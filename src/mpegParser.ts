import { ReadStream } from "fs";

const validatePacket = (buffer: Buffer, chunk: number) => {
  const hasSyncByte = buffer.toString("hex", 0, 1) === "47";
  if (!hasSyncByte) {
    return { error: `Error: No sync byte present in packet ${chunk}, offset ${188 * chunk}`, packetId: null };
  }

  const packetId = Buffer.from([buffer[1] & 31, buffer[2]]).toString("hex");

  return { error: null, packetId };
};

export const parseFile = async (stream: ReadStream) => {
  let chunk = 0;
  let errorMessage = "";
  const packetIds: string[] = [];
  let valid = true;

  var end = new Promise<{ valid: boolean; errorMessage: string; packetIds: string[] }>(function (resolve, reject) {
    const distinct = (ids: string[]) => [...new Set(ids)].sort();
    stream.on("end", () => resolve({ valid, errorMessage, packetIds: distinct(packetIds) }));
    stream.on("close", () => resolve({ valid, errorMessage, packetIds: distinct(packetIds) }));
    stream.on("error", (error) =>
      reject({ valid: false, errorMessage: error.message, packetIds: distinct(packetIds) })
    );
  });

  stream.on("data", (buffer: Buffer) => {
    const { error, packetId } = validatePacket(buffer, chunk);
    if (error) {
      stream.close();
      valid = false;
      errorMessage = error;
    }

    packetId && packetIds.push(packetId);
    chunk++;
  });

  return await end;
};
