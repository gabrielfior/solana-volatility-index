import { main, uploadToS3, Option } from './main';
import { buildDb, writeItemToDb } from './db';

export async function hello(event:any) {
    
    console.log('starting job', new Date());

    try {
        //await main();
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
        let db = buildDb();
        writeItemToDb(db, items[0]);
        console.log('done');
        console.log('finished job');
    } catch (error) {
        console.error('error', error);
    }

    return {
        message: 'finished',
        input: event,
    };
}