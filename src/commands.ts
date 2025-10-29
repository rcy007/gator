import { setUser } from "./config";

export type CommandHandler = (cmdName: string, ...args: string[]) => void;

export function loginHandler(cmdName: string, ...args: string[]){
    if(args.length !== 1){
        throw new Error("Wrong argument!");
    } else{
        const user = args[0];
        setUser(user);
        console.log(user+" has been set!");
    }
}

export type CommandsRegistry = Record<string, CommandHandler>;

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler){
    // This function registers a new handler function for a command name.
    registry[cmdName] = handler;

};

export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]){
    // This function runs a given command with the provided state if it exists.
    if(cmdName in registry){
        // loginHandler(cmdName, ...args);
        registry[cmdName](cmdName, ...args);
    } else{
        console.log("No such command!");
    }

}

