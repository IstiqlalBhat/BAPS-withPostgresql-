// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Utils.sol";

contract ProjectManagement {
    using Utils for *;

    address public owner;
    uint256 public projectCount;
    uint256 public genConCount;
    uint256 public subConCount;

    struct Project {
        uint256 id;
        string workScheduleFrom;
        string workScheduleTo;
        string location;
        string workType;
        uint256 materialUnitCost;
        uint256 laborUnitCost;
        uint256 totalQuantity;
        uint256 totalConstructionCost;
    }

    struct Contractor {
        uint256 id;
        string name;
        address account;
    }

    struct SubcontractorData {
        string availableFrom;
        string availableTo;
        string location;
        string workTypeSub;
        uint256 materialsCostPerSqm;
        uint256 laborCostPerSqm;
    }

    struct TrustFactorStruct {
        uint8 conformityToCost;
        uint8 conformityToTime;
        uint8 conformityToQuality;
    }

    struct Winner {
        string generalContractor;
        string subcontractorName;
        uint256 materialsCostPerSqm;
        uint256 laborCostPerSqm;
    }

    mapping(address => TrustFactorStruct) public trustFactors;
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Contractor) public generalContractors;
    mapping(uint256 => Contractor) public subContractors;
    mapping(address => SubcontractorData) public subcontractorData;
    mapping(address => uint256) public totalConstructionCosts;
    mapping(uint256 => Winner) public winners;
    mapping(uint256 => bool) public projectFinalized;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyGeneralContractor() {
        require(generalContractors[findContractor(msg.sender, true)].account == msg.sender, "Not GC");
        _;
    }

    modifier onlySubcontractor() {
        require(subContractors[findContractor(msg.sender, false)].account == msg.sender, "Not Sub");
        _;
    }

    event ProjectAdded(uint256 projectId, string name);
    event GeneralContractorAdded(uint256 contractorId, string name);
    event SubContractorAdded(uint256 contractorId, string name);
    event SubcontractorDataAdded(address subcontractorAddress);
    event TrustFactorUpdated(address subcontractorAddress);
    event WinnerFinalised(uint256 projectId, string generalContractor, string subcontractorName, uint256 materialsCostPerSqm, uint256 laborCostPerSqm);
    event TotalConstructionCostCalculated(address subcontractorAddress, uint256 totalCost);

    constructor() {
        owner = msg.sender;
    }

    function addProject(
        string memory _workScheduleFrom,
        string memory _workScheduleTo,
        string memory _location,
        string memory _workType,
        uint256 _materialUnitCost,
        uint256 _laborUnitCost,
        uint256 _totalQuantity,
        uint256 _totalConstructionCost
    ) public onlyGeneralContractor {
        projectCount++;
        projects[projectCount] = Project(
            projectCount,
            _workScheduleFrom,
            _workScheduleTo,
            _location,
            _workType,
            _materialUnitCost,
            _laborUnitCost,
            _totalQuantity,
            _totalConstructionCost
        );
        emit ProjectAdded(projectCount, _workType);
    }

    function addGeneralContractor(string memory _name, address _account) public onlyOwner {
        require(findContractor(_account, true) == 0, "GC exists");
        genConCount++;
        generalContractors[genConCount] = Contractor(genConCount, _name, _account);
        emit GeneralContractorAdded(genConCount, _name);
    }

    function addSubContractor(string memory _name, address _account) public onlyOwner {
        require(findContractor(_account, false) == 0, "Sub exists");
        subConCount++;
        subContractors[subConCount] = Contractor(subConCount, _name, _account);
        emit SubContractorAdded(subConCount, _name);
    }

    function addSubcontractorData(
        string memory _availableFrom,
        string memory _availableTo,
        string memory _location,
        string memory _workTypeSub,
        uint256 _materialsCostPerSqm,
        uint256 _laborCostPerSqm
    ) public onlySubcontractor {
        address _subcontractorAddress = msg.sender;
        subcontractorData[_subcontractorAddress] = SubcontractorData(
            _availableFrom,
            _availableTo,
            _location,
            _workTypeSub,
            _materialsCostPerSqm,
            _laborCostPerSqm
        );
        emit SubcontractorDataAdded(_subcontractorAddress);
        for (uint256 i = 1; i <= projectCount; i++) {
            calculateTotalConstructionCost(i, _subcontractorAddress);
        }
    }

    function setTrustFactor(
        address _subcontractorAddress,
        uint8 _conformityToCost,
        uint8 _conformityToTime,
        uint8 _conformityToQuality
    ) public onlyGeneralContractor {
        require(_subcontractorAddress != address(0), "Invalid address");

        TrustFactorStruct storage tf = trustFactors[_subcontractorAddress];

        uint8 totalEntries = 1;

        if (tf.conformityToCost != 0 || tf.conformityToTime != 0 || tf.conformityToQuality != 0) {
            totalEntries++;
        }

        tf.conformityToCost = (tf.conformityToCost + _conformityToCost) / totalEntries;
        tf.conformityToTime = (tf.conformityToTime + _conformityToTime) / totalEntries;
        tf.conformityToQuality = (tf.conformityToQuality + _conformityToQuality) / totalEntries;

        require(tf.conformityToCost + tf.conformityToTime + tf.conformityToQuality <= 30, "TF > 30");

        emit TrustFactorUpdated(_subcontractorAddress);
    }

    function calculateTrustFactor(address subcontractorAddress) public view returns (uint) {
        TrustFactorStruct storage tf = trustFactors[subcontractorAddress];
        return tf.conformityToCost + tf.conformityToTime + tf.conformityToQuality;
    }

    function fetchProjectData(uint256 _projectId) public view returns (Project memory) {
        require(_projectId <= projectCount, "Invalid ID");
        return projects[_projectId];
    }

    function getSubcontractorData(address _subcontractorAddress) public view returns (SubcontractorData memory) {
        require(subcontractorData[_subcontractorAddress].materialsCostPerSqm > 0, "Data not found");
        return subcontractorData[_subcontractorAddress];
    }

    function findMatchingSubcontractors(uint256 _projectId) public view returns (uint256[] memory) {
        require(_projectId <= projectCount, "Invalid ID");
        Project memory project = projects[_projectId];
        uint256[] memory tempMatchingSubs = new uint256[](subConCount);
        uint count = 0;

        for (uint256 i = 1; i <= subConCount; i++) {
            address subcontractorAddress = subContractors[i].account;
            SubcontractorData memory subData = subcontractorData[subcontractorAddress];

            if (keccak256(abi.encodePacked(subData.location)) == keccak256(abi.encodePacked(project.location)) &&
                Utils.checkScheduleOverlap(project.workScheduleFrom, project.workScheduleTo, subData.availableFrom, subData.availableTo)) {
                tempMatchingSubs[count++] = i;
            }
        }

        uint256[] memory matchingSubs = new uint256[](count);
        for (uint i = 0; i < count; i++) {
            matchingSubs[i] = tempMatchingSubs[i];
        }

        return sortSubcontractorsByTrustFactor(matchingSubs, count);
    }

    function sortSubcontractorsByTrustFactor(uint256[] memory subcontractorIds, uint count) internal view returns (uint256[] memory) {
        if (count > 1) {
            quickSortByTrustFactor(subcontractorIds, int(0), int(count - 1));
        }
        return subcontractorIds;
    }

    function quickSortByTrustFactor(uint256[] memory arr, int left, int right) internal view {
        int i = left;
        int j = right;
        if (i == j) return;
        uint pivot = calculateTrustFactor(subContractors[arr[uint(left + (right - left) / 2)]].account);
        while (i <= j) {
            while (calculateTrustFactor(subContractors[arr[uint(i)]].account) > pivot) i++;
            while (pivot > calculateTrustFactor(subContractors[arr[uint(j)]].account)) j--;
            if (i <= j) {
                (arr[uint(i)], arr[uint(j)]) = (arr[uint(j)], arr[uint(i)]);
                i++;
                j--;
            }
        }
        if (left < j)
            quickSortByTrustFactor(arr, left, j);
        if (i < right)
            quickSortByTrustFactor(arr, i, right);
    }

    function getSortedMatchesWithGC(uint256 _projectId) public view returns (uint256[] memory, string[] memory, uint256[] memory, uint256[] memory) {
        uint256[] memory matchingSubcontractors = findMatchingSubcontractors(_projectId);
        uint256[] memory sortedSubcontractors = sortSubcontractorsByTrustFactor(matchingSubcontractors, matchingSubcontractors.length);

        uint256 matchCount = sortedSubcontractors.length * genConCount;
        uint256[] memory matchIndices = new uint256[](matchCount);
        string[] memory gcNames = new string[](matchCount);
        uint256[] memory totalConstructionCostsArray = new uint256[](matchCount);
        uint256[] memory trustScores = new uint256[](matchCount);

        uint256 index = 0;
        for (uint256 gcIndex = 1; gcIndex <= genConCount; gcIndex++) {
            for (uint256 i = 0; i < sortedSubcontractors.length; i++) {
                uint256 subId = sortedSubcontractors[i];
                address subAddress = subContractors[subId].account;
                uint256 trustScore = calculateTrustFactor(subAddress);
                uint256 totalCost = totalConstructionCosts[subAddress];

                matchIndices[index] = index; // Ensure to use the correct subcontractor ID
                gcNames[index] = generalContractors[gcIndex].name;
                totalConstructionCostsArray[index] = totalCost;
                trustScores[index] = trustScore;
                index++;
            }
        }

        return (matchIndices, gcNames, totalConstructionCostsArray, trustScores);
    }

    function finaliseWinner(uint256 _projectId, uint256 _matchIndex) public onlyGeneralContractor {
        require(!projectFinalized[_projectId], "Already finalized");
        (uint256[] memory matchIndices, string[] memory gcNames, , ) = getSortedMatchesWithGC(_projectId); // Omit unused arrays

        require(_matchIndex < matchIndices.length, "Invalid index");

        string memory winningGC = gcNames[_matchIndex];
        uint256 winningSubId = matchIndices[_matchIndex];
        address winningSubAddress = subContractors[winningSubId].account;
        SubcontractorData memory winningSubData = subcontractorData[winningSubAddress];
        string memory winningSubName = subContractors[winningSubId].name;

        winners[_projectId] = Winner(
            winningGC,
            winningSubName,
            winningSubData.materialsCostPerSqm,
            winningSubData.laborCostPerSqm
        );

        emit WinnerFinalised(_projectId, winningGC, winningSubName, winningSubData.materialsCostPerSqm, winningSubData.laborCostPerSqm);
        projectFinalized[_projectId] = true;
    }

    function getWinner(uint256 _projectId) public view returns (Winner memory, SubcontractorData memory) {
        require(_projectId <= projectCount, "Invalid ID");
        Winner memory winner = winners[_projectId];
        require(bytes(winner.subcontractorName).length != 0, "No winner"); // Check for empty string

        address winningSubAddress = subContractors[findContractorByName(winner.subcontractorName)].account;
        SubcontractorData memory winningSubData = subcontractorData[winningSubAddress];

        return (winner, winningSubData);
    }

    function calculateTotalConstructionCost(uint256 _projectId, address _subcontractorAddress) internal {
        require(_projectId <= projectCount, "Invalid ID");
        require(_subcontractorAddress != address(0), "Invalid address");

        Project memory project = projects[_projectId];
        SubcontractorData memory subData = subcontractorData[_subcontractorAddress];

        uint256 totalCost = (subData.materialsCostPerSqm + subData.laborCostPerSqm) * project.totalQuantity;
        totalConstructionCosts[_subcontractorAddress] = totalCost;

        emit TotalConstructionCostCalculated(_subcontractorAddress, totalCost);
    }

    function findContractor(address account, bool isGeneral) internal view returns (uint256) {
        if (isGeneral) {
            for (uint256 i = 1; i <= genConCount; i++) {
                if (generalContractors[i].account == account) {
                    return i;
                }
            }
        } else {
            for (uint256 i = 1; i <= subConCount; i++) {
                if (subContractors[i].account == account) {
                    return i;
                }
            }
        }
        return 0;
    }

    function findContractorByName(string memory name) internal view returns (uint256) {
        for (uint256 i = 1; i <= subConCount; i++) {
            if (keccak256(abi.encodePacked(subContractors[i].name)) == keccak256(abi.encodePacked(name))) {
                return i;
            }
        }
        return 0;
    }
}
