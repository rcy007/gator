import { CommandsRegistry, registerCommand, loginHandler,
     runCommand, registerHandler, resetHandler,
     usersHandler, aggHandler } from "./commands";
import process from "process";
async function main() {

    const [cmd, ...others] = process.argv.slice(2);

    const command: CommandsRegistry = {};
    registerCommand(command, "login", loginHandler);
    registerCommand(command, "register", registerHandler);
    registerCommand(command, "reset", resetHandler);
    registerCommand(command, "users", usersHandler);
    registerCommand(command, "agg", aggHandler);
    try {
        if (cmd) {
            await runCommand(command, cmd, ...others);
            process.exit(0);
        } else {
            throw new Error("No command was given.");
        }
    } catch (e: any) {
        console.log("Error: "+e.message);
        process.exit(1);
    }



}

await main();

process.exit(0);