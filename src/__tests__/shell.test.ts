import { Shell } from '../shell';
import * as pWaitFor from 'p-wait-for';

describe('Shell', () => {
  let shell: Shell;

  describe('destroy', () => {
    it('kill the subprocess', async () => {
      shell = new Shell('42', 'localhost:27017');
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
      shell = new Shell('42', 'localhost:27017');
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
      shell = new Shell('42', 'localhost:27017');
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
  });
});
