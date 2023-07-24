/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import mongoose from 'mongoose';
import { Logger } from '../../libs/Logger';
import { MongoMemoryServer } from 'mongodb-memory-server';
const log = new Logger('getConexion');
let mongod;

export const connectDB = async () => {
  try {
    let dbUrl = `mongodb+srv://${process.env.DB_USER || ''}:${process.env.DB_PASS || ''}@cluster0.${
      process.env.DB_CLUSTER || ''
    }.mongodb.net/${process.env.DB_DBNAME || ''}`;
    if (process.env.NODE_ENV === 'test') {
      mongod = await MongoMemoryServer.create();
      dbUrl = mongod.getUri();
    }
    const conn = await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    return `MongoDB connected: ${conn.connection.host}`;
  } catch (err) {
    log.error(err);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    process.exit(1);
  }
};
