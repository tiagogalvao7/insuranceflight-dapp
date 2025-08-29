// TO DO-> melhorar frontend
//      -> todos os clientes que compraram insurance para aquele especifico voo, assim que passar 30min depois do voo todos recebem
//      -> confirmar que cliente recebe pagamento quando vai reclamar o pagamento

// get contract address and ABI
const contractAddress = "0x0a8F7b9b8D350baF3Dd2B69520Ed1C45F7529737";
const contractABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_flightTo",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_ticketPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_startTime",
        type: "uint256",
      },
    ],
    name: "addFlight",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_policyId",
        type: "uint256",
      },
    ],
    name: "claimPayout",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_flightId",
        type: "uint256",
      },
    ],
    name: "purchasePolicy",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_policyId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_delayInMinutes",
        type: "uint256",
      },
    ],
    name: "triggerPayout",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "flights",
    outputs: [
      {
        internalType: "string",
        name: "flightTo",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "flightId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "ticketPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "startTime",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "flightsCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "policies",
    outputs: [
      {
        internalType: "uint256",
        name: "flightId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "payoutAmount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "policyHolder",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isPaidOut",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  // get references of html elements
  const connectButton = document.getElementById("connectButton");
  const walletAddressText = document.getElementById("walletAddress");
  const getTotalFlightsButton = document.getElementById(
    "getTotalFlightsButton"
  );
  const totalFlightsCountText = document.getElementById("totalFlightsCount");
  const flightIdInput = document.getElementById("flightIdInput");
  const getFlightDetailsButton = document.getElementById(
    "getFlightDetailsButton"
  );
  const flightDetailsDiv = document.getElementById("flightDetails");

  let signer;
  let insuranceContract;

  // 2. add listener to event at button
  connectButton.addEventListener("click", async () => {
    // check if wallet extension (Metamask) is installed
    if (typeof window.ethereum !== "undefined") {
      try {
        // create a provider to connect with blockchain
        // CORRECTED: 'providers' instead of 'provider'
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        // request accounts to Metamask
        // pop of Metamask open
        await ethereum.request({ method: "eth_requestAccounts" });

        // get the signer, account that will sign the transactions
        signer = provider.getSigner();

        // if connection was a success, shows the address of the first account
        const account = await signer.getAddress();
        walletAddressText.textContent = `Wallet connected: ${account}`;
        console.log("Wallet connected:", account);

        // create the instance of the contract
        // CORRECTED: 'ethers' instead of 'ether'
        insuranceContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
      } catch (error) {
        // Handles errors if the user rejects the connection
        console.error("Error connecting wallets", error);
        walletAddressText.textContent = "Connection error.";
      }
    } else {
      // If Metamask was not installed, informs user
      walletAddressText.textContent = "Please install Metamask to continue";
      console.log("Metamask not installed");
    }
  });

  // add a listening to button "Get all available flights"
  getTotalFlightsButton.addEventListener("click", async () => {
    // check if contract is on
    if (!insuranceContract) {
      alert("Pls, connect your wallet first");
      return;
    }

    try {
      // call flightsCount function, view function
      const count = await insuranceContract.flightsCount();
      totalFlightsCountText.textContent = `Total of flights: ${count.toString()}`;
    } catch (error) {
      console.error("Error obtaining the number of flights:", error);
      totalFlightsCountText.textContent = "Error loading data";
    }
  });

  // add a listening to button "Get details of the flight"
  getFlightDetailsButton.addEventListener("click", async () => {
    // check if contract is on
    if (!insuranceContract) {
      alert("Pls, connect your wallet first");
      return;
    }

    try {
      const flightId = flightIdInput.value;
      if (!flightId) {
        alert("Please enter a flight ID.");
        return;
      }

      // call flights function, view function
      const flight = await insuranceContract.flights(flightId);
      flightDetailsDiv.innerHTML = `
                <p>Flight ID: ${flight.flightId}</p>
                <p>Destination: ${flight.flightTo}</p>
                <p>Ticket Price: ${ethers.utils.formatEther(
                  flight.ticketPrice
                )} ETH</p>
                <p>Departure Time: ${new Date(
                  flight.startTime * 1000
                ).toLocaleString()}</p>
            `;
    } catch (error) {
      console.error("Error obtaining flight details:", error);
      flightDetailsDiv.textContent = "Error loading data.";
    }
  });

  // add a listener for the button of the buy insurance
  purchasePolicyButton.addEventListener("click", async () => {
    // check if contract is on
    if (!insuranceContract) {
      alert("Pls, connect your wallet first");
      return;
    }

    try {
      const flightId = policyFlightIdInput.value;
      if (!flightId) {
        alert("Please, insert the ID of the flight");
        return;
      }

      // define the value in ether
      const overrides = {
        value: ethers.utils.parseEther("0.0001"),
      };

      //call the function purchasePolicy of the contract
      const transactionResponse = await insuranceContract.purchasePolicy(
        flightId,
        overrides
      );

      alert("Transaction sent! Check Metamask");

      // wait for transaction mined
      await transactionResponse.wait();
      alert("Insurance bougth successfully");
    } catch (error) {
      console.error("Error buying insurance:", error);
      alert(
        `Error buying insurance. Check logs for more details. Error: ${
          error.reason || error.message
        }`
      );
    }
  });
});
