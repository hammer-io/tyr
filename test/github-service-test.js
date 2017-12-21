import assert from 'assert';
import sinon from 'sinon';

import * as githubClient from '../dist/clients/github';
import * as githubService from '../dist/services/github-service';

describe('GitHub Service', () => {

  describe('isValidCredentials()', () => {

    // stub the githubClient getCurrentUser() method.
    let stub = sinon.stub(githubClient, 'getCurrentUser');

    it('should return true if the credentials are valid', async () => {

      // stub the github client to resolve. It doesn't matter what it resolves to, we just need
      // to test what happens when it does resolve.
      stub.resolves(true);

      // it doesn't what credentials we send
      const isValid =await githubService.isValidCredentials('blah', 'blah');

      assert.equal(isValid, true);
    });

    it('should return false if the credentials are invalid', async () => {

      // stub the github client to return a 401 (unauthorized).
      stub.rejects({status: 401});


      // it doesn't matter the credentials, just checking to make sure the client that this function
      // returns true when the client resolves.
      const isValid = await githubService.isValidCredentials('blah', 'blah');
      assert.equal(isValid, false);
    });

    it('should throw an error if there was a problem contacting the API', async () => {
      stub.rejects({status: 404}); // it does't matter what the error is, just that the status
                                   // is not 401

      try {
        const isValid = await githubService.isValidCredentials('blah', 'blah');
      } catch (error) {
        assert.equal(error.message, 'Something went wrong contacting the GitHub API!');
      }

      stub.rejects({status: 500});
      try {
        const isValid = await githubService.isValidCredentials('blah', 'blah');
      } catch (error) {
        assert.equal(error.message, 'Something went wrong contacting the GitHub API!');
      }
    });
  });
});