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

type Option = {
  serumMarketAddress: string;
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
}


async function uploadToS3(items: Array<Option>) {
  console.log('enter uploadToS3');
  
  //var AWS = require('aws-sdk');
  AWS.config.update({ region: 'eu-central-1' });
  const s3 = new AWS.S3();

  var buf = Buffer.from(JSON.stringify(items));
  let currentEpoch = Math.floor(new Date().getTime() / 1000);

  try {
    const stored = await s3.putObject({
      Bucket: 'solbucket-ber',
      Key: `zeta-markets-options-${currentEpoch}.json`,
      ContentType: 'application/json',
      Body: buf,
      ACL: 'public-read',
    }).promise();
    console.log(stored);
  } catch (err) {
    console.log(err)
  }
}


function writeItemsToFile(items: Array<Option>) {
  console.log('begin write items');
  fs.writeFileSync('output.json', JSON.stringify(items));
}



async function displayState() {
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
      console.log(
        `Expiration @ ${new Date(
          expirySeries.expiryTs * 1000
        )} Live: ${expirySeries.isLive()}`
      );
      let interestRate = utils.convertNativeBNToDecimal(
        subExchange.greeks.interestRate[index],
        constants.PRICING_PRECISION
      );
      console.log(`Interest rate: ${interestRate}`);
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

        console.log('quote vault', market.quoteVault.toString());

        items.push({
          serumMarketAddress: market.serumMarket.address.toString(),
          exchange: assets.assetToName(subExchange.asset),
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
          priceStatus: priceStatus!
        });

        /*
        console.log(
          `[MARKET] INDEX: ${market.marketIndex} KIND: ${market.kind} STRIKE: ${market.strike
          } MARK_PRICE: ${markPrice.toFixed(6)} DELTA: ${delta.toFixed(
            2
          )} IV: ${sigma.toFixed(6)} VEGA: ${vega.toFixed(6)}`
        );
        */
      }
    }
  }
  console.log(`retrieved ${items.length} items'`);
  return items;
}


const main = async () => {
  // Starts a solana web3 connection to an RPC endpoint
  //let networkUrlDevNet = 'https://api.devnet.solana.com';
  let networkUrlDevNet = 'https://aged-compatible-wish.solana-devnet.quiknode.pro/5528b752c70b0b11d9ae51444f9816ff53e376f5/';
  const connection = new Connection(networkUrlDevNet, utils.defaultCommitment());

  // Airdrop some SOL to your wallet
  //await connection.requestAirdrop(wallet.publicKey, 100000000);
  let DEVNET_PROGRAM_ID = 'BG3oRikW8d16YjUEmX3ZxHm9SiJzrGtMhsSR8aCw1Cd7';
  // Loads the SDK exchange singleton. This can take up to 10 seconds...

  
  await Exchange.load(
    [assets.Asset.SOL, assets.Asset.BTC, assets.Asset.ETH], // Can be one or more depending on what you wish to trade
    new PublicKey(DEVNET_PROGRAM_ID),
    Network.DEVNET,
    connection,
    utils.defaultCommitment(),
    undefined, // Exchange wallet can be ignored for normal clients.
    0, // ThrottleMs - increase if you are running into rate limit issues on startup.
    undefined // Callback - See below for more details.
  );
  

  let items = await displayState();
  writeItemsToFile(items);
  await uploadToS3(items);
};


main().then(() => {
  console.log('finished');
  process.exit(0);
});
//getPrice('BTC').then((e) => console.log(e));
