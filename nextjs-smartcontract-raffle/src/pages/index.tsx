import Head from 'next/head';
import Header from '../components/Header';
import RaffleEntrance from '../components/RaffleEntrance';

function Home() {
  return (
    <div>
      <Head>
        <title>Crypto Raffle</title>
        <meta name="description" content="Win $$ by joining this raffle!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <RaffleEntrance />
    </div>
  );
}

export default Home;