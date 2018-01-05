import assert from 'assert';
import fs from 'fs-extra';

import {generateExpressFiles} from '../dist/services/express-service';

describe('Express Service Test', () => {
  describe('generateExpressFiles()', () => {
    beforeEach(() => {
      fs.mkdirSync('test-express');
      fs.mkdirSync('test-express/src');
      fs.writeFileSync('test-express/package.json', "{\n" +
        "  \"name\": \"test-express\",\n" +
        "  \"version\": \"0.0.0\",\n" +
        "  \"description\": \"test-project\",\n" +
        "  \"main\": \"src/index.js\",\n" +
        "  \"scripts\": {\n" +
        "    \"start\": \"node src/index.js\",\n" +
        "    \"test\": \"mocha\"\n" +
        "  },\n" +
        "  \"repository\": {},\n" +
        "  \"authors\": [],\n" +
        "  \"license\": \"\",\n" +
        "  \"bin\": {},\n" +
        "  \"dependencies\": {},\n" +
        "  \"devDependencies\": {\n" +
        "    \"mocha\": \"3.5.3\"\n" +
        "  }\n" +
        "}");
    });

    it('should generate an index.html file', async () => {
      await generateExpressFiles('test-express');

      const expectedIndexContents = "<head>\n" +
        "    <meta charset=\"utf-8\">\n" +
        "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, shrink-to-fit=no\">\n" +
        "    <meta name=\"theme-color\" content=\"#000000\">\n" +
        "    <link rel=\"manifest\" href=\"/manifest.json\">\n" +
        "    <title>Your Hammer app</title>\n" +
        "    <style type=\"text/css\">body {\n" +
        "        margin: 0;\n" +
        "        padding: 0;\n" +
        "        font-family: sans-serif;\n" +
        "    }\n" +
        "    </style><style type=\"text/css\">.App {\n" +
        "    text-align: center;\n" +
        "}\n" +
        "\n" +
        ".App-logo {\n" +
        "    height: 120px;\n" +
        "}\n" +
        "\n" +
        ".App-header {\n" +
        "    background-color: #222;\n" +
        "    height: 200px;\n" +
        "    padding: 20px;\n" +
        "    color: white;\n" +
        "}\n" +
        "\n" +
        ".App-title {\n" +
        "    font-size: 1.5em;\n" +
        "}\n" +
        "\n" +
        ".App-intro {\n" +
        "    font-size: large;\n" +
        "}\n" +
        "\n" +
        "</style></head>\n" +
        "<body>\n" +
        "<div id=\"root\"><div class=\"App\"><header class=\"App-header\"><img src=\"https://hammer-io.github.io/i/Viking_Hammer_Logo_1.png\" class=\"App-logo\" alt=\"logo\"><h1 class=\"App-title\">Hello World!</h1></header><p class=\"App-intro\">Welcome to your new app created through <a href=\"https://github.com/hammer-io\">hammer-io<a>.</p></div></div>\n" +
        "\n" +
        "</body>"

      assert.equal(fs.existsSync('test-express/src/index.html'), true);
      assert.equal(fs.readFileSync('test-express/src/index.html'), expectedIndexContents);

    });

    it('should generate an index.js file', async () => {
      await generateExpressFiles('test-express');

      const expectedIndexContents = "const express = require('express');\n" +
        "const routes = require('./routes');\n" +
        "\n" +
        "const app = express();\n" +
        "\n" +
        "// set our port\n" +
        "const port = process.env.PORT || 8080;\n" +
        "\n" +
        "// routes\n" +
        "app.use('/', routes);\n" +
        "\n" +
        "// start app at localhost:8080\n" +
        "app.listen(port);\n" +
        "\n" +
        "console.log(`Listening on ${port}`);\n" +
        "module.exports = app;";

      assert.equal(fs.existsSync('test-express/src/index.js'), true);
      assert.equal(fs.readFileSync('test-express/src/index.js'), expectedIndexContents)
    });

    it('should generate a routes.js file', async () => {
      await generateExpressFiles('test-express');

      const expectedRoutesContent = "const express = require('express');\n" +
        "const router = express.Router();\n" +
        "\n" +
        "// Routes go here\n" +
        "\n" +
        "module.exports = router;\n" +
        "\n" +
        "\n" +
        "// Example endpoint\n" +
        "router.get('/', function (req, res) {\n" +
        "  res.sendFile(__dirname + '/index.html');\n" +
        "});";

      assert.equal(fs.existsSync('test-express/src/routes.js'), true);
      assert.equal(fs.readFileSync('test-express/src/routes.js'), expectedRoutesContent);
    });

    it('should add express as a dependency to the package.json file', async () => {

      const expectedPackageJsonContents = "{\n" +
        " \"name\": \"test-express\",\n" +
        " \"version\": \"0.0.0\",\n" +
        " \"description\": \"test-project\",\n" +
        " \"main\": \"src/index.js\",\n" +
        " \"scripts\": {\n" +
        "  \"start\": \"node src/index.js\",\n" +
        "  \"test\": \"mocha\"\n" +
        " },\n" +
        " \"repository\": {},\n" +
        " \"authors\": [],\n" +
        " \"license\": \"\",\n" +
        " \"bin\": {},\n" +
        " \"dependencies\": {\n" +
        "  \"express\": \"4.16.0\"\n" +
        " },\n" +
        " \"devDependencies\": {\n" +
        "  \"mocha\": \"3.5.3\"\n" +
        " }\n" +
        "}";


      await generateExpressFiles('test-express');

      assert.equal(fs.existsSync('test-express/package.json'), true);
      assert.equal(fs.readFileSync('test-express/package.json', 'utf-8'), expectedPackageJsonContents);

    });

    afterEach(() => {
      fs.removeSync('test-express');
    });
  });
});