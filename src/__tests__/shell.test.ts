import { Shell } from '../shell';
import * as pWaitFor from 'p-wait-for';

describe('Shell', () => {
  describe('sendCommand', () => {
    it('can sends a command to a mongodb', async () => {
      jest.setTimeout(30000);

      const mongoShell = new Shell('42', 'localhost:27017');
      await mongoShell.init();
      const outs = new Array<string>();
      mongoShell.stdout.on('data', chunk => {
        outs.push(chunk.toString());
      });
      mongoShell.sendCommand({ in: 'foo=5' });
      await pWaitFor(() => {
        return outs.length === 1;
      });
      const last = Array.from(outs).pop();
      expect(last).toEqual('5\n');
    });
  });
});
