import { spawn, ChildProcess } from 'child_process';
import { Readable } from 'stream';
import { CommandIn, Logger } from './index';

const LOGGER_PREFIX = '[MongoShell] ';

export class Shell {
  private workerId: string;
  private logger: Logger;
  public stdout: Readable;
  private mongoUri: string;

  public constructor(workerId: string, mongoUri: string, logger?: Logger) {
    this.mongoUri = mongoUri;
    this.workerId = workerId;
    if (logger) {
      this.logger = logger;
    } else {
      this.logger = console;
    }
    this.stdout = new Readable({
      read() {},
    });
  }

  public async init(): Promise<void> {
    return;
  }

  public sendCommand(command: CommandIn): void {
    const mongo = spawn('mongo', [
      '--host',
      this.mongoUri,
      '--eval',
      command.in,
    ]);
    mongo.stdout.on('data', data => {
      if (data.toString().match(/MongoDB shell version/)) {
        return;
      }
      if (data.toString().match(/connecting to/)) {
        return;
      }
      if (data.toString().match(/MongoDB server version/)) {
        return;
      }
      this.logger.debug(LOGGER_PREFIX + 'received response ' + data);
      this.stdout.push(data);
      this.stdout.emit('end');
    });
    mongo.stderr.on('data', data => {
      this.logger.warn(LOGGER_PREFIX + 'received error ' + data);
      this.stdout.emit('error', data);
      this.stdout.emit('end');
    });
    this.logger.debug(LOGGER_PREFIX + 'received command ' + command.in);
    mongo.stdin.write(command.in);
  }
}
