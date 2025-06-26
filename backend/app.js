const express = require('express');
const app = express();
const PORT = 4000;
const cors = require('cors');
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

const userRoutes = require('./routes/user.routes');

// Route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/users', userRoutes);


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
