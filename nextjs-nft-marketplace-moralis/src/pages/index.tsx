import { Box } from '@chakra-ui/react';
import Head from 'next/head';
import Header from '../components/Header';

function Home() {
  return (
    <>
      <Head>
        <title>NFT Marketplace</title>
        <meta name="description" content="A Web3 website to buy and sell your NFTs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box h="100vh">
        <Header />
      </Box>
    </>
   
  );
}

export default Home;
