import { parseFile, getStartPoints } from "./mpegParser.js";
import fs from "fs";

export const validate = async (fileName: string) => {
  console.log("Parsing ", fileName);

  const startPointStream = fs.createReadStream(fileName, { start: 0, end: 187 });

  const startPoints = await getStartPoints(startPointStream);

  if (!startPoints.length) {
    console.log("Error: No sync byte found within first 188 bytes of the stream");
  } else {
    let point = 0;
    let errors = [];

    while (point < startPoints.length) {
      const stream = fs.createReadStream(fileName, { highWaterMark: 188, start: startPoints[point] });
      const result = await parseFile(stream);

      if (result.valid) {
        result.packetIds.forEach((o) => console.log(o));
        console.log(`Started at byte ${startPoints[point]}`);
        console.log(0);
        point = startPoints.length;
        break;
      }

      errors.push({ ...result.error, startPoint: startPoints[point] });
      point++;
    }

    if (errors.length === startPoints.length) {
      const furthestError = errors.sort((a, b) => b.distance - a.distance)[0];
      console.log(furthestError?.message);
      console.log(`Started at byte ${furthestError?.startPoint}`);
      console.log(1);
    }
  }
};

export const runConsole = () => {
  const fileName = process.argv[2];

  validate(fileName);
};
