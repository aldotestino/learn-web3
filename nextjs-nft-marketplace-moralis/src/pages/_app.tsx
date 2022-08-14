import { ChakraProvider, theme } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import { MoralisProvider } from 'react-moralis';
import Head from 'next/head';

const MORALIS_APP_ID = process.env.NEXT_PUBLIC_MORALIS_APP_ID;
const MORALIS_SERVER_URL = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;

function MyApp({ Component, pageProps }: AppProps) {
  
  return (
    <>
      <Head>
        <title>NFT Marketplace</title>
        <meta name="description" content="A Web3 website to buy and sell your NFTs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MoralisProvider initializeOnMount={false}>
        <ChakraProvider theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </MoralisProvider>
    </>
  );
}

export default MyApp;
