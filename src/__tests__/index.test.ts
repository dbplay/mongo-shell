import { MongoShell, ERROR, SUCCESS } from '../index';

describe('MongoShell', () => {
  describe('sendCommand', () => {
    let mongoShell: MongoShell;

    afterEach(() => {
      if (mongoShell) {
        mongoShell.destroy();
      }
    });

    it('can sends a big mongo command', async () => {
      mongoShell = new MongoShell('localhost:27017');
      const bigValue =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum';
      await mongoShell.sendCommand({ in: 'bigValue="' + bigValue + '"' });
      const resultInsert = await mongoShell.sendCommand({
        in: 'db.test.insert({value: bigValue})',
      });
      expect(resultInsert.out).toEqual('WriteResult({ "nInserted" : 1 })');
      expect(resultInsert.status).toEqual(SUCCESS);
      const resultRead = await mongoShell.sendCommand({
        in: 'db.test.find({value: bigValue})',
      });
      expect(resultRead.out).toMatch(new RegExp(bigValue));
      expect(resultInsert.status).toEqual(SUCCESS);
    });

    it('can sends a javascript command to a fresh mongo shell', async () => {
      mongoShell = new MongoShell('localhost:27017');
      const result = await mongoShell.sendCommand({ in: 'foo=5' });
      expect(result.out).toEqual('5');
      expect(result.status).toEqual(SUCCESS);
    });

    it('rejects a failed command', async () => {
      mongoShell = new MongoShell('localhost:27017');
      const result = await mongoShell.sendCommand({ in: 'idoesnotexist' });
      expect(result.status).toEqual(ERROR);
      expect(result.out).toMatch(/idoesnotexist is not defined/);
    });
  });
});
