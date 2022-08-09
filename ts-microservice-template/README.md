# ts-microservice-template

Simple template for a TypeScript microservice.

- Install deps with `npm install`.
- Build with `npm build` or run watcher with `npm dev`.
- Start the server with `npm start`.

You can things like [nodemon](https://nodemon.io) or [watchexec](https://github.com/watchexec/watchexec) on `build/*` in combination with `npm run start`. For example:

```sh
watchexec -r -w build/* -c 'npm run start'
```
