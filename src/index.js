#! /usr/bin/env node

import { Cli } from "./cli";

function main() {
    const cli = new Cli();
    cli.run();
}

main();