import {AuthenticationStrategy} from '@loopback/authentication';
import {UserProfile, securityId} from '@loopback/security';
import {Request} from '@loopback/rest';

export class JWTAuthenticationStrategy implements AuthenticationStrategy {
  name = 'JWTStrategy';
  constructor() {}
  async authenticate(request: Request): Promise<UserProfile | undefined> {
    //always return a dummy user for now
    return {email: 'test@test.com', [securityId]: 'test@test.com'};

    //always throws unauthorized error
    //throw new HttpErrors.Unauthorized('The credentials are not correct.');
  }
}
