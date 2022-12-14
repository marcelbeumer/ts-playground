// https://nodejs.dev/learn/build-an-http-server
import http from "http";

const port = process.env.PORT || 3000;

const server = http.createServer((_req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.end("<h1>Hello, World!</h1>");
});

server.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
