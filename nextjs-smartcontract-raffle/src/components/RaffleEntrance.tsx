import { useEffect, useState } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import { contractAddresses, abi  } from '../constants';
import { BigNumber, ContractTransaction, ethers } from 'ethers';
import { useNotification } from '@web3uikit/core';
import { Bell, Eth } from '@web3uikit/icons';
import Button from './Button';

function RaffleEntrance() {

  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const dispatch = useNotification(); 

  const [entranceFee, setEntranceFee] = useState('0');
  const [numPlayers, setNumPlayers] = useState('0');
  const [recentWinner, setRecentWinner] = useState('0');

  const { runContractFunction: getEntranceFee } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: 'getEntranceFee',
    params: {},
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: 'getNumberOfPlayers',
    params: {}
  });

  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: 'getRecentWinner',
    params: {}
  });

  async function updateUI() {
    const ef = ((await getEntranceFee()) as BigNumber).toString();
    const np = (await getNumberOfPlayers()).toString(); 
    const rw = (await getRecentWinner()) as string; 
     
    
    setEntranceFee(ef);
    setNumPlayers(np);
    setRecentWinner(rw);
  }

  useEffect(() => {
    if(isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const { runContractFunction: enterRaffle, isLoading, isFetching } = useWeb3Contract({
    abi,
    contractAddress: raffleAddress,
    functionName: 'enterRaffle',
    params: {},
    msgValue: entranceFee
  });

  async function handleSuccess(tx: ContractTransaction) {
    await tx.wait(1);
    updateUI();
    handleNewNotificaiton();
  }

  function handleNewNotificaiton() {
    dispatch({
      type: 'info',
      message: 'Transaction Complete!',
      title: 'Transaction Notification',
      position: 'topR',
      icon: <Bell />
    });
  }

  if(!raffleAddress) {
    return (
      <div className='flex justify-center py-10'>
        <p className='text-xl'>No Raffle Address detected!</p>
      </div>
    );
  }

  return (
    <div className='py-10 px-5'>
      <Button
        disabled={isLoading || isFetching}
        isLoading={isLoading || isFetching}
        onClick={async () => {
          await enterRaffle({
            onSuccess: handleSuccess,
            onError: (error) => console.log(error)
          });  
        }}>
          Enter Raffle!
      </Button>
      <div className='mt-4'>
        <p>Entrance Fee: <span className='text-[#2e7daf] inline-flex items-center'>{ethers.utils.formatUnits(entranceFee, 'ether')} ETH <Eth /></span></p>
        <p>Number of players: <span className='text-[#2e7daf]'>{numPlayers}</span></p>
        <p>Recent winner: <a className='text-[#2e7daf] hover:underline hover:cursor-pointer'>{recentWinner}</a></p>
      </div>
    </div>
  );
}

export default RaffleEntrance;