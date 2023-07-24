/* eslint-disable @typescript-eslint/no-floating-promises */
import { CreditCards } from '../domain/CreditCardRepository';
import creditCard from '../models/CreditCard.model';
import { NotFoundError } from '../../libs/errors';
import { Logger } from '../../libs/Logger';
// eslint-disable-next-line no-duplicate-imports
import { BadRequestError } from '../../libs/errors';
const log = new Logger('handler');
export class CreditcardrepositoryImpl {
  public async createCreditCard(params: CreditCards): Promise<CreditCards> {
    try {
      const response = await creditCard.create(params);
      return response;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new BadRequestError('CREDIT CARD', error._message);
    }
  }

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
