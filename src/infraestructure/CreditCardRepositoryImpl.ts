/* eslint-disable @typescript-eslint/no-floating-promises */
import { CreditCards } from '../domain/CreditCardRepository';
import creditCard from '../models/CreditCard.model';
import { NotFoundError } from '../../libs/errors';
import { Logger } from '../../libs/Logger';
const log = new Logger('handler');
export class CreditcardrepositoryImpl {
  /**
   * Create User
   * @param params
   */
  public async createCreditCard(params: CreditCards): Promise<CreditCards> {
    const response = await creditCard.create(params);
    return response;
  }

  /**
   * Query user by id
   * @param token
   */
  public async findOneCreditCardByToken(token: string): Promise<CreditCards> {
    const response = await creditCard.findOne(
      { token: token },
      { email: 1, card_number: 1, expiration_year: 1, expiration_month: 1, _id: 0, expiration_register: 1 },
    );
    log.info('[response]', JSON.stringify(response));
    if (response) {
      if (new Date() < response.expiration_register) {
        return response;
      }
      throw new NotFoundError('CREDIT_CARD', 'TOKEN_EXPIRED');
    }
    throw new NotFoundError('CREDIT_CARD', 'NOT_FOUND');
  }
}
