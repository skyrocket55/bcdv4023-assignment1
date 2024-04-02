// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

contract TaskTracker {

    enum Severity {
        Low, // automatically assigned value of 0
        Medium, // automatically assigned value of 1
        High // automatically assigned value of 2
    }

    struct Task {
        string id;
        string description;
        Severity severity; 
        bool isDone;
    }

    mapping(address => Task[]) private  Users;

    // check uint8 values with Enum values
    function getSeverityString(uint8 _severity) internal pure returns (string memory) {
        if (_severity == uint8(Severity.Low)) {
            return "Low";
        } else if (_severity == uint8(Severity.Medium)) {
            return "Medium";
        } else if (_severity == uint8(Severity.High)) {
            return "High";
        } else {
            revert("Invalid severity");
        }
    }

    function addTask(string calldata _id, string calldata _description, Severity _severity) external {
        Users[msg.sender].push(Task({
            id: _id,
            description: _description, 
            severity: _severity,
            isDone: false
        }));
    }

    // return descriptive task with severity enum string values
    function getTask(uint256 _bugIndex) external view returns (string memory id, string memory description, string memory severity, bool status) {
        // add validation if index does not exists
        require(_bugIndex < Users[msg.sender].length, "Task does not exist");
        Task storage task = Users[msg.sender][_bugIndex];
        return (task.id, task.description, getSeverityString(uint8(task.severity)), task.isDone);
    }
    
    function updateBugStatus(uint256 _bugIndex, bool _status) external {
        Users[msg.sender][_bugIndex].isDone = _status;
    }

    function deleteTask(uint256 _bugIndex) external {
        // deleting from struct mapping is not hard delete, just reset values to default states
        // https://kiecodes.medium.com/hidden-pitfall-in-solidity-insecure-data-deletion-4d86e87b6f1c
        delete (Users[msg.sender][_bugIndex]);
    }

    function getTaskCount() external view returns (uint256) {
        return Users[msg.sender].length;
    }
}