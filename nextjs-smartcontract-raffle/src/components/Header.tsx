import { ConnectWallet } from '@web3uikit/web3';

function Header() {
  return (
    <div>
      <ConnectWallet moralisAuth={false} />
    </div>
  );
}

export default Header;