import { ConnectWallet } from '@web3uikit/web3';

function Header() {
  return (
    <div className='border-b-2 py-10 px-5 flex justify-between items-center'>
      <h1 className='font-bold text-3xl'>Crypto Raffle</h1>
      <ConnectWallet moralisAuth={false} />
    </div>
  );
}

export default Header;