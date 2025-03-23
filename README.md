```md
[Link to the Research Paper](https://doi.org/10.1016/j.autcon.2024.105779)

# Project Management DApp (BBAPS)

This repository demonstrates a **BIM- and Blockchain-enabled Automatic Procurement System (BBAPS)** for managing construction projects, general contractors, and subcontractors on the Ethereum blockchain. It serves as a proof-of-concept (PoC) DApp that integrates:

1. **Solidity Smart Contracts** (`ProjectManagement.sol` and `Utils.sol`)
2. **React** front-end (with **web3** for blockchain interaction)
3. **BIM-based CSV Imports** (using **Papa Parse**)

BBAPS removes traditional relationship bias by automating GC–Sub matching based on objective parameters (location, schedule, cost, trust factors, etc.).  

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

The **BBAPS** approach is drawn from the research paper _“BIM- and blockchain-enabled Automatic Procurement System (BBAPS) removing relationship bias”_. This PoC system aims to:

- Extend the pool of subcontractors (Subs) by focusing on objective, data-driven factors instead of prior relationships.
- Ensure transparency and immutability via blockchain, so procurement data (bids, trust scores, and decisions) is tamper-resistant.
- Integrate BIM-based project data (via CSV) to quickly populate project information such as quantity takeoffs, schedules, and location details.

Stakeholders in this system include:

- **Contract Owner (Admin)**: Registers GCs and Subs.
- **General Contractors (GCs)**: Add and manage projects, assign trust factors, finalize Sub winners.
- **Subcontractors (Subs)**: Provide availability, location, work type, unit costs, and gain trust factors based on performance.

---

## Key Features

1. **Decentralized Project Management**  
   - All interactions happen on the Ethereum blockchain via MetaMask (or another Web3 wallet).
   - Eliminates centralized control, ensuring impartial data handling.

2. **Trust Factor Computation**  
   - Subcontractors receive three performance metrics (conformity to cost, time, and quality).
   - The system aggregates these metrics into a single trust score.

3. **Anonymized, Data-Driven Selection**  
   - Matches are based on objective criteria (schedule, location, costs, trust factor).
   - GCs see only anonymized candidate data before finalizing the winner, minimizing relationship bias.

4. **BIM Integration with CSV**  
   - GCs can automatically populate project details with CSV exports from BIM software (e.g., Autodesk Revit).
   - **Papa Parse** is used to read CSV data in the React front end.

5. **Finalize Winner & Reveal**  
   - A GC can finalize the chosen Sub.
   - Only after finalizing does the system reveal the Sub’s identity.

---

## Smart Contract

Core logic resides in `ProjectManagement.sol`, which references a utility library `Utils.sol`.  

- **`Project` struct** – holds project info (schedule, location, cost, etc.).  
- **`Contractor` struct** – stores contractor details (ID, name, Ethereum address).  
- **`TrustFactorStruct`** – keeps track of the Sub’s performance ratings.  
- **Key functions**:
  - `addGeneralContractor(...)` and `addSubContractor(...)`
  - `addProject(...)`
  - `addSubcontractorData(...)`
  - `setTrustFactor(...)` and `calculateTrustFactor(...)`
  - `findMatchingSubcontractors(...)` and `getSortedMatchesWithGC(...)`
  - `finaliseWinner(...)` and `getWinner(...)`

---

## Prerequisites

1. **Node.js and npm**  
   - Preferably Node v14+ and npm v6+ (or Yarn).

2. **Ganache / Test Network**  
   - Local blockchain environment such as **Ganache** or any public Ethereum testnet (e.g., Sepolia, Goerli).

3. **MetaMask** (or another Web3 wallet)  
   - Required for running transactions in the browser.

4. **Remix IDE** (optional)  
   - Easiest for contract compilation and quick local tests, but you can also use Truffle or Hardhat.

---

## Deployment

1. **Compile and Deploy**  
   - Open `ProjectManagement.sol` in [Remix](https://remix.ethereum.org/) (or use Truffle/Hardhat).  
   - Ensure the correct Solidity version.  
   - Deploy to Ganache (local) or a desired testnet.

2. **Obtain Contract Address & ABI**  
   - Copy the deployed contract address.
   - Retrieve the ABI from Remix (or Truffle artifacts).

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
   - By default, runs on `http://localhost:3000`.

---

## Configuration

Typically, you have a config file (e.g., `contract.js`) in your React app:

```js
import web3 from "./web3";
import ABI from "./abi";

const contractAddress = "0xYourDeployedContractAddress"; // replace with the actual deployed address

const mainContract = new web3.eth.Contract(ABI, contractAddress);

export default mainContract;
```

1. Replace `"0xYourDeployedContractAddress"` with the actual deployed address.
2. Ensure the `ABI` is properly imported from your build artifacts or manually copied from Remix.

---

## Usage

1. **Register GC & Sub**  
   - As contract owner, call `addGeneralContractor(...)` or `addSubContractor(...)`.

2. **GC Adds Project**  
   - Fill in schedule, location, cost, etc.
   - (Optional) Use the CSV import to populate data from a BIM model’s quantity takeoff.

3. **Sub Adds Data**  
   - Sub logs in with their wallet and provides availability, location, work type, unit costs.

4. **Trust Factor**  
   - GC updates Sub’s performance rating via `setTrustFactor(...)`.
   - The system calculates a combined trust score.

5. **Match & Finalize**  
   - GC retrieves sorted Sub list via `findMatchingSubcontractors(...)` or `getSortedMatchesWithGC(...)`.
   - Finalizes with `finaliseWinner(...)`, then the system reveals the winning Sub.

---

## CSV File Support

- Uses [Papa Parse](https://www.papaparse.com/) in the React front end.
- Steps:
  1. Select CSV export (e.g., from Autodesk Revit).  
  2. Papa Parse reads rows into a table.  
  3. Click a row to auto-fill project fields.  
  4. Submit to create a new project on-chain.

---

## File Structure

A typical layout might be:

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
To contribute:
1. Fork the repo
2. Create a feature branch
3. Submit a PR describing your changes

---

## Future Directions

- **Additional Procurement Parameters**  
  Add features for insurance, certifications, and advanced contract terms.

- **Real-World Case Studies**  
  Validate in actual construction projects for performance, trust, and cost–benefit analysis.

- **Enhanced BIM Integration**  
  Go beyond basic quantity data to more detailed specs (e.g., thermal, density) or manufacturer data.

- **Scaling / Layer-2 Solutions**  
  Consider solutions like Polygon or Arbitrum to reduce gas fees and improve throughput.

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

## License

This project is open-source (MIT License). See [LICENSE](LICENSE.md) for details.

**Disclaimer**: BBAPS is a research-oriented proof of concept. Production usage requires thorough security audits, real-world testing, and compliance checks.
```
