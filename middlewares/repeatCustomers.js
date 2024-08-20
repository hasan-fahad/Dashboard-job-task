
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/repeat_customers', async (req, res) => {
    const interval = req.query.interval || 'monthly';

    let groupBy;
    let sortFields;

    switch (interval) {
        case 'monthly':
            groupBy = { year: { $year: "$date" }, month: { $month: "$date" } };
            sortFields = { year: 1, month: 1 };
            break;
        case 'yearly':
            groupBy = { year: { $year: "$date" } };
            sortFields = { year: 1 };
            break;
        default:
            groupBy = { year: { $year: "$date" }, month: { $month: "$date" }, day: { $dayOfMonth: "$date" } };
            sortFields = { year: 1, month: 1, day: 1 };
    }

    try {
        const result = await mongoose.connection.db.collection('shopifyOrders').aggregate([
            {
                $addFields: {
                    date: { $dateFromString: { dateString: "$created_at" } }
                }
            },
            {
                $match: {
                    date: { $ne: null }
                }
            },
            {
                $group: {
                    _id: { customerId: "$customer.id", period: groupBy },
                    totalPurchases: { $sum: 1 }
                }
            },
            {
                $match: {
                    totalPurchases: { $gt: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.period",
                    repeatCustomers: { $sum: 1 }
                }
            },
            {
                $sort: sortFields
            }
        ]).toArray();

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "An error occurred" });
    }
});

module.exports = router;
