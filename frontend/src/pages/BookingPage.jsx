import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import './BookingPage.css';

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const flight = location.state?.flight;

  const [passengerName, setPassengerName] = useState('');
  const [passengerAge, setPassengerAge] = useState('');
  const [seat, setSeat] = useState('');
  const [food, setFood] = useState('');
  const [travelClass, setTravelClass] = useState('');
  const [specialFare, setSpecialFare] = useState('Regular');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    if (!flight) {
      navigate('/home', { replace: true });
    }
  }, [flight, navigate]);

  if (!flight) {
    return null;
  }

  let multiplier = 1;
  if (travelClass === 'Business Class') multiplier = 2.5;
  if (travelClass === 'First Class') multiplier = 4.0;

  let discount = 1;
  if (specialFare === 'Student') discount = 0.85;
  if (specialFare === 'Armed Forces') discount = 0.80;
  if (specialFare === 'Senior Citizen') discount = 0.90;

  const currentPrice = Math.round(flight.price * multiplier * discount);
  const allFieldsFilled = passengerName.trim() && passengerAge && seat && food && travelClass && specialFare;

  const handleBooking = async () => {
    if (!allFieldsFilled) {
      setError('Please fill in all details and make your selections.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        passengerName: passengerName.trim(),
        passengerAge: Number(passengerAge),
        seat,
        food,
        travelClass,
        specialFare
      };

      if (flight._id) {
        payload.flightId = flight._id;
      } else {
        payload.flightData = flight;
      }

      const response = await axiosInstance.post('/bookings', payload);
      setBookingResult(response.data.booking);
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        navigate('/login');
      } else {
        setError(requestError.response?.data?.message || 'Booking failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderSeatMap = () => {
    const rows = 10;
    const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    let seats = [];
    for (let r = 1; r <= rows; r++) {
      let rowSeats = [];
      for (let c of cols) {
        const seatId = `${r}${c}`;
        const isSelected = seat === seatId;
        const isOccupied = (r * c.charCodeAt(0)) % 7 === 0;
        
        rowSeats.push(
          <div 
            key={seatId} 
            className={`seat ${isSelected ? 'selected' : ''} ${isOccupied ? 'occupied' : ''}`}
            onClick={() => !isOccupied && setSeat(seatId)}
          >
            {seatId}
          </div>
        );
      }
      seats.push(
        <div key={`row-${r}`} className="seat-row">
          <div className="seat-group">{rowSeats.slice(0, 3)}</div>
          <div className="aisle">{r}</div>
          <div className="seat-group">{rowSeats.slice(3, 6)}</div>
        </div>
      );
    }
    
    return (
      <div className="seat-map-container">
        <label className="section-label">Select Your Seat</label>
        <div className="seat-map-legend">
          <div className="legend-item"><div className="seat available"></div> Available</div>
          <div className="legend-item"><div className="seat selected"></div> Selected</div>
          <div className="legend-item"><div className="seat occupied"></div> Occupied</div>
        </div>
        <div className="seat-map">
          {seats}
        </div>
      </div>
    );
  };

  return (
    <div className="booking-page">
      <div className="booking-container">
        {bookingResult ? (
          <div className="confirmation-card">
            <div className="confirm-icon">✓</div>
            <h2>Booking Confirmed!</h2>
            <div className="pnr-badge">PNR: {bookingResult.pnr}</div>

            <div className="confirm-details">
              <div className="detail-row">
                <span>Flight</span>
                <span>{flight.airline} · {flight.fromCode} → {flight.toCode}</span>
              </div>
              <div className="detail-row">
                <span>Date & Time</span>
                <span>{flight.date} · {flight.departTime} → {flight.arriveTime}</span>
              </div>
              <div className="detail-row">
                <span>Passenger</span>
                <span>{bookingResult.passengerName} (Age {bookingResult.passengerAge})</span>
              </div>
              <div className="detail-row">
                <span>Class & Fare</span>
                <span>{bookingResult.travelClass} ({bookingResult.specialFare})</span>
              </div>
              <div className="detail-row">
                <span>Seat & Meal</span>
                <span>Seat {bookingResult.seat} · {bookingResult.food}</span>
              </div>
              <div className="detail-row">
                <span>Amount Paid</span>
                <span className="price">₹{bookingResult.totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button type="button" className="print-btn" onClick={() => window.print()}>
              Print Ticket 🖨
            </button>
            <button type="button" className="home-btn" onClick={() => navigate('/home')}>
              Back to Home
            </button>
          </div>
        ) : (
          <>
            <div className="flight-summary-card">
              <h3>Flight Summary</h3>
              <div className="summary-row">
                <span>{flight.airline}</span>
                <span>{flight.fromCode} → {flight.toCode}</span>
                <span>{flight.departTime} – {flight.arriveTime}</span>
                <span className="price">Base: ₹{flight.price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="passenger-form-card">
              <h3>Personalization & Details</h3>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Travel Class</label>
                  <select value={travelClass} onChange={(e) => setTravelClass(e.target.value)}>
                    <option value="">Select Class</option>
                    <option value="Economy">Economy</option>
                    <option value="Business Class">Business Class (2.5x)</option>
                    <option value="First Class">First Class (4x)</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label>Special Fares</label>
                  <select value={specialFare} onChange={(e) => setSpecialFare(e.target.value)}>
                    <option value="Regular">Regular Fare</option>
                    <option value="Student">Student (15% Off)</option>
                    <option value="Armed Forces">Armed Forces (20% Off)</option>
                    <option value="Senior Citizen">Senior Citizen (10% Off)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="As on government ID"
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Age</label>
                  <input
                    type="number"
                    placeholder="e.g. 25"
                    min={1}
                    max={120}
                    value={passengerAge}
                    onChange={(e) => setPassengerAge(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Meal Add-on</label>
                <select value={food} onChange={(e) => setFood(e.target.value)}>
                  <option value="">Select Meal</option>
                  <option value="Veg Meal">Vegetarian Meal</option>
                  <option value="Non-Veg Meal">Non-Vegetarian Meal</option>
                  <option value="No Meal">Skip Meal</option>
                </select>
              </div>

              {renderSeatMap()}

              {error && <p className="booking-error-msg">{error}</p>}

              <button 
                type="button" 
                className="confirm-btn" 
                onClick={handleBooking} 
                disabled={loading || !allFieldsFilled}
              >
                {loading ? 'Processing...' : (allFieldsFilled ? `Confirm & Pay ₹${currentPrice.toLocaleString('en-IN')}` : 'Please make all selections')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
