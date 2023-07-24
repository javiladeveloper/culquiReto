"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const creditCardSchema = new mongoose_1.default.Schema({
    token: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        minlength: 16,
        maxlength: 16,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100,
        validate: {
            validator: (val) => {
                const re = /[\w.]@(yahoo.es|hotmail.com|gmail.com)(\W|$)/;
                return re.test(val);
            },
            message: () => `this mail does not match allowed mailers end with yahoo.es | hotmail.com | gmail.com`,
        },
    },
    card_number: {
        type: Number,
        required: true,
        trim: true,
        validate: {
            validator: (val) => {
                return val.toString().length >= 13 && val.toString().length <= 16;
            },
            message: () => `must be between 13 and 16 digits`,
        },
    },
    cvv: {
        type: Number,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 4,
        enum: [123, 4532],
    },
    expiration_year: {
        type: String,
        required: true,
        trim: true,
        minlength: [4, 'Must be at least 4, got {VALUE}'],
        maxlength: [4, 'Must be at least 4, got {VALUE}'],
        validate: {
            validator: (val) => {
                const currentTime = new Date();
                const value = currentTime.getFullYear() + 5;
                return value >= Number(val);
            },
            message: () => `must have 4 digits`,
        },
    },
    expiration_month: {
        type: String,
        required: true,
        trim: true,
        minlength: [1, 'Must have 1 to 2 characters got {VALUE}'],
        maxlength: [2, 'Must have 1 to 2 characters, got {VALUE}'],
        validate: {
            validator: (val) => {
                return val >= 1 && val <= 12;
            },
            message: () => `must be between 1 and 12`,
        },
    },
    expiration_register: {
        type: Date,
        default: new Date(+new Date() + 60 * 15 * 1000),
    },
    createdAt: { type: Date, default: new Date() },
}, { versionKey: false });
const creditCard = mongoose_1.default.model('credit_card', creditCardSchema, 'credit_card');
exports.default = creditCard;
//# sourceMappingURL=CreditCard.model.js.map