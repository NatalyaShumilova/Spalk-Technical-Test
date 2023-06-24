import { ReadStream } from "fs";

const validatePacket = (buffer: Buffer, chunk: number) => {
  const hasSyncByte = buffer.toString("hex", 0, 1) === "47";
  if (!hasSyncByte) {
    return { status: "error", message: `Error: No sync byte present in packet ${chunk}, offset ${188 * chunk}` };
  }

  return { status: "success", message: "Sync byte found" };
};

export const parseFile = async (stream: ReadStream) => {
  let chunk = 0;
  const output: string[] = [];
  let valid = true;

  var end = new Promise<{ valid: boolean; output: string[] }>(function (resolve, reject) {
    stream.on("end", () => resolve({ valid, output }));
    stream.on("close", () => resolve({ valid, output }));
    stream.on("error", (error) => reject({ valid: false, output: error.message }));
  });

  stream.on("data", (buffer: Buffer) => {
    const { status, message } = validatePacket(buffer, chunk);
    output.push(message);

    if (status === "error") {
      stream.close();
      valid = false;
    }
    chunk++;
  });

  return await end;
};
