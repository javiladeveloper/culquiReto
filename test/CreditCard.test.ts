/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable jest/prefer-expect-assertions */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { uid } from 'rand-token';
import { APIGatewayProxyEvent } from 'aws-lambda';
import * as handler from '../src/controller/handler';
import { CreditcardrepositoryImpl } from '../src/infraestructure/CreditCardRepositoryImpl';
const creditCardImpl = new CreditcardrepositoryImpl();
const idToken = uid(16);
import { connectDB, disconnectDB } from '../src/lib/mongoose-db';

const timeout = 2 * 60 * 1000;
jest.setTimeout(timeout);
jest.mock('mongodb');

describe('credit card', () => {
  beforeAll(() => {
    connectDB();
  });
  afterAll(() => {
    disconnectDB();
  });
  it('testing lambda: findCreditCard - empty request.body', async () => {
    const event = {
      queryStringParameters: { token: null },
    } as unknown as APIGatewayProxyEvent;
    const response = handler.findCreditCard(event);
    expect((await response).statusCode).toBe(400);
  });
  it('testing lambda: createCreditCard && findCreditCard - ok', async () => {
    const saveCreditCard = await creditCardImpl.createCreditCard(mockSaveCreditCard);
    expect(saveCreditCard.email).toBe(mockSaveCreditCard.email);
    expect(saveCreditCard.card_number).toBe(mockSaveCreditCard.card_number);
    expect(saveCreditCard.cvv).toBe(mockSaveCreditCard.cvv);
    expect(saveCreditCard.expiration_year).toBe(mockSaveCreditCard.expiration_year);
    expect(saveCreditCard.expiration_month).toBe(mockSaveCreditCard.expiration_month);
    expect(saveCreditCard.token).toBe(mockSaveCreditCard.token);
    const getCreditCard = await creditCardImpl.findOneCreditCardByToken(saveCreditCard.token || '');
    expect(getCreditCard.email).toBe(mockGetCreditCard.email);
    expect(getCreditCard.card_number).toBe(mockGetCreditCard.card_number);
    expect(getCreditCard.expiration_year).toBe(mockGetCreditCard.expiration_year);
    expect(getCreditCard.expiration_month).toBe(mockGetCreditCard.expiration_month);
  });
  it('testing lambda: createCreditCard - error email && credit card lenght', async () => {
    let error = null;

    try {
      await creditCardImpl.createCreditCard(mockErrorEmailCardNumber);
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
  });

  it('testing lambda: createCreditCard - error yearn and month', async () => {
    let error = null;

    try {
      await creditCardImpl.createCreditCard(mockErroryearmonth);
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
  });

  it('testing lambda: findCreditCard - no credit card exist', async () => {
    let error = null;

    try {
      await creditCardImpl.findOneCreditCardByToken('421424');
    } catch (e) {
      error = e;
    }
    expect(error).not.toBeNull();
  });
});

const mockSaveCreditCard = {
  expiration_register: new Date(+new Date() + 60 * 15 * 1000),
  email: 'jonathan.joan.avila@gmail.com',
  card_number: 35600000000048,
  cvv: 123,
  expiration_year: '2026',
  expiration_month: '12',
  token: idToken,
};

const mockGetCreditCard = {
  email: 'jonathan.joan.avila@gmail.com',
  card_number: 35600000000048,
  expiration_year: '2026',
  expiration_month: '12',
};

const mockErrorEmailCardNumber = {
  expiration_register: new Date(+new Date() + 60 * 15 * 1000),
  email: 'jonathan.joan.avila@gmail.es',
  card_number: 356,
  cvv: 123,
  expiration_year: '2026',
  expiration_month: '12',
  token: idToken,
};

const mockErroryearmonth = {
  expiration_register: new Date(+new Date() + 60 * 15 * 1000),
  email: 'jonathan.joan.avila@gmail.com',
  card_number: 35600000000048,
  cvv: 123,
  expiration_year: '2035',
  expiration_month: '13',
  token: idToken,
};
