const { proxyActivities } = require('@temporalio/workflow');

const {getAllUsers, getUserByEmail, saveToRemote, updateUserByEmail, deleteUserByEmail } = proxyActivities({
  startToCloseTimeout: '15 seconds',
});

async function createUserWorkflow(user) {
  return await saveToRemote(user);
}

async function updateUserByEmailWorkflow(email, updatedUser) {
  await updateUserByEmail(email, updatedUser);
  return 'User updated';
}

async function deleteUserByEmailWorkflow(email) {
  await deleteUserByEmail(email);
  return 'User deleted';
}

async function getAllUsersWorkflow() {
  return await getAllUsers();
}

async function getUserByEmailWorkflow(email) {
  return await getUserByEmail(email);
}

module.exports = {
  createUserWorkflow,
  updateUserByEmailWorkflow,
  deleteUserByEmailWorkflow,
  getAllUsersWorkflow,
  getUserByEmailWorkflow
};
