import assert from 'assert';
import sinon from 'sinon';

import * as herokuClient from './../dist/clients/heroku-client';
import * as herokuService from '../dist/services/heroku-service';

describe('Heroku Service', () => {
  describe('isValidCredentials()', () => {

    const stub = sinon.stub(herokuClient, 'getCurrentUser');

    it('should return true if the credentials are valid', async () => {
      // stub the heroku client to resolve. It doesn't matter what it resolves to, we just need
      // to test what happens when it does resolve.
      stub.resolves(true);

      // it doesn't what credentials we send
      const isValid =await herokuService.isValidCredentials('blah', 'blah');

      assert.equal(isValid, true);
    });

    it('should return false if the credentials are invalid', async () => {
      // stub the heroku client to return a 401 (unauthorized).
      stub.rejects({status: 401});


      // it doesn't matter the credentials, just checking to make sure the client that this function
      // returns true when the client resolves.
      const isValid = await herokuService.isValidCredentials('blah', 'blah');
      assert.equal(isValid, false);
    });

    it('should throw an error if there was a problem contacting the API', async () => {
      stub.rejects({status: 404}); // it does't matter what the error is, just that the status
      // is not 401

      try {
        const isValid = await herokuService.isValidCredentials('blah', 'blah');
      } catch (error) {
        assert.equal(error.message, 'Something went wrong contacting the Heroku API!');
      }

      stub.rejects({status: 500});
      try {
        const isValid = await herokuService.isValidCredentials('blah', 'blah');
      } catch (error) {
        assert.equal(error.message, 'Something went wrong contacting the Heroku API!');
      }
    });
  });

  describe('createApp()', () => {
    let createAppRequest = {};

    beforeEach(() => {
      createAppRequest = sinon.stub(herokuClient, 'createApp');
    });

    it('should successfully create a heroku app and return true', async () => {
      createAppRequest.resolves();
      const isCreated = await herokuService.createApp('blah', '1234');
      assert.equal(isCreated, true);
    });

    it('should not create an app and return false if the name is already taken on heroku', async () => {
      createAppRequest.rejects({status: 422});
      const isCreated = await herokuService.createApp('blah', '1234');
      assert.equal(isCreated, false);
    });

    it('should throw an error if it was unable to create a heroku app', async () => {
      createAppRequest.rejects({status: 400});
      try {
        await herokuService.createApp('blah', '1234');
        assert.equal(true, false, 'should be an error');
      } catch (error) {
        assert.equal(error.message, 'Unable to create Heroku Application');
      }
    });

    afterEach(() => {
      createAppRequest.restore();
    });
  });
});