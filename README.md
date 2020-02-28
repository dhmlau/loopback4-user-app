# loopback4-user-app

This LoopBack 4 application is based on https://github.com/strongloop/loopback-next/pull/4223.

The objective of this repo is to try out what is the best way to break down the authentication tutorials: the one proposed in https://github.com/strongloop/loopback-next/pull/4223 and https://loopback.io/doc/en/lb4/Authentication-Tutorial.html.

- Basic authentication may not be an ideal method for authentication. So I'm investigating whether I can take part of the above PR as a stepping stone to add jwt authentication instead.

## Try it Out

This example is using Postgresql as the database. The database name is called `userdb`.

1. Create the database `userdb` before proceed.

If you want to use other database, go to `src/datasources/ds.datasource.config.json` to change the configuration.

2. Run the following commands to install dependencies, create the database table and start the application.

```sh
npm install
npm run build
npm run migrate
npm start
```

3. Go to http://localhost:3000/explorer.

i. Create user using `/users/signup`
ii. Log in using `/users/login`. After you log in, copy the returned token
iii. Click Authorize at the top of API Explorer, paste the token you got in the previous step.
iv. You now can call other endpoints.

## Instructions

This diagram describes how JWT authentication works:
![JWT authentication](https://loopback.io/pages/en/lb4/imgs/json_web_token_overview.png)

We are going to:

- Part 1: create an authentication strategy. See [instructions-jwtauth-strategy.md](instructions-jwtauth-strategy.md). This will be pretty much the same for any kind of authentication that you're going to use. Code can be found in the `part1` branch.
- Part 2: create a UserService that authenticates the provided credentials from the user database. See [instructions-jwtauth-userservice.md](instructions-jwtauth-userservice.md). Code can be found in the `part2` branch.
- Part 3: create a TokenService that extracts token from request header and validates & generates tokens: [instructions-jwtauth-tokenservice.md](instructions-jwtauth-tokenservice.md). Code can be found in the `part3` branch
- Part 4: [test the application](instructions-jwtauth-test.md)

---

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)
