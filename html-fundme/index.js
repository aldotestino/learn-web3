import { Contract, ethers } from './ethers-5.2.esm.min.js';
import { abi, contractAddress } from './constants.js';
const { ethereum } = window;
const connectBtn = document.getElementById('connect-btn');
const balanceBtn = document.getElementById('balance-btn');
const withdrawBtn = document.getElementById('withdraw-btn');
const balanceSpan = document.getElementById('balance');
const fundForm = document.getElementById('fund-form');

connectBtn.onclick = connect;
balanceBtn.onclick = getBalance;
withdrawBtn.onclick = withdraw;
fundForm.addEventListener('submit', async e => {
  e.preventDefault();
  await fund(fundForm.ethAmount.value);
  fundForm.reset();
})

async function connect() {
  if(!ethereum) {
    alert('Install metamask before!');
    connectBtn.innerText = 'No metamask';
  }else {
    try {
      await ethereum.request({method: 'eth_requestAccounts'});
    }catch (error) {
      console.log('error');
    }
    console.log('connected');
    connectBtn.innerText = 'Connected';
  } 
}

async function fund(ethAmount) {
  if(ethereum) {
    console.log(`Funding with ${ethAmount} eth...`);
    const provider = new ethers.providers.Web3Provider(ethereum); 
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    try {
      const transactionResponse = await contract.fund({value: ethers.utils.parseEther(ethAmount)});
      await listenForTransactionMine(transactionResponse, provider);
      console.log('Done!');
    }catch(error) {
      console.log(error);
    }
  }
} 

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);
  return new Promise(resolve => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(`Completed with ${transactionReceipt.confirmations} confirmations`);
      resolve();
    });
  })
}

async function getBalance() {
  if(ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const balance = await provider.getBalance(contractAddress);
    balanceSpan.innerHTML = `${ethers.utils.formatEther(balance)} eth`;
  }
}

async function withdraw() {
  if(ethereum) {
    console.log(`Withdrawing...`);
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      console.log('Done!');
    }catch(error) {
      console.log(error);
    }
  }
}