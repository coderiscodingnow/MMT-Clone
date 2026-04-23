const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Flight = require('./models/Flight');

dotenv.config();

const seedFlights = [
  {
    airline: 'IndiGo',
    airlineCode: '6E',
    from: 'Delhi',
    fromCode: 'DEL',
    to: 'Mumbai',
    toCode: 'BOM',
    date: '2025-05-10',
    departTime: '06:00',
    arriveTime: '08:10',
    duration: '2h 10m',
    price: 3499,
    seatsLeft: 42
  },
  {
    airline: 'Air India',
    airlineCode: 'AI',
    from: 'Delhi',
    fromCode: 'DEL',
    to: 'Mumbai',
    toCode: 'BOM',
    date: '2025-05-10',
    departTime: '09:30',
    arriveTime: '11:45',
    duration: '2h 15m',
    price: 5200,
    seatsLeft: 18
  },
  {
    airline: 'SpiceJet',
    airlineCode: 'SG',
    from: 'Delhi',
    fromCode: 'DEL',
    to: 'Mumbai',
    toCode: 'BOM',
    date: '2025-05-10',
    departTime: '14:00',
    arriveTime: '16:20',
    duration: '2h 20m',
    price: 2899,
    seatsLeft: 5
  },
  {
    airline: 'Vistara',
    airlineCode: 'UK',
    from: 'Delhi',
    fromCode: 'DEL',
    to: 'Chennai',
    toCode: 'MAA',
    date: '2025-05-11',
    departTime: '07:15',
    arriveTime: '10:00',
    duration: '2h 45m',
    price: 4800,
    seatsLeft: 30
  },
  {
    airline: 'IndiGo',
    airlineCode: '6E',
    from: 'Mumbai',
    fromCode: 'BOM',
    to: 'Delhi',
    toCode: 'DEL',
    date: '2025-05-11',
    departTime: '11:00',
    arriveTime: '13:05',
    duration: '2h 05m',
    price: 3100,
    seatsLeft: 55
  },
  {
    airline: 'Air India',
    airlineCode: 'AI',
    from: 'Mumbai',
    fromCode: 'BOM',
    to: 'Bengaluru',
    toCode: 'BLR',
    date: '2025-05-11',
    departTime: '08:45',
    arriveTime: '10:15',
    duration: '1h 30m',
    price: 3750,
    seatsLeft: 22
  },
  {
    airline: 'GoFirst',
    airlineCode: 'G8',
    from: 'Chennai',
    fromCode: 'MAA',
    to: 'Delhi',
    toCode: 'DEL',
    date: '2025-05-12',
    departTime: '05:30',
    arriveTime: '08:20',
    duration: '2h 50m',
    price: 2500,
    seatsLeft: 14
  },
  {
    airline: 'SpiceJet',
    airlineCode: 'SG',
    from: 'Bengaluru',
    fromCode: 'BLR',
    to: 'Hyderabad',
    toCode: 'HYD',
    date: '2025-05-12',
    departTime: '16:30',
    arriveTime: '17:40',
    duration: '1h 10m',
    price: 1899,
    seatsLeft: 60
  },
  {
    airline: 'IndiGo',
    airlineCode: '6E',
    from: 'Hyderabad',
    fromCode: 'HYD',
    to: 'Mumbai',
    toCode: 'BOM',
    date: '2025-05-12',
    departTime: '20:00',
    arriveTime: '21:35',
    duration: '1h 35m',
    price: 2200,
    seatsLeft: 38
  },
  {
    airline: 'Vistara',
    airlineCode: 'UK',
    from: 'Delhi',
    fromCode: 'DEL',
    to: 'Bengaluru',
    toCode: 'BLR',
    date: '2025-05-13',
    departTime: '06:45',
    arriveTime: '09:20',
    duration: '2h 35m',
    price: 5900,
    seatsLeft: 10
  },
  {
    airline: 'Air India',
    airlineCode: 'AI',
    from: 'Chennai',
    fromCode: 'MAA',
    to: 'Mumbai',
    toCode: 'BOM',
    date: '2025-05-13',
    departTime: '12:00',
    arriveTime: '14:00',
    duration: '2h 00m',
    price: 4100,
    seatsLeft: 25
  },
  {
    airline: 'GoFirst',
    airlineCode: 'G8',
    from: 'Delhi',
    fromCode: 'DEL',
    to: 'Hyderabad',
    toCode: 'HYD',
    date: '2025-05-14',
    departTime: '09:00',
    arriveTime: '11:20',
    duration: '2h 20m',
    price: 2750,
    seatsLeft: 45
  }
];

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    if (process.argv.includes('--force')) {
      await Flight.deleteMany({});
    }

    await Flight.insertMany(seedFlights);
    console.log('Seeded 12 flights');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

runSeed();
