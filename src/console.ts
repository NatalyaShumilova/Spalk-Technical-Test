import { parseFile } from "./mpegParser.js";
import fs from "fs";

const fileName = process.argv[2];

const file = fs.createReadStream(fileName, { highWaterMark: 188 });

console.log("Parsing ", file.path);

const result = await parseFile(file);

result.valid && result.packetIds.forEach((o) => console.log(o));

result.errorMessage && console.log(result.errorMessage);

console.log(result.valid ? "0" : "1");
