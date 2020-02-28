## Part 3: Create the UserService

In this example, the user profile and credentials are stored in a database. The password will be hashed before going into the database.

There are two models associated with it:

- `User`: user profile which contains all the user information
- `UserCredentials`: it has the userid and the hashed password

In terms of the model relation, `User` `hasOne` `UserCredentials`.

Eventually, we're going to add the `/login` endpoint that checks the credentials of the user using the UserService and returns the token from the TokenService.

## Step 1: Create `User` and `UserCredentials` model

First, we're going to define the `User` and `UserCredentials` model using the `lb4 model` command.

`User` model has the following properties. All are of string type and required.

- `email`: string. id field
- `firstName`: string
- `lastName`: string

`UserCredentials` model has the following properties.

- `id`: string. id field. generated.
- `userId`: string. This is the same as `email` in the `User` model.
- `password`: string.

See `src/models/user.model.ts` and `src/models/user-credentials.model.ts` for reference.

## Step 2: Create the datasource and Repository for User and UserCredentials

1. Create datasource using `lb4 datasource` and name it as `ds`.
   In this example, we use Postgresql as the database. After running this command, you should have two files created under `src/datasources`:

   - [ds.datasource.config.json](src/datasources/ds.datasource.config.json)
   - [ds.datasource.ts](src/datasources/ds.datasource.ts)

2. Create the Repository classes for User and UserCredentials using `lb4 repository`.

## Step 3: Add model relation

There is a `hasOne` relation between `User` and `UserCredentials`. Next, we're going to define it using the `lb4 relation` command.

```sh
$ lb4 relation
? Please select the relation type hasOne
? Please select source model User
? Please select target model UserCredentials
? Foreign key name to define on the target model userId
? Source property name for the relation getter (will be the relation name) userCredent
ials
? Allow User queries to include data from related UserCredentials instances? Yes
   create src/controllers/user-user-credentials.controller.ts

Relation HasOne was created in src/
```

### Step 4: Create UserService

This really depends on how you're authenticating the users. You might have a database to check against, or you're calling external services.

The purpose of the `UserService` is to:

- obtain the credentials
- authenticate the user
- if the user exists, return the user profile with the UserCredential information.

1. Create a HashPassword service, `services/hash.password.bcryptjs.ts` with the content in [src/services/hash.password.bcryptjs.ts](./src/services/hash.password.bcryptjs.ts).

   Install the following modules as well:

   ```sh
   $ npm i bcryptjs --save
   $ npm i @types/bcryptjs --save-dev
   ```

2. Add `PasswordHasherBindings` key which will be used later.

   Go to `keys.ts`, and add:

   ```ts
   // add import
   import {PasswordHasher} from './services/hash.password.bcryptjs';

   // add the PasswordHasherBindings
   export namespace PasswordHasherBindings {
     export const PASSWORD_HASHER = BindingKey.create<PasswordHasher>(
       'services.hasher',
     );
     export const ROUNDS = BindingKey.create<number>('services.hasher.round');
   }
   ```

3. Under `src/services` folder, create `user-service.ts` for the UserService. The new `MyUserService` implements the `UserService` from `@loopback/authentication`, therefore, it has the following two functions:

- verifyCredentials
- convertToUserProfile

See [`src/services/user.service.ts`](./src/services/user.service.ts) for content.

4.  Add the UserService to the binding
    In `src/keys.ts`, add:

    ```ts
    // add import
    import {TokenService, UserService} from '@loopback/authentication';
    import {User} from './models';
    import {Credentials} from './services/user-service';

    // add UserServiceBindings
    export namespace UserServiceBindings {
      export const USER_SERVICE = BindingKey.create<
        UserService<User, Credentials>
      >('services.user.service');
    }
    ```

5.  In the applcation.ts, add the bindings in the `setUpBindings()` function.

    ```ts
    //update / add import
    import {
      TokenServiceBindings,
      TokenServiceConstants,
      PasswordHasherBindings,
      UserServiceBindings,
    } from './keys';
    import {BcryptHasher} from './services/hash.password.bcryptjs';
    import {MyUserService} from './services/user-service';

    // add binding in setUpBindings function
    this.bind(PasswordHasherBindings.ROUNDS).to(10);
    this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);

    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);
    ```

## Step 5: Add `/login` endpoint

In `user.controller.ts`,

1. Inject the services we created in the previous steps

   ```ts
   // add import
   import {authenticate, TokenService, UserService} from '@loopback/authentication';
   import {Credentials} from '../services/user-service';
   import {PasswordHasherBindings, TokenServiceBindings, UserServiceBindings} from '../keys';
   import {inject} from '@loopback/core';
   import { PasswordHasher } from '../services/hash.password.bcryptjs';

   //update the constructor
   constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<User, Credentials>,
   ) {}
   ```

2. add a `/login` API:

```ts
  @authenticate.skip()
  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody({
      description: 'The input of login function',
      required: true,
      content: {
        // 'application/json': {
        //   schema: getModelSchemaRef(UserCredentials, {partial: true}),
        // },
        'application/json': {
          schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: {
                type: 'string',
                format: 'email',
              },
              password: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    credentials: Credentials,
  ): Promise<{token: string}> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);

    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);
    return {token};
  }
```

## Step 6: (Optional) Create a `/signup` endpoint

When adding a user, we want to add both the user profile information and the credential all at once. So it's better to create a separate endpoint for that.

In `src/controllers/user.controller.ts`,

1. add a `NewUserRequest` model

   ```ts
   @model()
   export class NewUserRequest extends User {
     @property({
       type: 'string',
       required: true,
     })
     password: string;
   }
   ```

2. add a `signup` function

See `src/controllers/user.controller.ts`

## Step 7: (Optional) Create tables for User and UserCredentials in SQL database

If you're using a SQL database, you can use the migrate script to create the tables.

1. The migrate script does not create the foreign keys by default. We're going to edit the `@model` decorator for `UserCredentials`.

   ```ts
   @model({
     settings: {
       foreignKeys: {
         fk_credential_userId: {
           name: 'fk_credential_userId',
           entity: 'User',
           entityKey: 'email',
           foreignKey: 'userid',
         },
       },
     },
   })
   export class UserCredentials extends Entity {
   ```

2. Run

   ```sh
   npm run build
   npm run migrate
   ```

   You'll get the table definition as below:

   ```
   userdb=# \d user
                Table "public.user"
   Column   | Type | Collation | Nullable | Default
   -----------+------+-----------+----------+---------
   email     | text |           | not null |
   firstname | text |           |          |
   lastname  | text |           |          |
   Indexes:
    "user_pkey" PRIMARY KEY, btree (email)
   Referenced by:
    TABLE "usercredentials" CONSTRAINT "fk_credential_userId" FOREIGN KEY (userid) REFERENCES "user"(email)

    userdb=# \d usercredentials
    Table "public.usercredentials"
    Column | Type | Collation | Nullable | Default
    ----------+---------+-----------+----------+---------------------------------------------
    id | integer | | not null | nextval('usercredentials_id_seq'::regclass)
    userid | text | | not null |
    password | text | | not null |
    Indexes:
    "usercredentials_pkey" PRIMARY KEY, btree (id)
    Foreign-key constraints:
    "fk_credential_userId" FOREIGN KEY (userid) REFERENCES "user"(email)

   ```

---

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

```

```
