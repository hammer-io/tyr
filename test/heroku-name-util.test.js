import assert from 'assert';
import {makeHerokuAppNameCompliant} from "../dist/utils/heroku-name-util";

describe('Heroku Name Util', () => {
    it('should not modify the name since it is already compliant', () => {
        assert.equal('good-name', makeHerokuAppNameCompliant('good-name'));
        assert.equal('g00d-n4m3', makeHerokuAppNameCompliant('g00d-n4m3'));
    });

    it('should make the app name compliant', () => {
       assert.equal(makeHerokuAppNameCompliant('TEST_PROJECT'), 'test-project');
       assert.equal(makeHerokuAppNameCompliant('TEST!@#$%^&*()_'), 'test-----------')
    });
});