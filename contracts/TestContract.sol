// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TestContract {
    string public message = "Hello Hardhat!";
    
    function setMessage(string memory _message) public {
        message = _message;
    }
}
