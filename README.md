```md
## Research Paper

[**BIM- and blockchain-enabled Automatic Procurement System (BBAPS) removing relationship bias**](https://doi.org/10.1016/j.autcon.2024.105779)

---

# Project Management DApp (BBAPS)

This repository demonstrates a **BIM- and Blockchain-enabled Automatic Procurement System (BBAPS)** for managing construction projects, general contractors (GCs), and subcontractors (Subs) on the Ethereum blockchain. It serves as a proof-of-concept (PoC) decentralized application (DApp) that integrates:

1. **Solidity Smart Contracts** (`ProjectManagement.sol` and `Utils.sol`)  
2. **React** front end (using **web3** for blockchain interaction)  
3. **BIM-based CSV Imports** (via **Papa Parse**)  

BBAPS eliminates traditional relationship bias by automating GC–Sub matching based on objective factors (location, schedule, cost, trust, etc.).

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
14. [Disclaimer](#disclaimer)  

---

## Overview

The **BBAPS** approach is derived from the paper:

> _“BIM- and blockchain-enabled Automatic Procurement System (BBAPS) removing relationship bias.”_

This system aims to:

- **Expand** the pool of subcontractors by emphasizing data-driven criteria rather than past relationships.  
- **Ensure** transparent and immutable data (bids and trust scores) on the blockchain.  
- **Simplify** project setup by importing BIM-based data (CSV) for quantity takeoffs, scheduling, and locations.

**Stakeholders:**

- **Contract Owner (Admin)**: Registers GCs and Subs.  
- **General Contractors (GCs)**: Add/manage projects, assign trust factors, finalize Sub winners.  
- **Subcontractors (Subs)**: Provide availability, location, work type, unit costs, and receive trust factor evaluations.

---

## Key Features

1. **Decentralized Project Management**  
   - No single controlling entity; uses Ethereum blockchain and a Web3 wallet (e.g., MetaMask).

2. **Trust Factor Computation**  
   - Subs are rated on cost, time, and quality.  
   - Creates an overall trust score for unbiased selection.

3. **Anonymized, Data-Driven Selection**  
   - GCs see anonymized Sub data (schedule, location, costs, trust) before deciding.  
   - Minimizes potential for relationship bias.

4. **BIM Integration with CSV**  
   - Project details can be quickly populated (e.g., from Autodesk Revit) using Papa Parse.  
   - Reduces manual data entry overhead.

5. **Finalize Winner & Reveal**  
   - GC finalizes the chosen Sub.  
   - Only after finalization does the system reveal the Sub’s identity.

---

## Smart Contract

**File:** `ProjectManagement.sol` (imports `Utils.sol`)

- **`Project` struct**: Contains schedule, location, and cost details.  
- **`Contractor` struct**: Contains ID, name, and Ethereum address.  
- **`TrustFactorStruct`**: Captures performance metrics (cost, time, quality).  

**Key Functions:**
- `addGeneralContractor()` / `addSubContractor()`  
- `addProject()`  
- `addSubcontractorData()`  
- `setTrustFactor()` / `calculateTrustFactor()`  
- `findMatchingSubcontractors()` / `getSortedMatchesWithGC()`  
- `finaliseWinner()` / `getWinner()`

---

## Prerequisites

1. **Node.js and npm**  
   - Node v14+ and npm v6+ (or Yarn) recommended.

2. **Ganache / Test Network**  
   - Local blockchain (Ganache) or a public Ethereum test network (e.g., Sepolia).

3. **MetaMask**  
   - Required for Web3 interactions in the browser.

4. **Remix IDE** (optional)  
   - Quick compilation/deployment; can also use Truffle/Hardhat.

---

## Deployment

1. **Compile and Deploy**  
   - Open `ProjectManagement.sol` in [Remix](https://remix.ethereum.org/) (or in Truffle/Hardhat).  
   - Set **Solidity** compiler to **0.8.14**.  
   - Deploy to Ganache or a testnet.

2. **Obtain Contract Address & ABI**  
   - Copy the deployed contract address.  
   - Retrieve the ABI (from Remix or Truffle artifacts).

---

## Front-End Setup

1. **Install Dependencies**  
   ```bash
   cd client
   npm install
   ```

2. **Run Development Server**  
   ```bash
   npm start
   ```
   - Usually available at `http://localhost:3000`.

---

## Configuration

In `client/src/config/contract.js` (example):

```js
import web3 from "./web3";
import ABI from "./abi";

const contractAddress = "0xYourDeployedContractAddress"; // Replace with the actual address

const mainContract = new web3.eth.Contract(ABI, contractAddress);

export default mainContract;
```

- Ensure **ABI** is correct from your build artifacts.
- Update `contractAddress` for your network.

---

## Usage

1. **Register GC & Subs**  
   - As contract owner (admin), call `addGeneralContractor()` or `addSubContractor()`.

2. **Add Project (GC)**  
   - Input schedule, location, costs, etc.  
   - Optionally parse CSV for autofill.  
   - Submit -> `addProject()`.

3. **Add Subcontractor Data (Subs)**  
   - Subs log in via MetaMask.  
   - Provide availability, location, cost details -> `addSubcontractorData()`.

4. **Set Trust Factor**  
   - GC updates performance via `setTrustFactor()`.  
   - The system calculates an updated trust score.

5. **Match & Finalize**  
   - GC calls `findMatchingSubcontractors()` or `getSortedMatchesWithGC()`.  
   - Finalize the chosen Sub (`finaliseWinner()`).  
   - `getWinner()` reveals the winning Sub.

---

## CSV File Support

- Uses [Papa Parse](https://www.papaparse.com/) in React.
- **Typical Steps**:
  1. Export CSV from BIM software (e.g., Autodesk Revit).  
  2. Papa Parse displays a table of the data.  
  3. Click a row to auto-fill relevant project fields.  
  4. Submit -> calls `addProject()` on-chain.

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

Contributions are welcome!  
**Steps**:
1. Fork the repository.  
2. Create a feature branch.  
3. Submit a pull request describing your changes.

---

## Future Directions

- **Additional Procurement Parameters**  
  - Insurance, certifications, more advanced terms.  
- **Real-World Case Studies**  
  - Validate performance, trust, and cost–benefit in live deployments.  
- **Enhanced BIM Integration**  
  - Leverage advanced BIM data (material density, thermal properties, etc.).  
- **Scaling / Layer-2**  
  - Explore L2 solutions (Polygon, Arbitrum) to reduce gas costs.

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

## Disclaimer

BBAPS is a **research-oriented proof of concept**. Any production usage should undergo thorough **security audits**, real-world testing, and regulatory compliance.
