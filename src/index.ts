import { ChildProcessWithoutNullStreams, exec } from 'child_process';
import { Readable } from 'stream';

export interface Logger {
  debug: (message?: any) => void;
  info: (message?: any) => void;
  warn: (message?: any) => void;
  error: (message?: any) => void;
}
export interface CommandIn {
  in: string;
}

const LOGGER_PREFIX = '[MongoShell] ';

export class MongoShell {
  private workerId: string;
  private logger: Logger;
  public stdout: Readable;
  private mongoUri: string;
  private mongo: ChildProcessWithoutNullStreams;

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
    this.mongo = exec('mongo --quiet --host ' + this.mongoUri, {
      encoding: 'utf8',
    }) as ChildProcessWithoutNullStreams;
    this.bindStdout();
  }

  private async bindStdout() {
    await this.init();
    this.mongo.stdout.on('data', data => {
      if (data.match(/E QUERY/)) {
        this.logger.warn(LOGGER_PREFIX + 'received error ' + data);
        this.stdout.emit('error', data);
        this.stdout.emit('end');
      } else {
        this.stdout.emit('data', data);
        this.stdout.emit('end');
        this.logger.debug(LOGGER_PREFIX + 'received response ' + data);
      }
    });
    this.mongo.stderr.on('data', data => {
      this.logger.warn(LOGGER_PREFIX + 'received error ' + data);
      this.stdout.emit('error', data);
      this.stdout.emit('end');
    });
  }

  public async init(): Promise<void> {}

  public async destroy(): Promise<void> {
    this.mongo.kill();
    delete this.mongo;
  }

  public sendCommand(command: CommandIn): void {
    this.logger.debug(LOGGER_PREFIX + 'send command ' + command.in);
    this.mongo.stdin.write(command.in + '\n');
  }
}
