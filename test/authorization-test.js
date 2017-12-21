import assert from 'assert';
import {basicAuthorization} from '../dist/utils/authorization/authorization';

describe('Authorization Util', () => {
  describe('basicAuthorization()', () => {
    it('should create a basic authorization token based on the username/password', () => {
      assert.equal(basicAuthorization('test', 'test'), 'Basic dGVzdDp0ZXN0');
    })
  })
});