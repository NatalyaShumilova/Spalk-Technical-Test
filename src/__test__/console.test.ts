import { validate } from "../console";

const failureFile = "test_files/test_failure.ts";
const successFile = "test_files/test_success.ts";

const consoleOuput = jest.spyOn(console, "log");

const mockGetStartPoints = jest.fn(() => Promise.resolve([0]));
const mockParseFile = jest.fn(() => Promise.resolve({ valid: true, error: {}, packetIds: [] as string[] }));

jest.mock("../mpegParser", () => ({
  getStartPoints: () => mockGetStartPoints(),
  parseFile: () => mockParseFile(),
}));

describe("validate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("Given file get all startPoints", async () => {
    await validate(successFile);

    expect(consoleOuput).toHaveBeenCalledWith("Parsing ", successFile);
    expect(mockGetStartPoints).toHaveBeenCalled();
  });

  test("Given no start points return error", async () => {
    mockGetStartPoints.mockReturnValue(Promise.resolve([]));
    await validate(successFile);

    expect(consoleOuput).toHaveBeenCalledWith("Error: No sync byte found within first 188 bytes of the stream");
    expect(mockParseFile).not.toHaveBeenCalled();
  });

  test("Given invalid partial file call parseFile for each startPoint", async () => {
    mockGetStartPoints.mockReturnValue(Promise.resolve([0, 1, 2]));
    mockParseFile
      .mockReturnValueOnce(Promise.resolve({ valid: false, error: { distance: 1, message: "error 1" }, packetIds: [] }))
      .mockReturnValueOnce(Promise.resolve({ valid: false, error: { distance: 2, message: "error 2" }, packetIds: [] }))
      .mockReturnValueOnce(
        Promise.resolve({ valid: false, error: { distance: 3, message: "error 3" }, packetIds: [] })
      );
    await validate(failureFile);

    expect(mockParseFile).toHaveBeenCalledTimes(3);
    expect(consoleOuput).toHaveBeenCalledWith("error 3");
    expect(consoleOuput).toHaveBeenCalledWith("Started at byte 2");
    expect(consoleOuput).toHaveBeenCalledWith(1);
  });

  test("Given valid partial file stop executing after successful validation", async () => {
    mockGetStartPoints.mockReturnValue(Promise.resolve([0, 1, 2]));
    mockParseFile
      .mockReturnValueOnce(Promise.resolve({ valid: false, error: { distance: 1, message: "error 1" }, packetIds: [] }))
      .mockReturnValueOnce(Promise.resolve({ valid: true, error: {}, packetIds: ["0000", "0001"] }));
    await validate(failureFile);

    expect(mockParseFile).toHaveBeenCalledTimes(2);
    expect(consoleOuput).toHaveBeenCalledWith("0000");
    expect(consoleOuput).toHaveBeenCalledWith("0001");
    expect(consoleOuput).toHaveBeenCalledWith("Started at byte 1");
    expect(consoleOuput).toHaveBeenCalledWith(0);
  });
});
