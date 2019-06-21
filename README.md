# Kin Unity SDK server - Node
This is a simple server side implementation of  [Kin's node SDK](https://github.com/kinecosystem/kin-sdk-node). and its [callback implementation](https://www.npmjs.com/package/kin-node-callback) It can work as a standalone implementation, or together with the client side wrapper provided in the [Kin Unity SDK tutorial](https://github.com/hitwill/kin-sdk-unity-tutorial/tree/master).

With this code, you can call [Kin's blockchain](https://www.kin.org/blockchainExplorer) to:
1. Fund newly created accounts
2. Send payments
3. Whitelist transactions for the client

You can also extend it to suit your needs.

![sample node code](https://i.imgur.com/zC4WhkY.png)


## Installation

```
npm install kin-node-server
```

## Configuration
Set the following variables in server.js and upload to your server or localhost (port 5000)
```javascript
const isProduction = false;
const seed = 'SBKK2MJZLU4UERFXP3CCG5QYUZ27WXDJ2CIUKA2UCOAXZV3DRDBLBCLA'; //private key/seed (keep private / store in .env file for production)
const uniqueAppId = '1acd'; //your app id assigned by Kin - you can use 1acd for testing
const maxKinSendable = 10; //just for your security - set max Kin you allow from your server to your app
```

You can use [Kin's Laboratory](https://laboratory.kin.org/index.html#account-creator?network=test) to generate your seed.

Push to your server (Heroku recommended).


## Usage
Simply call the server with GET/POST to perform the following functions:
1. Fund a new account (create it on the blockchain)

    GET: fund = 1

   POST: address, memo, amount

2. Send a payment to an account
  
   GET: request = 1

   POST: address, id, memo, amount

3. Whitelist a transaction for the client

   GET: whitelist = 1

   POST: address, id, memo, amount

#### Variables
1. **address:** The blockchain address you wish to make a payment to
2. **memo:** Memo to add to your transaction
3. **amount:** Amount to send for your transaction
4. **id:** A unique id for your client (optional)

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details.



## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

