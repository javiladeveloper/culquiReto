"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditCardImpl = void 0;
const errors_1 = require("../../libs/errors");
const Logger_1 = require("../../libs/Logger");
const CreditCardRepositoryImpl_1 = require("../infraestructure/CreditCardRepositoryImpl");
const luhn_1 = __importDefault(require("luhn"));
const mongoose_db_1 = require("../lib/mongoose-db");
const creditcard = new CreditCardRepositoryImpl_1.CreditcardrepositoryImpl();
class CreditCardImpl {
    constructor() {
        this.log = new Logger_1.Logger('CreditCardImpl');
    }
    /**
     * Create user
     * @param {*} params
     */
    async create(params) {
        var _a;
        this.log.info('create');
        const credit_card = ((_a = params.card_number) === null || _a === void 0 ? void 0 : _a.toString()) || '';
        if (!luhn_1.default.validate(credit_card))
            throw 'No validate card number';
        this.log.debug('create params', params);
        await (0, mongoose_db_1.connectDB)();
        return await creditcard.createCreditCard(params);
    }
    /**
     * Query user by id
     * @param token
     */
    async findOne(token) {
        try {
            this.log.info('findOne');
            this.log.debug('findOne token', token);
            await (0, mongoose_db_1.connectDB)();
            const result = await creditcard.findOneCreditCardByToken(token);
            return result;
        }
        catch (err) {
            const error = err;
            this.log.error(err);
            throw new errors_1.BadRequestError('CREDIT CARD', error.message);
        }
    }
}
exports.CreditCardImpl = CreditCardImpl;
//# sourceMappingURL=CreditCardImpl.js.map