import querystring from "querystring";
import { couchRetrieveOn } from "../db/chatdev";
import {Chat} from '../db/protocol'

export async function retrieveLogs(uri: string | null):Promise<Array<Chat>> {
  let { date = "", channel } = querystring.parse(uri || "");
  channel = channel || "#coffeesh0p"

  console.debug(`query ${date} and channel ${channel}`)
  const normalizStrDate =  (function (date: string): string{
      if (date.match(/^\d{4,4}-\d{1,2}-\d{1,2}$/g) == null) {
        throw "Date Format wrong";
      }
      return date
  })(date as string);
  console.debug(`Normalized Date`,normalizStrDate)

  const arr = await couchRetrieveOn(new Date(normalizStrDate).getTime(), channel as string);
  console.debug("We Recieved",arr.length)
  return arr;
}

function todayDateMilliSec(): number {
  const today = new Date();
  return today.getTime() / 1000;
}
