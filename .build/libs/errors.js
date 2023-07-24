"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpHandlerV2 = exports.httpHandler = exports.NotFoundError = exports.InternalServerError = exports.UnauthorizedError = exports.BadRequestError = exports.GenericError = void 0;
const Logger_1 = require("./Logger");
class GenericError extends Error {
    constructor(errorCode, systemMessage, userMessage) {
        super(systemMessage);
        this.errorCode = `ERROR_${this.getHttpStatus()}_${errorCode}`;
        this.systemMessage = systemMessage;
        this.userMessage = userMessage !== null && userMessage !== void 0 ? userMessage : systemMessage;
        Object.setPrototypeOf(this, GenericError.prototype);
    }
}
exports.GenericError = GenericError;
class BadRequestError extends GenericError {
    getHttpStatus() {
        return 400;
    }
    constructor(errorCode, systemMessage, userMessage) {
        super(errorCode, systemMessage, userMessage);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends GenericError {
    getHttpStatus() {
        return 401;
    }
    constructor(errorCode, systemMessage, userMessage) {
        super(errorCode, systemMessage, userMessage);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class InternalServerError extends GenericError {
    getHttpStatus() {
        return 500;
    }
    constructor(errorCode, systemMessage, userMessage) {
        super(errorCode, systemMessage, userMessage);
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}
exports.InternalServerError = InternalServerError;
class NotFoundError extends GenericError {
    getHttpStatus() {
        return 404;
    }
    constructor(errorCode, systemMessage, userMessage) {
        super(errorCode, systemMessage, userMessage);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
exports.NotFoundError = NotFoundError;
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
async function httpHandler(_handler) {
    var _a;
    try {
        const apiGatewayProxyStructuredResultV2 = await _handler();
        const headers = (_a = apiGatewayProxyStructuredResultV2.headers) !== null && _a !== void 0 ? _a : {};
        apiGatewayProxyStructuredResultV2.headers = {
            ...headers,
            ...CORS,
        };
        return apiGatewayProxyStructuredResultV2;
    }
    catch (error) {
        const log = new Logger_1.Logger('httpHandler');
        log.error('[errorHandler] Error desconocido', error);
        let response;
        if (error instanceof GenericError) {
            response = errorToResponse(error);
        }
        else {
            response = errorToResponse(new InternalServerError('', error));
        }
        return response;
    }
}
exports.httpHandler = httpHandler;
const logHttpHandlerV2 = new Logger_1.Logger('httpHandlerV2');
function httpHandlerV2(handler) {
    return async (event, context, callback) => {
        var _a, _b;
        let apiGatewayProxyResult;
        try {
            logHttpHandlerV2.info(`>BEGIN> API (${event.httpMethod}) ${event.path} ============================>`);
            apiGatewayProxyResult = await handler(event, context, callback);
            logHttpHandlerV2.info(`<END< API (${event.httpMethod}) ${event.path}   ============================<`);
            const headers = (_a = apiGatewayProxyResult.headers) !== null && _a !== void 0 ? _a : {};
            (_b = apiGatewayProxyResult.body) !== null && _b !== void 0 ? _b : {};
            apiGatewayProxyResult.headers = {
                ...headers,
                ...CORS,
            };
            return apiGatewayProxyResult;
        }
        catch (error) {
            logHttpHandlerV2.error('[errorHandler] Error desconocido', error);
            if (error instanceof GenericError) {
                apiGatewayProxyResult = errorToResponse(error);
            }
            else {
                apiGatewayProxyResult = errorToResponse(new InternalServerError('', error));
            }
            logHttpHandlerV2.info(`<END< API (${event.httpMethod}) ${event.path} (ERROR) ============================<`);
        }
        return apiGatewayProxyResult;
    };
}
exports.httpHandlerV2 = httpHandlerV2;
function errorToResponse(genericError) {
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
//# sourceMappingURL=errors.js.map