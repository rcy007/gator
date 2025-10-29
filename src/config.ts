// export type Config = Record<string, string>;
import fs from "fs";
import os from "os";
import path from "path";


export type Config = {
    "dbUrl": string;
    "currentUserName": string;
};

export function setUser(user: string){
    let config = readConfig();
    config.currentUserName = user;
    writeConfig(config);
}

export function writeConfig(cfg: any){
    const finalConf: any = {};
    for (const key in cfg){
        let newKey = camelToSnake(key);
        finalConf[newKey] = cfg[key];
    }
    fs.writeFileSync(os.homedir()+"/.gatorconfig.json", JSON.stringify(finalConf), {"encoding": "utf-8"});
    
}

export function convertConfig(rawConfig: any): Config{
    const finalConf: any = {};
    for (const key in rawConfig){
        let newKey = snakeToCamel(key);
        finalConf[newKey] = rawConfig[key];
    }
    return finalConf as Config;
}

export function readConfig(convert = true): Config{
    const cf = fs.readFileSync(os.homedir()+"/.gatorconfig.json", {"encoding": "utf-8"});
    let final = JSON.parse(cf);
    if(convert){
        return convertConfig(final);
    } else{
        return final;
    }
}

function snakeToCamel(str: string){
    return str.toLowerCase().replace(/[-_][a-z]/g, (group) => group.slice(-1).toUpperCase());
}

function camelToSnake(str: string) {
  return str
    // insert "_" before every capital letter
    .replace(/([A-Z])/g, "_$1")
    // make the whole thing lowercase
    .toLowerCase()
    // fix possible leading "_" if the string started with a capital
    .replace(/^_/, "");
}