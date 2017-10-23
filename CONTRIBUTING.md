## Installation for Development

1. Fork this repository.
2. Open your favorite terminal and navigate to the desired installation location.
3. `git clone https://github.com/<your_username>/tyr`,
4. `cd tyr`
5. `npm install`


## Usage

```bash
npm start     # starts the main command line interface.
npm test      # runs the test suite
npm run lint  # runs the linter
```


## Running the Tests

There's a small amount of configuration needed to run the tests locally.
Observe the bottom of the [.gitignore](https://github.com/hammer-io/tyr/blob/master/.gitignore)
file, where it ignores the file `/test/github-test-credentials.txt`. You need to create this
file on your local machine and populate it as follows:

```bash
####   WARNING: Do not commit!!!   ####

username=
password=
```

The username and password need to be filled in with actual GitHub
account credentials. This is used for tests that involve the
GitHub API. We've got a test user named Holmgang on GitHub for
this purpose. Reach out to one of the developers if you need the
password for that account. Otherwise, any valid account information
you use will work for the tests.


## Commits

Please ensure that commits are descriptive and are free of any obvious grammatical errors.


## Pull Requests

* Please follow the syntax of `closes #issuenumber: description` when submitting pull requests.
* Please write a brief description of the pull request in the comments section
* Please request a reviewer upon submitting pull request.
* When in doubt, follow [GitHub's Guidelines](https://github.com/blog/1943-how-to-write-the-perfect-pull-request)


## Logging

We use the [winston](https://github.com/winstonjs/winston) module for
logging. There are several different log levels that we use:

```javascript
{ 
  error: 0, 
  warn: 1, 
  info: 2, 
  verbose: 3, 
  debug: 4, 
  silly: 5 
}
```

The `info` level is used by default. To increase the level for debugging, you can
set the level by adding the following line.

```javascript
winston.level = 'debug';
```

If you want to save off the output from the console to a file, the `tee` command is
very useful:

```bash
npm start | tee output.log
```
