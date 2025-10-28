function main(){
    console.log("Hello, world!\n\n");

const testing = '[1,2,3]'
let final = JSON.parse(testing, (key, value) => typeof(value) === "number" ? value*2 : value);
console.log(final);
}

main();