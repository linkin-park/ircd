import * as irc from 'irc'
import { couchInsert } from '../db/chatdev'

const client = new irc.Client(process.env.IRC_SERVER!, process.env.IRC_NICK!, {
  userName: process.env.IRC_NICK!,
  secure: true,
  port: 6697,
  realName: process.env.IRC_REALNAME!,
  channels: process.env.IRC_CHANNELS!.split(','),
  autoConnect: false,
})

// console.debug("[DEBUG]",
//   process.env.IRC_SERVER!,
//   process.env.IRC_CHANNELS!,
//   process.env.IRC_REALNAME!,
// )

client.connect(100, () => console.log('Joined all Channels'))

client.addListener('message', (from: string, to: string, msg: string) => {
  couchInsert({
    at: Math.floor(Date.now() / 1000),
    from: from,
    to: to,
    message: msg,
  })
})

// handle error instead of crashing
client.addListener('error', function (message) {
  console.log('error: ', message)
})
