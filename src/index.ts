import { readConfig, setUser } from "./config";
import { CommandsRegistry, registerCommand, loginHandler, runCommand } from "./commands";
import process from "process";
function main() {

    const [cmd, first, ...others] = process.argv.slice(2);

    const command: CommandsRegistry = {};
    registerCommand(command, "login", loginHandler);
    try {
        if (cmd) {
            if (first) {
                runCommand(command, cmd, first);
                process.exit(0);
            } else {
                throw new Error("A username is required.");
            }
        } else {
            throw new Error("Not enough arguments were provided.");
        }
    } catch (e: any) {
        console.log(e.message);
        process.exit(1);
    }



}

main();