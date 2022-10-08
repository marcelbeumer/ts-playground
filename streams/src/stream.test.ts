import { Readable } from "stream";

function createSimpleReadable(opts: {
  dataSize: number;
  chunkSize: number;
}): Readable {
  const data = Array.from({ length: opts.dataSize }).map((_, i) => `${i}`);
  return new Readable({
    // Read can also be defined with readable._read = (size) => ...
    read(size) {
      if (data.length === 0) {
        this.push(null);
      } else {
        this.push(data.splice(0, Math.min(opts.chunkSize, size)).join(""));
      }
    },
  });
}

describe("node read stream", () => {
  test("read all at once", () => {
    const readable = createSimpleReadable({ dataSize: 10, chunkSize: 10 });
    expect(String(readable.read())).toEqual("0123456789");
  });

  test("read using for await", async () => {
    const readable = createSimpleReadable({ dataSize: 10, chunkSize: 5 });
    const mock = jest.fn();
    for await (const chunk of readable) {
      mock(String(chunk));
    }

    expect(mock).toHaveBeenCalledTimes(2);
    expect(mock).toHaveBeenNthCalledWith(1, "01234");
    expect(mock).toHaveBeenNthCalledWith(2, "56789");
  });

  test("read using multiple read calls", () => {
    const readable = createSimpleReadable({ dataSize: 10, chunkSize: 5 });
    const mock = jest.fn();

    // officially better to wait for "readable"
    let chunk: unknown;
    while ((chunk = readable.read()) !== null) {
      mock(String(chunk));
    }

    expect(mock).toHaveBeenCalledTimes(2);
    expect(mock).toHaveBeenNthCalledWith(1, "01234");
    expect(mock).toHaveBeenNthCalledWith(2, "56789");
  });

  test.todo("read using a write stream");
  test.todo("error handling with error event");
  test.todo("automatically handle errors with for-await");
  test.todo("can push its data asynchronously");
});

describe("node write stream", () => {
  test.todo("can be created with constructor opts");
  test.todo("can be created by setting _read");
  test.todo("can receive data using push");
  test.todo("can receive data using pipe");
});
