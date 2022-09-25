# streams

Somehow I always keep forgetting parts of the NodeJS stream APIs, and it didn't get better now we have the Web Streams API too, so I'm creating a playground to collect different use-cases over time.

## Getting started

- Install deps with `npm install`.
- Build with `npm build` to build.
- Run build with `npm start`.
- Run tests with `npm test`.

For file watchers please use things like [nodemon](https://nodemon.io) or [watchexec](https://github.com/watchexec/watchexec). For example:

```sh
watchexec -r -w src -c 'npm build' # build on file change
watchexec -r -w dist -c 'npm start' # run on build change
```
## Resources

- [Node 16 stream docs](https://nodejs.org/docs/latest-v16.x/api/stream.html#stream)
- [Nodejs.dev streams docs](https://nodejs.dev/en/learn/nodejs-streams/)
- [Web Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)