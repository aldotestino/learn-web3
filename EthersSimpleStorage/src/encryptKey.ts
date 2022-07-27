import dotenv from 'dotenv';
import * as ethers from 'ethers';
import * as fs from 'fs';
import { JSON_KEY_PATH } from './vars';

dotenv.config();

async function main() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!);
  const encryptedJsonKey = await wallet.encrypt(process.env.PRIVATE_KEY_PASSWORD!, process.env.PRIVATE_KEY);
  console.log(encryptedJsonKey);

  fs.writeFileSync(JSON_KEY_PATH, encryptedJsonKey);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
