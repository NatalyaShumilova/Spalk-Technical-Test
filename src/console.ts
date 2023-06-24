import { parseFile } from "./mpegParser.js";
import fs from "fs";

const fileName = process.argv[2];

const file = fs.createReadStream(fileName, { highWaterMark: 188 });

console.log("Parsing ", file.path);

const result = await parseFile(file);

result.output.forEach((o) => console.log(o));

console.log(`File is ${result.valid ? "valid" : "invalid"}`);
