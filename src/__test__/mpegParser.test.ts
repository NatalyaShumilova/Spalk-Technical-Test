import { parseFile } from "../mpegParser";
import fs from "fs";

const failureFile = fs.createReadStream("test_files/test_failure.ts", { highWaterMark: 188 });
const successFile = fs.createReadStream("test_files/test_success.ts", { highWaterMark: 188 });

describe("mpegParser", () => {
  test("Given sync byte return valid", async () => {
    var result = await parseFile(successFile);
    expect(result.valid).toBe(true);
  });

  test("Given no sync byte provide packet index", async () => {
    var result = await parseFile(failureFile);
    expect(result.valid).toBe(false);
    expect(result.output).toContain("Error: No sync byte present in packet 20535, offset 3860580");
  });
});
