import { setUser } from "./config";
import { createUser, getUser } from "./lib/db/queries/users";

export type CommandHandler =  (cmdName: string, ...args: string[]) => Promise<void>;

export async function loginHandler(cmdName: string, ...args: string[]){
    if(args.length !== 1){
        throw new Error("Wrong argument!");
    } else{
        const user = args[0];
        const gres = await getUser(user);
        if(!gres){
            throw new Error("User does not exist in database!");
        }
        setUser(user);
        console.log(user+" has been set!");
    }
}

export async function registerHandler(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error("Wrong argument!");
    } else {
        try {
            const user = args[0];
            const gres = await getUser(user);
            if (!gres) {
                try {
                    const res = await createUser(user);
                    try {
                        // console.log(gres);
                        setUser(user);
                        console.log(user + " has been set!");
                        console.log(res);
                    } catch (e: any) {
                        throw new Error("User is added but FAILURE to set User! " + e.message);
                    }
                } catch (e: any) {
                    throw new Error("User creation error! " + e.message);
                }
            } else {
                throw new Error("User already exists! ");
            }
        } catch (e: any) {
            throw new Error("Database error! " + e.message);
        }
    }
}

export type CommandsRegistry = Record<string, CommandHandler>;

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler){
    // This function registers a new handler function for a command name.
    registry[cmdName] = handler;

};

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]){
    // This function runs a given command with the provided state if it exists.
    if(cmdName in registry){
        // loginHandler(cmdName, ...args);
        await registry[cmdName](cmdName, ...args);
    } else{
        console.log("No such command!");
    }

}

