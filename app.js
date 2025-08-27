document.addEventListener("DOMContentLoaded", () => {
  // 1. get references of html elements
  const connectButton = document.getElementById("connectButton");
  const walletAddressText = document.getElementById("walletAddress");

  // 2. add listener to event at button
  connectButton.addEventListener("click", async () => {
    // check if wallet extension (Metamask) is installed
    if (typeof window.ethereum !== "undefined") {
      try {
        // request accounts to Metamask
        // pop of Metamask open
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });

        // if connection was a success, shows the address of the first account
        const account = accounts[0];
        walletAddressText.textContent = `Wallet connected: ${account}`;
        console.log("Wallet connected:", account);
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
});
