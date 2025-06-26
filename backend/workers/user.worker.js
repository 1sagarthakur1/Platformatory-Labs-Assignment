const { Worker } = require('@temporalio/worker');
const axios = require('axios');

const BASE_URL = 'https://crudcrud.com/api/e1b96f16c25a4d638fe5d03b572264cf/users';

async function runWorker() {
  const worker = await Worker.create({
    workflowsPath: require.resolve('../workflows/user.workflow'),
    activities: {

      // CREATE
      saveToRemote: async (user) => {
        const res = await axios.post(BASE_URL, user);
        return res.data;
      },

      // UPDATE BY EMAIL
      updateUserByEmail: async (email, updatedUser) => {
        const res = await axios.get(BASE_URL);
        const users = res.data;

        const user = users.find(u => u.email === email);
        if (!user) throw new Error(`User with email ${email} not found`);

        await axios.put(`${BASE_URL}/${user._id}`, updatedUser);
        console.log(`Updated user ${email}`);
      },

      // DELETE BY EMAIL
      deleteUserByEmail: async (email) => {
        const res = await axios.get(BASE_URL);
        const users = res.data;

        const user = users.find(u => u.email === email);
        if (!user) throw new Error(`User with email ${email} not found`);

        await axios.delete(`${BASE_URL}/${user._id}`);
        console.log(` Deleted user ${email}`);
      },

      getAllUsers: async () => {
        const res = await axios.get(BASE_URL);
        return res.data;
      },

      // Activity: Get a user by email
      getUserByEmail: async (email) => {
        const res = await axios.get(BASE_URL);
        const user = res.data.find(u => u.email === email);
        if (!user) throw new Error(`User with email ${email} not found`);
        return user;
      },
    },
    taskQueue: 'user-task-queue',
  });

  await worker.run();
}

runWorker().catch(console.error);
