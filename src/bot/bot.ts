import * as irc from "irc";
import { couchInsert } from "../db/chatdev";

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
