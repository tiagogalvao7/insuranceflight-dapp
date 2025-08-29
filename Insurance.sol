// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// flight delay insurance
// users can purchase an insurance policy for a specific flight
// if the flight is delayed beyond a certain period, the contract automatically pays them

contract FlightInsurance {

    struct Flight {
        string flightTo;
        uint256 flightId;
        uint256 ticketPrice;
        uint256 startTime;
    }

    struct Insurance {
        uint256 flightId;
        uint256 amountPaid;
        bool isActive;
        bool isClaimed;
    }

    mapping(uint256 => Flight) public flights;
    mapping(address => uint256) public tickets;     // each address can only have 1 ticket per flight
    mapping(address => Insurance) public insurances;

    uint256 public constant INSURANCE_TIME = 30 minutes;
    uint256 public constant INSURANCE_PRICE = 0.00005 ether;
    uint256 public flightsCount = 0;

    constructor() {
        flightsCount = 3;

        flights[1] = Flight("Madrid", 1, 0.0001 ether, block.timestamp + 1 hours);
        flights[2] = Flight("Paris", 2, 0.0001 ether, block.timestamp + 2 hours);
        flights[3] = Flight("London", 3, 0.0001 ether, block.timestamp + 3 hours);
    }

    // client buy ticket
    function buyTicket (uint256 _flightId) external payable {
        require(_flightId>0 && _flightId<=flightsCount, "This flight does not exist");
        require(block.timestamp < flights[_flightId].startTime, "This flight already departed");
        require(msg.value == flights[_flightId].ticketPrice, "Pay exactly the amount of ticket");
        require(tickets[msg.sender] == 0, "You already have a ticket for this flight");

        tickets[msg.sender] = _flightId;
    }

    // client buy insurance if already has bought flight ticket
    function buyInsurance (uint256 _flightId) external payable {
        require(_flightId>0 && _flightId<=flightsCount, "This flight does not exist");
        require(tickets[msg.sender] == _flightId, "You need to have 1 ticket for this flight");
        require(msg.value == INSURANCE_PRICE, "Pay the exactly price of the insurance");
        require(insurances[msg.sender].isActive, "You already purchase this insurance");

        insurances[msg.sender] = Insurance(_flightId, INSURANCE_PRICE, true, false);
    }

    // client claim insurance after 30 minutes of delay
    function claimInsurance () external {
        Insurance storage insurance = insurances[msg.sender];
        require(insurance.isActive, "You dont have any insurance purchased to claim");
        require(!insurance.isClaimed, "You already claimed this insurance value");

        Flight memory flight = flights[insurance.flightId];
        require(block.timestamp >= flight.startTime + INSURANCE_TIME, "Flight not delayed time necessary to claim insurance");

        insurance.isClaimed = true;
        payable(msg.sender).transfer(insurance.amountPaid);
    }

    // see the state of the insurance
    // memory keyword to return a temporary copy of the data storage
    function getInsuranceStatus (address _user) external view returns (Insurance memory) {
        return insurances[_user];
    }

    // see details of certain flight
    // memory keyword to return a temporary copy of the data storage
    function getFlightDetails (uint256 _flightId) external view returns (Flight memory) {
        return flights[_flightId];
    }
}


// storage → permanent data in the blockchain.
// memory → temporary data, used only within the execution of the function (or to return structs/arrays).
// 