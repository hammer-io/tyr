import assert from 'assert';
import * as credentialValidator from '../dist/utils/credential-validator';

describe('Credential Validator Test', () => {
  describe('validateUsername()', () => {
    it('should not allow a blank username', () => {
      assert.equal(credentialValidator.validateUsername(''), 'Username cannot be blank!');
      assert.equal(credentialValidator.validateUsername(' '), 'Username cannot be blank!');
      assert.equal(credentialValidator.validateUsername('       '), 'Username cannot be blank!');
    });

    it('should allow a valid username', () => {
      assert.equal(credentialValidator.validateUsername('valid'), true);
      assert.equal(credentialValidator.validateUsername('valid      '), true);
      assert.equal(credentialValidator.validateUsername('     valid     '), true);
    });
  });

  describe('validateEmail()', () => {
    it('should not allow a blank email', () => {
      assert.equal(credentialValidator.validateEmail(''), 'Email cannot be blank!');
      assert.equal(credentialValidator.validateEmail(' '), 'Email cannot be blank!');
      assert.equal(credentialValidator.validateEmail('       '), 'Email cannot be blank!');
    });

    it('should not allow an email in an invalid format', () => {
      assert.equal(credentialValidator.validateEmail('badformat'), 'Email must be a valid email!');
      assert.equal(credentialValidator.validateEmail('badformat@badformat'), 'Email must be a valid email!');
      assert.equal(credentialValidator.validateEmail('badformat.com'), 'Email must be a valid email!');
    });

    it('should allow valid emails', () => {
      assert.equal(credentialValidator.validateEmail('goodformat@hi.com'), true);
      assert.equal(credentialValidator.validateEmail('goodformat@hi.net.com'), true);
      assert.equal(credentialValidator.validateEmail('goodformat@hi.org'), true);
    });
  });

  describe('validatePassword()', () => {
    it('should not allow a blank password', () => {
      assert.equal(credentialValidator.validatePassword(''), 'Password cannot be blank!');
      assert.equal(credentialValidator.validatePassword(' '), 'Password cannot be blank!');
      assert.equal(credentialValidator.validatePassword('       '), 'Password cannot be blank!');
    });

    it('should allow a valid password', () => {
      assert.equal(credentialValidator.validatePassword('valid'), true);
      assert.equal(credentialValidator.validatePassword('valid      '), true);
      assert.equal(credentialValidator.validatePassword('     valid     '), true);
    });
  });

  describe('validateApiKey()', () => {
    it('should not allow a blank password', () => {
      assert.equal(credentialValidator.validateApiKey(''), 'API Key cannot be blank!');
      assert.equal(credentialValidator.validateApiKey(' '), 'API Key cannot be blank!');
      assert.equal(credentialValidator.validateApiKey('       '), 'API Key cannot be blank!');
    });

    it('should allow a valid password', () => {
      assert.equal(credentialValidator.validateApiKey('valid'), true);
      assert.equal(credentialValidator.validateApiKey('valid      '), true);
      assert.equal(credentialValidator.validateApiKey('     valid     '), true);
    });
  });
});