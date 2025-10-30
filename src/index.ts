import { readConfig, setUser } from "./config";
import { CommandsRegistry, registerCommand, loginHandler, runCommand, registerHandler } from "./commands";
import process from "process";
async function main() {

    const [cmd, first, ...others] = process.argv.slice(2);

    const command: CommandsRegistry = {};
    registerCommand(command, "login", loginHandler);
    registerCommand(command, "register", registerHandler);
    try {
        if (cmd) {
            if (first) {
                await runCommand(command, cmd, first);
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

await main();

process.exit(0);