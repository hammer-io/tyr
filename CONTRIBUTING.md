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


## Commits

Please ensure that commits are descriptive and are free of any obvious grammatical errors.


## Pull Requests

* Please follow the syntax of `closes #issuenumber: description` when submitting pull requests.
* Please write a brief description of the pull request in the comments section
* Please request a reviewer upon submitting pull request.
* When in doubt, follow [GitHub's Guidelines](https://github.com/blog/1943-how-to-write-the-perfect-pull-request)


## Logging

We use the [winston](https://github.com/winstonjs/winston){:target="_blank"} module for
logging. There are several different log levels that we use:

```json
{ 
  error: 0, 
  warn: 1, 
  info: 2, 
  verbose: 3, 
  debug: 4, 
  silly: 5 
}
```

The `info` level is used by default. To increase the level (say, for debugging or if we
add a `--verbose` flag to the CLI), you can set the level by adding the following line.

```javascript
winston.level = 'debug';
```

If you want to save off the output from the console to a file, the `tee` command is
very useful:

```bash
npm start | tee output.log
```
