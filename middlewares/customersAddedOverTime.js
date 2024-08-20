
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/new_customers', async (req, res) => {
    const interval = req.query.interval || 'monthly';

    let groupBy;
    switch (interval) {
        case 'monthly':
            groupBy = { year: { $year: "$created_at" }, month: { $month: "$created_at" } };
            break;
        case 'quarterly':
            groupBy = { year: { $year: "$created_at" }, quarter: { $ceil: { $divide: [{ $month: "$created_at" }, 3] } } };
            break;
        case 'yearly':
            groupBy = { year: { $year: "$created_at" } };
            break;
        default:
            groupBy = { year: { $year: "$created_at" }, month: { $month: "$created_at" }, day: { $dayOfMonth: "$created_at" } };
    }

    const result = await mongoose.connection.db.collection('shopifyCustomers').aggregate([
        {
            $addFields: {
                created_at: { $dateFromString: { dateString: "$created_at" } }
            }
        },
        {
            $group: {
                _id: groupBy,
                newCustomers: { $sum: 1 }
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
        }
    ]).toArray();

    res.json(result);
});

module.exports = router;
