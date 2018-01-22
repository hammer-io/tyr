[![Build Status](https://travis-ci.org/hammer-io/tyr.svg?branch=master)](https://travis-ci.org/hammer-io/tyr)
[![codecov](https://codecov.io/gh/hammer-io/tyr/branch/master/graph/badge.svg)](https://codecov.io/gh/hammer-io/tyr)
[![npm version](https://badge.fury.io/js/tyr-cli.svg)](https://badge.fury.io/js/tyr-cli)

# tyr

A CLI tool to scaffold Node.js microservice applications with DevOps capabilities. It
takes an opinionated approach, meaning we've done the homework and start you off with
what we think are the best tools for a small team creating a new open-source project. Upon
running the CLI, it will ask you a series of questions and use the answers to do the
following:

- generate a new Node.js project,
- add testing, web, and database frameworks,
- initialize and push the code to a new GitHub repository,
- establish a continuous integration environment,
- build a container for the code, and
- deploy the app container to a cloud service.

The goal is to save you time and headaches and get you started developing code faster.


## Getting Started

### Prerequisites

Before you can use Tyr, you need to make sure you've done the following:

1. Create a [GitHub](https://github.com/) account. At this current stage of development,
   GitHub is the default version control platform for storing and managing your code.
2. Ensure that you linked your TravisCI account to your GitHub account.   
3. Create a [Heroku](https://signup.heroku.com/) account. At this current stage of development, Heroku is the default web hosting service. 
4. After creating a Heroku account, find your API key [here](https://dashboard.heroku.com/account). Make sure to copy it as you'll need it to sign in to Heroku. 

### Installation

```bash
npm install --global tyr-cli
```


## Usage

```bash
tyr [OPTIONS]
```

### Options:
* `-V, --version`    output the version number
* `--config <file>`  configure project from configuration file
* `--logfile <file>` the filepath that logs will be written to
* `-h, --help`       output usage information

## Configuration File
### Project Configurations
| Name          | Required | Note                                                                           |
|---------------|----------|--------------------------------------------------------------------------------|
| `projectName` | Yes      | Must be a valid directory name and cannot be a directory that already exists.  |
| `description` | Yes      |                                                                                |
| `version`     | No       | Must match `(number)(.number)*`                                                |
| `author`      | No       | For multiple authors, use comma separated values                               |
| `license`     | No       |                                                                                |

### Tooling Choices
| Name               | Required | Description                                    | Valid Choices         |
|--------------------|----------|------------------------------------------------|-----------------------|
| `ci`               | Yes      | The Continuous Integration Tool you want to use | `<None>`, `TravisCI`  |
| `containerization` | Yes      | The Containerization tool you want to use      | `<None>`, `Docker`    |
| `deployment`       | Yes      | The deployment tool you want to use            | `<None>`, `Heroku`    |
| `sourceControl`    | Yes      | The source control tool you want to use        | `<None>`, `GitHub`    |
| `web`              | Yes      | The web framework you want to use              | `<None>`, `ExpressJS` |
| `test`             | Yes      | The test framework you want to use             | `<None>`, `Mocha`      |
| `database`         | Yes      | The database framework you want to use         | `<None>`, `Sequelize` |


* If Source Control Choice is `<None>`, then CI Choice, Containerization Choice, and Deployment 
Choice must also be `<None>`.

* If CI Choice is `<None>`, then Containerization Choice and Deployment Choice must also be `<None>`.

* If Containerization Choice is `<None>`, then Deployment Choice must also be none. 

### File Format
```javascript
{
  projectConfigurations:
    {
      projectName: '{project name}',
      description: '{project description}',
      version: '{version number}',
      author: ['author1', 'author2', ...],
      license: '{license}'
    },
  toolingConfigurations:
    {
      sourceControl: '{source control choice}',
      ci: '{ci choice}',
      containerization: '{containerization choice}',
      deployment: '{deployment choice}',
      web: '{web framework choice}',
      test: '{test framework choice}',
      database: '{database framework choice}'
    }
}
```


## Contributing

Please see our [Contributing Guide](https://github.com/hammer-io/tyr/blob/master/CONTRIBUTING.md)
for contribution guidelines.

## Security Information Management Policy

In order to orchestrate the various third party applications for your
project, we will periodically ask for your username and password to
these applications. To find out more about how we use these credentials
and what steps we are taking to keep your information safe, please read
the [Security Information Management Policy](https://github.com/hammer-io/tyr/blob/master/SECURITY_INFORMATION_MANAGEMENT_POLICY.md).
