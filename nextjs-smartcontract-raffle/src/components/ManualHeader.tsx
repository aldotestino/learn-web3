import { useEffect } from 'react';
import { useMoralis } from 'react-moralis';

function Header() {

  const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } = useMoralis();

  useEffect(() => {
    if(isWeb3Enabled) return;
    if(typeof window !== 'undefined') {
      if(localStorage.getItem('connected')) {
        enableWeb3();
      }
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    Moralis.onAccountChanged(account => {
      if(account === null) {
        if(typeof window !== 'undefined') {
          localStorage.removeItem('connected');
        }
        deactivateWeb3();
      }
    });
  }, []);

  return (
    <div>
      {account ?
        <div>Connected to {account.slice(0, 6)}...{account.slice(account.length - 4)}</div>
        : <button disabled={isWeb3EnableLoading} onClick={async () => {
          await enableWeb3();
          if(typeof window !== 'undefined') {
            localStorage.setItem('connected', 'injected ');
          }
        }}>Connect</button>}
      
    </div>
  );
}

export default Header;