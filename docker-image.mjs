import fs from "fs";
import path from "path";

const configurationPath =  ["src", "CONFIGURATIONS.json"]

console.log(process.env)

const welcome = JSON.parse(fs.readFileSync(
  path.resolve(...configurationPath),
  "utf-8"
));
console.log(welcome)
