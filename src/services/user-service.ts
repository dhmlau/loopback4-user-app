import {UserService} from '@loopback/authentication';
import {UserProfile, securityId} from '@loopback/security';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {repository} from '@loopback/repository';
import {inject} from '@loopback/context';
import {PasswordHasher} from './hash.password.bcryptjs';
import {PasswordHasherBindings} from '../keys';
import {HttpErrors} from '@loopback/rest';

export type Credentials = {
  email: string;
  password: string;
};

// Code coming from https://github.com/strongloop/loopback4-example-shopping/blob/master/packages/shopping/src/services/user-service.ts
export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const invalidCredentialsError = 'Invalid email or password.';

    // Check to see if the user id/email exist
    let foundUser = await this.userRepository.findOne({
      where: {email: credentials.email},
      include: [{relation: 'userCredentials'}],
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    // Check to see if the password is valid
    const passwordMatched = await this.passwordHasher.comparePassword(
      credentials.password,
      foundUser.userCredentials.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }
  convertToUserProfile(user: User): UserProfile {
    // since first name and lastName are optional, no error is thrown if not provided
    let userName = '';
    if (user.firstName) userName = `${user.firstName}`;
    if (user.lastName)
      userName = user.firstName
        ? `${userName} ${user.lastName}`
        : `${user.lastName}`;
    const userProfile: UserProfile = {
      [securityId]: user.email,
      name: userName,
      id: user.email,
    };

    return userProfile;
  }
}
