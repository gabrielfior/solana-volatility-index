import pgPromise, { IDatabase } from "pg-promise"; // pg-promise core library
import { IMain } from "pg-promise";
import { Option } from "./main";
import * as dotenv from "dotenv";
import { IClient } from "pg-promise/typescript/pg-subset";
dotenv.config({ path: __dirname + "/.env" });

export function buildDb() {
  const pgp: IMain = pgPromise();
  let dbConfig = `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:5432`;
  const db = pgp(dbConfig);
  return db;
}

export async function writeItemToDb(db: any, item: Option) {
  await db
    .none(
      `INSERT INTO prod_serum_option(
        serum_market_address,
    exchange,
    interest_rate,
    live,
    strike,
    expiry_date,
    kind,
    mark_price,
    delta,
    implied_volatility,
    vega,
    price,
    confidence,
    price_status,
    current_datetime) VALUES($1, $2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      Object.values(item)
    )
    .then(() => {
      console.log('finished writing');
    })
    .catch((error) => {
      console.log("ERROR:", error);
    });
}
