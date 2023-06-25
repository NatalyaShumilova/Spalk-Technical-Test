import { getStartPoints, parseFile } from "../mpegParser";
import fs from "fs";

const failureFile = () => fs.createReadStream("test_files/test_failure.ts", { highWaterMark: 188 });
const successFile = () => fs.createReadStream("test_files/test_success.ts", { highWaterMark: 188 });
const startPointStream = () => fs.createReadStream("test_files/test_failure.ts", { start: 1, end: 188 });

describe("mpegParser", () => {
  test("Given partialFile when getStartPoints called return all sync byte locations", async () => {
    var result = await getStartPoints(startPointStream());
    console.log(result);
    expect(result).toContain(187);
  });
  test("Given sync byte when parseFile called return valid", async () => {
    var result = await parseFile(successFile());
    expect(result.valid).toBe(true);
  });

  test("Given valid packet when parseFile called return packetId", async () => {
    var result = await parseFile(successFile());
    expect(result.valid).toBe(true);
    expect(result.packetIds).toHaveLength(9);
    expect(result.packetIds).toContain("0000");
    expect(result.packetIds).toContain("0011");
    expect(result.packetIds).toContain("0020");
    expect(result.packetIds).toContain("0021");
    expect(result.packetIds).toContain("0022");
    expect(result.packetIds).toContain("0023");
    expect(result.packetIds).toContain("0024");
    expect(result.packetIds).toContain("0025");
    expect(result.packetIds).toContain("1fff");
  });

  test("Given no sync byte when parseFile called provide packet index", async () => {
    var result = await parseFile(failureFile());
    expect(result.valid).toBe(false);
    expect(result.error.message).toBe("Error: No sync byte present in packet 20535, offset 3860580");
    expect(result.error.distance).toBe(20535);
  });
});
