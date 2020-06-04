import { retrieveLogs } from "./route/irc";
import { ChatTO } from "./protocol/chat";
import { FormatError } from "./custom_error/format";

import https from "https";
import fs from "fs";
import path from "path";
import ejs from "ejs";
import { ServerResponse, IncomingMessage } from "http";
import url from "url";

const { SERVER_PORT = 443 } = process.env;

// when error escapes it reaches me
process.on("uncaughtException", (err) => {
  console.error("uncaughtException", err.stack);
});

// when unhandledRejection escapes it reaches me
process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection", err);
});

process.on("exit", (code) => {
  console.error(`App exited with status ${code}\n`);
});

// server handle atm
const httpsServer = https.createServer({
  cert: fs.readFileSync(path.join(__dirname, "priv_test", "cert.pem")),
  key: fs.readFileSync(path.join(__dirname, "priv_test", "key.pem")),
});

const htmlContent = fs
  .readFileSync(path.join(__dirname, "view", "display.ejs"))
  .toString();

httpsServer.on("request", (req: IncomingMessage, res: ServerResponse) => {
  if (!req.url) throw "Request Url Missing!";

  console.log("Request Method", req.method);
  const parsedURL = url.parse(req.url);

  let ejsInfo = {
    data: Array<ChatTO>(),
    errMsg: "",
  };

  switch (parsedURL.pathname) {
    case "/irc/logs":
      if (req.method == "GET") {
        // handle EJS
        console.debug("Query %s", parsedURL.query);
        let logsPromise = retrieveLogs(parsedURL.query);
        let data: string = "";

        logsPromise.then(
          (values) => {
            console.debug("===>", values.length);

            ejsInfo.data = values;
            data = renderEJS(htmlContent, ejsInfo);

            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
          },
          (err) => {
            console.error(`at index.ts`, err.message);
            console.log("[log]", `${err instanceof FormatError}`);

            ejsInfo.errMsg = err.message;
            data = renderEJS(htmlContent, ejsInfo);

            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
          }
        );
      }
      break;
    case "/":
      if (req.method == "GET") {
        // handle EJS
        const data = ejs.render(htmlContent, {
          ejsInfo,
        });

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
      break;
    default:
      res.writeHead(404);
      res.end("Invalid");
      break;
  }
});

httpsServer.listen(SERVER_PORT);
httpsServer.on("listening", () => {
  console.log(`Server listening on port ${SERVER_PORT}`);
});

function renderEJS(htmlContent: string, ejsInfo: object) {
  return ejs.render(htmlContent, { ejsInfo });
}
