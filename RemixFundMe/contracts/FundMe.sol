// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./PriceConverter.sol";

error NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    // `constant` permette un minor utilizzo di gas
    uint256 public constant MINIMUM_USD = 50 * 1e18;

    address[] public funders;
    mapping(address => uint256) public addrressToAmountFunded;

    // `immutable` permette un minor utilizzo di gas
    address public immutable i_owner;

    constructor() {
        i_owner = msg.sender;
    }

    // `payable` permette di inviare ETH, GWEI, WEI
    function fund() public payable {
        // imposto minimo valore inviato
        require(msg.value.getConversionRate() >= MINIMUM_USD, "Sei uno scorzo"); // inviati almeno 50 USD
        funders.push(msg.sender);
        addrressToAmountFunded[msg.sender] += msg.value;
    }

    // solo il proprietario può richiamare questa funzione
    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addrressToAmountFunded[funder] = 0;
        }

        // reset array
        funders = new address[](0); // nuovo array vuoto

        // withdraw funds (3 methods)

        // msg.sender = address
        // payable(msg.sender) = payable address

        // 1. transfer -> 2300 gas, thrws error
        // payable(msg.sender).transfer(address(this).balance); // `address(this).balance` balance del contract attuale

        // 2. send -> 2300 gas, return bool
        /* bool = sendSuccess = payable(msg.sender).send(address(this).balance);
        require(sendSuccess, "Send failed"); */

        // 3. call (basso livello) -> forward all gas or set gas, returns boolean
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    modifier onlyOwner() {
        //require(msg.sender == i_owner, "Sender is not owner"); // check prima
        if (msg.sender != i_owner) {
            revert NotOwner();
        } // risparmia gas rispetto a `require`
        _; // resto della funzione dopo il check
    }

    // se è effettuata una transazione sul contratto senza chiamare la funzone `fund`
    // essa verrà richiamata internamente
    receive() external payable {
        fund();
    }

    // se è effettuata una chiamata a una funzione inesistente
    // viene chiamata comunque la funzione `fund`
    fallback() external payable {
        fund();
    }
}
