import assert from 'assert';
import sinon from 'sinon';

import * as herokuClient from './../dist/clients/heroku';
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
});