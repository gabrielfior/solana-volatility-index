//require("dotenv").config();
import { getPrice } from './prices';
import * as dotenv from "dotenv";
import * as fs from "fs";
dotenv.config({ path: __dirname + '/.env' });

import { Connection, PublicKey } from "@solana/web3.js";
import {
  Exchange,
  Network,
  constants,
  utils,
  assets,
  Decimal,
} from "@zetamarkets/sdk";
import AWS from 'aws-sdk';
import { buildDb, writeItemToDb } from './db';

export type Option = {
  serumMarketAddress: string;
  interestRate: Number;
  exchange: string | null;
  live: Boolean;
  expiryDate: Date;
  strike: Number;
  kind: string;
  markPrice: String;
  delta: String;
  impliedVolatility: String;
  vega: Number;
  price: Number;
  confidence: Number;
  priceStatus: Number;
  current_datetime: Date;
}


export async function uploadToDb(items: Array<Option>) {
  console.log('uploading items');

  //var AWS = require('aws-sdk');
  AWS.config.update({ region: `${process.env.S3_REGION}` });
  const s3 = new AWS.S3();

  var buf = Buffer.from(JSON.stringify(items));
  let currentEpoch = Math.floor(new Date().getTime() / 1000);

  let db = buildDb();

  try {
    items.forEach(async item => {
      await writeItemToDb(db, item);
    });
    console.log('done');
  } catch (err) {
    console.log(err)
  }
}

export async function displayState() {
  console.log('entered display state');
  let subExchanges = Exchange.subExchanges;

  let items: Array<Option> = [];

  for (var [asset, subExchange] of subExchanges) {

    let symbolName = assets.assetToName(subExchange.asset);
    let [price, confidence, priceStatus] = await getPrice(symbolName!);

    let orderedIndexes = [
      subExchange.zetaGroup.frontExpiryIndex,
      utils.getMostRecentExpiredIndex(asset),
    ];

    console.log(
      `[EXCHANGE ${assets.assetToName(subExchange.asset)}] Display market state...`
    );

    for (var i = 0; i < orderedIndexes.length; i++) {
      let index = orderedIndexes[i];
      let expirySeries = subExchange.markets.expirySeries[index];

      let interestRate = utils.convertNativeBNToDecimal(
        subExchange.greeks.interestRate[index],
        constants.PRICING_PRECISION
      );

      let markets = subExchange.markets.getMarketsByExpiryIndex(index);
      for (var j = 0; j < markets.length; j++) {
        let market = markets[j];
        let greeksIndex = utils.getGreeksIndex(market.marketIndex);
        let markPrice = utils.convertNativeBNToDecimal(
          subExchange.greeks.markPrices[market.marketIndex]
        );
        let delta = utils.convertNativeBNToDecimal(
          subExchange.greeks.productGreeks[greeksIndex].delta,
          constants.PRICING_PRECISION
        );

        let sigma = Decimal.fromAnchorDecimal(
          subExchange.greeks.productGreeks[greeksIndex].volatility
        ).toNumber();

        let vega = Decimal.fromAnchorDecimal(
          subExchange.greeks.productGreeks[greeksIndex].vega
        ).toNumber();

        // console.log('quote vault', market.quoteVault.toString());

        items.push({
          serumMarketAddress: market.serumMarket.address.toString(),
          exchange: assets.assetToName(subExchange.asset),
          interestRate: interestRate,
          live: expirySeries.isLive(),
          strike: market.strike,
          expiryDate: new Date(expirySeries.expiryTs * 1000),
          kind: market.kind,
          markPrice: markPrice.toFixed(6),
          delta: delta.toFixed(2),
          impliedVolatility: sigma.toFixed(6),
          vega: vega,
          price: price!,
          confidence: confidence!,
          priceStatus: priceStatus!,
          current_datetime: new Date()
        });
      }
    }
  }
  console.log(`retrieved ${items.length} items'`);
  return items;
}

const initializeExchange = async (connection: Connection) => {

  // Program_id from zeta markets docs
  let DEVNET_PROGRAM_ID = 'BG3oRikW8d16YjUEmX3ZxHm9SiJzrGtMhsSR8aCw1Cd7';

  await Exchange.load(
    [assets.Asset.SOL, assets.Asset.BTC, assets.Asset.ETH], // Can be one or more depending on what you wish to trade
    new PublicKey(DEVNET_PROGRAM_ID),
    Network.DEVNET,
    connection,
    utils.defaultCommitment(),
    undefined, // Exchange wallet can be ignored for normal clients.
    500, // ThrottleMs - increase if you are running into rate limit issues on startup.
    undefined // Callback - See below for more details.
  );
};

export async function main() {
  let networkUrlDevNet = `https://aged-compatible-wish.solana-devnet.quiknode.pro/${process.env.QUICKNODE_KEY}/`;
  const connection = new Connection(networkUrlDevNet, utils.defaultCommitment());

  await initializeExchange(connection);
  let items = await displayState();
  await uploadToDb(items);
};


export function execute() {
  main().then(() => {
    console.log('finished');
    //process.exit(0);
  }).catch((e) => console.error(e));
};
