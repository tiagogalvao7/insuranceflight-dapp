// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// flight delay insurance
// users can purchase an insurance policy for a specific flight
// if the flight is delayed beyond a certain period, the contract automatically pays them

contract Insurance {

    struct Policy {
        uint256 flightId;
        uint256 payoutAmount;
        address policyHolder;
        bool isPaidOut;
    }

    struct Flight {
        string flightTo;
        uint256 flightId;
        uint256 ticketPrice;
        uint256 startTime;
    }

    mapping(uint => Policy) public policies;
    mapping(uint => Flight) public flights;

    address owner;
    uint256 policiesCount;
    uint256 public flightsCount;

    constructor() {
        owner = msg.sender;
    }

    function addFlight (string memory _flightTo, uint256 _ticketPrice, uint _startTime) public {
        require(msg.sender == owner, "Only the owner of this contract can call this function");
        
        flightsCount++;
        flights[flightsCount] = Flight(_flightTo, flightsCount, _ticketPrice, _startTime);
    }

    function purchasePolicy(uint256 _flightId) public payable {
        require(_flightId > 0 && _flightId <= flightsCount, "This flight does not exist");
        require(block.timestamp < flights[_flightId].startTime, "This flight already departed");
        require(msg.value == 0.0001 ether, "Pay the exact price of the policy");
        
        policiesCount++;
        policies[policiesCount] = Policy(_flightId, 1 ether, msg.sender, false);
    }

    function triggerPayout(uint256 _policyId, uint256 _delayInMinutes) external {
        // 1. Check if the caller is the owner
        require(msg.sender == owner, "Only owner of the contract can call this function");
        // 2. Check if the policy exists
        require(_policyId > 0 && _policyId <= policiesCount, "This policy does not exist");
        // 3. Check if the payout has already been triggered for this policy
        require(policies[_policyId].isPaidOut == false, "Payout already triggered for this policy");
        // 4. Check for the delay (15 minutes = 900 seconds)
        require(_delayInMinutes >= 900, "Delay must be greater than 15 minutes");
        
        policies[_policyId].isPaidOut = true;
    }

    function claimPayout(uint256 _policyId) public {
        require(msg.sender == policies[_policyId].policyHolder, "Only owner of this policy can claim this money");
        require(policies[_policyId].isPaidOut == true, "This payment is not already allowed");
        require(policies[_policyId].payoutAmount > 0, "Payout already claimed");
        
        // get the amountfrom the policy struct
        uint256 amount = policies[_policyId].payoutAmount;
        
        // reset the Payout amount
        policies[_policyId].payoutAmount = 0;

        // transfer the funds
        payable(msg.sender).transfer(amount);
    }
}