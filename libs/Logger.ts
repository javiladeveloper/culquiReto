export enum LogLevel {
  OFF = 0,
  ERROR,
  WARN,
  INFO,
  DEBUG,
  TRACE,
  LOG,
}

export type LogOutput = (source: string | undefined, level: LogLevel, message: string, ...data: unknown[]) => void;

/**
 * # LOGs
 *
 * Esta clase es la encargada de crear los logs en consola con el nivel adecuado (TRACE, DEBUG, INFO, WARN, ERROR)
 * el valor por defecto es INFO.
 *
 * ## Modo de uso
 *
 * Se debe de instanciar el `Logger` en el inicio de la clase, y colocar un mensaje `info` al inicio
 * de cada metodo sin informacion sencible del request, opcionalmente puede
 * mostrar los input pero usando el nivel debug. Por otro lado, siempre se tiene que logear el error.
 *
 * Ejemplo:
 * ```typescript
 * ...
 * import { Logger } from '../../../../libs/Logger';

 * @injectable()
 * export class CaptchaServiceImpl implements CaptchaService {
 *  private readonly log = new Logger('CaptchaServiceImpl');
 *
 *   constructor(@inject(TYPES.CaptchaRepository) private captchaRepository: CaptchaRepository) {}
 *
 *   async captcha(): Promise<Captcha> {
 *     this.log.info("captcha");
 *     return await this.captchaRepository.captcha();
 *   }
 * }
 * ```
 *
 * Esto imprime el siguiente mensaje en la salida estandar:
 *
 * ```
 * 2021-01-16T15:26:36.392Z  INFO [CaptchaServiceImpl] captcha
 * ```
 */
export class Logger {
  static level = LogLevel.LOG;
  static outputs: LogOutput[] = [];
  static showTimestamp = true;
  private readonly source: string | undefined;

  // eslint-disable-next-line @typescript-eslint/ban-types
  public constructor(source: string | Object | undefined) {
    if (!source) {
      this.source = undefined;
    } else if (typeof source === 'string') {
      this.source = source;
    } else {
      this.source = source.constructor.name;
    }

    const logger_level = process.env.LOGGER_LEVEL;
    if (logger_level && LogLevel[logger_level]) {
      Logger.level = LogLevel[logger_level] as LogLevel;
    } else {
      Logger.level = LogLevel.LOG;
    }
  }

  static enableProductionMode(): void {
    Logger.level = LogLevel.INFO;
  }

  static trace(message: string, ...data: unknown[]): void {
    // eslint-disable-next-line no-console
    doLog(undefined, console.debug, LogLevel.TRACE, message, data);
  }

  static debug(message: string, ...data: unknown[]): void {
    // eslint-disable-next-line no-console
    doLog(undefined, console.debug, LogLevel.DEBUG, message, data);
  }

  static info(message: string, ...data: unknown[]): void {
    // eslint-disable-next-line no-console
    doLog(undefined, console.info, LogLevel.INFO, message, data);
  }

  static warn(message: string, ...data: unknown[]): void {
    // eslint-disable-next-line no-console
    doLog(undefined, console.warn, LogLevel.WARN, message, data);
  }

  static error(message: string, ...data: unknown[]): void {
    // eslint-disable-next-line no-console
    doLog(undefined, console.error, LogLevel.ERROR, message, data);
  }

  static create(name?: string): Logger {
    return new Logger(name);
  }

  trace(message: string, ...data: unknown[]): void {
    // eslint-disable-next-line no-console
    doLog(this.source, console.trace, LogLevel.TRACE, message, data);
  }

  debug(message: string, ...data: unknown[]): void {
    // eslint-disable-next-line no-console
    doLog(this.source, console.debug, LogLevel.DEBUG, message, data);
  }

  info(message: string, ...data: unknown[]): void {
    // eslint-disable-next-line no-console
    doLog(this.source, console.info, LogLevel.INFO, message, data);
  }

  warn(message: string, ...data: unknown[]): void {
    // eslint-disable-next-line no-console
    doLog(this.source, console.warn, LogLevel.WARN, message, data);
  }

  error(message: string, ...data: unknown[]): void {
    // eslint-disable-next-line no-console
    doLog(this.source, console.error, LogLevel.ERROR, message, data);
  }
}

function doLog(
  source: string | undefined,
  func: (...args: unknown[]) => void,
  level: LogLevel,
  message: string,
  data: unknown[],
) {
  if (level > Logger.level) {
    return;
  }
  const log = build(level, message, data, source);
  func.apply(console, log);
  applyLoggerOutput(level, message, data, source);
}

function build(level: LogLevel, message: string, data: unknown[], source?: string): unknown[] {
  // const title: string = LogLevel[level].toUpperCase();
  // let background: string;
  let _level: string;
  switch (level) {
    case LogLevel.TRACE:
      // background = '#A8CC8C';
      _level = `${LogLevel[level]}`;
      break;
    case LogLevel.DEBUG:
      // background = '#A8CC8C';
      _level = `${LogLevel[level]}`;
      break;
    case LogLevel.INFO:
      // background = '#71BEF2';
      _level = ` ${LogLevel[level]}`;
      break;
    case LogLevel.WARN:
      // background = '#DBAB79';
      _level = ` ${LogLevel[level]}`;
      break;
    case LogLevel.ERROR:
      // background = '#E88388';
      _level = `${LogLevel[level]}`;
      break;
    default:
      // background = '#B9BFCA';
      _level = `${LogLevel[level]}`;
      break;
  }
  const result: unknown[] = [];
  const printTime = Logger.showTimestamp ? `${timestamp()}` : '';
  result.push(`${printTime} ${_level}`);
  // result.push(`background: ${background}; color: #000; padding: 2px 0.5em; border-radius: 0.5em;`);
  if (source) result.push(`[${source}]`);
  result.push(message);
  return result.concat(data);
}

function applyLoggerOutput(level: LogLevel, message: string, data: unknown[], source?: string) {
  Logger.outputs.forEach((output) => {
    output.apply(output, [source, level, message, ...data]);
  });
}

function timestamp(): string {
  return `${new Date().toISOString()}`;
}
