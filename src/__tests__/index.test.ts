import { MongoShell, ERROR, SUCCESS } from '../index';

describe('MongoShell', () => {
  describe('sendCommand', () => {
    let mongoShell: MongoShell;

    afterEach(() => {
      if (mongoShell) {
        mongoShell.destroy();
      }
    });

    it('can sends a javascript command to a fresh mongo shell', async () => {
      mongoShell = new MongoShell('localhost:27017');
      const result = await mongoShell.sendCommand({ in: 'foo=5' });
      expect(result.status).toEqual(SUCCESS);
      expect(result.out).toEqual('5');
    });

    it('rejects a failed command', async () => {
      mongoShell = new MongoShell('localhost:27017');
      const result = await mongoShell.sendCommand({ in: 'idoesnotexist' });
      expect(result.status).toEqual(ERROR);
      expect(result.out).toMatch(/idoesnotexist is not defined/);
    });
  });
});
