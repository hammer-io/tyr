/**
 * The Cli class.
 */

var chalk = require('chalk');
var figlet = require('figlet');
var inquirer = require('inquirer');

export class Cli {

    constructor() {

    }

    run() {
        console.log(chalk.yellow(figlet.textSync("hammer-io", {horizontalLayout: 'full'})));


        var questions = [{
                name: 'projectName',
                type: 'input',
                message: 'Project Name:',
                validate: function(value) {
                    return true;
                }
            }, {
                name: 'description',
                type: 'input',
                message: 'Description:',
                validate: function(value) {
                    return true;
                }
            }, {
                name: 'version',
                type: 'input',
                message: 'Version:',
                validate: function(value) {
                    return true;
                }
            }
        ];

        inquirer.prompt(questions).then(function(answers) {
           console.log(answers);
        });


    }
}