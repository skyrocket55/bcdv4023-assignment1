import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, 
        ModalTitle, Form, Card, CardHeader, CardBody, CardFooter } from 'react-bootstrap';
import { faBug } from '@fortawesome/free-solid-svg-icons';
import Header from './Header';
import { contractAddress, contractABI } from '../config/contract.config';
import Web3 from 'web3';

function Dashboard() {
  // Use the state hook to manage component state
  const [showModal, setShowModal] = useState(false);
  const [account, setAccount] = useState('');
  const [listOfTasks, setTaskList] = useState([]);
  const [task, setTask] = useState({id: '', description: '', severity: ''});
  const [actionSelected, setAction] = useState('');
  const [selectedIndex, setSelectedIndex] = useState('');
  const [updatedStatus, setUpdatedStatus] = useState('');
  

  const handleModalClose = () => {
    setShowModal(false);
    setUpdatedStatus('');
  };  
  
  // used in Add and Update
  const handleModalShow = async (event, taskId) => {
    setShowModal(true);
    setAction(event.target.id);
    console.log('task id: ', task.id);
    // If action is updateButton, populate the fields with selected task values
    if(event.target.id === 'updateButton') {
      const selectedTask = listOfTasks.find(task => task.id === taskId);
      console.log('updateButton selectedTask: ', selectedTask);
      if(selectedTask) {
        setTask({
          id: selectedTask.id,
          description: selectedTask.description,
          severity: selectedTask.severity,
          status: selectedTask.status
        })
      }
      console.log('updateButton task: ', task);
    } else {
      // If adding a new task, clear the form fields and calculate the next ID
      const nextId = listOfTasks.length > 0 ? Math.max(...listOfTasks.map(task => task.id)) + 1 : 1;
      setTask({ id: nextId.toString(), description: '', severity: ''});
    }
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
            bug.status = !bug.status ? 'Open' : 'Resolved';
            taskList.push(bug);
          }
          console.log('taskList: ', taskList.length);
          setTaskList(taskList);
          console.log('loading listOfTasks: ', listOfTasks);
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

  // handle form change
  const handleChange = (event) => {
    const { name, value } = event.target;
    console.log('handleChange: ', name, value);
    setTask({
      ...task,
      [name]: value
    });

    console.log('handleChange updated taskList: ', listOfTasks);
  }

  // convert severity string to numerical values for uint contract param
  function getSeverityUintValue(severity) {
    let severityUint = null;
    if(severity==='Low') {
      severityUint = 0;
    } else if(severity==='Medium') {
      severityUint = 1;
    } else {
      severityUint = 2;
    }
    return severityUint;
  }

  // Add task
  async function handleAdd(event) {
    event.preventDefault();
    try {
      // to fix "out of gas" error, set a higher gas limit
      const gasEstimate = await contract.methods.addTask(task.id, task.description, getSeverityUintValue(task.severity)).estimateGas({ from: account });
      // Fix TypeError: Cannot mix BigInt by explicitly converting the gas estimate to a number 
      const gasLimit = Number(gasEstimate) * 2; // Set multiplier as needed

      await contract.methods
        .addTask(task.id, task.description, getSeverityUintValue(task.severity))
        .send({ from: account, gas: gasLimit }); // modifies the state of the contract 
      
      // Create a new task object with the same properties as the current task
      // Ensure new task is added correctly to the list without any reactivity issues
      const newTask = { ...task, status: 'Open', severity: task.severity}; // Set status to 'Open' for the new task

      // Refresh the list
      const updatedTaskList = [...listOfTasks, newTask];
      setTaskList(updatedTaskList);

      // reset the task form fields
      setTask({id: '', description: '', severity: ''});

      //close modal window
      handleModalClose();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  // Update task status
  async function handleUpdate(index, status) {
    try {
      // Convert status to a boolean value
      const selectedStatus = status === 'Resolved' ? true : false;
      setUpdatedStatus(selectedStatus);
      
      await contract.methods
        .updateBugStatus(index, selectedStatus)
        .send({ from: account }); // modifies the state of the contract 

      // Update the local state of the updated status using the functional form of setTaskList
      setTaskList(prevTaskList => {
        const updatedTaskList = [...prevTaskList]; // Create a new array
        updatedTaskList[index] = { ...updatedTaskList[index], status: selectedStatus ? 'Resolved' : 'Open' }; // Update the status of the specific task
        return updatedTaskList;
      });

      //close modal window
      handleModalClose();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  return (
    <div>
        <div className='card mt-3'>
          <div className='card-header'>
            <Header title="Bug Tracker" margin="ml-2" icon={faBug} size="xs"/>
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
                                <td width='20%'>{task.status}</td>
                                <td width='20%'>
                                  <Button variant='outline-success' id='updateButton' onClick={ (event) => {
                                      setSelectedIndex(index);
                                      handleModalShow(event, task.id);
                                    }}>
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
            <Button variant='outline-primary' id='addButton' onClick={handleModalShow}>
              Add Task
            </Button>

            {/* Modal */}
            <Modal show={showModal} onHide={handleModalClose}>
              <ModalHeader closeButton>
                <ModalTitle>Bug Tracker</ModalTitle>
              </ModalHeader>
              <ModalBody>
              <Form>
                <Form.Group>
                  <Form.Label>ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter ID"
                    name="id"
                    value={task.id}
                    onChange={handleChange}
                    readOnly
                  />

                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Description"
                    name="description"
                    value={task.description}
                    onChange={handleChange}
                    readOnly={ actionSelected==='updateButton' }
                  />

                  <Form.Label>Severity</Form.Label>
                  <Form.Control
                    as="select"
                    name="severity"
                    value={task.severity}
                    onChange={handleChange}
                    disabled={ actionSelected==='updateButton' }
                  >
                    <option value="">Select Severity</option> {/* Empty option for default */}
                    <option value={'Low'}>Low</option>
                    <option value={'Medium'}>Medium</option>
                    <option value={'High'}>High</option>
                  </Form.Control>  

                  <Form.Label>Status</Form.Label>
                  <Form.Control
                    as="select"
                    name="status"
                    value={task.status}
                    onChange={(event) => handleChange(event)}
                  >    
                    <option value={'Open'}>Open</option>
                    {actionSelected==='updateButton' ? (
                      <option value={'Resolved'}>Resolved</option>
                      ) : null
                    } 
                  </Form.Control>
                </Form.Group>
              </Form>
              </ModalBody>
              <ModalFooter>
                <Button variant='outline-secondary' onClick={handleModalClose}>
                  Close
                </Button>
                <Button variant='outline-primary' type='submit'onClick={ actionSelected==='updateButton' ? 
                                        () => handleUpdate(selectedIndex, task.status) : handleAdd }>
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