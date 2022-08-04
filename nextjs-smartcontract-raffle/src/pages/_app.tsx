import { AppProps } from 'next/app';
import { MoralisProvider } from 'react-moralis';
import { NotificationProvider } from '@web3uikit/core';
import '../styles/globals.css';

function App({ Component, pageProps }: AppProps) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <NotificationProvider>
        <Component {...pageProps} />
      </NotificationProvider>
    </MoralisProvider>
  );
}

export default App;
