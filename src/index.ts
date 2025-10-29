import { readConfig, setUser } from "./config";

function main(){
    setUser("Ricky");
    console.log(readConfig(true));
}

main();