const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./middleware/logger')
const app = express();
const port = process.env.PORT || 3000;
const db = require('./utils/mongoose')
const cors = require('cors');

db();
require('dotenv').config()
app.use(cors());
app.use(bodyParser.json());
app.use(logger);
// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware
const middleware = require('./middleware/admin');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', middleware, userRoutes);

// Hello World Route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
