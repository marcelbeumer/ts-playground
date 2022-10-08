import { Readable, Writable, Transform } from "stream";
import { pipeline, finished } from "stream/promises";

function createSimpleReadable(opts: {
  dataSize: number;
  chunkSize: number;
  errorOnChunk?: number;
}): Readable {
  let readCount = 0;
  const data = Array.from({ length: opts.dataSize }).map((_, i) => `${i}`);
  return new Readable({
    // Read can also be defined with readable._read = (size) => ...
    read(size) {
      if (opts.errorOnChunk === readCount) {
        throw new Error(`Test error on chunk# ${readCount}`);
      }
      readCount++;
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

  test("read using a write stream", async () => {
    const readable = createSimpleReadable({ dataSize: 10, chunkSize: 5 });
    const data: string[] = [];
    const writable = new Writable({
      write: (chunk, enc, cb) => {
        data.push(String(chunk));
        cb(null);
      },
    });

    await pipeline(readable, writable);

    expect(data.length).toEqual(2);
  });

  test("read using a transform stream", async () => {
    const readable = createSimpleReadable({ dataSize: 10, chunkSize: 5 });
    const transform = new Transform({
      transform(chunk, enc, callback) {
        callback(null, String(chunk));
      },
    });

    // Will read all at once, not sure why.
    const mock = jest.fn();
    for await (const chunk of readable.pipe(transform)) {
      mock(String(chunk));
    }

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenNthCalledWith(1, "0123456789");
  });

  test("read using finished and ondata", async () => {
    const readable = createSimpleReadable({ dataSize: 10, chunkSize: 5 });

    const mock = jest.fn();
    readable.on("data", (chunk) => {
      mock(String(chunk));
    });

    // readable.resume(); // drain
    await finished(readable);

    expect(mock).toHaveBeenCalledTimes(2);
    expect(mock).toHaveBeenNthCalledWith(1, "01234");
    expect(mock).toHaveBeenNthCalledWith(2, "56789");
  });

  test("drain using resume", async () => {
    const readable = createSimpleReadable({ dataSize: 10, chunkSize: 5 });

    readable.resume(); // drain
    await finished(readable);
  });

  test("error handling with error event", (done) => {
    const readable = createSimpleReadable({
      dataSize: 10,
      chunkSize: 5,
      errorOnChunk: 1,
    });

    const errorMock = jest.fn();
    const dataMock = jest.fn();
    const endMock = jest.fn();

    const finish = () => {
      done();
      expect(endMock).toHaveBeenCalledTimes(0);
      expect(errorMock).toHaveBeenCalledTimes(1);
      expect(errorMock).toHaveBeenCalledWith("Test error on chunk# 1");
      expect(dataMock).toHaveBeenCalledTimes(1);
      expect(dataMock).toHaveBeenCalledWith("01234");
    };

    readable.on("error", (err) => {
      errorMock(err.message);
      finish();
    });

    readable.on("data", (chunk) => {
      dataMock(String(chunk));
    });

    readable.on("end", () => {
      endMock();
      finish();
    });

    readable.resume(); // drain
  });

  test.todo("automatically handle errors with for-await");
  test.todo("automatically handle errors with finished");
  test.todo("automatically handle errors with pipeline");
  test.todo("can push its data asynchronously");
  test.todo("can error asynchronously");
});

describe("node write stream", () => {
  test.todo("can be created with constructor opts");
  test.todo("can be created by setting _read");
  test.todo("can receive data using push");
  test.todo("can receive data using pipe");
});
