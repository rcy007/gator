import process from "process";

const [cmd, ...others] = process.argv.slice(2);

console.log(others);

if(others){
    console.log(22);
} else{
    console.log(33);
}