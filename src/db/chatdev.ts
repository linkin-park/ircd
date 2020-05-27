import NodeCouchDb from "node-couchdb";
import { dbconfig} from "./config";
import { v4 } from "uuid";
import { Chat } from "./protocol";

const couch = new NodeCouchDb({
  auth: { 
    user: dbconfig.user, 
    pass: dbconfig.pass 
  }
});

export function couchInsert(chat: Chat) {
  couch
    .insert(dbconfig.db, {
      _id: v4(),
      datetime: chat.at,
      from: chat.from,
      to: chat.to,
      message: chat.message
    })
    .then(
      ({ data, headers, status }) => {
        // data is json response
        // headers is an object with all response headers
        // status is statusCode number
      },
      err => {
        console.error(err)
        console.error(`Something went wrong
              from : ${chat.from}
              to:${chat.to}
              message:${chat.message}`);
        // either request error occured
        // ...or err.code=EDOCCONFLICT if document with the same id already exists
      }
    );
}
