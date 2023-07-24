/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestError, httpHandler, httpHandlerV2, UnauthorizedError } from '../../libs/errors';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { uid } from 'rand-token';
import { CreditCards } from '../domain/CreditCardRepository';
import { CreditCardImpl } from '../application/CreditCardImpl';
import { Logger } from '../../libs/Logger';
const creditCardApplication = new CreditCardImpl();
const log = new Logger('handler');
export const createCreditCard = httpHandlerV2(async (event) => {
  log.info('processCreditCards');
  const idToken = uid(16);
  if (!event.body) {
    throw new BadRequestError('CREDIT_CARD', 'request empty');
  }
  if (!event.headers.Authorization) {
    throw new UnauthorizedError('CREDIT_CARD', 'No Autorizated');
  }
  const TokenArray = event.headers.Authorization.split(' ');
  if (TokenArray[1] !== process.env.AUTORIZATION) {
    throw new UnauthorizedError('CREDIT_CARD', 'Token No Format');
  }
  const eventCreditCard = JSON.parse(event.body) as CreditCards;
  eventCreditCard.token = idToken;
  const response = await creditCardApplication.create(eventCreditCard);
  log.debug('[creditCard]', JSON.stringify(response, null, 2));
  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'ok', token: response.token }),
  };
});

export function findCreditCard(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  return httpHandler(async () => {
    if (!event.pathParameters || !event.pathParameters.token) {
      throw new BadRequestError('CREDIT_CARD', 'parameter Empty');
    }
    if (!event.headers.Authorization) {
      throw new UnauthorizedError('CREDIT_CARD', 'No Autorizated');
    }
    const TokenArray = event.headers.Authorization.split(' ');
    if (TokenArray[1] !== process.env.AUTORIZATION) {
      throw new UnauthorizedError('CREDIT_CARD', 'Token No Format');
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
