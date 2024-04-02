import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle } from 'react-bootstrap';
import { faReceipt, faCube } from '@fortawesome/free-solid-svg-icons';
import Header from './Header';
import { contractAddress, contractABI } from '../config/contract.config';
import Web3 from 'web3';

function Dashboard() {
  // Use the state hook to manage component state
  const [showModal, setShowModal] = useState(false);
  const [account, setAccount] = useState(null);
  const [listOfTasks, setTaskList] = useState([]);
  const handleModalClose = () => setShowModal(false);
  const handleModalShow = async () => {
    // await createBugList();
    setShowModal(true);
  }

  // Connect to Ganache
  const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
  // Contract deployed to Remix
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  // show the bug list on page reload and when add/update events are triggered
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Retrieve the first account [0] from Ganache and set it as the default account.
        const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
        const accounts = await web3.eth.getAccounts();
        const defaultAccount = accounts[0];

        console.log('🔍 Ganache account ' + defaultAccount + ' detected.');
        setAccount(defaultAccount);

        // Fetch all of the bugs and create the list to display
        const bugNum = await contract.methods.getTaskCount().call({ from: defaultAccount });
        console.log('bugNum: ', bugNum, bugNum > 0);
        if (bugNum > 0) {
          const taskList = [];
          for (let i = 0; i < bugNum; i++) {
            const bug = await contract.methods.getTask(i).call({ from: defaultAccount });
            console.log('Bug:', bug.id, bug.description, bug.severity, bug.status);
            taskList.push(bug);
          }
          console.log('taskList: ', taskList.length);
          setTaskList(taskList);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []); // dependency array to re-run effect when it changes

  // delete task
  async function handleDelete(index) {
    try {
      await contract.methods
        .deleteTask(index)
        .send({ from: account }); // modifies the state of the contract 
      
        // Refresh the list
        const updatedTaskList = listOfTasks.filter((task, i) => i !== index);
        setTaskList(updatedTaskList);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  return (
    <div>
        <div className='card mt-3'>
          <div className='card-header'>
            <Header title="Bug Tracker" margin="ml-2" icon={faReceipt} size="xs"/>
          </div>
          <div className='card-body text-center justify-content-center'>
            <div className='row alert alert-info'>
              <div className='table-responsive'>
                <table className='table table-hover'>
                  <thead>
                    <tr>
                      <th scope='col'>Bug ID</th>
                      <th scope='col'>Description</th>
                      <th scope='col'>Severity</th>
                      <th scope='col'>Status</th>
                      <th scope='col'>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    { listOfTasks.length > 0 ? (
                      listOfTasks.map((task, index) => {
                        return (
                          <tr key={index}>
                            {task.id !== '' && (
                              <>
                                <td width='20%'>{task.id}</td>
                                <td width='20%'>{task.description}</td>
                                <td width='20%'>{task.severity}</td>
                                <td width='20%'>{!task.status ? 'Open' : 'Resolved'}</td>
                                <td width='20%'>
                                  <Button variant='outline-success' onClick={handleModalClose}>
                                    Update
                                  </Button>
                                  <Button variant='outline-danger' onClick={() => handleDelete(index)}>
                                    Delete
                                  </Button>
                                </td> 
                              </>
                            )}
                          </tr>
                        )
                      })  
                    ): (
                      <tr>
                        <td colSpan="6">No tasks available</td>
                      </tr>
                    )}
                    
                  </tbody>
                </table>
              </div>
            </div>  
            {/* Button trigger modal */}
            <Button variant='outline-primary' onClick={handleModalShow}>
              Add Task
            </Button>

            {/* Modal */}
            <Modal show={showModal} onHide={handleModalClose}>
              <ModalHeader closeButton>
                <ModalTitle>Bug Tracker</ModalTitle>
              </ModalHeader>
              <ModalBody>
                
              </ModalBody>
              <ModalFooter>
                <Button variant='outline-secondary' onClick={handleModalClose}>
                  Close
                </Button>
                <Button variant='outline-primary' onClick={handleModalClose}>
                  Save
                </Button>
              </ModalFooter>
            </Modal>
          </div>
      </div>
    </div>
  )
}

export default Dashboard;