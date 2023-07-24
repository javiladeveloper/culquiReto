"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdToken = void 0;
const errors_1 = require("./errors");
const Logger_1 = require("./Logger");
const ENCODING = 'utf8';
/**
 * {@link getToken}
 */
class IdToken {
    constructor(tokenOrIdToken, userId, customerId, email, password) {
        this.log = new Logger_1.Logger('IdToken');
        this.log.info('tokenOrIdToken', tokenOrIdToken);
        if (tokenOrIdToken instanceof IdToken) {
            this.token = tokenOrIdToken.token;
            this.sub = tokenOrIdToken.sub;
            this.cognitoUsername = tokenOrIdToken.cognitoUsername;
            this.email = email;
            this.userId = userId;
            this.customerId = customerId;
            this.password = password;
        }
        else {
            this.token = tokenOrIdToken;
            const jwt = tokenOrIdToken.split('.');
            if (jwt.length === 3) {
                try {
                    const payload = Buffer.from(jwt[1], 'base64').toString(ENCODING);
                    const idToken = JSON.parse(payload);
                    this.log.debug('idToken', idToken);
                    this.sub = idToken.sub;
                    this.email = idToken.email;
                    this.userId = idToken['custom:user'];
                    this.customerId = idToken['custom:customer'];
                    this.cognitoUsername = idToken['cognito:username'];
                }
                catch (error) {
                    throw new errors_1.BadRequestError('ERROR_ID_TOKEN', error, 'El id token no es valido');
                }
            }
        }
    }
}
exports.IdToken = IdToken;
//# sourceMappingURL=IdToken.js.map