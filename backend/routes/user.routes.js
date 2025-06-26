const express = require('express');
const User = require('../models/user');
const router = express.Router();
const { Connection, Client } = require('@temporalio/client');

// POST /users/create
router.post('/create', async (req, res) => {
  const connection = await Connection.connect();
  const client = new Client({ connection });

  const user = req.body;
  const result = await client.workflow.start('createUserWorkflow', {
    args: [user],
    taskQueue: 'user-task-queue',
    workflowId: `create-${Date.now()}`
  });

  res.status(201).json({ message: 'User created via Temporal', workflowId: result.workflowId });
});


// PUT /users/update-by-email
router.put('/update-by-email', async (req, res) => {
  const { email, updatedUser } = req.body;
  if (!email || !updatedUser) return res.status(400).json({ message: 'Email and updated data required' });

  const connection = await Connection.connect();
  const client = new Client({ connection });

  await client.workflow.start('updateUserByEmailWorkflow', {
    args: [email, updatedUser],
    taskQueue: 'user-task-queue',
    workflowId: `update-${Date.now()}`
  });

  res.json({ message: `Update initiated for ${email}` });
});

// DELETE /users/delete-by-email
router.delete('/delete-by-email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  const connection = await Connection.connect();
  const client = new Client({ connection });

  await client.workflow.start('deleteUserByEmailWorkflow', {
    args: [email],
    taskQueue: 'user-task-queue',
    workflowId: `delete-${Date.now()}`
  });

  res.json({ message: `Delete initiated for ${email}` });
});


// GET /user/all 
router.get('/all', async (req, res) => {
  try {
    const connection = await Connection.connect();
    const client = new Client({ connection });

    const result = await client.workflow.execute('getAllUsersWorkflow', {
      taskQueue: 'user-task-queue',
      workflowId: `get-all-${Date.now()}`
    });

    res.status(200).json({ users: result });
  } catch (error) {
    console.error('Fetch All Error:', error);
    res.status(500).json({ message: 'Failed to get users via workflow' });
  }
});

//GET /user/email
router.get('/email/:email', async (req, res) => {
  try {
    const connection = await Connection.connect();
    const client = new Client({ connection });

    const result = await client.workflow.execute('getUserByEmailWorkflow', {
      args: [req.params.email],
      taskQueue: 'user-task-queue',
      workflowId: `get-email-${Date.now()}`
    });

    res.status(200).json({ user: result });
  } catch (error) {
    console.error('Fetch Email Error:', error);
    res.status(500).json({ message: 'Failed to get user by email via workflow' });
  }
});

module.exports = router;
