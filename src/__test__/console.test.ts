import { validate } from "../console";

const failureFile = "test_files/test_failure.ts";
const successFile = "test_files/test_success.ts";

const consoleOuput = jest.spyOn(console, "log");

jest.mock("../mpegParser", () => ({
  getStartPoints: jest.fn(() => [0]),
  parseFile: jest.fn(() => {
    return { valid: true, error: {}, packetIds: [] };
  }),
}));

describe("validate", () => {
  test("Given file get all startPoints", async () => {
    await validate(successFile);

    expect(consoleOuput).toHaveBeenCalledWith("Parsing ", successFile);
  });
});
