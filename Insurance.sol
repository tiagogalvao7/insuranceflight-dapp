// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;
pragma experimental ABIEncoderV2;

/// @title Flight Insurance DApp
/// @notice Users can buy one ticket + one insurance for a flight. 
/// If the flight is delayed, the contract pays them the ticket price back.
contract FlightInsurance {
    struct Flight {
        string flightTo;       // Destination of the flight
        uint256 flightId;      // Unique ID of the flight
        uint256 ticketPrice;   // Price to buy a ticket
        uint256 startTime;     // Departure timestamp
    }

    struct Insurance {
        uint256 flightId;      // Flight ID associated with this insurance
        bool isActive;         // Insurance is active until claimed
        bool isClaimed;        // If already claimed
    }

    // Flight storage
    mapping(uint256 => Flight) public flights;

    // Each user can only hold ONE ticket at a time
    mapping(address => uint256) public tickets;

    // Each user can only hold ONE insurance at a time
    mapping(address => Insurance) public insurances;

    uint256 public constant INSURANCE_TIME = 30 minutes; // Delay required to claim insurance
    uint256 public constant INSURANCE_PRICE = 0.00005 ether; // Flat insurance cost
    uint256 public flightsCount = 0;

    constructor() {
        flightsCount = 3;

        // Initialize 3 example flights
        flights[1] = Flight("Madrid", 1, 0.0001 ether, block.timestamp + 1 hours);
        flights[2] = Flight("Paris", 2, 0.0001 ether, block.timestamp + 2 hours);
        flights[3] = Flight("London", 3, 0.0001 ether, block.timestamp + 3 hours);
    }

    /// @notice Buy a ticket for a given flight
    function buyTicket(uint256 _flightId) external payable {
        require(_flightId > 0 && _flightId <= flightsCount, "This flight does not exist");
        require(block.timestamp < flights[_flightId].startTime, "This flight already departed");
        require(msg.value == flights[_flightId].ticketPrice, "Pay exactly the ticket price");
        require(tickets[msg.sender] == 0, "You already have a ticket");

        // Assign ticket to user
        tickets[msg.sender] = _flightId;
    }

    /// @notice Buy insurance only if you already bought a ticket
    function buyInsurance(uint256 _flightId) external payable {
        require(_flightId > 0 && _flightId <= flightsCount, "This flight does not exist");
        require(tickets[msg.sender] == _flightId, "You must own this flight's ticket");
        require(msg.value == INSURANCE_PRICE, "Pay the exact insurance price");
        require(!insurances[msg.sender].isActive, "You already purchased insurance");

        // Activate insurance for this flight
        insurances[msg.sender] = Insurance(_flightId, true, false);
    }

    /// @notice Claim insurance after 30 minutes delay
    /// @dev Returns the ticket price as compensation, not just the insurance fee
    function claimInsurance() external {
        Insurance storage insurance = insurances[msg.sender];
        require(insurance.isActive, "You don't have an active insurance");
        require(!insurance.isClaimed, "Already claimed");

        Flight memory flight = flights[insurance.flightId];
        require(block.timestamp >= flight.startTime + INSURANCE_TIME, "Not enough delay");

        // Update insurance state BEFORE transfer (checks-effects-interactions pattern)
        insurance.isClaimed = true;

        // Pay back the ticket price (compensation)
        payable(msg.sender).transfer(flight.ticketPrice);
    }

    /// @notice Get current insurance status for a user
    function getInsuranceStatus(address _user) external view returns (Insurance memory) {
        return insurances[_user];
    }

    /// @notice Get details of a flight
    function getFlightDetails(uint256 _flightId) external view returns (Flight memory) {
        return flights[_flightId];
    }
}


// storage → permanent data in the blockchain.
// memory → temporary data, used only within the execution of the function (or to return structs/arrays).
//