import assert from 'assert';
import {basicAuthorization, tokenAuthorization, bearerAuthorization} from '../dist/utils/authorization/authorization';

describe('Authorization Util', () => {
  describe('basicAuthorization()', () => {
    it('should create a basic authorization token based on the username/password', () => {
      assert.equal(basicAuthorization('test', 'test'), 'Basic dGVzdDp0ZXN0');
    });

    describe('tokenAuthorization()', () => {
      it('should create a token based on another token', () => {
        assert.equal(tokenAuthorization('blah'), 'token blah')
      });
    });

    describe('bearerAuthorization()', () => {
      it('should create a bearer authorization token', () => {
        assert.equal(bearerAuthorization('blah'), 'Bearer blah');
      });
    });
  })
});