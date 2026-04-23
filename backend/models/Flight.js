const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  airline: { type: String, required: true },
  airlineCode: { type: String, required: true },
  from: { type: String, required: true },
  fromCode: { type: String, required: true },
  to: { type: String, required: true },
  toCode: { type: String, required: true },
  date: { type: String, required: true },
  departTime: { type: String, required: true },
  arriveTime: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: Number, required: true },
  seatsLeft: { type: Number, required: true, default: 50 }
});

module.exports = mongoose.model('Flight', flightSchema);
