import { Option } from './main';
import { getPrice } from './prices';
import * as dotenv from "dotenv";
import AWS from 'aws-sdk';
dotenv.config({ path: __dirname + '/.env' });


async function uploadToS3(items: Array<Option>) {
    console.log('enter uploadToS3');
    console.log('ac', process.env.AWS_ACCESS_KEY_ID);
    //var AWS = require('aws-sdk');
    AWS.config.update({ region: `${process.env.S3_REGION}` });
    const s3 = new AWS.S3();

    var buf = Buffer.from(JSON.stringify(items));
    let currentEpoch = Math.floor(new Date().getTime() / 1000);

    try {
        const stored = await s3.putObject({
            Bucket: `${process.env.S3_BUCKET_NAME}`,
            Key: `dummy-${currentEpoch}.json`,
            ContentType: 'application/json',
            Body: buf,
            ACL: 'public-read',
        }).promise();
        console.log(stored);
    } catch (err) {
        console.log(err)
    }
}

export async function main() {
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
    await uploadToS3(items);
    console.log('done');
}

main().then(() => console.log('done')).catch((e) => console.error(e));