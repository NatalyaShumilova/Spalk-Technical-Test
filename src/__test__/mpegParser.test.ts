import { parseFile } from "../mpegParser";
import fs from "fs";

const failureFile = () => fs.createReadStream("test_files/test_failure.ts", { highWaterMark: 188 });
const successFile = () => fs.createReadStream("test_files/test_success.ts", { highWaterMark: 188 });

describe("mpegParser", () => {
  test("Given sync byte return valid", async () => {
    var result = await parseFile(successFile());
    expect(result.valid).toBe(true);
  });

  test("Given valid packet return packetId", async () => {
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

  test("Given no sync byte provide packet index", async () => {
    var result = await parseFile(failureFile());
    expect(result.valid).toBe(false);
    expect(result.errorMessage).toContain("Error: No sync byte present in packet 20535, offset 3860580");
  });
});
