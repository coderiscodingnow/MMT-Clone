import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import './MyBookingsPage.css';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/bookings/my');
        setBookings(response.data.bookings || []);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to fetch your bookings. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  if (loading) {
    return <div className="bookings-loading">Loading your bookings...</div>;
  }

  return (
    <div className="my-bookings-page">
      <div className="my-bookings-container">
        <div className="my-bookings-header">
          <h1>My Bookings</h1>
          <p>View and manage all your past and upcoming flights.</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {!loading && bookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">✈️</div>
            <h2>No Bookings Found</h2>
            <p>You haven't booked any flights yet.</p>
            <button className="book-now-btn" onClick={() => navigate('/home')}>
              Search Flights
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-card-header">
                  <div className="booking-status">
                    <span className="status-dot"></span> Confirmed
                  </div>
                  <div className="booking-pnr">PNR: {booking.pnr}</div>
                </div>

                <div className="booking-flight-info">
                  <div className="flight-route">
                    <div className="city">
                      <h3>{booking.flightId?.fromCode || 'Unknown'}</h3>
                      <p>Departure</p>
                    </div>
                    <div className="flight-arrow">
                      <span>✈</span>
                      <p className="airline-name">{booking.flightId?.airline}</p>
                    </div>
                    <div className="city">
                      <h3>{booking.flightId?.toCode || 'Unknown'}</h3>
                      <p>Arrival</p>
                    </div>
                  </div>
                  
                  <div className="flight-datetime">
                    <p><strong>Date:</strong> {booking.flightId?.date || 'N/A'}</p>
                    <p><strong>Time:</strong> {booking.flightId?.departTime} - {booking.flightId?.arriveTime}</p>
                    <p><strong>Class:</strong> {booking.travelClass}</p>
                  </div>
                </div>

                <div className="booking-passengers">
                  <h4>Passengers ({booking.passengers?.length || 0})</h4>
                  <div className="passenger-tags">
                    {booking.passengers?.map((pax, index) => (
                      <span key={index} className="pax-tag">
                        {pax.passengerName} (Seat {pax.seat})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="booking-card-footer">
                  <div className="booking-date-booked">
                    Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                  </div>
                  <div className="booking-total-price">
                    Total Paid: <span>₹{booking.totalPrice?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
