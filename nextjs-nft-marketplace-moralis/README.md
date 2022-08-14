## Setup Moralis

1. Run Local Hardhat Node from `hardhat-nft-marketplace` folder
  ```
  yarn run-node
  ```
2. Sync Events to Moralis
  ```
  yarn moralis:sync
  ```
3. Add Events to Moralis DB
  ```
  yarn moralis:add-events
  ```
4. Add Cloud Functions to Moralis
  ```
  yarn moralis:cloud
  ```
  
`RESET LOCAL CHAIN` from Moralis when restarting localnode!