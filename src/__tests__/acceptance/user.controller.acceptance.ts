import {Client, expect} from '@loopback/testlab';
import {Loopback4UserAppApplication} from '../..';
import {setupApplication} from './test-helper';

describe('UserController', () => {
  let app: Loopback4UserAppApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('invokes count', async () => {
    const res = await client.get('/users/count').expect(200);
    expect(res.body).to.have.key('count');
  });
});
