import { setUser, readConfig } from "./config";
import { getFeedFollowsForUser, createFeed, createFeedFollow, createUser, getFeeds, getUser, getUsers, truncUser } from "./lib/db/queries/users";
import { XMLParser } from "fast-xml-parser"
import { title } from "process";
import { Feed, feeds, User } from "src/lib/db/schema";


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

export async function followingHandler(cmdName: string, ...args: string[]) {
    if (args.length !== 0) {
        throw new Error("Unexpected arguments!");
    }
    const result = await getFeedFollowsForUser();
    if(!result) throw new Error("Could not get followed feeds!");

    const user = readConfig().currentUserName;
    if(result.length === 0) console.log(`Sorry, no feeds found for the user: ${user}`);

    console.log(`Feeds followed by the ${user} are: `);
    result.forEach((values) => {console.log(values.feedName)});

}

export async function followHandler(cmdName: string, ...args: string[]) {
    if (args.length !== 1) {
        throw new Error("Unexpected arguments!");
    }
    const url = args[0];
    const result = await createFeedFollow(url);
    if(!result) throw new Error("Could not add follow!");
    for (const [key, value] of Object.entries(result)) {
            console.log(`${key} : ${value}`);
        }

}

export async function feedsHandler(cmdName: string, ...args: string[]) {
    if (args.length !== 0) {
        throw new Error("Unexpected arguments!");
    }
    const result = await getFeeds();
    if(!result) throw new Error("Could not fetch feeds!");

    result.forEach((values) => {
        console.log("--- FEED ---");
        for (const [key, value] of Object.entries(values)) {
            console.log(`${key} : ${value}`);
        }
    })
}

export async function addfeedHandler(cmdName: string, ...args: string[]) {
    if (args.length !== 2){
        throw new Error("Invalid arguments!");
    }
    const [name, url] = args;
    const config = readConfig();
    const user = await getUser(config.currentUserName);

    if(!user){
        throw new Error(`User ${config.currentUserName} not found!`);
    }

    const res = await createFeed(user.id, name, url);
    if (!res){
        throw new Error("Failed to create feed!");
    }
    console.log("Feed created successfully: ");

    const newres = await createFeedFollow(url);
    if(!newres) throw new Error("Failed to create corresponding follow!");

    printFeed(res, user);

}

function printFeed(feed: Feed, user: User) {
  console.log(`* ID:            ${feed.id}`);
  console.log(`* Created:       ${feed.createdAt}`);
  console.log(`* Updated:       ${feed.updatedAt}`);
  console.log(`* name:          ${feed.name}`);
  console.log(`* URL:           ${feed.url}`);
  console.log(`* User:          ${user.name}`);
}

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
        console.log(user+" has been set as the current user!");
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
                        console.log(user + " has been set as the current user!");
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

