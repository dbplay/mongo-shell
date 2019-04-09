import { Shell } from './shell';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const streamToPromise = require('stream-to-promise');
export interface Logger {
  debug: (message?: any) => void;
  info: (message?: any) => void;
  warn: (message?: any) => void;
  error: (message?: any) => void;
}
export interface CommandIn {
  in: string;
}

export interface CommandOut {
  out: string;
}

export class MongoShell {
  private workerId: string;
  private shell: Shell;

  public constructor(mongoUri: string, previousShellId?: string) {
    if (previousShellId) {
      this.workerId = previousShellId;
    } else {
      this.workerId = Math.round(Math.random() * 1000000).toString();
    }
    this.shell = new Shell(this.workerId, mongoUri);
  }

  public async sendCommand(command: CommandIn): Promise<CommandOut> {
    const promise = streamToPromise(this.shell.stdout);
    this.shell.sendCommand(command);
    const result = await promise;
    return { out: result.toString().trim() };
  }
}
