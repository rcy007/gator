import { setUser } from "./config";
import { createUser, getUser, getUsers, truncUser } from "./lib/db/queries/users";
import { readConfig } from "./config";
import { XMLParser } from "fast-xml-parser"
import { title } from "process";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

async function fetchFeed(feedURL: string){
    try{
    const res = await fetch(feedURL, {
        method: "GET",
        headers: {
            "User-Agent": "gator"
        }
     });
    if (!res.ok) {
      throw new Error(`Response status: ${res.status}`);
    }
    const tx = await res.text();
    const parser = new XMLParser();
    const final: RSSFeed = parser.parse(tx).rss;
    // console.log(final);
    if(final.channel){
        // console.log(final);
        if(final.channel.title && final.channel.link && final.channel.description){
            const output: RSSFeed = {channel: {
                title: final.channel.title,
                link: final.channel.link,
                description: final.channel.description,
                item: []
            }};
            if(final.channel.item){
                if(Array.isArray(final.channel.item)){
                    for(const item of final.channel.item){
                        if(item.title && item.pubDate && item.link && item.description){
                            output.channel.item.push({title: item.title, pubDate: item.pubDate, link: item.link, description: item.description});
                        }
                    }
                }
            }
            
        console.log(output.channel);
        } else{
            throw new Error("Missing essential fields in Channel!");
        }
    } else{
        throw new Error("Channel not found in parsed JSON!");
    }
    } catch(e: any){
        throw new Error(e.message);
    }



}

export type CommandHandler =  (cmdName: string, ...args: string[]) => Promise<void>;

export async function aggHandler(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        await fetchFeed("https://www.wagslane.dev/index.xml");
    } else {
        throw new Error("Invalid arguments!");
    }
}

export async function usersHandler(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        try {
            const tr = await getUsers();
            const current = readConfig().currentUserName;
            tr.forEach((x)=> x.name === current ? console.log(x.name+" (current)") : console.log(x.name));
        } catch (e: any) {
            throw new Error(e.message);
        }
    } else {
        throw new Error("Invalid arguments!");
    }
}

export async function resetHandler(cmdName: string, ...args: string[]){
    if(args.length === 0){
        try{
        const tr = await truncUser();
        // console.log(tr);
        console.log("Users table was truncated!");
        } catch(e: any){
            throw new Error(e.message);
        }
    } else{
        throw new Error("Invalid arguments!");
    }
}


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

