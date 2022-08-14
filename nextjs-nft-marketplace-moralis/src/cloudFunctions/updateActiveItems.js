// const { default: Moralis } = require('moralis-v1/node'); // comment out before uploading

Moralis.Cloud.afterSave('ItemListed', async request => {
  const confirmed = request.object.get('confirmed');
  const logger = Moralis.Cloud.getLogger();
  logger.info('Looking for confirmed Tx...');

  if (confirmed) {
    logger.info('Found Item!');
    const ActiveItem = Moralis.Object.extend('ActiveItem');

    const query = new Moralis.Query(ActiveItem);
    query.equalTo('nftAddress', request.object.get('nftAddress'));
    query.equalTo('tokenId', request.object.get('tokenId'));
    query.equalTo('marketplaceAddress', request.object.get('address'));
    query.equalTo('seller', request.object.get('seller'));
    const alreadyListedItem = await query.first();
    if (alreadyListedItem) {
      logger.info(`Deleting already listed ${request.object.get('objectId')}`);
      await alreadyListedItem.destroy();
      logger.info('Done!');
    }

    const activeItem = new ActiveItem();
    activeItem.set('marketplaceAddress', request.object.get('address'));
    activeItem.set('nftAddress', request.object.get('nftAddress'));
    activeItem.set('price', request.object.get('price'));
    activeItem.set('tokenId', request.object.get('tokenId'));
    activeItem.set('seller', request.object.get('seller'));

    logger.info(`Adding Address: ${request.object.get('address')}. TokenId: ${request.object.get('tokenId')}`);
    logger.info('Saving...');
    await activeItem.save();
    console.log('Done!');
  }
});

Moralis.Cloud.afterSave('ItemCanceled', async request => {
  const confirmed = request.object.get('confirmed');
  const logger = Moralis.Cloud.getLogger();
  logger.info('Looking for confirmed Tx...');

  if (confirmed) {
    logger.info('Found Item!');
    const ActiveItem = Moralis.Object.extend('ActiveItem');

    const query = new Moralis.Query(ActiveItem);
    query.equalTo('marketplaceAddress', request.object.get('address'));
    query.equalTo('nftAddress', request.object.get('nftAddress'));
    query.equalTo('tokenId', request.object.get('tokenId'));

    logger.info(`Martketplace | Query: ${query}`);
    const canceledItem = await query.first();
    logger.info(`Marketplace | BoughtItem: ${canceledItem}`);
    if (canceledItem) {
      logger.info(`Deleting ${request.object.get('tokenId')} at address ${request.object.get('address')} since it was canceled`);
      await canceledItem.destroy();
      logger.info('Done!');
    } else {
      logger.info(`No item found with address: ${request.object.get('address')} and tokenId: ${request.object.get('tokenId')}`);
    }
  }
});

Moralis.Cloud.afterSave('ItemBought', async request => {
  const confirmed = request.object.get('confirmed');
  const logger = Moralis.Cloud.getLogger();
  logger.info('Looking for confirmed Tx...');

  if (confirmed) {
    logger.info('Found Item!');
    const ActiveItem = Moralis.Object.extend('ActiveItem');

    const query = new Moralis.Query(ActiveItem);
    query.equalTo('marketplaceAddress', request.object.get('address'));
    query.equalTo('nftAddress', request.object.get('nftAddress'));
    query.equalTo('tokenId', request.object.get('tokenId'));

    logger.info(`Martketplace | Query: ${query}`);
    const boughtItem = await query.first();
    logger.info(`Marketplace | BoughtItem: ${boughtItem}`);
    if (boughtItem) {
      logger.info(`Deleting ${request.object.get('tokenId')} at address ${request.object.get('address')} since it was bought`);
      await boughtItem.destroy();
      logger.info('Done!');
    } else {
      logger.info(`No item found with address: ${request.object.get('address')} and tokenId: ${request.object.get('tokenId')}`);
    }
  }
});