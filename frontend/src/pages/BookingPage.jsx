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

  const handleBooking = async () => {
    if (!passengerName.trim() || Number(passengerAge) <= 0) {
      setError('Please enter valid passenger details');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axiosInstance.post('/bookings', {
        flightId: flight._id,
        passengerName: passengerName.trim(),
        passengerAge: Number(passengerAge)
      });

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
                <span>
                  {flight.airline} · {flight.fromCode} → {flight.toCode}
                </span>
              </div>
              <div className="detail-row">
                <span>Date</span>
                <span>{flight.date}</span>
              </div>
              <div className="detail-row">
                <span>Departure</span>
                <span>
                  {flight.departTime} → {flight.arriveTime}
                </span>
              </div>
              <div className="detail-row">
                <span>Passenger</span>
                <span>{bookingResult.passengerName}</span>
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
              <h3>Your Selected Flight</h3>
              <div className="summary-row">
                <span>{flight.airline}</span>
                <span>
                  {flight.fromCode} → {flight.toCode}
                </span>
                <span>
                  {flight.departTime} – {flight.arriveTime}
                </span>
                <span className="price">₹{flight.price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="passenger-form-card">
              <h3>Passenger Details</h3>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="As on government ID"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                />
              </div>

              <div className="form-group">
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

              {error && <p className="booking-error-msg">{error}</p>}

              <button type="button" className="confirm-btn" onClick={handleBooking} disabled={loading}>
                {loading ? 'Confirming...' : `Confirm & Pay ₹${flight.price.toLocaleString('en-IN')}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
