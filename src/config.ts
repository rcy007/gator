// export type Config = Record<string, string>;
import fs from "fs";
import { validateHeaderValue } from "http";
import os from "os";
import path from "path";


export type Config = {
    "dbUrl": string;
    "currentUserName": string;
};

export function setUser(user: string, config: Config){
    config.currentUserName = user;

}

// export function validateConfig(rawConfig: any): Config{
//     if(typeof rawConfig == Config){

//     }
// }

// export function readConfig(): Config{
//     const cf = fs.readFileSync(os.homedir()+"/.gatorconfig.json", {"encoding": "utf-8"});
//     let final = JSON.parse(cf, (key, value) => );
//     console.log(cf);
// }

function snakeToCamel(str: string){
    return str.toLowerCase().replace(/[-_][a-z]/g, (group) => group.slice(-1).toUpperCase());
}
