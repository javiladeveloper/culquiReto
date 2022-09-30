import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Callback } from 'aws-lambda';
import { Context } from 'aws-lambda/handler';
import { Logger } from './Logger';

export abstract class GenericError extends Error {
  readonly errorCode: string;
  readonly userMessage: string;
  readonly systemMessage: string;

  constructor(errorCode: string, systemMessage: string, userMessage?: string) {
    super(systemMessage);
    this.errorCode = `ERROR_${this.getHttpStatus()}_${errorCode}`;
    this.systemMessage = systemMessage;
    this.userMessage = userMessage ?? systemMessage;

    Object.setPrototypeOf(this, GenericError.prototype);
  }

  abstract getHttpStatus(): number;
}

export class BadRequestError extends GenericError {
  getHttpStatus(): number {
    return 400;
  }

  constructor(errorCode: string, systemMessage: string, userMessage?: string) {
    super(errorCode, systemMessage, userMessage);

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class UnauthorizedError extends GenericError {
  getHttpStatus(): number {
    return 401;
  }

  constructor(errorCode: string, systemMessage: string, userMessage?: string) {
    super(errorCode, systemMessage, userMessage);

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class InternalServerError extends GenericError {
  getHttpStatus(): number {
    return 500;
  }

  constructor(errorCode: string, systemMessage: string, userMessage?: string) {
    super(errorCode, systemMessage, userMessage);

    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
export class NotFoundError extends GenericError {
  getHttpStatus(): number {
    return 404;
  }

  constructor(errorCode: string, systemMessage: string, userMessage?: string) {
    super(errorCode, systemMessage, userMessage);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
/**
 * # Manejo de las llamadas por http
 *
 * La finalidad de esta funcion es capturar los errores lanzados por cualquiera de las capas y
 * darle un formato estandar, para ello captura cualquier error que implemente [[GenericError]]
 * y retornar un json estandar para los errores, si el error no pertenece a ninguna implementacion
 * de [[GenericError]], entonces envolvera el error en un [[InternalServerError]]
 *
 * Ejemplo, un error interno:
 * ```json
 * HTTP/1.1 500 Internal Server Error
 * X-Amzn-Trace-Id: Root=1-5fbfd016-7233c769680bae5d37149d7d
 * {
 *   'errorCode': 'ERROR_500_VISIT_TYPE';
 *   'userMessage': 'visitType not found';
 *   'systemMessage': 'visitType not found';
 * }
 * ```
 *
 * **Ejemplo** de como implementar el `httpHandler`:
 *
 * ```typescript
 * require('../../../../libs/tracing');
 * import { APIGatewayProxyResult } from 'aws-lambda';
 * import { httpHandler } from '../../../../libs/errors';
 * import { CaptchaService } from '../application';
 * import { ContainerContext } from '../di/context.di';
 * import { TYPES } from '../di/TYPES';
 *
 * export const containerContext: ContainerContext = new ContainerContext();
 *
 * export async function captcha(): Promise<APIGatewayProxyResult> {
 *  const captchaService: CaptchaService = containerContext.container.get(TYPES.CaptchaService);
 *
 *
 *  // HTTP HANDLER ===================================================>
 *  return httpHandler(async () => {
 *    const captcha = await captchaService.captcha();
 *    return {
 *      statusCode: 200,
 *      body: JSON.stringify(captcha),
 *    };
 *  });
 *  // HTTP HANDLER ===================================================<
 * }
 * ```
 *
 * @param event
 * @param _handler
 */
export async function httpHandler(_handler: () => Promise<APIGatewayProxyResult>): Promise<APIGatewayProxyResult> {
  try {
    const apiGatewayProxyStructuredResultV2 = await _handler();
    const headers = apiGatewayProxyStructuredResultV2.headers ?? {};
    apiGatewayProxyStructuredResultV2.headers = {
      ...headers,
      ...CORS,
    };
    return apiGatewayProxyStructuredResultV2;
  } catch (error) {
    const log = new Logger('httpHandler');
    log.error('[errorHandler] Error desconocido', error);
    let response: APIGatewayProxyResult;
    if (error instanceof GenericError) {
      response = errorToResponse(error);
    } else {
      response = errorToResponse(new InternalServerError('', error));
    }
    return response;
  }
}
const logHttpHandlerV2 = new Logger('httpHandlerV2');
export function httpHandlerV2(
  handler: (event: APIGatewayProxyEvent, context: Context, callback: Callback) => Promise<APIGatewayProxyResult>,
): APIGatewayProxyHandler {
  return async (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
    let apiGatewayProxyResult: APIGatewayProxyResult;
    try {
      logHttpHandlerV2.info(`>BEGIN> API (${event.httpMethod}) ${event.path} ============================>`);
      apiGatewayProxyResult = await handler(event, context, callback);
      logHttpHandlerV2.info(`<END< API (${event.httpMethod}) ${event.path}   ============================<`);

      const headers = apiGatewayProxyResult.headers ?? {};
      apiGatewayProxyResult.body ?? {};
      apiGatewayProxyResult.headers = {
        ...headers,
        ...CORS,
      };
      return apiGatewayProxyResult;
    } catch (error) {
      logHttpHandlerV2.error('[errorHandler] Error desconocido', error);
      if (error instanceof GenericError) {
        apiGatewayProxyResult = errorToResponse(error);
      } else {
        apiGatewayProxyResult = errorToResponse(new InternalServerError('', error));
      }
      logHttpHandlerV2.info(`<END< API (${event.httpMethod}) ${event.path} (ERROR) ============================<`);
    }

    return apiGatewayProxyResult;
  };
}
function errorToResponse(genericError: GenericError): APIGatewayProxyResult {
  return {
    statusCode: genericError.getHttpStatus(),
    headers: {
      ...CORS,
    },
    body: JSON.stringify({
      code: genericError.errorCode,
      systemMessage: genericError.systemMessage,
      userMessage: genericError.userMessage,
    }),
  };
}
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH',
};
