

# Research Paper
```
(https://doi.org/10.1016/j.autcon.2024.105779)
```
# Project Management DApp (BBAPS)

This repository demonstrates a **BIM- and Blockchain-enabled Automatic Procurement System (BBAPS)** for managing construction projects, general contractors (GCs), and subcontractors (Subs) on the Ethereum blockchain. It serves as a proof-of-concept (PoC) DApp that integrates:

1. **Solidity Smart Contracts** (`ProjectManagement.sol` and `Utils.sol`)
2. **React** front-end (using **web3** for blockchain interaction)
3. **BIM-based CSV Imports** (via **Papa Parse**)

BBAPS removes traditional relationship bias by automating GC–Sub matching based on objective factors (location, schedule, cost, trust, etc.).

---

## Table of Contents

1. [Overview](#overview)  
2. [Key Features](#key-features)  
3. [Smart Contract](#smart-contract)  
4. [Prerequisites](#prerequisites)  
5. [Deployment](#deployment)  
6. [Front-End Setup](#front-end-setup)  
7. [Configuration](#configuration)  
8. [Usage](#usage)  
9. [CSV File Support](#csv-file-support)  
10. [File Structure](#file-structure)  
11. [Contributing](#contributing)  
12. [Future Directions](#future-directions)  
13. [Citation](#citation)  
14. [License](#license)  

---

## Overview

The **BBAPS** approach is drawn from the paper:  
> _“BIM- and blockchain-enabled Automatic Procurement System (BBAPS) removing relationship bias.”_  

This system aims to:

- Extend the pool of subcontractors by focusing on data-driven criteria instead of prior relationships.  
- Store bids and trust scores immutably on the blockchain for transparency.  
- Integrate BIM-based data (from CSV) to simplify project setup (quantity takeoffs, scheduling, location details).

**Stakeholders:**

- **Contract Owner (Admin)**: Registers GCs and Subs.  
- **General Contractors (GCs)**: Add/manage projects, assign trust factors, finalize Sub winners.  
- **Subcontractors (Subs)**: Submit availability, location, work type, unit costs, and gain trust factors based on performance.

---

## Key Features

1. **Decentralized Project Management**  
   - No single central entity; uses Ethereum blockchain transactions and a Web3 wallet (e.g., MetaMask).

2. **Trust Factor Computation**  
   - Subs are evaluated on cost, time, and quality metrics.  
   - Combined into an overall trust score for unbiased selection.

3. **Anonymized, Data-Driven Selection**  
   - GC sees anonymized Sub data (schedule, location, costs, trust) before picking a winner.  
   - Minimizes relationship bias.

4. **BIM Integration with CSV**  
   - Quickly populate project details (e.g., from Autodesk Revit) via Papa Parse.  
   - Reduces manual data entry.

5. **Finalize Winner & Reveal**  
   - GCs select their preferred Sub.  
   - Only after finalization does the contract reveal the chosen Sub’s identity.

---

## Smart Contract

**File:** `ProjectManagement.sol` (imports `Utils.sol`)

- **`Project` struct**: schedule, location, cost details.  
- **`Contractor` struct**: ID, name, Ethereum address.  
- **`TrustFactorStruct`**: cost/time/quality metrics.  
- **Key Functions**:  
  - `addGeneralContractor()` / `addSubContractor()`  
  - `addProject()`  
  - `addSubcontractorData()`  
  - `setTrustFactor()` and `calculateTrustFactor()`  
  - `findMatchingSubcontractors()` / `getSortedMatchesWithGC()`  
  - `finaliseWinner()` / `getWinner()`

---

## Prerequisites

1. **Node.js and npm**  
   - Node v14+ and npm v6+ (or Yarn) recommended.

2. **Ganache / Test Network**  
   - Local blockchain (Ganache) or a public Ethereum test network.

3. **MetaMask**  
   - Required for Web3 interactions in the browser.

4. **Remix IDE** (optional)  
   - Simple way to compile/deploy contracts, else Truffle/Hardhat.

---

## Deployment

1. **Compile and Deploy**  
   - Open `ProjectManagement.sol` in [Remix](https://remix.ethereum.org/) (or use Truffle/Hardhat).  
   - Check Solidity version.  
   - Deploy to Ganache or a desired testnet.

2. **Obtain Contract Address & ABI**  
   - Copy the deployed address.  
   - Get the ABI from Remix or Truffle artifacts.

---

## Front-End Setup

1. **Install Dependencies**  
   ```bash
   cd client
   npm install
   ```
2. **Start Development Server**  
   ```bash
   npm start
   ```
   - Typically available at `http://localhost:3000`.

---

## Configuration

Inside your React app (e.g., `client/src/config/contract.js`):

```js
import web3 from "./web3";
import ABI from "./abi";

const contractAddress = "0xYourDeployedContractAddress"; // Replace with actual address

const mainContract = new web3.eth.Contract(ABI, contractAddress);

export default mainContract;
```

- Ensure the ABI import matches your build artifacts.
- Update `contractAddress` accordingly.

---

## Usage

1. **Register GC & Subs**  
   - The contract owner (admin) calls `addGeneralContractor()` or `addSubContractor()`.

2. **Add Project (GC)**  
   - Input schedule, location, costs, etc.  
   - Optionally parse CSV to auto-fill fields.  
   - Submit -> `addProject()`.

3. **Add Subcontractor Data (Subs)**  
   - Subs log in via MetaMask.  
   - Provide availability, location, labor/material costs -> `addSubcontractorData()`.

4. **Set Trust Factor**  
   - GC updates Sub’s performance (`setTrustFactor()`).  
   - Contract calculates updated trust score.

5. **Match & Finalize**  
   - GC calls `findMatchingSubcontractors()` or `getSortedMatchesWithGC()`.  
   - Finalize your chosen Sub with `finaliseWinner()`.  
   - `getWinner()` reveals the winning Sub’s identity.

---

## CSV File Support

- Uses [Papa Parse](https://www.papaparse.com/) in React.
- **Steps**:
  1. Upload CSV from BIM software (e.g., Autodesk Revit).  
  2. Papa Parse creates a data table.  
  3. Click a table row to fill project fields.  
  4. Submit -> calls `addProject()` to record on-chain.

---

## File Structure

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
│   │       └── Project/
│   │           └── AddProject.jsx
│   ├── package.json
│   └── ...
└── README.md
```

---

## Contributing

Contributions are welcome! To get involved:

1. Fork the repo.  
2. Create a feature branch.  
3. Submit a pull request detailing your changes.

---

## Future Directions

- **Additional Procurement Parameters**  
  Include insurance, certifications, advanced contract terms.

- **Real-World Case Studies**  
  Validate performance, trust, and cost–benefit in live projects.

- **Enhanced BIM Integration**  
  Extend beyond QTO data to more specialized specifications (material density, thermal properties, etc.).

- **Scaling / Layer-2**  
  Consider L2 solutions (e.g., Polygon, Arbitrum) to reduce gas costs.

---

## Citation

If you use BBAPS in your project or research, please cite:

```
Yoon, J. H., Aurangzeb, I., & McNamara, S. (2024).
BIM- and blockchain-enabled Automatic Procurement System (BBAPS) removing relationship bias.
Automation in Construction, 168, 105779.
https://doi.org/10.1016/j.autcon.2024.105779
```

---


**Disclaimer**: BBAPS is a raw **research-oriented proof of concept**. Any production usage should undergo thorough security audits, real-world testing, and regulatory compliance checks.

