import { useEffect, useState } from 'react';
import { useMoralis, useWeb3Contract } from 'react-moralis';
import { contractAddresses, abi  } from '../constants';
import { BigNumber, ContractTransaction, ethers } from 'ethers';
import { useNotification } from '@web3uikit/core';
import { Bell } from '@web3uikit/icons';

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

  const { runContractFunction: enterRaffle } = useWeb3Contract({
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
      <div>No Raffle Address detected!</div>
    );
  }

  return (
    <div>
      <div>
        <button onClick={async () => {
          await enterRaffle({
            onSuccess: handleSuccess,
            onError: (error) => console.log(error)
          });  
        }}>
          Enter Raffle!
        </button>
        <p>Entrance Fee: {ethers.utils.formatUnits(entranceFee, 'ether')} ETH</p>
        <p>Number of players: {numPlayers}</p>
        <p>Recent winner: {recentWinner}</p>
      </div>
    </div>
  );
}

export default RaffleEntrance;