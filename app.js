// TO DO -> Improve frontend
//         -> Automatically pay all clients who bought insurance for a specific flight after 30min delay
//         -> Confirm the client receives payment when claiming

// Contract address and ABI
const contractAddress = "YOUR_CONTRACT_ADDRESS";
const contractABI = "YOUR_CONTRACT_ABI"; // add your ABI here

document.addEventListener("DOMContentLoaded", () => {
  // ======= HTML element references =======
  const connectWalletButton = document.getElementById("connectWalletButton");
  const walletAddressText = document.getElementById("walletAddress");

  const getFlightsButton = document.getElementById("getTotalFlightsButton");
  const flightsCountText = document.getElementById("totalFlightsCount");

  const flightDetailsButton = document.getElementById("getFlightDetailsButton");
  const flightDetailsDiv = document.getElementById("flightDetails");
  const flightIdInput = document.getElementById("flightIdInput");

  const purchaseTicketButton = document.getElementById("purchaseTicketButton");
  const purchaseTicketFlightIdInput = document.getElementById(
    "purchaseTicketFlightIdInput"
  );

  const purchaseInsuranceButton = document.getElementById(
    "purchaseInsuranceButton"
  );

  const insuranceDetailsButton = document.getElementById(
    "insuranceDetailsButton"
  );
  const insuranceDetailsDiv = document.getElementById("insuranceDetails");

  const claimInsuranceButton = document.getElementById("claimInsuranceButton");

  let signer;
  let insuranceContract;

  // ======= Helper function =======
  function requireContract() {
    if (!insuranceContract) {
      alert("Please connect your wallet first");
      return false;
    }
    return true;
  }

  function clearAfterTimeout(element, timeout = 3000) {
    setTimeout(() => {
      element.innerHTML = "";
    }, timeout);
  }

  // ======= Connect wallet =======
  connectWalletButton.addEventListener("click", async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await ethereum.request({ method: "eth_requestAccounts" });
        signer = provider.getSigner();

        const account = await signer.getAddress();
        walletAddressText.textContent = `Wallet connected: ${account}`;
        console.log("Wallet connected:", account);

        // Instantiate the contract with signer
        insuranceContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
      } catch (error) {
        console.error("Error connecting wallet", error);
        walletAddressText.textContent = "Connection error.";
      }
    } else {
      walletAddressText.textContent = "Please install Metamask to continue";
      console.log("Metamask not installed");
    }
  });

  // ======= Get total flights =======
  getFlightsButton.addEventListener("click", async () => {
    if (!requireContract()) return;

    try {
      const count = await insuranceContract.flightsCount();
      flightsCountText.textContent = `Total flights: ${count.toString()}`;
      // Clear after 3 seconds
      clearAfterTimeout(totalFlightsCount);
    } catch (error) {
      console.error("Error obtaining total flights:", error);
      flightsCountText.textContent = "Error loading data";
    }
  });

  // ======= Get flight details =======
  flightDetailsButton.addEventListener("click", async () => {
    if (!requireContract()) return;

    try {
      const flightId = flightIdInput.value;
      if (!flightId) {
        alert("Please enter a flight ID.");
        return;
      }

      const flight = await insuranceContract.flights(flightId);
      flightDetailsDiv.innerHTML = `
        <p>Flight ID: ${flight.flightId}</p>
        <p>Destination: ${flight.flightTo}</p>
        <p>Ticket Price: ${ethers.utils.formatEther(flight.ticketPrice)} ETH</p>
        <p>Departure Time: ${new Date(
          flight.startTime * 1000
        ).toLocaleString()}</p>
      `;

      // Clear after 3 seconds
      clearAfterTimeout(flightDetailsDiv);
    } catch (error) {
      console.error("Error obtaining flight details:", error);
      flightDetailsDiv.textContent = "Error loading data.";
    }
  });

  // ======= Purchase ticket =======
  purchaseTicketButton.addEventListener("click", async () => {
    if (!requireContract()) return;

    try {
      const flightId = purchaseTicketFlightIdInput.value;
      if (!flightId) {
        alert("Please enter a flight ID.");
        return;
      }

      const flightDetails1 = await insuranceContract.getFlightDetails(flightId);
      const ticketPrice = flightDetails1.ticketPrice;

      const tx = await insuranceContract.buyTicket(flightId, {
        value: ticketPrice,
      });
      await tx.wait();

      alert("Flight purchased successfully!");
    } catch (error) {
      console.error("Error purchasing flight ticket:", error);
    }
  });

  // ======= Purchase insurance =======
  purchaseInsuranceButton.addEventListener("click", async () => {
    if (!requireContract()) return;

    try {
      const flightId = purchaseInsuranceFlightIdInput.value;
      if (!flightId) {
        alert("Please enter a flight ID.");
        return;
      }

      const price = await insuranceContract.INSURANCE_PRICE();
      const tx = await insuranceContract.buyInsurance(flightId, {
        value: price,
      });
      await tx.wait();

      alert("Insurance purchased successfully!");
    } catch (error) {
      console.error("Error purchasing insurance:", error);
    }
  });

  // ======= Insurance details =======
  insuranceDetailsButton.addEventListener("click", async () => {
    if (!requireContract()) return;

    try {
      const userAddress = await signer.getAddress();
      const insurance = await insuranceContract.getInsuranceStatus(userAddress);

      insuranceDetailsDiv.innerHTML = `
        <p>Flight ID: ${insurance.flightId}</p>
        <p>Insurance Active: ${insurance.isActive}</p>
        <p>Insurance Claimed: ${insurance.isClaimed}</p>
      `;
      // Clear after 3 seconds
      clearAfterTimeout(insuranceDetailsDiv);
    } catch (error) {
      console.error("Error obtaining insurance details:", error);
      insuranceDetailsDiv.textContent = "Error loading data";
      // Clear after 3 seconds
      clearAfterTimeout(insuranceDetailsDiv);
    }
  });

  // ======= Claim insurance =======
  claimInsuranceButton.addEventListener("click", async () => {
    if (!requireContract()) return;

    try {
      const tx = await insuranceContract.claimInsurance();
      await tx.wait();

      insuranceDetailsDiv.innerHTML = `<p class="success">✅ Insurance claimed successfully!</p>`;
      // Clear after 3 seconds
      clearAfterTimeout(insuranceDetailsDiv);
    } catch (error) {
      console.error("Error claiming insurance:", error);
      insuranceDetailsDiv.innerHTML = `<p class="error">❌ Error claiming insurance. Maybe flight not delayed yet or no active insurance.</p>`;
      clearAfterTimeout(insuranceDetailsDiv);
    }
  });
});
