import { MongoShell, Logger } from '../index';
import * as pWaitFor from 'p-wait-for';

const logger: Logger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

function randomDB() {
  return (
    'dd' +
    Math.random()
      .toString(36)
      .substring(7)
  );
}

describe('Shell', () => {
  let shell: MongoShell;

  describe('destroy', () => {
    it('kill the subprocess', async () => {
      shell = new MongoShell('42', 'localhost:27017', logger);
      await shell.init();
      await shell.destroy();
    });
  });
  describe('sendCommand', () => {
    afterEach(() => {
      if (shell) {
        shell.destroy();
      }
    });

    it('can sends a command to a mongodb', async () => {
      shell = new MongoShell('42', 'localhost:27017', logger);
      await shell.init();
      const outs = new Array<string>();
      shell.stdout.on('data', chunk => {
        outs.push(chunk.toString());
      });
      shell.sendCommand({ in: 'foo=5' });
      await pWaitFor(() => {
        return outs.length === 1;
      });
      const last = Array.from(outs).pop();
      expect(last).toEqual('5\n');
    });

    it('keeps env from a call to another', async () => {
      shell = new MongoShell('42', 'localhost:27017', logger);
      await shell.init();
      const outs = new Array<string>();
      shell.stdout.on('data', chunk => {
        outs.push(chunk.toString());
      });
      shell.sendCommand({ in: 'foo=5' });
      await pWaitFor(() => {
        return outs.length === 1;
      });
      let last = Array.from(outs).pop();
      expect(last).toEqual('5\n');
      shell.sendCommand({ in: 'foo' });
      await pWaitFor(() => {
        return outs.length === 2;
      });
      last = Array.from(outs).pop();
      expect(last).toEqual('5\n');
    });

    it('can send a big mongo commandcommand', async () => {
      const db = randomDB();
      const bigValue =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum';
      shell = new MongoShell('42', 'localhost:27017', logger);
      await shell.init();
      const outs = new Array<string>();
      shell.stdout.on('data', chunk => {
        outs.push(chunk.toString());
      });
      shell.sendCommand({ in: 'bigValue="' + bigValue + '"' });
      await pWaitFor(() => {
        return outs.length === 1;
      });
      let last = Array.from(outs).pop();
      expect(last).toMatch(bigValue);
      shell.sendCommand({
        in: `db.${db}.insert({value: bigValue})`,
      });

      await pWaitFor(() => {
        return outs.length === 2;
      });
      last = Array.from(outs).pop();
      expect(last).toMatch('WriteResult({ "nInserted" : 1 })');
    });

    it('can fetch several results up to the iterator end', async () => {
      jest.setTimeout(10e3);
      shell = new MongoShell('42', 'localhost:27017', logger);
      await shell.init();
      const db = randomDB();
      const outs = new Array<string>();
      shell.stdout.on('data', chunk => {
        outs.push(chunk.toString());
      });
      for (let index = 0; index < 50; index += 1) {
        shell.sendCommand({
          in: `db.${db}.insert({index: ${index}}, { writeConcern: { w: 1, j: true } })`,
        });
      }
      await pWaitFor(() => {
        return outs.length === 50;
      });
      shell.sendCommand({
        in: `db.${db}.find({})`,
      });
      await pWaitFor(() => {
        const last = Array.from(outs).pop() || '';
        return last.includes('for more');
        // return outs.length === 53;
      });
      const last = Array.from(outs).pop();
      expect(last).toMatch('Type "it" for more');
    });

    it('rejects a failed command', async () => {
      shell = new MongoShell('42', 'localhost:27017', logger);
      shell.sendCommand({ in: 'idoesnotexist' });
      const outs = new Array<string>();
      shell.stdout.on('error', chunk => {
        outs.push(chunk.toString());
      });
      await pWaitFor(() => {
        return outs.length === 1;
      });
      const last = Array.from(outs).pop();
      expect(last).toMatch('idoesnotexist is not defined');
    });
  });
});
