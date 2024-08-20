
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/sales_growth_rate', async (req, res) => {
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

    const salesData = await mongoose.connection.db.collection('shopifyOrders').aggregate([
        {
            $addFields: {
                date: { $dateFromString: { dateString: "$created_at" } },
                totalSales: { $toDouble: "$total_price" }
            }
        },
        {
            $group: {
                _id: groupBy,
                totalSales: { $sum: "$totalSales" }
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
        }
    ]).toArray();

    const result = salesData.map((current, index, array) => {
        if (index === 0) {
            return { ...current, growthRate: null };
        }
        const previous = array[index - 1];
        const growthRate = previous.totalSales
            ? ((current.totalSales - previous.totalSales) / previous.totalSales) * 100
            : 0;
        return { ...current, growthRate };
    });

    res.json(result);
});

module.exports = router;
