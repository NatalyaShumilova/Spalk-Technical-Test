import { ReadStream } from "fs";

const validatePacket = (buffer: Buffer, chunk: number) => {
  const hasSyncByte = buffer.toString("hex", 0, 1) === "47";
  if (!hasSyncByte) {
    console.log(`Error: No sync byte present in packet ${chunk}, offset ${188 * chunk}`);
  }
};

export const parseFile = async (stream: ReadStream) => {
  let chunk = 0;

  stream.on("data", (buffer: Buffer) => {
    validatePacket(buffer, chunk);
    chunk++;
  });
};
