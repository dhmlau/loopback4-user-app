# Part 1: Set up the authentication startegy

## Overview

This part of the tutorial set up the authentication stategy in a LoopBack application.

## Install the required LoopBack modules

First, ensure you have the necessary packages installed:

```sh
npm install --save @loopback/authentication @loopback/security
```

## Add authentication to the sequence

Authentication is not enabled by default. We need to tell loopback that every
incoming HTTP request should check to see if authentication is required.

Open `src/sequence.ts` and add the following:

```ts
  // At the top
  import { AuthenticationBindings, AuthenticateFn } from '@loopback/authentication';

  // In the constructor's arguments
  @inject(AuthenticationBindings.AUTH_ACTION) protected authenticateRequest: AuthenticateFn,

  // In the handle function
  const route = this.findRoute(request);
  await this.authenticateRequest(request);    // ADD THIS LINE
  const args = await this.parseParams(request, route);
```

## Create an authentication strategy

The AuthenticationStrategy is where the work really happens.

Make a new folder `src/strategies`

Create the file `src/strategies/jwt-strategy.ts` with the following content:

```ts
import {AuthenticationStrategy} from '@loopback/authentication';
import {UserProfile, securityId} from '@loopback/security';
import {HttpErrors, Request} from '@loopback/rest';

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
```

As an initial step, the `authenticate` function always returns a dummy user. Eventually, this method will verify the token from the `request` and returns the corresponding user profile.

## Register the JWT authentication strategy

Now we need to tell our application that this strategy exists and can be used.

Open `src/application.ts` and add the following lines:

```ts
import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {JWTAuthenticationStrategy} from './strategies/jwt-strategy';
// At the bottom of the constructor function
this.component(AuthenticationComponent);
registerAuthenticationStrategy(this, JWTAuthenticationStrategy);
```

## Create `User` model and the corresponding DataSource, Repository and Controller class

The `User` model has the following properties using the [model generator command](https://loopback.io/doc/en/lb4/Model-generator.html) `lb4 model` :

- `email`: string. This is an `id` property.
- `firstName`: string
- `lastName`: string

Create the DataSource and Repository class using [DataSource generator](https://loopback.io/doc/en/lb4/DataSource-generator.html) and [Repository generator](https://loopback.io/doc/en/lb4/Repository-generator.html) command.

When creating the controller, follow the prompts below:

```sh
 lb4 controller
? Controller class name: User
Controller User will be created in src/controllers/user.controller.ts

? What kind of controller would you like to generate? REST Controller with CRUD functions
? What is the name of the model to use with this CRUD repository? User
? What is the name of your CRUD repository? UserRepository
? What is the name of ID property? email
? What is the type of your ID? string
? Is the id omitted when creating a new instance? Yes
? What is the base HTTP path name of the CRUD operations? /users
   create src/controllers/user.controller.ts
   update src/controllers/index.ts

Controller User was created in src/controllers/
```

Now, you have a controller that can utilize the newly created JWT authentication strategy.

## Start using the JWT authentication strategy in controllers

In `src/user.controller.ts`:

1. Add the following import:

   ```ts
   import {authenticate} from '@loopback/authentication';
   ```

2. Since we want to protect all endpoints in this controller except the `POST` method, we are enabling the authentication at the class level.

   ```ts
   @authenticate('JWTStrategy') //add this line to protect all endpoints
   export class UserController {
     //...
   }
   ```

   And use `@authenticate.skip()` to make the particular endpoints unprotected:

   ```ts
     @authenticate.skip() //add this line for the endpoint you don't want to be protected
     @post('/users', ..)
   ```

## Add a test to ensure it works as expected

Create acceptance tests for the controller.
Under `src/__tests__/acceptance`, in my example, create `user.controller.acceptance.ts`.

Add the following to one of your acceptance tests:

```ts
import {Client, expect} from '@loopback/testlab';
import {Loopback4AuthenticationAppApplication} from '../..';
import {setupApplication} from './test-helper';

describe('UserController', () => {
  let app: Loopback4AuthenticationAppApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('invokes count', async () => {
    const res = await client.get('/customers/count').expect(200);
    expect(res.body).to.have.key('count');
  });
});
```

## Testing the application

Now running `npm test` will verify that your authentication pipeline works.

The test should always pass, because the `authenticate` function always return a user.
To test the authentication really works, in `jwt-strategy.ts` `authenticate` function, uncomment the snippet that always throw unauthorized error, i.e.

```ts
// make sure HttpErrors is added to the import
import {HttpErrors, Request} from '@loopback/rest';
//...
async authenticate(request: Request): Promise<UserProfile | undefined> {
  //always throws unauthorized error
  throw new HttpErrors.Unauthorized('The credentials are not correct.');
}
```

When running `npm test`, you will get an error saying:

```
Error: expected 200 "OK", got 401 "Unauthorized"
```

## Conclusion

At this point, you have set up the minimal infrastructure for enabling authentication.
