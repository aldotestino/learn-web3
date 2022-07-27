# HardhatSimpleStorage

## Run locally
```
npm run local
```

## Run on Rinkeby
1. Create [Alchemy app](https://dashboard.alchemyapi.io/apps) -> Rinkeby network
2. Create .env file with
    ```
    RPC_URL=alchemy_https_key
    PRIVATE_KEY=metamask_account_private_key
    ETHERSCAN_API_KEY=etherscan_api_key
    ```
3. Run
    ```
    npm run rinkeby
    ```

## Run tests
```
npm run test
```