import pinataSDK from '@pinata/sdk';
import * as path from 'path';
import * as fs from 'fs';
import 'dotenv/config';
import { NftMetadata } from './types';

const { PINATA_API_KEY, PINATA_API_SECRET } = process.env;

const pinata = pinataSDK(PINATA_API_KEY!, PINATA_API_SECRET!);

async function storageImages(imagesFilePath: string) {
  const fullImagesPath = path.resolve(imagesFilePath);
  const files = fs.readdirSync(fullImagesPath);
  const responses = [];
  console.log('⚠️ Uploading to Pinata...');
  for (const fileIndex in files) {
    const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`);
    try {
      const response = await pinata.pinFileToIPFS(readableStreamForFile);
      responses.push(response);
    } catch (e) {
      console.log(e);
    }
  }
  console.log('✅ Images uploaded to Pinata succesfully!');
  return { responses, files };
}

function storeTokenUriMetadata(metadata: NftMetadata) {
  try {
    return pinata.pinJSONToIPFS(metadata);
  } catch (e) {
    console.log(e);
  }
  return null;
}

export {
  storageImages,
  storeTokenUriMetadata
};