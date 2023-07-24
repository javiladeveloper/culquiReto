"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findCreditCard = exports.createCreditCard = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const errors_1 = require("../../libs/errors");
const rand_token_1 = require("rand-token");
const CreditCardImpl_1 = require("../application/CreditCardImpl");
const Logger_1 = require("../../libs/Logger");
const creditCardApplication = new CreditCardImpl_1.CreditCardImpl();
const log = new Logger_1.Logger('handler');
exports.createCreditCard = (0, errors_1.httpHandlerV2)(async (event) => {
    log.info('processCreditCards');
    const idToken = (0, rand_token_1.uid)(16);
    if (!event.body) {
        throw new errors_1.BadRequestError('CREDIT_CARD', 'request empty');
    }
    if (!event.headers.Authorization) {
        throw new errors_1.UnauthorizedError('CREDIT_CARD', 'No Autorizated');
    }
    const TokenArray = event.headers.Authorization.split(' ');
    if (TokenArray[1] !== process.env.AUTORIZATION) {
        throw new errors_1.UnauthorizedError('CREDIT_CARD', 'Token No Format');
    }
    const eventCreditCard = JSON.parse(event.body);
    eventCreditCard.token = idToken;
    const response = await creditCardApplication.create(eventCreditCard);
    log.debug('[creditCard]', JSON.stringify(response, null, 2));
    return {
        statusCode: 200,
        body: JSON.stringify({ status: 'ok', token: response.token }),
    };
});
function findCreditCard(event) {
    return (0, errors_1.httpHandler)(async () => {
        if (!event.pathParameters || !event.pathParameters.token) {
            throw new errors_1.BadRequestError('CREDIT_CARD', 'parameter Empty');
        }
        if (!event.headers.Authorization) {
            throw new errors_1.UnauthorizedError('CREDIT_CARD', 'No Autorizated');
        }
        const TokenArray = event.headers.Authorization.split(' ');
        if (TokenArray[1] !== process.env.AUTORIZATION) {
            throw new errors_1.UnauthorizedError('CREDIT_CARD', 'Token No Format');
        }
        const id = event.pathParameters.token;
        const response = await creditCardApplication.findOne(id);
        log.debug('[creditCard]', JSON.stringify(response, null, 2));
        return {
            statusCode: 200,
            body: JSON.stringify(response),
        };
    });
}
exports.findCreditCard = findCreditCard;
//# sourceMappingURL=handler.js.map