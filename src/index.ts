import * as irc from "irc";
import { couchInsert, } from "./db/chatdev";
import {retrieveLogs} from './route/irc'
// import {Chat} from './db/protocol'

import https from "https";
import fs from "fs";
import path from "path";
import ejs from "ejs";
import { ServerResponse, IncomingMessage } from "http";
import url from 'url'

const { SERVER_PORT = 443} = process.env;

const client = new irc.Client("irc.hackthissite.org", "linter", {
  userName: "linterr",
  secure: true,
  port: 6697,
  realName: "we write compiler only",
  channels: ["#bots" /* "#coffeesh0p", "#dev" */],
  autoConnect: false,
});

client.connect(100, () => console.log("Joined all Channels"));

client.addListener("message", (from: string, to: string, msg: string) => {
  couchInsert({
    at: Math.floor(Date.now() / 1000),
    from: from,
    to: to,
    message: msg,
  });
});

// handle error instead of crashing
client.addListener("error", function (message) {
  console.log("error: ", message);
});

// when error escapes it reaches me
process.on("uncaughtException", (err) => {
  console.error(err.stack);
});

process.on("exit", (code) => {
  console.log(`App exited with status ${code}\n`);
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
  if(!req.url)
    throw "Request Url Missing!"
  
  console.log("Request Method",req.method)
  const parsedURL =  url.parse(req.url)

  switch (parsedURL.pathname) {
    case "/irc/logs":
      if (req.method == "GET") {
        // handle EJS
        console.debug('Query %s',parsedURL.query)
        let logsPromise =  retrieveLogs(parsedURL.query)
        let data:string = ''
        
        logsPromise.then((x)=>{
          console.debug('===>',x.length)
           data = ejs.render(htmlContent, {
            exampleRenderEjs: x,
            filename: 'display.ejs', 
          });

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        },
        (err)=>{
          console.error(err)
          data = ejs.render(htmlContent, {
            exampleRenderEjs: [],
          });

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        })
      }
      break;
    case "/":
      if (req.method == "GET") {
        // handle EJS
        const data = ejs.render(htmlContent, {
          exampleRenderEjs: [],
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
