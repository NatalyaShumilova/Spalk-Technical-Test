import { ReadStream } from "fs";

/**
 * Locates all potential sync bytes within the provided stream, and returns an array of indexes.
 * @param stream the file stream to check
 * @returns the indexes of all potential sync bytes
 */
export const getStartPoints = async (stream: ReadStream) => {
  let startPoints: number[] = [];

  var end = new Promise<number[]>(function (resolve, reject) {
    stream.on("end", () => resolve(startPoints));
    stream.on("error", () => reject());
  });

  stream.on("data", (chunk: Buffer) => chunk.forEach((b, i) => b.toString(16) === "47" && startPoints.push(i)));

  return await end;
};

/**
 * Validates each individual packet. Checks for the presence of a sync byte, and parses the packet Id.
 * @param buffer the packet to check
 * @returns An object containing an error status and the packet Id
 */
const validatePacket = (buffer: Buffer) => {
  const hasSyncByte = buffer.toString("hex", 0, 1) === "47";
  if (!hasSyncByte) {
    return { error: true, packetId: null };
  }

  const packetId = Buffer.from([buffer[1] & 31, buffer[2]]).toString("hex");

  return { error: false, packetId };
};

/**
 * Reads the provided stream and validates each chunk (packet).
 * @param stream the file stream to parse
 * @returns An object containing the validation result, an array of packet Ids, and error details
 */
export const parseFile = async (stream: ReadStream) => {
  let chunk = 0;
  let error = { message: "", distance: 0 };
  const packetIds: string[] = [];
  let valid = true;

  var end = new Promise<{ valid: boolean; error: { message: string; distance: number }; packetIds: string[] }>(
    function (resolve, reject) {
      const distinct = (ids: string[]) => [...new Set(ids)].sort();
      stream.on("end", () => resolve({ valid, error, packetIds: distinct(packetIds) }));
      stream.on("close", () => resolve({ valid, error, packetIds: distinct(packetIds) }));
      stream.on("error", (error) =>
        reject({ valid: false, errorMessage: error.message, packetIds: distinct(packetIds) })
      );
    }
  );

  stream.on("data", (buffer: Buffer) => {
    const { error: hasError, packetId } = validatePacket(buffer);
    if (hasError) {
      valid = false;
      error = { message: `Error: No sync byte present in packet ${chunk}, offset ${188 * chunk}`, distance: chunk };
      stream.close();
    }

    packetId && packetIds.push(packetId);
    chunk++;
  });

  return await end;
};
