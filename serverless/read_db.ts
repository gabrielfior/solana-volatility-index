import pgPromise from 'pg-promise'; // pg-promise core library
import { IMain } from 'pg-promise';
import { Option } from './main';
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + '/.env' });

// pg-promise initialization options:
const pgp: IMain = pgPromise();

export async function read_db() {
    // Creating the database instance with extensions:
    let dbConfig = `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:5432`;
    const db = pgp(dbConfig);

    let tablename = 'prod_serum_option';

    let items: Array<Option> = new Array();
    items.push({
        serumMarketAddress: "abc",
        exchange: "abc",
        interestRate: 0,
        live: false,
        strike: 123,
        expiryDate: new Date(),
        kind: "a",
        markPrice: "123",
        delta: "123",
        impliedVolatility: "123",
        vega: 123456,
        price: 123456,
        confidence: 123,
        priceStatus: 1,
        current_datetime: new Date()
    });


    await db.none(`INSERT INTO prod_serum_option(
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
        ["abc", "abc", 0, false, 123, new Date(), "a", "123", "123", "123", 123456, 123456, 123, 1, new Date()]
    )
        .then(data => {
            console.log(data); // print new user id;
        })
        .catch(error => {
            console.log('ERROR:', error); // print error;
        });


}


read_db()
    .then((a) => {
        console.log('returned', a);
        process.exit(0);
    })
    .catch((e) => console.error(e));

