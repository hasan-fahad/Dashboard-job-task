// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Correct paths to middleware
const totalsalesRouter = require('./middlewares/totalSales');
const salesGrowthRateRouter = require('./middlewares/salesGrowth');
const newCustomersRouter = require('./middlewares/customersAddedOverTime');
const repeatCustomersRouter = require('./middlewares/repeatCustomers');
const geoDistributionRouter = require('./middlewares/geographicalDistribution');
const lifetimeValueRouter = require('./middlewares/customersLifetimeValue');

const app = express();
app.use(cors());

mongoose.connect('mongodb+srv://db_user_read:LdmrVA5EDEv4z3Wr@cluster0.y9lpi.mongodb.net/RQ_Analytics?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.get('/', (req, res) => {
    res.send('Welcome to Dashboard API');
});

// Middleware to parse JSON
app.use(express.json());

// Use the routers
app.use('/', totalsalesRouter);
app.use('/', salesGrowthRateRouter);
app.use('/', newCustomersRouter);
app.use('/', repeatCustomersRouter);
app.use('/', geoDistributionRouter);
app.use('/', lifetimeValueRouter);

// Listen on port 5000
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
