// middlewares/geographicalDistribution.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/geo_distribution', async (req, res) => {
    try {
        const result = await mongoose.connection.db.collection('shopifyCustomers').aggregate([
            {
                $group: {
                    _id: "$default_address.city",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]).toArray();

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred" });
    }
});

module.exports = router;
