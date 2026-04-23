const express = require('express');
const Flight = require('../models/Flight');

const router = express.Router();

router.get('/cities', async (req, res, next) => {
  try {
    const cities = await Flight.aggregate([
      {
        $project: {
          items: [
            { name: '$from', code: '$fromCode' },
            { name: '$to', code: '$toCode' }
          ]
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            name: '$items.name',
            code: '$items.code'
          }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id.name',
          code: '$_id.code'
        }
      },
      { $sort: { name: 1 } }
    ]);

    return res.status(200).json({ cities });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { from, to, date } = req.query;
    const filter = {};

    if (from) {
      filter.from = { $regex: from, $options: 'i' };
    }

    if (to) {
      filter.to = { $regex: to, $options: 'i' };
    }

    if (date) {
      filter.date = date;
    }

    const flights = await Flight.find(filter).sort({ price: 1 });

    return res.status(200).json({ count: flights.length, flights });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
