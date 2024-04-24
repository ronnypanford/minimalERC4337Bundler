Minimal ERC-4337 Bundle
=======================

This repository contains a minimal implementation of an ERC-4337 bundle, designed to facilitate the bundling and execution of User Operations through the Ethereum EntryPoint contract.

Features
--------

- ERC-4337 handleOp execution
- TypeScript Support: Written in TypeScript, the project offers static typing and advanced tooling support for a more robust development experience.
- Express Server: Implements Express.js in a RESTful architecture for handling HTTP requests and routing.
- Wallet Management: Implements a singleton pattern for wallet management. The bundler manages multiple wallets and their transactions efficiently. With a redundancy sending mechanism, the bundler can retry sending transactions if the first attempt fails, and does so with multiple accounts concurrently. This fully adjustable for the number of concurrent accounts, the number of retries and the delay between retries.
- Wallet Security: Implements a secure wallet management system that accesses wallets securely, with a server boot-up password. The wallet password is of one-time use and is not kept in memory after the server is booted up. The wallet password is to be known by the user and the user only. PrivateKeys are AES-256 encrypted and stored in a secure manner (enforce chmod on the files and restricted user access to the application only), and are not openly accessible in the system environment. The server would gracefully exit after 100 seconds has elapsed without the password being entered. Ensure all wallets are encypted with the same password, the server would only load wallets it can unlock with the password entered.
- Wallet Balance Monitoring and Reordering: The bundler monitors the balance of each wallet and reorders the wallets based on their balance. This ensures that the wallets with the highest balance are used first, optimizing the bundling process. Excess gas is re-balanced to the wallets with the lowest balance. Over a period of time, the bundler will balance the wallets to have an equal amount of gas on its own unless manually adjusted.
- Dynamic Route Handling: Implements dynamic route handling for JSON-RPC requests, allowing for the processing of various JSON-RPC methods through routers created in a modular internal structure.
- JSON-RPC Support: Incorporates JSON-RPC method extraction middleware, allowing for the handling of JSON-RPC requests in a standardized manner.
- Error Handling: Implements error handling middleware for catching and logging errors in the application.
- Safe Schema Parsing: Safe schema parsing is used to ensure all data received and returned are type-sctrict at runtime aside the compile time type checking of TypeScript.
- Configuration and Environment Variables: Leverages environment variables and a configuration file for easy customization and deployment.

Getting Started
---------------

### Prerequisites

- Node.js (v14.x or higher)
- npm or yarn
- Basic understanding of TypeScript and Node.js

### Installation

1. Clone the repository:

```bash
   git clone https://github.com/ronnypanford/minimalERC4337Bundler.git

```

2. Navigate to the project directory:

```bash
   cd minimalERC4337Bundler

```

3. Install dependencies:

```bash
   npm install

```

or if you're using yarn:

```bash
   yarn

```

4. Start the server:

```bash
   npm start

```

or if you're using yarn:

```bash
   yarn start

```

5. Enter the wallet password when prompted to unlock the wallets. The project comes packed with [sample encrypted wallets](sampleFiles/testPrivateKeys/) of which the password to be entered on server boot-up is `biconomyTeam`. The server will exit if the password is not entered within 100 seconds.
**Note**: This bundler node requires at least 2 wallets to be loaded.

**Note**: The project also provides a helper script to encrypt your own test private keys with your own secure password [encryptionScript](sampleFiles/scripts/encryptPrivateKey.ts). You can add your own private keys to the [sampleFiles/testPrivateKeys](sampleFiles/testPrivateKeys) by encrypting them with the script and password of your choice or use `biconomyTeam`.

6. The server should now be running and listening on port 3000 with any loaded wallets.

### Configuration

The project uses a `.env` file for configuration. Where you can override the entrypoint contract (ENTRYPOINT_CONTRACT_ADDRESS), and apiKeyIdentifier for the server included in the url route (API_KEY) to which can be used internally by a client if need be. You can also set whether the node waits for transactions to be mined
(TX_WAIT = true | false) and a coma seperated list of paths to encrypted private keys JSON files(PRIVATE_KEY_PATHS = path1,path2,path3). The is also a configuration defined in [config](config/index.ts) where for the scope of this project and task the chain has been set strictly to sepolia.

### Usage

Once the server is running, you can interact with the ERC-4337 bundle functionality through sending JSON-RPC requests to the server. The server listens on port 3000 by default, and you can send requests using the default base URL `http://localhost:3000/api/v2/1/testAPIKey`.

Testing
-------

The project uses jest for testing. To run the tests, use the following command:

```bash
npm test
```

Or to run the tests for specific components/files:

```bash
npm test -- <path-to-file/path-to-directory>
```

License
-------

This project is licensed under the MIT License. See the [LICENSE](vscode-webview://09g0c556tub3ncaa8ndr2ocs2uer6ouqmj0l26cqehvackq3f1k7/LICENSE) file for details.
