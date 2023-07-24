"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditcardrepositoryImpl = void 0;
const CreditCard_model_1 = __importDefault(require("../models/CreditCard.model"));
const errors_1 = require("../../libs/errors");
const Logger_1 = require("../../libs/Logger");
// eslint-disable-next-line no-duplicate-imports
const errors_2 = require("../../libs/errors");
const log = new Logger_1.Logger('handler');
class CreditcardrepositoryImpl {
    async createCreditCard(params) {
        try {
            const response = await CreditCard_model_1.default.create(params);
            return response;
        }
        catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            throw new errors_2.BadRequestError('CREDIT CARD', error._message);
        }
    }
    async findOneCreditCardByToken(token) {
        const response = await CreditCard_model_1.default.findOne({ token: token }, { email: 1, card_number: 1, expiration_year: 1, expiration_month: 1, _id: 0, expiration_register: 1 });
        log.info('[response]', JSON.stringify(response));
        if (response) {
            if (new Date() < response.expiration_register) {
                return response;
            }
            throw new errors_1.NotFoundError('CREDIT_CARD', 'TOKEN_EXPIRED');
        }
        throw new errors_1.NotFoundError('CREDIT_CARD', 'NOT_FOUND');
    }
}
exports.CreditcardrepositoryImpl = CreditcardrepositoryImpl;
//# sourceMappingURL=CreditCardRepositoryImpl.js.map