// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

// inheritance

import "./SimpleStorage.sol";

contract ExtraStorage is SimpleStorage {
    // override della funzione `store` del `SimpleStorage`
    function store(uint256 _favouriteNumber) public override {
        favouriteNumber = _favouriteNumber + 5;
    }
}
