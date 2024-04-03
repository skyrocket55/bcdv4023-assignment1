Assignment #1: Bug Tracker

Submitted by: Ciel Recuerdo [101439257]
Submitted On: April 3, 2024 12:55

### Project Setup
1. npm install
2. Update the contractAddress and contractABI at /config/contract.config.js. BugTracker.sol added under contracts folder.
3. npm start    http://localhost:3000

### Sample UI Flows
https://www.loom.com/share/a59c6ffb9b7641878ab713b6923f4700

### Libraries Installed
- web3, react-bootstrap, bootstrap 5, react-router-dom, react-fontawesome, fontawesome free-solid-svg-icons, fontawesome free-brands-svg-icon

### Features
1. Contract updated with the following:
    1.1. Bug ID - string
    1.2. Bug Description - string
    1.3. Bug Severity (Low, Medium, High) - enum
    1.4. Open/Resolved - boolean
2. Add, Update Delete, List View of Tasks/Bugs 
3. Mobile Responsive UI
4. Validations