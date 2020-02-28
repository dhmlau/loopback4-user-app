# Part 2: Create a TokenService and Apply it in the JWT Authentication Strategy

## Step 1: Create binding keys for the TokenService

Create `keys.ts` under `src` folder with the following content. See file [`src/keys.ts`](./src/keys.ts)

```ts
import {BindingKey} from '@loopback/context';
import {TokenService} from '@loopback/authentication';

export namespace TokenServiceConstants {
  export const TOKEN_SECRET_VALUE = 'myjwts3cr3t'; //you can put any value you want
  export const TOKEN_EXPIRES_IN_VALUE = '600';
}

export namespace TokenServiceBindings {
  export const TOKEN_SECRET = BindingKey.create<string>(
    'authentication.jwt.secret',
  );
  export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
    'authentication.jwt.expires.in.seconds',
  );
  export const TOKEN_SERVICE = BindingKey.create<TokenService>(
    'services.authentication.jwt.tokenservice',
  );
}
```

## Step 2: Create JWTService to validate the token

This `JWTService` is a service to validate and generate tokens. It implements the [`TokenService`](https://github.com/strongloop/loopback-next/blob/master/packages/authentication/src/services/token.service.ts), so has 2 functions:

- `verifyToken`: verify the validity of the token and reutnr the corresponding user profile.
- `generateToken`: generate the token based on the user profile

Here the steps:

1. We will be using the `jsonwebtoken` module to encode and decode a token, so let's install this module now by running:

   ```sh
   $ npm install --save jsonwebtoken
   ```

2. Create `src/services/jwt-service.ts`. Copy the content from [`src/services/jwt-services.ts`](src/services/jwt-services.ts)

## Step 3: Use JWTService in the existing JWT Authentication Strategy

In the JWT Authentication strategy, instead of blindly return a dummy user in the `authenticate` function, it extracts the token from the `Authorization` header in the request and calls the `JWTService` to validate the token.

1. Modify/Add the import statements

   ```ts
   import {
     AuthenticationStrategy,
     TokenService,
   } from '@loopback/authentication'; //add TokenService
   import {UserProfile, securityId} from '@loopback/security'; //add securityId
   import {TokenServiceBindings} from '../keys'; //add this line
   import {inject} from '@loopback/context'; // add this line
   import {Request, HttpErrors} from '@loopback/rest';
   ```

2. Inject the `TokenService` in the constructor, the construction should look like:

   ```ts
   constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public tokenService: TokenService,
   ) {}
   ```

3. Add the `extractCredentials` function that extracts the token from the Authorization header

   ```ts
     extractCredentials(request: Request): string {
       if (!request.headers.authorization) {
         throw new HttpErrors.Unauthorized(`Authorization header not found.`);
       }

       // for example: Bearer xxx.yyy.zzz
       const authHeaderValue = request.headers.authorization;

       if (!authHeaderValue.startsWith('Bearer')) {
         throw new HttpErrors.Unauthorized(
           `Authorization header is not of type 'Bearer'.`,
         );
       }

       //split the string into 2 parts: 'Bearer ' and the `xxx.yyy.zzz`
       const parts = authHeaderValue.split(' ');
       if (parts.length !== 2)
         throw new HttpErrors.Unauthorized(
           `Authorization header value has too many parts. It must follow the pattern: 'Bearer xx.yy.zz' where xx.yy.zz is a valid JWT token.`,
         );
       const token = parts[1];

       return token;
     }
   ```

4. In the `authenticate` function, calls the `extractCredentials` to get the token which will then be passed to the TokenService for validation.

   ```ts
   async authenticate(request: Request): Promise<UserProfile | undefined> {

       // reference implementation
       const token: string = this.extractCredentials(request);
       const userProfile: UserProfile = await this.tokenService.verifyToken(token);
       return userProfile;
     }
   ```

See file [src/strategies/jwt-strategy.ts](./src/strategies/jwt-strategy.ts)

## Step 4: Set up the Bindings

To bind the JWT secret, expires in values and the JWTService class to binding keys, go to `src/application.ts`

1. Add the imports:

   ```ts
   import {TokenServiceBindings, TokenServiceConstants} from './keys';
   import {JWTService} from './services/jwt-service';
   ```

2. Set up the bindings

   ```ts
   constructor(options?: ApplicationConfig) {
      super(options);
      // ...
      // add this to the bottom of the constructor
      this.setUpBindings();
    }

    setUpBindings(): void {

      this.bind(TokenServiceBindings.TOKEN_SECRET).to(
        TokenServiceConstants.TOKEN_SECRET_VALUE,
      );

      this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
        TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE,
      );

      this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);

    }
   ```

---

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)
