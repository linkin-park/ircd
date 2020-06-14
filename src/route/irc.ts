import querystring from "querystring";
import { couchRetrieveOn } from "../db/chatdev";
import { ChatTO } from "../model/chat";
import { FormatError } from "../custom_error/format";

export async function retrieveLogs(uri: string | null): Promise<Array<ChatTO>> {
  let { date = "", channel } = querystring.parse(uri || "");
  channel = channel || "#coffeesh0p";

  console.debug(`query ${date} and channel ${channel}`);
  const normalizStrDate = (function (date: string): string {
    if (date.match(/^\d{4,4}-\d{1,2}-\d{1,2}$/g) == null) {
      throw new FormatError("Date Format wrong");
    }
    return date;
  })(date as string);
  console.debug(`Normalized Date`, normalizStrDate);

  const arr = await couchRetrieveOn(
    new Date(normalizStrDate).getTime(),
    channel as string
  );

  //modify
  const newArr = arr.map((val) => {
    let dt = new Date(val.at * 1000);
    return {
      at: `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}
      ${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}`,
      from: val.from,
      message: val.message,
      to: val.to,
    };
  });

  return newArr;
}

function todayDateMilliSec(): number {
  const today = new Date();
  return today.getTime() / 1000;
}
