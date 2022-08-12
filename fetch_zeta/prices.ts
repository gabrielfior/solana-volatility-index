import { PythHttpClient, PriceStatus } from "@pythnetwork/client";
import { getPythClusterApiUrl, getPythProgramKeyForCluster, PythCluster } from "@pythnetwork/client/lib/cluster";
import { Connection } from "@solana/web3.js";

const SOLANA_CLUSTER_NAME: PythCluster = 'devnet';

/*const symbolIdentifierMap: Map<string, string> = new Map([
    ['BTC', 'HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J'],
    ['ETH', 'EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw'],
    ['SOL', 'J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix']
]);*/

const symbolIdentifierMap: Map<string, string> = new Map([
    ['BTC', 'Crypto.BTC/USD'],
    ['ETH', 'Crypto.ETH/USD'],
    ['SOL', 'Crypto.SOL/USD']
]);

export async function getPrice(symbol: string) {
    const pythPublicKey = getPythProgramKeyForCluster(SOLANA_CLUSTER_NAME);
    const connection = new Connection(getPythClusterApiUrl(SOLANA_CLUSTER_NAME))
    const pythClient = new PythHttpClient(connection, pythPublicKey);
    const data = await pythClient.getData();

    let pythSymbolAddress = symbolIdentifierMap.get(symbol);
    console.log('pyth feed', pythSymbolAddress);
    if (pythSymbolAddress === undefined){
        throw new Error(`Symbol ${symbol} not found`);
    }

    const price = data.productPrice.get(pythSymbolAddress)!;
    // Sample output:
    // Crypto.SRM/USD: $8.68725 ±$0.0131 Status: Trading
    //console.log(`${symbol}: $${price.price} \xB1$${price.confidence} Status: ${PriceStatus[price.status]}`)
    return [price.price, price.confidence, price.status];
}