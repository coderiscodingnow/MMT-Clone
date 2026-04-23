const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
  passengerName: { type: String, required: true, trim: true },
  passengerAge: { type: Number, required: true, min: 1, max: 120 },
  seat: { type: String, default: 'Unassigned' },
  food: { type: String, default: 'None' },
  travelClass: { type: String, default: 'Economy' },
  specialFare: { type: String, default: 'Regular' },
  pnr: { type: String, required: true, unique: true },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
