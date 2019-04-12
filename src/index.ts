import { Shell } from './shell';
export interface Logger {
  debug: (message?: any) => void;
  info: (message?: any) => void;
  warn: (message?: any) => void;
  error: (message?: any) => void;
}
export const ERROR = 'ERROR';
export const SUCCESS = 'SUCCESS';

export interface CommandIn {
  in: string;
}

export interface CommandOut {
  out: string;
  status: 'ERROR' | 'SUCCESS';
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

  public destroy() {
    this.shell.destroy();
  }

  public async sendCommand(command: CommandIn): Promise<CommandOut> {
    return new Promise((resolve, reject) => {
      this.shell.sendCommand(command);
      this.shell.stdout.on('error', data => {
        resolve({ out: data.toString().trim(), status: ERROR });
      });
      this.shell.stdout.on('data', data => {
        resolve({ out: data.toString().trim(), status: SUCCESS });
      });
    });
  }
}
