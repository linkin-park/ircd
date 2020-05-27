import * as irc from "irc";
import { couchInsert } from "./db/chatdev";

import https from "https";
import fs from "fs";
import path from "path";
import ejs from "ejs";

const { SERVER_PORT = 443 } = process.env;

const client = new irc.Client("irc.hackthissite.org", "linter", {
  userName: "linterr",
  secure: true,
  port: 6697,
  realName: "we write compiler only",
  channels: ["#bots"],
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

const httpsServer = https.createServer({
  cert: fs.readFileSync(path.join(__dirname, "priv_test", "cert.pem")),
  key: fs.readFileSync(path.join(__dirname, "priv_test", "key.pem")),
});
