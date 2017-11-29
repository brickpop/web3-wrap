var Promise = require("bluebird");
var Web3 = require("web3");
var EthContractClass = require("eth-contract-class").default;
var web3 = new Web3();

var connectionStatus = {
	connected: false,
	network: null,
	accounts: []
};

var connectionChangeInterval = null;
var connectionChangeCallbacks = [];
var lastConnectionStatus = {
	connected: false,
	network: null,
	accounts: null
};

var INTERVAL_PERIOD = 1000;
// var gasLimit = 4700000;
// var gasPrice = web3.utils.toWei("0.00000006");

// FUNCTIONS

function connect(providerUrl) {
	providerUrl = providerUrl || "http://localhost:8545";
	web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

	return getNetwork()
		.then(function (networkId) {
			connectionStatus.network = networkId;
			connectionStatus.connected = true;

			return getAccounts();
		})
		.then(function (accountList) {
			connectionStatus.accounts = accountList;
			return accountList;
		});
}

function useConnection(web3Instance) {
	web3 = new Web3(web3Instance.currentProvider);

	return getNetwork()
		.then(function (networkId) {
			connectionStatus.network = networkId;
			connectionStatus.connected = true;

			return getAccounts();
		})
		.then(function (accountList) {
			connectionStatus.accounts = accountList;
			return accountList;
		});
}

function getCurrentWeb3() {
	return web3;
}

function isConnected() {
	return connectionStatus.connected;
}

function addConnectionChangedListener(func) {
	if (!func || typeof func !== "function")
		throw new Error("The first parameter must be a callback");

	if (!connectionChangeInterval) {
		connectionChangeInterval = setInterval(
			checkConnectionChanged,
			INTERVAL_PERIOD
		);
	}
	connectionChangeCallbacks.push(func);
}

function checkConnectionChanged() {
	Promise.all(getAccounts(), getNetwork()).then(function () {
		var newConnectionStatus = {
			connected: connectionStatus.connected,
			network: connectionStatus.network,
			accounts: connectionStatus.accounts
		};
		if (lastConnectionStatus.connected != connectionStatus.connected) {
			notifyChangeListeners(newConnectionStatus);
		} else if (lastConnectionStatus.network != connectionStatus.network) {
			notifyChangeListeners(newConnectionStatus);
		} else if (
			(lastConnectionStatus.accounts || []).join() !=
			(connectionStatus.accounts || []).join()
		) {
			notifyChangeListeners(newConnectionStatus);
		}

		lastConnectionStatus = newConnectionStatus;
	}).catch(function (err) { console.error(err) });
}

function notifyChangeListeners(newState) {
	connectionChangeCallbacks.forEach(function (func) { func(newState) });
}

// UTIL

function delay(secs) {
	return rpcSend("evm_mine")
		.then(function () { rpcSend("evm_increaseTime", [secs]) })
		.then(function () { rpcSend("evm_mine") });
}

// Call a low level RPC

function rpcSend(method, params) {
	params = params || [];
	if (!connectionStatus.connected) {
		return Promise.reject(
			new Error("You are using an unsupported browser or your connection is down")
		);
	} else if (!method) {
		return Promise.reject(new Error("You need to indicate a method"));
	}

	return new Promise(function (resolve, reject) {
		web3.currentProvider.sendAsync(
			{
				jsonrpc: "2.0",
				method: method,
				params: params,
				id: new Date().getTime()
			},
			function (err) {
				if (err) reject(err);
				else resolve();
			}
		);
	});
}

function deployContract(abi, byteCode, parameters, opts) {
  // check connected
  if(!isConnected()) return Promise.reject(new Error("You are using an unsupported browser or your connection is down"));

	// Contract.deploy({data: HashStore.byteCode, arguments: ["0x1234"]}).send({from: "0xE18D8EB2b5d0d141908A7eBF672DC77D8681902b"})
  const contractClass = EthContractClass(abi, byteCode);
  return contractClass.new.apply(null, [web3].concat(parameters).concat([opts]));
}

function wrapContract(abi, byteCode) {
  return EthContractClass(abi, byteCode);
}

function attachToContract(abi, byteCode, address, opts){
  const contractClass = EthContractClass(abi, byteCode);

  return new contractClass(web3, address);
}

function sendTransaction(opts) { }


// Convenience wrappers

function getBalance(address) {
	return web3.eth.getBalance(address);
}

function getNetwork() {
	return web3.eth.net.getNetworkType().then(function (networkId) {
		connectionStatus.network = networkId;
		return connectionStatus.network;
	});
}

function getAccounts() {
	return web3.eth.getAccounts().then(function (acct) {
		connectionStatus.accounts = acct; // update the current list
		return connectionStatus.accounts;
	});
}

function getTransactionReceipt(txHash) {
	return web3.eth.getTransactionReceipt(txHash);
}

function getBlock(blockNumber) {
	return web3.eth.getBlock(blockNumber);
}

function estimateTransactionGas(txOpts) {
	txOpts = txOpts || {};
	return web3.eth.estimateGas(txOpts);
}

module.exports = {
	connect: connect,
	useConnection: useConnection,
	getCurrentWeb3: getCurrentWeb3,
	isConnected: isConnected,

	addConnectionChangedListener: addConnectionChangedListener,

	delay: delay,
  rpcSend: rpcSend,

  wrapContract: wrapContract,
  attachToContract: attachToContract,
  deployContract: deployContract,

	getAccounts: getAccounts,
	getBalance: getBalance,
	getBlock: getBlock,
	getNetwork: getNetwork,
	getTransactionReceipt: getTransactionReceipt,
	estimateTransactionGas: estimateTransactionGas
};
