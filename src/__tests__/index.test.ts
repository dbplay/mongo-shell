import { MongoShell } from '../index';

describe('MongoShell', () => {
  describe('sendCommand', () => {
    it('can sends a javascript command to a fresh mongo shell', async () => {
      jest.setTimeout(30000);

      const mongoShell = new MongoShell('localhost:27017');
      const result = await mongoShell.sendCommand({ in: 'foo=5' });
      expect(result.out).toEqual('5');
    });
  });
});
