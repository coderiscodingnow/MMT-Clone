const express = require('express');
const axios = require('axios');
const Flight = require('../models/Flight');
const { generateSimulatedPrice } = require('../utils/pricing');

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

    let fromCode, toCode;

    if (from) {
      filter.from = { $regex: from, $options: 'i' };
      const city = await Flight.findOne(filter.from ? { from: filter.from } : {});
      if (city) fromCode = city.fromCode;
    }

    if (to) {
      filter.to = { $regex: to, $options: 'i' };
      const city = await Flight.findOne(filter.to ? { to: filter.to } : {});
      if (city) toCode = city.toCode;
    }

    if (date) {
      filter.date = date;
    }

    // Fallback: Get flights from Database
    const dbFlights = await Flight.find(filter).lean();
    
    // Attempt to get real-time external flights
    let externalFlights = [];
    const API_KEY = process.env.AVIATIONSTACK_API_KEY;

    if (API_KEY && fromCode && toCode) {
      try {
        const response = await axios.get(`http://api.aviationstack.com/v1/flights`, {
          params: {
            access_key: API_KEY,
            dep_iata: fromCode,
            arr_iata: toCode
          }
        });
        
        if (response.data && response.data.data) {
          externalFlights = response.data.data.map(f => {
            const simulatedPrice = generateSimulatedPrice(fromCode, toCode);
            let departTime = '00:00';
            let arriveTime = '00:00';
            
            if (f.departure && f.departure.scheduled) {
              const dDate = new Date(f.departure.scheduled);
              departTime = dDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit' });
            }
            if (f.arrival && f.arrival.scheduled) {
              const aDate = new Date(f.arrival.scheduled);
              arriveTime = aDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit' });
            }

            return {
              airline: (f.airline && f.airline.name) ? f.airline.name : 'Live Airline',
              airlineCode: (f.airline && f.airline.iata) ? f.airline.iata : 'LIVE',
              from: from,
              fromCode: fromCode,
              to: to,
              toCode: toCode,
              date: date || new Date().toISOString().split('T')[0],
              departTime,
              arriveTime,
              duration: '2h 15m', // Simulated duration
              price: simulatedPrice,
              seatsLeft: Math.floor(Math.random() * 60) + 1,
              isLive: true
            };
          });
        }
      } catch (err) {
        console.error("Aviationstack API Error:", err.message);
      }
    }

    // Combine DB flights and external flights, then sort by price
    const combinedFlights = [...dbFlights, ...externalFlights].sort((a, b) => a.price - b.price);

    return res.status(200).json({ count: combinedFlights.length, flights: combinedFlights });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
