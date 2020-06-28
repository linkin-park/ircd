import NodeCouchDb from 'node-couchdb'
import { dbconfig } from './config'
import { v4 } from 'uuid'
import { Chat } from '../model/chat'
import { rejects } from 'assert'

const couch = new NodeCouchDb({
  host: dbconfig.host,
  protocol: dbconfig.proto,
  port: dbconfig.port,
  auth: {
    user: dbconfig.user,
    pass: dbconfig.pass,
  },
})

export function couchInsert(chat: Chat) {
  couch
    .insert(dbconfig.db, {
      _id: v4(),
      datetime: chat.at,
      from: chat.from,
      to: chat.to,
      message: chat.message,
    })
    .then(
      ({ data, headers, status }) => {
        // data is json response
        // headers is an object with all response headers
        // status is statusCode number
      },
      (err) => {
        console.error(err)
        console.error(`Something went wrong
              from : ${chat.from}
              to:${chat.to}
              message:${chat.message}`)
        // either request error occured
        // ...or err.code=EDOCCONFLICT if document with the same id already exists
      },
    )
}

export async function couchRetrieveOn(
  dateInNano: number,
  channel: string = 'coffeesh0p',
): Promise<Array<Chat>> {
  console.log(`what date? ${new Date(dateInNano)}`)
  const prevDate = new Date(dateInNano)
  prevDate.setDate(prevDate.getDate() - 1)
  const nextDate = new Date(dateInNano)
  nextDate.setDate(nextDate.getDate() + 1)

  const mongoQuery = {
    selector: {
      datetime: {
        $gt: prevDate.getTime() / 1000,
        $lt: nextDate.getTime() / 1000,
      },
      to: {
        $eq: channel,
      },
    },
  }
  const parameters = {}

  const datas: Array<Chat> = []
  return couch
    .mango(dbconfig.db, mongoQuery, parameters)
    .then(
      ({ data, headers, status }) => {
        // data is json response
        // headers is an object with all response headers
        // status is statusCode number
        console.debug('Queried Mongo Query', mongoQuery)
        // console.debug("db return Intended",data)
        data.docs.forEach(({ datetime, from, to, message }) => {
          datas.push({ at: datetime, from, to, message })
        })
        return datas
      },
      (err: any) => {
        // either request error occured
        // ...or err.code=EDOCMISSING if document is missing
        // ...or err.code=EUNKNOWN if statusCode is unexpected
        throw err
      },
    )
    .catch((err: any) => {
      console.debug('Something funky happened!', err)
      throw err
    })
}
