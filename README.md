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

Below is a sample **README.md** that summarizes the core ideas of the paper, highlights the objectives and benefits of the BIM- and Blockchain-enabled Automatic Procurement System (BBAPS), and outlines how one might set up, run, and extend the project. Feel free to tailor the structure and wording to suit your needs or the norms of your repository.

---

# BIM- and Blockchain-enabled Automatic Procurement System (BBAPS)

**Version:** 1.0

## Overview

BBAPS is a proof-of-concept system that integrates **Building Information Modeling (BIM)** and **blockchain-enabled smart contracts** to streamline the subcontractor (Sub) procurement process. By automating data exchange and decision-making, BBAPS removes traditional **relationship bias**—giving qualified new Subs an equal chance to participate, compete, and be matched fairly to General Contractors (GCs).

### Why BBAPS?

- **Eliminates Relationship Bias**  
  Traditional procurement often favors Subs who have prior relationships with the GC. BBAPS leverages anonymity and data-driven logic to expand the pool of qualified Subs, ensuring fair competition.

- **Blockchain-Backed Transparency**  
  All procurement data—GC requirements, Sub bids, trust scores, etc.—is recorded immutably on the blockchain, fostering trust and preventing unethical practices.

- **BIM-Driven Data Integration**  
  BIM-based quantity takeoffs and construction data (e.g., location, schedule, cost, specs) are integrated into BBAPS via CSV to streamline the subcontracting process and reduce manual data entry errors.

- **Smart Contracts Automation**  
  BBAPS automates GC–Sub matching and handles tasks like trust score calculation, final Sub selection, and cost comparisons, significantly reducing the potential for human errors or deliberate manipulation.

---

## Key Features

1. **Data-Driven Subcontractor Selection**  
   - Automatic GC–Sub matching based on objective parameters (location, schedule, cost, work type, trust factor).  
   - Anonymized data ensures GCs cannot pick Subs solely based on prior relationships.

2. **Trust Factor Computation**  
   - Collects past performance metrics (conformity to time, cost, quality).  
   - Aggregates these metrics into an overall trust score, encouraging Subs to maintain consistent quality.

3. **BIM Integration**  
   - Uses a CSV exported from BIM software (e.g., Revit) for key project details (quantity, cost estimates, materials).  
   - Data is parsed and loaded into a blockchain ledger.

4. **Blockchain-Enabled**  
   - Solidity smart contracts store, verify, and secure the data.  
   - All matching logic (algorithms) is executed on-chain, ensuring tamper-proof records.

5. **Proof-of-Concept Demo**  
   - Remix IDE and Ganache used for local testing.  
   - Example scenario (two-story residential building) showcased how GC’s requirements and five Subs’ data feed into the BBAPS system.

---

## System Architecture

1. **Frontend**  
   - A lightweight web interface (e.g., React-based) allows GCs to input project data and Subs to register their bids.  
   - Papa Parse library processes CSV files from the BIM model.  

2. **Ethereum Smart Contracts**  
   - **Smart Contract 1**: Registers GCs (only the owner can do this).  
   - **Smart Contract 2**: Registers Subs and calculates total construction cost.  
   - **Smart Contract 3**: Sets and computes trust scores for each Sub.  
   - **Smart Contract 4**: Matches GC with Subs based on cost, location, schedule, and trust factor.  
   - **Smart Contract 5**: Finalizes winners and reveals them to the GC once selection is complete.

3. **Blockchain Network**  
   - Remix IDE + Ganache for local testing and proof-of-concept.  
   - Can be extended or migrated to a public or private Ethereum network.

4. **Data Flow**  
   1. **GC** uploads project data (CSV from BIM + schedule/location) -> stored on-chain.  
   2. **Subs** submit location, availability, costs, etc. -> stored on-chain.  
   3. **Smart Contracts** match data, calculate trust scores, and finalize winners.  
   4. **GC** sees anonymized matches, picks a winner, and the system reveals Sub’s identity post-selection.

---

## Getting Started

### Prerequisites

- **Node.js / npm**  
  Required for installing frontend dependencies and interacting with the blockchain.
- **Truffle / Hardhat** (optional)  
  If you plan on compiling, deploying, and testing the contracts in a local environment outside Remix.
- **Ganache**  
  Used for local Ethereum network simulation.
- **Remix IDE**  
  Easiest approach to testing smart contracts.  
- **BIM Software** (e.g., Autodesk Revit) to export CSV.  
  The system expects CSV files containing relevant quantity takeoff data.

### Installation & Setup

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/<YOUR_ORGANIZATION>/<BBAPS_REPOSITORY>.git
   cd BBAPS
   ```

2. **Compile Contracts** (Remix IDE or locally)
   - **In Remix IDE**  
     - Upload the `.sol` files to Remix.  
     - Compile them in the Solidity compiler panel.  
     - Deploy to a local environment (e.g., Ganache).
   - **Locally with Truffle/Hardhat**  
     ```bash
     npm install
     truffle compile
     truffle migrate --network development
     ```

3. **Run Ganache**  
   ```bash
   ganache-cli
   ```
   This will start a local Ethereum testnet at `http://127.0.0.1:8545/`.

4. **Frontend Setup** (if applicable)  
   - From the `client` folder, run:
     ```bash
     npm install
     npm start
     ```
   - Open your browser at `http://localhost:3000` to interact with the UI (subcontractor data entry, CSV upload, etc.).

---

## Usage

1. **Register GC & Subs**  
   - The contract owner (admin) registers valid GC addresses.  
   - Similarly, the admin registers any new Subs.  

2. **GC Uploads Project Data**  
   - Generate CSV from your BIM software.  
   - Use Papa Parse in the UI to parse CSV fields (e.g., work types, labor/material rates, quantity).  
   - Provide schedule & location in the text fields.  
   - Click **Add Project** -> triggers the `addProject` function on the smart contract.

3. **Subs Input Their Data**  
   - Each Sub logs in with their MetaMask account.  
   - Inputs available schedule, location, labor/material rates -> triggers `addSubcontractorData` function.

4. **Trust Score Assignment**  
   - The GC of previous projects (or an authorized entity) sets trust factor metrics (`conformityToCost`, `conformityToTime`, `conformityToQuality`) for each Sub.  
   - Smart contract automatically computes the combined trust score.

5. **Matching & Finalizing**  
   - GC calls `findMatchingSubcontractors` or `getSortedMatchesWithGC`.  
   - The contract returns anonymized potential Subs sorted by trust score, total cost, and location/schedule fit.  
   - GC picks a final Sub by calling `finaliseWinner`.  
   - The system then reveals the Sub’s identity via `getWinner`.

---

## Example Demo (Pilot Test)

- **Scenario**:  
  - A GC is building a two-story residence and needs a concrete wall subcontractor.  
  - GC CSV data includes unit costs, total quantity, schedule from BIM (e.g., Revit).  
  - 5 Subcontractors register, each with different availability, location, cost, and trust scores.
- **Outcome**:  
  - The system automatically ranks potential Subs.  
  - The GC views anonymized matches, picks the best candidate, and the system reveals the winner’s identity only after finalization.  
  - Typical cost overhead in gas fees is **\$130–\$210** in test settings.

---

## Contributing

Contributions are welcome! If you’d like to:

- Report a bug
- Suggest a new feature
- Improve existing code or documentation

Please open a pull request or create an issue in this repository.

---

## Future Directions

- **Additional Procurement Parameters**  
  Expand the system to incorporate insurance/certification data or other complex contract terms.
- **Real-World Case Studies**  
  Deploy on real projects for performance, trust, and cost–benefit evaluation.
- **Enhanced BIM Integration**  
  Move beyond QTO data to include advanced material specs (e.g., thermal, density) and manufacturer details directly from the BIM model.
- **Scalability & Layer-2 Solutions**  
  Consider Layer-2 Ethereum networks (e.g., Polygon) to reduce gas fees for large-scale usage.




---

## Citation

If you use BBAPS in your research or project, please cite the accompanying paper:

```
Yoon, J. H., Aurangzeb, I., & McNamara, S. (2024).
BIM- and blockchain-enabled Automatic Procurement System (BBAPS) removing relationship bias.
Automation in Construction, 168, 105779.
https://doi.org/10.1016/j.autcon.2024.105779
```

---

**Disclaimer**: The BBAPS prototype is a research-oriented proof of concept. Actual usage in production environments requires careful consideration of legal and regulatory factors, thorough security audits, and robust testing.
