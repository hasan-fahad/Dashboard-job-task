
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/total_sales', async (req, res) => {
    const interval = req.query.interval || 'daily';

    let groupBy;
    switch (interval) {
        case 'monthly':
            groupBy = { year: { $year: "$date" }, month: { $month: "$date" } };
            break;
        case 'quarterly':
            groupBy = { year: { $year: "$date" }, quarter: { $ceil: { $divide: [{ $month: "$date" }, 3] } } };
            break;
        case 'yearly':
            groupBy = { year: { $year: "$date" } };
            break;
        default:
            groupBy = { year: { $year: "$date" }, month: { $month: "$date" }, day: { $dayOfMonth: "$date" } };
    }

    const result = await mongoose.connection.db.collection('shopifyOrders').aggregate([
        {
            $addFields: {
                date: { $dateFromString: { dateString: "$created_at" } },
                total_price_num: { $toDouble: "$total_price" }
            }
        },
        {
            $group: {
                _id: groupBy,
                totalSales: { $sum: "$total_price_num" }
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
        }
    ]).toArray();

    res.json(result);
});

module.exports = router;
