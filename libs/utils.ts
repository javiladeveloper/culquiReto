import { APIGatewayProxyEvent } from 'aws-lambda';
import { UnauthorizedError } from './errors';
import { IdToken } from './IdToken';
import { Logger } from './Logger';

/**
 * Retorna true si la variable que se le pasa no esta definida, es una cadena vacia, o tiene puros espacios.
 * @param str
 */
export function isBlank(str: string | undefined | null): boolean {
  return !str || str.length === 0 || str.trim().length === 0;
}

/**
 * # Obtener Token
 *
 * Metodo sacar idToken desde la cabecera de los request, busca en los headers una cabecera con el
 * nombre `idh-token`, este idToken nos permite reconocer quies es el usuanio que se autentico.
 *
 * No se debe de pasar por parametro el usuario por el que se quiere consultar, la identidad
 * del usuario esta implicita en id-token.
 *
 * El idToken es un JWT firmado usando el estandar JWS, ejemplo:
 *
 * id-token:
 * `eyJraWQiOiJrVFhxYnRvTFd1Um9xMTRYZXdIRW1UV3QzRmkyYVVnNjM1a0swSVk5WGNZPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJiMmZjMGIwMy01MWZmLTQwNGItOWEyZS00MGE0OTNlZDFkY2YiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiY3VzdG9tOmN1c3RvbWVyIjoiODM2NjgwIiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfbUY2VWZFU1pDIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjp0cnVlLCJjb2duaXRvOnVzZXJuYW1lIjoiYjJmYzBiMDMtNTFmZi00MDRiLTlhMmUtNDBhNDkzZWQxZGNmIiwiY3VzdG9tOnVzZXIiOiIxYzViNDM2MC0yZGFjLTExZWItOTEyNS00NzFhNTMyMDM3ZGIiLCJhdWQiOiI0czJrbjJxN2tvcThncmc5bTdvbmlkbGZpaiIsImV2ZW50X2lkIjoiNWViNTNlYzItMmNlYi00NGQ0LTkzMmMtYTVlZDQyNjgzOTk2IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MDc2NTc4NzQsIm5hbWUiOiJYWFhYSSIsInBob25lX251bWJlciI6Iis1MTAwMDAwMDA0MiIsImV4cCI6MTYwNzc0NDI3NCwiaWF0IjoxNjA3NjU3ODc0LCJmYW1pbHlfbmFtZSI6IlhYWFhJICBYWFhYSSIsImVtYWlsIjoiVVoxSTlUQTFXQFJFTEFZLkZJUkVGT1guQ09NIn0.UxFFClIu6r1nRbXNJFtg9-nZjblEfHW2W7fly7yZD0ck-nx1u0lJ-ypKPHIpfILp4i9Od_ACQN26NwKaC7tonpxoRo3-MzOgmCqSwFfVz6kEdJKZ-ZVyMmFSFAN0btoGymGG-C-vdutDwsWkoBJr69F1RFhHjl5vN8m4fp1DQqYBDZO7cz-0uQ59hMhaoKZC9YM9MR-LPC5vcMolnXtcDs9C26Zv-FQpnB4fokN6ygVMef48pKXLFmRgehglqE3kDNTX3F5QdsjBilBrq0yF2uuVsZZS1muKKmOWt9p2HlRTE9YiZN22YQx1w2z5LqefvHEWDMq6B3qPZT0qbs14QQ`
 *
 * id-token decodificado:
 *
 * header
 * ```
 * {
 *  "kid": "kTXqbtoLWuRoq14XewHEmTWt3Fi2aUg635kK0IY9XcY=",
 *  "alg": "RS256"
 * }
 * ```
 * payload
 * ```json
 * {
 *   "sub": "b2fc0b03-51ff-404b-9a2e-40a493ed1dcf",
 *   "email_verified": true,
 *   "custom:customer": "836680",
 *   "iss": "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_mF6UfESZC",
 *   "phone_number_verified": true,
 *   "cognito:username": "b2fc0b03-51ff-404b-9a2e-40a493ed1dcf",
 *   "custom:user": "1c5b4360-2dac-11eb-9125-471a532037db",
 *   "aud": "4s2kn2q7koq8grg9m7onidlfij",
 *   "event_id": "5eb53ec2-2ceb-44d4-932c-a5ed42683996",
 *   "token_use": "id",
 *   "auth_time": 1607657874,
 *   "name": "XXXXI",
 *   "phone_number": "+51000000042",
 *   "exp": 1607744274,
 *   "iat": 1607657874,
 *   "family_name": "XXXXI  XXXXI",
 *   "email": "UZ1I9TA1W@RELAY.FIREFOX.COM"
 * }
 * ```
 *
 * ## Autorizador
 * Debido a que el APIC no esta validando el idtoken, la validacion se debe de hacer en el
 * api gateway de aws, por lo que se tiene que colocar el el serverless en la seccion del evento
 * de api gateway el autorizador.
 *
 * 1. Primero se tiene que crear la referencia del autorizador en la seccion de `custom`
 * que es una lambada que debe de estar creada previamente el proyecto de `identity-api`:
 * ```yaml
 * custom:
 *   authorizer:
 *     arn: arn:aws:lambda:#{AWS::Region}:#{AWS::AccountId}:function:identity-api-${self:provider.stage}-authorizator
 * ```
 *
 * 2. Luego hay poner el authorizador en el lambda con evento http:
 * ```yaml
 * ...
 *
 *
 * @param event es un event del tipo APIGatewayProxyEvent, que contiene los headers.
 */
export function getToken(event: APIGatewayProxyEvent): IdToken {
  const idtoken = event.headers['TOKEN'] ?? '';
  if (!idtoken) {
    throw new UnauthorizedError('UNAUTHORIZED', 'invalid token');
  }

  const token = !isBlank(idtoken) ? idtoken : '';
  const idToken = new IdToken(token);
  Logger.debug('idToken', idToken);
  return idToken;
}
