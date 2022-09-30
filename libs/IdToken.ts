import { BadRequestError } from './errors';
import { Logger } from './Logger';

const ENCODING = 'utf8';

/**
 * {@link getToken}
 */
export class IdToken {
  private readonly log = new Logger('IdToken');

  public readonly token: string;
  public readonly sub: string;
  public readonly email: string;
  public readonly userId: string;
  public readonly customerId: string;
  public readonly cognitoUsername: string;
  public readonly password: string;

  constructor(tokenOrIdToken: string);
  constructor(tokenOrIdToken: IdToken, userId: string, customerId: string, email: string, password: string);
  constructor(
    tokenOrIdToken: string | IdToken,
    userId?: string,
    customerId?: string,
    email?: string,
    password?: string,
  ) {
    this.log.info('tokenOrIdToken', tokenOrIdToken);

    if (tokenOrIdToken instanceof IdToken) {
      this.token = tokenOrIdToken.token;
      this.sub = tokenOrIdToken.sub;
      this.cognitoUsername = tokenOrIdToken.cognitoUsername;
      this.email = email as string;
      this.userId = userId as string;
      this.customerId = customerId as string;
      this.password = password as string;
    } else {
      this.token = tokenOrIdToken;
      const jwt = tokenOrIdToken.split('.');
      if (jwt.length === 3) {
        try {
          const payload = Buffer.from(jwt[1], 'base64').toString(ENCODING);
          const idToken = JSON.parse(payload) as IdTokenRequest;
          this.log.debug('idToken', idToken);
          this.sub = idToken.sub as string;
          this.email = idToken.email as string;
          this.userId = idToken['custom:user'] as string;
          this.customerId = idToken['custom:customer'] as string;
          this.cognitoUsername = idToken['cognito:username'] as string;
        } catch (error) {
          throw new BadRequestError('ERROR_ID_TOKEN', error, 'El id token no es valido');
        }
      }
    }
  }
}

interface IdTokenRequest {
  email: string | undefined;
  sub: string | undefined;
  'custom:user': string | undefined;
  'custom:customer': string | undefined;
  'cognito:username': string | undefined;
}
