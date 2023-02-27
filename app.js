require("dotenv").config();
const ethers = require("ethers");

// API KEYs
const INFURA_API_KEY = process.env.INFURA_API_KEY;
const provider = new ethers.providers.JsonRpcProvider(
  `https://mainnet.infura.io/v3/${INFURA_API_KEY}`
);

// BORED APE CONTRACT
const boredApeAbi = [
  "function transferFrom() external;",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);",
];

const boredApeAddress = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";
const boredApe = new ethers.Contract(boredApeAddress, boredApeAbi, provider);

async function main() {
  console.log("\n👾 Loading transactions from Bored Ape....");
  // Range of blocks to query from the last block
  const rangeOfBlocks = 10000;
  // Latest block number
  const block = await provider.getBlockNumber();
  //Query the event Transfer emitted when transfers
  const transferEvents = await boredApe.queryFilter(
    "Transfer",
    block - rangeOfBlocks,
    block
  );

  // From the first block we are retrieving data to the last block
  for (let i = 0; i < block - rangeOfBlocks; i++) {
    // Get the args from the NFT Transfer.
    const details = transferEvents[i].args;
    // Get the value from the transfer
    const { value } = await provider.getTransaction(
      transferEvents[i].transactionHash
    );

    if (value > 0 && details !== "undefined") {
      // If there is value, print it
      if (
        transferEvents[i - 1].transactionIndex ===
        transferEvents[i].transactionIndex
      ) {
        console.log(`\n**** Internal transaction ****`);
      } else {
        console.log(`\n*New transaction*`);
      }

      console.log(`🐒 NFT ID: ${details.tokenId}`);
      console.log(`📤 From: ${details.from}`);
      console.log(`📥 To: ${details.to}`);
      console.log(`💰 Value: ${ethers.utils.formatEther(value)} Ethers`);
      console.log(
        `📧 Transaction Index: ${transferEvents[i].transactionIndex}`
      );
      console.log(`🔒 Transaction Hash: ${transferEvents[i].transactionHash}`);
    }
  }
  console.log(`\n*** ${rangeOfBlocks} last blocks read successfully ***`);
}

main();
