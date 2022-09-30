/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import mongoose from 'mongoose';
import { Logger } from '../../libs/Logger';
const log = new Logger('getConexion');

export const connectDB = async () => {
  try {
    const dbUrl = process.env.DB_CONN_STRING || '';
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

// export const disconnectDB = async () => {
//   try {
//     await mongoose.connection.close();
//     if (mongod) {
//       await mongod.stop();
//     }
//   } catch (err) {
//     log.error(err);
//     throw err;
//     // process.exit(1);
//   }
// };
