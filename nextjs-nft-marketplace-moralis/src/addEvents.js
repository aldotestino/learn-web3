const Moralis = require('moralis-v1/node');
require('dotenv').config();
const contractAddresses = require('./constants/networkMapping.json');

const chainId = process.env.chainId || '31337';
const moralisChainId = chainId === '31337' ? '1337' : chainId;

const contractAddress = contractAddresses[chainId]['NftMarketplace'][0];
const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
const appId = process.env.NEXT_PUBLIC_MORALIS_APP_ID;
const masterKey = process.env.masterKey;

async function main() {
  await Moralis.start({ serverUrl, appId, masterKey });
  console.log(`Working with contract address ${contractAddress}`);

  const itemListOptions = {
    chainId: moralisChainId,
    address: contractAddress,
    sync_historical: true,
    topic: 'ItemListed(address,address,uint256,uint256)', // nome dell'evento + tipo dei parametri
    abi: {
      'anonymous': false,
      'inputs': [
        {
          'indexed': true,
          'internalType': 'address',
          'name': 'seller',
          'type': 'address'
        },
        {
          'indexed': true,
          'internalType': 'address',
          'name': 'nftAddress',
          'type': 'address'
        },
        {
          'indexed': true,
          'internalType': 'uint256',
          'name': 'tokenId',
          'type': 'uint256'
        },
        {
          'indexed': false,
          'internalType': 'uint256',
          'name': 'price',
          'type': 'uint256'
        }
      ],
      'name': 'ItemListed',
      'type': 'event'
    },
    tableName: 'ItemListed'
  };

  const itemBoughtOptions = {
    chainId: moralisChainId,
    address: contractAddress,
    sync_historical: true,
    topic: 'ItemBought(address,address,uint256,uint256)', // nome dell'evento + tipo dei parametri
    abi: {
      'anonymous': false,
      'inputs': [
        {
          'indexed': true,
          'internalType': 'address',
          'name': 'buyer',
          'type': 'address'
        },
        {
          'indexed': true,
          'internalType': 'address',
          'name': 'nftAddress',
          'type': 'address'
        },
        {
          'indexed': true,
          'internalType': 'uint256',
          'name': 'tokenId',
          'type': 'uint256'
        },
        {
          'indexed': false,
          'internalType': 'uint256',
          'name': 'price',
          'type': 'uint256'
        }
      ],
      'name': 'ItemBought',
      'type': 'event'
    },
    tableName: 'ItemBought'
  };

  const itemCanceledOptions = {
    chainId: moralisChainId,
    address: contractAddress,
    sync_historical: true,
    topic: 'ItemCanceled(address,address,uint256)', // nome dell'evento + tipo dei parametri
    abi: {
      'anonymous': false,
      'inputs': [
        {
          'indexed': true,
          'internalType': 'address',
          'name': 'seller',
          'type': 'address'
        },
        {
          'indexed': true,
          'internalType': 'address',
          'name': 'nftAddress',
          'type': 'address'
        },
        {
          'indexed': true,
          'internalType': 'uint256',
          'name': 'tokenId',
          'type': 'uint256'
        }
      ],
      'name': 'ItemCanceled',
      'type': 'event'
    },
    tableName: 'ItemCanceled'
  };

  const listedResponse = await Moralis.Cloud.run('watchContractEvent', itemListOptions, {
    useMasterKey: true
  });

  const boughtResponse = await Moralis.Cloud.run('watchContractEvent', itemBoughtOptions, {
    useMasterKey: true
  });

  const canceledResponse = await Moralis.Cloud.run('watchContractEvent', itemCanceledOptions, {
    useMasterKey: true
  });

  if (listedResponse.success && boughtResponse.success && canceledResponse.success) {
    console.log('✅ Database updated with watching events');
  } else {
    console.log('❌ Something went wrong');
  }
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });