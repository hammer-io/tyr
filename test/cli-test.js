import assert from 'assert';
import sinon from 'sinon';

import * as cli from './../dist/cli';
import * as herokuService from './../dist/services/heroku-service';
import * as githubService from './../dist/services/github-service';
import * as prompt from './../dist/prompt/prompt';


describe('Test CLI Functionality', () => {

  describe('signInToGithub()', () => {

    let githubStub = sinon.stub(githubService, 'isValidCredentials');
    let promptStub = sinon.stub(prompt, 'promptForGithubCredentials');
    let spy = sinon.spy(cli, 'signInToGithub');

    it('should sign in to GitHub and return the credentials', async () => {
      promptStub.resolves({username: 'blah', password: 'blah'});
      githubStub.resolves(true);

      const credentials = await cli.signInToGithub();
      assert.equal(credentials.username, 'blah');
      assert.equal(credentials.password, 'blah');
      assert.equal(spy.calledOnce, true);
    });

    it('should reprompt the user if the credentials are invalid', async () =>  {
      promptStub
        .onFirstCall().resolves({username: 'blah', password: 'blah'})
        .onSecondCall().resolves({username: 'blah', password: 'blah'});

      githubStub
        .onFirstCall().resolves(false)
        .onSecondCall().resolves(true);

      const credentials = await cli.signInToGithub();
      assert.equal(credentials.username, 'blah');
      assert.equal(credentials.password, 'blah');
    });
  });

  describe('signInToHeroku()', () => {
    let herokuStub = sinon.stub(herokuService, 'isValidCredentials');
    let promptStub = sinon.stub(prompt, 'promptForHerokuCredentials');
    let spy = sinon.spy(cli, 'signInToHeroku');

    it('should sign in to Heroku and return the credentials', async () => {
      promptStub.resolves({email: 'blah@blah.com', password: 'blah'});
      herokuStub.resolves(true);

      const credentials = await cli.signInToHeroku();
      assert.equal(credentials.email, 'blah@blah.com');
      assert.equal(credentials.password, 'blah');
      assert.equal(spy.calledOnce, true);
    });

    it('should reprompt the user if the credentials are invalid', async () =>  {

      promptStub
        .onFirstCall().resolves({username: 'blah', password: 'blah'})
        .onSecondCall().resolves({username: 'blah', password: 'blah'});

      herokuStub
        .onFirstCall().resolves(false)
        .onSecondCall().resolves(true);

      const credentials = await cli.signInToHeroku();
      assert.equal(credentials.username, 'blah');
      assert.equal(credentials.password, 'blah');
    });
  });
});