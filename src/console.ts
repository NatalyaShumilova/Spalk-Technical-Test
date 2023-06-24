import { parseFile } from "./mpegParser.js";
import fs from "fs";

const fileName = process.argv[2];

const file = fs.createReadStream(fileName, { highWaterMark: 188 });

console.log("Parsing ", file.path);

await parseFile(file);
