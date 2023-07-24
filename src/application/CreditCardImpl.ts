import { CreditCards } from '../domain/CreditCardRepository';
import { BadRequestError } from '../../libs/errors';
import { Logger } from '../../libs/Logger';
import { CreditcardrepositoryImpl } from '../infraestructure/CreditCardRepositoryImpl';
import luhn from 'luhn';
import { connectDB } from '../lib/mongoose-db';
const creditcard = new CreditcardrepositoryImpl();
export class CreditCardImpl {
  private readonly log = new Logger('CreditCardImpl');

  /**
   * Create user
   * @param {*} params
   */

  async create(params: CreditCards): Promise<CreditCards> {
    this.log.info('create');
    const credit_card: string = params.card_number?.toString() || '';
    if (!luhn.validate(credit_card)) throw 'No validate card number';
    this.log.debug('create params', params);
    await connectDB();
    return await creditcard.createCreditCard(params);
  }

  /**
   * Query user by id
   * @param token
   */
  async findOne(token: string): Promise<CreditCards> {
    try {
      this.log.info('findOne');
      this.log.debug('findOne token', token);
      await connectDB();
      const result = await creditcard.findOneCreditCardByToken(token);
      return result;
    } catch (err) {
      const error = err as { message: string };
      this.log.error(err);
      throw new BadRequestError('CREDIT CARD', error.message);
    }
  }
}
