const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/lifetime_value', async (req, res) => {
    try {
        const result = await mongoose.connection.db.collection('shopifyOrders').aggregate([
            {
                $group: {
                    _id: "$customer.id",
                    totalSpent: { $sum: { $toDouble: "$total_price" } },
                    firstPurchaseDate: { $min: "$created_at" },
                    lastPurchaseDate: { $max: "$created_at" }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalSpent: 1,
                    firstPurchaseMonth: { $month: { $dateFromString: { dateString: "$firstPurchaseDate" } } },
                    firstPurchaseYear: { $year: { $dateFromString: { dateString: "$firstPurchaseDate" } } },
                    lifetimeValue: { $subtract: [new Date(), { $dateFromString: { dateString: "$firstPurchaseDate" } }] }
                }
            },
            {
                $group: {
                    _id: { month: "$firstPurchaseMonth", year: "$firstPurchaseYear" },
                    cohortLifetimeValue: { $avg: "$totalSpent" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]).toArray();

        // Transform the result to match frontend expectations
        const response = result.map(entry => ({
            month: entry._id.month,
            year: entry._id.year,
            cohortLifetimeValue: entry.cohortLifetimeValue
        }));

        res.json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred" });
    }
});

module.exports = router;
