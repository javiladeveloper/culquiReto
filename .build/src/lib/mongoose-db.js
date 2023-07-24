"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const mongoose_1 = __importDefault(require("mongoose"));
const Logger_1 = require("../../libs/Logger");
const mongodb_memory_server_1 = require("mongodb-memory-server");
const log = new Logger_1.Logger('getConexion');
let mongod;
const connectDB = async () => {
    try {
        let dbUrl = `mongodb+srv://${process.env.DB_USER || ''}:${process.env.DB_PASS || ''}@cluster0.${process.env.DB_CLUSTER || ''}.mongodb.net/${process.env.DB_DBNAME || ''}`;
        if (process.env.NODE_ENV === 'test') {
            mongod = await mongodb_memory_server_1.MongoMemoryServer.create();
            dbUrl = mongod.getUri();
        }
        const conn = await mongoose_1.default.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
        return `MongoDB connected: ${conn.connection.host}`;
    }
    catch (err) {
        log.error(err);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    try {
        await mongoose_1.default.connection.close();
        if (mongod) {
            await mongod.stop();
        }
    }
    catch (err) {
        process.exit(1);
    }
};
exports.disconnectDB = disconnectDB;
//# sourceMappingURL=mongoose-db.js.map