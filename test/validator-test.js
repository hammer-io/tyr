import * as validator from '../dist/utils/validator'
import sourceControlChoices from '../dist/constants/source-control-choices';
import ciChoices from '../dist/constants/ci-choices';
import webChoices from '../dist/constants/web-choices';
import deploymentChoices from '../dist/constants/deployment-choices';
import containerizationChoices from '../dist/constants/containerization-choices';
import assert from 'assert';


const noErrorConfig = {
  projectConfigurations:
    {
      projectName: 'jack',
      description: 'jack',
      version: '0.0.0',
      author: 'jack',
      license: ''
    },
  tooling:
    {
      sourceControl: '<None>',
      web: '<None>',
      ci: '<None>',
      containerization: '<None>',
      deployment: '<None>'
    }
};

const badToolingChoices = {
  projectConfigurations:
    {
      projectName: 'jack',
      description: 'jack',
      version: '0.0.0',
      author: 'jack',
      license: ''
    },
  tooling:
    {
      sourceControl: 'fdafdasfdsa',
      web: 'fdafdsafds',
      ci: 'fdafdafdsa',
      containerization: 'fdafdsafda',
      deployment: 'fdafdsafa'
    }
};

const invalidProjectName = {
  projectConfigurations:
    {
      projectName: '',
      description: 'jack',
      version: '0.0.0',
      author: 'jack',
      license: ''
    },
  tooling:
    {
      sourceControl: '<None>',
      web: '<None>',
      ci: '<None>',
      containerization: '<None>',
      deployment: '<None>'
    }
};

const missingProjectConfigurations = {
  projectConfigurations:
    {
      version: '0.0.0',
      author: 'jack',
      license: ''
    },
  tooling:
    {
      sourceControl: '<None>',
      web: '<None>',
      ci: '<None>',
      containerization: '<None>',
      deployment: '<None>'
    }
};

const missingToolingChoices = {
  projectConfigurations:
    {
      projectName: 'jack',
      description: 'jack',
      version: '0.0.0',
      author: 'jack',
      license: ''
    },
  tooling:
    {}
};

const githubNone = {
  projectConfigurations:
    {
      projectName: 'jack',
      description: 'jack',
      version: '0.0.0',
      author: 'jack',
      license: ''
    },
  tooling:
    {
      sourceControl: '<None>',
      web: 'ExpressJS',
      ci: 'TravisCI',
      containerization: 'Docker',
      deployment: 'Heroku'
    }
};

const ciNone = {
  projectConfigurations:
    {
      projectName: 'jack',
      description: 'jack',
      version: '0.0.0',
      author: 'jack',
      license: ''
    },
  tooling:
    {
      sourceControl: 'GitHub',
      web: '<None>',
      ci: '<None>',
      containerization: 'Docker',
      deployment: 'Heroku'
    }
};

const containerNone = {
  projectConfigurations:
    {
      projectName: 'jack',
      description: 'jack',
      version: '0.0.0',
      author: 'jack',
      license: ''
    },
  tooling:
    {
      sourceControl: 'GitHub',
      web: '<None>',
      ci: 'TravisCI',
      containerization: '<None>',
      deployment: 'Heroku'
    }
};



describe('Validation of configuration file', () => {
  it('should validate configuration file with no errors', () => {
    const errors = validator.validateProjectConfigurations(noErrorConfig);
    assert.equal(errors.length, 0);
  });

  it('should validate missing project configurations', () => {
    const errors = validator.validateProjectConfigurations(missingProjectConfigurations);
    assert.equal(errors.length, 2);
    assert.equal(errors[0], 'Project Name does not exist!');
    assert.equal(errors[1], 'Project Description does not exist!');
  });

  it('should validate missing tooling choices', () => {
    const errors = validator.validateProjectConfigurations(missingToolingChoices);
    assert.equal(errors.length, 5);
    assert.equal(errors[0], 'Source Control choice does not exist!');
    assert.equal(errors[1], 'CI choice does not exist!');
    assert.equal(errors[2], 'Container choice does not exist!');
    assert.equal(errors[3], 'Deployment choice does not exist!');
    assert.equal(errors[4], 'Web framework choice does not exist!');
  });

  it('should validate bad tooling choices', () => {
    const errors = validator.validateProjectConfigurations(badToolingChoices);
    assert.equal(errors.length, 5);
    assert.equal(errors[0], `Invalid source control choice. Valid choices are ${sourceControlChoices.choices}.`);
    assert.equal(errors[1], `Invalid CI choice. Valid choices are ${ciChoices.choices}.`);
    assert.equal(errors[2], `Invalid container choice. Valid choices are ${containerizationChoices.choices}`);
    assert.equal(errors[3], `Invalid deployment choice. Valid choices are ${deploymentChoices.choices}`);
    assert.equal(errors[4], `Invalid web framework choice. Valid choices are ${webChoices.choices}`);

  });

  it('should validate a bad project name', () => {
    const errors = validator.validateProjectConfigurations(invalidProjectName);
    assert.equal(errors.length, 1);
    assert.equal(errors[0], 'Invalid project name!');
  });

  it('should validate that github is not used and other tools are used', () => {
    const errors = validator.validateProjectConfigurations(githubNone);
    assert.equal(errors.length, 3);
    assert.equal(errors[0], 'If source control choice is <None>, CI choice must be <None>');
    assert.equal(errors[1], 'If source control choice is <None>, container choice must be <None>');
    assert.equal(errors[2], 'If source control choice is <None>, deployment choice must be <None>');

  });

  it('should validate that travis is not used and other tools are used', () => {
    const errors = validator.validateProjectConfigurations(ciNone);
    assert.equal(errors.length, 2);
    assert.equal(errors[0], 'If ci choice is <None>, container choice must be <None>');
    assert.equal(errors[1], 'If ci choice is <None>, deployment choice must be <None>');
  });

  it('should validate that docker is not and other tools are used', () => {
    const errors = validator.validateProjectConfigurations(containerNone);
    assert.equal(errors.length, 1);
    assert.equal(errors[0], 'If container choice is <None>, deployment choice must be <None>');
  });
});
