import { Shell } from './shell';
export interface Logger {
  debug: (message?: any) => void;
  info: (message?: any) => void;
  warn: (message?: any) => void;
  error: (message?: any) => void;
}
export const ERROR = 'ERROR';
export const SUCCESS = 'SUCCESS';
const TERMINATION_TOKEN = '$$$$8888!!!!!MPOJKJHGGHF453678HJGVHGFRY6758%%%£ùù';

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
      const outs: string[] = [];
      let resolver: NodeJS.Timeout;
      command.in = command.in;
      this.shell.sendCommand(command);
      this.shell.stdout.on('error', data => {
        resolve({ out: data.toString().trim(), status: ERROR });
      });
      this.shell.stdout.on('data', data => {
        // console.log(data.toString())
        outs.push(data.toString().trim());
        clearTimeout(resolver);
        resolver = setTimeout(() => {
          resolve({ out: outs.join('\n'), status: SUCCESS });
        }, 100);
      });
    });
  }
}
