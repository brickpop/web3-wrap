Web3 Wrap
---

Web3 Wrap is a client Javascript library inspired on the work of Jordi Baylina ([runWeb3Wrap](https://github.com/jbaylina/runWeb3Wrap) and [ethconnector](https://github.com/jbaylina/ethconnector)).

* It allows to interact with Web3, regardless of the underlying version or the browser support
* It provides a unified way to **deploy**, **call** and **send transactions** to Ethereum Smart Contracts
* It also allows to perform simple transactions in a simple way
* It abstracts the usage of the web3 component. Simply require the component and forget about the `window.web3` version

# Environment

**NOTE**: This version is only targeted for browsers and/or Webpack.

# Installation

```sh
$ npm install web3-wrap
```

Once the package is ready, import it in your app:

```javascript
const Web3Wrap = require("web3-wrap");
```

# Usage

## Connection

```javascript
const { connect, useConnection } = Web3Wrap;
```

To simply connect to `localhost:8545`, you can use:

```javascript
connect()
	.then(() => console.log("Success"))
	.catch(err => console.log("Error", err));
```

You can specify a custom URL like so:

```javascript
connect("http://localhost:8545")
	.then(() => console.log("Success"))
	.catch(err => console.log("Error", err));
```

Or you can reuse an already existing web3 instance:

```javascript
useConnection(window.web3)
	.then(() => console.log("Success"))
	.catch(err => console.log("Error", err));
```

At any time, you can check if a connection is already established:

```javascript
const { isConnected } = Web3Wrap;

isConnected(); // returns true or false
```

And you can also subscribe to connection status changes. You will receive a status object with the properties `{ connected, network, accounts }`.

```javascript
const { onConnectionChanged } = Web3Wrap;

onConnectionChanged(status => {
	if(!status.connected) {
		console.log("Web3 support is not available");
	}
	else if(status.accounts && status.accounts.length) {
		console.log(`Connected to ${status.network} => ${status.accounts.join()}`);
	}
	else {
		console.log(`Your account on ${status.network} is currently locked or has no accounts`);
	}
});
```

## Working with contracts

When you have a Smart Contract already compiled, you can wrap it into a class/object using the function `wrapContract`. You need to provide its Application Binary Interface (ABI) and its Byte Code.

```javascript
const { wrapContract } = Web3Wrap;

const abi = [...];
const byteCode = "0x12345...";

const HashStoreContract = wrapContract(abi, byteCode);
```

This function generates a customized Javascript class template, that you can use to deploy new instances or to attach to already deployed ones.

### Deploying a contract

On the wrapped object, invoke the `.deploy()` method, along with the constructor parameters, and any options that you need.

```javascript
const abi = [...];
const byteCode = "0x12345...";

const HashStoreContract = wrapContract(abi, byteCode);

HashStoreContract.deploy("parameter-1", "parameter-2", {value: 1234})
	.then(myContractInstance => {
		console.log("Deployed on", myContractInstance.$address);

		// ...
	})
	.catch(err => console.log("Error", err));
```

Calling `deploy(...)` returns a promise that resolves with an instance of the newly deployed contract.

### Attaching to an already deployed contract

On the wrapped object, invoke the `.attach()` method, along with the instance address.

```javascript
const abi = [...];
const byteCode = "0x12345...";
const address = "0x1234567890...";

const HashStoreContract = wrapContract(abi, byteCode);

const myContractInstance = HashStoreContract.attach(address);
```

Calling `attach(addr)` returns an instance of the contract that can be used immediately.

### Interacting with a contract instance

#### Sending a transaction to the contract

All the functions of the contract have been mapped into que contract's instance. To invoke a state-changing method, just call it along with any parameters you need (and options if need be).

```javascript
const options = { value: 1234 };
myContractInstance.setHash("param-1", "param-2", options)
	.then(transaction => {
		console.log("Transaction", transaction);

		// ...
	})
	.catch(err => console.log("Error", err));
```

#### Calling a read-only function

Simmilarly as before, `constant` functions are invoked right away with its parameters, but with only one difference.

Instead of returning a promise that resolves to a transaction receipt, the promise resolves with the value returned from the function.

```javascript
myContractInstance.getHash("param-1")
	.then(value => {
		console.log("Resulting value", value);

		// ...
	})
	.catch(err => console.log("Error", err));
```

#### Retrieving public variables

The same scenario applies to the public variables of a contract instance.

```javascript
myContractInstance.totalAmount()
	.then(value => {
		console.log("totalAmount =", value);

		// ...
	})
	.catch(err => console.log("Error", err));
```

#### Invoke the fallback function

Simply send a transaction to the contract's address

```javascript
const params = {
	to: myContractInstance.$address,
	value: 10 // wei
};

Web3Wrap.sendTransaction(params)
	.then(receipt => {
		console.log("Receipt:", receipt);

		// ...
	})
	.catch(err => console.log("Error", err));
```

## Working with simple transactions

Transactions can simply be a matter or transfering funds to another account.

```javascript
var accounts;
const { getAccounts, sendTransaction } = Web3Wrap;

getAccounts()
	.then(acc => { accounts = acc; })
	.catch(err => console.log("Error", err));
```

To send ether to another account, we can simply:

```javascript
const amount = Web3Wrap.getCurrentWeb3().utils.toWei("0.01", "ether");

const params = {
	// from: "0x123456...",  // by default will be accounts[0]
	to: accounts[1],
	value: amount,
	// data: "0x12345..."  // optional bytecode
};

sendTransaction(params)
	.then(result => console.log("Result", result))
	.catch(err => console.log("Error", err));
```

## Utilities

```javascript
const { getBalance, getBlock, getNetwork } = Web3Wrap;
```

These two functions are simply a wrapper of their corresponding method in `web3`. They return a `Promise` resolving to the appropriate value.

## Examples

Check out the file `example/index.js` for an example script.

```sh
$ cd example
$ ./compile.sh
$ serve
```

## About

By Jordi Moraleda
