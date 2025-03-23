Link to the Research Paper:
https://doi.org/10.1016/j.autcon.2024.105779

# Project Management DApp

This repository demonstrates a decentralized application (DApp) for managing construction projects, general contractors, and subcontractors on the Ethereum blockchain. It uses a **Solidity** smart contract (`ProjectManagement.sol`), along with a **React** front-end that interacts with the contract via **web3**.

---

## Table of Contents
1. [Overview](#overview)
2. [Smart Contract](#smart-contract)
3. [Prerequisites](#prerequisites)
4. [Deployment](#deployment)
5. [Front-End Setup](#front-end-setup)
6. [Configuration](#configuration)
7. [Usage](#usage)
8. [CSV File Support](#csv-file-support)
9. [File Structure](#file-structure)
10. [License](#license)

---

## Overview

This DApp allows:
- **Owners** to register General Contractors (GCs) and Subcontractors.
- **General Contractors** to add new projects, set trust factors for subcontractors, and select project winners.
- **Subcontractors** to provide their availability, location, work type, and unit costs.
- **Everyone** to view relevant information such as projects, subcontractor data, and project winners.

### Key Features
- **Add Projects**: A GC can upload project details.
- **Add Subcontractor Data**: Subcontractors can upload their cost and availability data.
- **Calculate & Sort by Trust Factor**: Built-in trust scoring to help GCs select suitable subcontractors.
- **Winner Finalization**: GCs finalize a winner for a project.
- **CSV Import**: Automatically populate project data from a CSV file (e.g., from Autodesk Revit).

---

## Smart Contract

The core logic is in:
```
ProjectManagement.sol
```
which imports a utility library:
```
Utils.sol
```
(Ensure that `Utils.sol` resides in the same folder or that your import statements match your directory structure.)

### Important Contracts/Structs/Functions
- **`Project`**: Stores project-specific data (schedule, location, cost details).
- **`Contractor`**: Stores contractor info (ID, name, Ethereum account).
- **`TrustFactorStruct`**: Stores trust factor scores (`cost`, `time`, `quality`) for each subcontractor.
- **`ProjectManagement`** contract includes methods to:
  - Register GCs and subcontractors.
  - Add projects.
  - Add subcontractor data.
  - Compute trust factors.
  - Sort subcontractors based on trust factor.
  - Finalize a winner for a project.
  - Retrieve all relevant data.

---

## Prerequisites

1. **Node.js and npm**  
   - Recommended to use Node v14+ and npm v6+ (or corresponding Yarn version).

2. **Ganache / Test Network**  
   - You need a local test environment such as **Ganache** or a public test network (like Ropsten, Goerli, Sepolia, etc.) to deploy and test your contract.

3. **MetaMask** (or another Web3-compatible wallet)  
   - Required to interact with the DApp from your browser.

4. **Remix IDE** (optional)  
   - You can deploy the smart contract using [Remix](https://remix.ethereum.org/) or Truffle/Hardhat.

---

## Deployment

1. **Open and Compile**  
   - In Remix, create or upload your `ProjectManagement.sol` and `Utils.sol`.
   - Compile the contracts (ensure the `pragma solidity` version matches your Remix compiler).

2. **Deploy**  
   - Use your desired **environment** (e.g., Ganache local network or a test network).
   - Deploy the `ProjectManagement` contract.
   - Copy the **deployed contract address**.

3. **Take note of the ABI**  
   - After deployment, retrieve the **ABI** (Application Binary Interface). You will need the ABI to interact with your contract in the front-end.

---

## Front-End Setup

Assuming you have a front-end folder (e.g., `client`) with the React application:

1. **Install Dependencies**  
   In your front-end directory:
   ```bash
   npm install
   ```
2. **Start Development Server**  
   ```bash
   npm run start
   ```
   This should spin up the local React development server (typically at `http://localhost:3000`).

---

## Configuration

Inside the React app, there is a configuration file (for example, `config/contract.js`) which contains:

```js
import React from "react";
import ABI from "./abi";
import web3 from "./web3";

const contractAddress = "0xYourDeployedContractAddress"; // <-- Replace with your contract address

const mainContract = new web3.eth.Contract(ABI, contractAddress);

export default mainContract;
```

- **ABI**: Imported from a local file `abi.js` (or however you choose to store your ABI).
- **web3**: A web3 instance (e.g., using `window.ethereum` from MetaMask or a custom provider).
- **contractAddress**: Must be replaced with the **actual address** at which your `ProjectManagement` contract was deployed.

---

## Usage

1. **Connect Wallet**  
   - Ensure MetaMask is connected to the same network (Ganache or testnet) on which you deployed the contract.

2. **Add General Contractor**  
   - As the contract owner, you can register new general contractors.

3. **Add Subcontractor**  
   - As the contract owner, register new subcontractors.

4. **Subcontractor Uploads Data**  
   - Subcontractors log in (with their address) and fill in availability, location, and cost details.

5. **General Contractor Adds Projects**  
   - GCs can create projects, specifying schedule, location, cost, etc.
   - The front-end includes a feature to parse CSV data (e.g., from **Autodesk Revit**) to quickly fill in fields.

6. **View & Sort Potential Matches**  
   - GCs can view matched subcontractors, sorted by trust factor.
   - GCs update the trust factor if needed.

7. **Finalize Winner**  
   - Once a suitable subcontractor is found, GCs finalize the winner for the project.
   - The contract stores the final decision on-chain.

---

## CSV File Support

The front-end uses [Papa Parse](https://www.papaparse.com/) to parse a CSV file (e.g., a quantity take-off from Autodesk Revit). 

In the component (`AddProject.jsx`), you can:

1. **Upload CSV File**  
   - Click the file input button and select your CSV file.
2. **Map CSV Fields**  
   - The table is dynamically generated with the CSV rows.
3. **Click a Row**  
   - On clicking a table row, fields (e.g., `Family and Type`, `Material Costs`, `Labor Costs`) populate automatically in the project form.
4. **Submit Project**  
   - Finally, click **Add Project** to send a transaction, creating a new project on the blockchain.

---

## File Structure

A simplified version of the relevant file structure might look like this:

```
your-repo/
├── contracts/
│   ├── Utils.sol
│   └── ProjectManagement.sol
├── client/
│   ├── src/
│   │   ├── config/
│   │   │   ├── contract.js
│   │   │   ├── abi.js
│   │   │   └── web3.js
│   │   └── components/
│   │       └── common/
│   │           └── Project/
│   │               └── AddProject.jsx
│   ├── package.json
│   └── ...
└── README.md
```

**Note**: The exact structure may vary. The important parts are:
- `contracts` folder for Solidity files
- `config` folder for your front-end’s contract address & ABI
- `AddProject.jsx` for CSV file parsing & project creation

---

