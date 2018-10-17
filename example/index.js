const Web3Wrap = require("../index"); // This would be require("eth-tx")
const { HashStore } = require("./contracts.js");

var hashStoreInstance = null;

const HashStoreContract = Web3Wrap.wrapContract(HashStore.abi, HashStore.byteCode);

function connect() {
  if (typeof window.web3 !== "undefined") {
    return Web3Wrap.useConnection(window.web3);
  } else if (location.protocol == "file:") {
    throw new Error("Can't connect to the Ethereum net from a local file://");
  } else {
    return Web3Wrap.connect();
  }
}

function init() {
  connect()
    .then(accounts => {
      if (accounts && accounts.length) setStatus("Web3 has been loaded");
      else setStatus("Please, unlock your wallet or create an account");

      return Web3Wrap.getNetwork();
    })
    .then(name => {
      if (name != "ropsten")
        throw new Error("Please, switch to the Ropsten network");

      setInterval(updateHashStatus, 3000);
      return updateHashStatus();
    })
    .catch(err => {
      setStatus(err.message);
      // alert(err.message);
    });
}

function setStatus(text) {
  $("#status").text("Status: " + text);
}

function deploy() {
  if (!confirm("Do you want to deploy the contract?")) return;

  Web3Wrap
    .getAccounts()
    .then(accounts => {
      if (!accounts || !accounts.length)
        throw new Error("Please, unlock your wallet or create an account");

      const initialHash = "0x1234";
      setStatus("Deploying HashStore");

      return HashStoreContract.deploy(initialHash, {});
    })
    .then(instance => {
      hashStoreInstance = instance;

      setStatus("Deployed: " + instance.$address);
    })
    .catch(err => {
      if (err && err.message == "No accounts are available")
        return setStatus("Please, unlock your wallet or create an account");
      else alert(err.message);

      setStatus(err.message);
    });
}

function attachToContract() {
  if (!hashStoreInstance) {
    const address = "0x03f3fE224F6c4eB3437b273fB682326034A69EfD"; // change it by yours once deployed
    // const address = "0xBF83424D053d4E97dcA78611f44E3939a7697953";
    // const address = "0xcBeDf81116eC295D3752d69b58FEAFD340D90641";

    hashStoreInstance = HashStoreContract.attach(address);
  }
}

function updateHashStatus() {
  attachToContract();
  if(!hashStoreInstance) return;

  return hashStoreInstance
    .getHash()
    .then(hash => {
      $("#hash").text("Current Hash: " + hash);
    })
    .catch(err => {
      setStatus(err.message);
    });
}

Web3Wrap.onConnectionChanged(status => {
  if (!status.connected)
    setStatus("You are using an unsupported browser or your connection is down");
  else if (status.accounts && status.accounts.length)
    setStatus(`Web3 connection status changed (${status.network})`);
  else setStatus("Please, unlock your wallet or create an account");
});

function setHash(hash) {
  attachToContract();
  if(!hashStoreInstance) return alert("You need to attach to the Smart Contract");

  return Web3Wrap
    .getNetwork()
    .then(name => {
      if (name != "ropsten")
        throw new Error("Please, switch to the Ropsten network");

      return hashStoreInstance.setHash(hash, {});
    })
    .then(result => {
      console.log(result);
      setStatus("Updated the hash to " + hash);

      return updateHashStatus();
    })
    .catch(err => {
      alert(err.message);
      setStatus(err.message);
    });
}

function clearHash() {
  if(!hashStoreInstance) return alert("You need to attach to the Smart Contract");

  return Web3Wrap
    .getNetwork()
    .then(name => {
      if (name != "ropsten")
        throw new Error("Please, switch to the Ropsten network");

      const params = {
        to: hashStoreInstance.$address,
        value: 10 // wei
      };
      return Web3Wrap.sendTransaction(params);
    })
    .then(() => {
      return updateHashStatus();
    })
    .catch(err => {
      alert(err.message);
      setStatus(err.message);
    });
}

// INIT

init();

$("#deploy").click(() => deploy());
$("#set-1234").click(() => setHash("0x1234"));
$("#set-5678").click(() => setHash("0x5678"));
$("#set-90ab").click(() => setHash("0x90ab"));
$("#set-cdef").click(() => setHash("0xcdef"));
$("#clear").click(() => clearHash());
