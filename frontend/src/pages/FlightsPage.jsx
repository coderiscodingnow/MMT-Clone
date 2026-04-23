import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FlightCard from '../components/FlightCard';
import './FlightsPage.css';

export default function FlightsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const flights = useMemo(() => location.state?.flights || [], [location.state]);
  const query = location.state?.query || {};

  const [sortBy, setSortBy] = useState('price');
  const [filteredFlights, setFilteredFlights] = useState(flights);

  useEffect(() => {
    const sorted = [...flights].sort((a, b) => {
      if (sortBy === 'time') {
        return a.departTime.localeCompare(b.departTime);
      }
      return a.price - b.price;
    });

    setFilteredFlights(sorted);
  }, [flights, sortBy]);

  const handleBook = (flight) => {
    navigate('/booking', { state: { flight } });
  };

  if (!flights.length) {
    return (
      <div className="flights-empty-state">
        <h2>No flights found</h2>
        <button type="button" className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="flights-page">
      <div className="flights-header">
        <div className="flights-title">
          <button type="button" className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h2>
            {query.from} → {query.to}
          </h2>
          <span className="flights-count">{flights.length} flights found</span>
        </div>

        <div className="sort-controls">
          <label>Sort by:</label>
          <button
            type="button"
            className={sortBy === 'price' ? 'active' : ''}
            onClick={() => setSortBy('price')}
          >
            Price ↑
          </button>
          <button
            type="button"
            className={sortBy === 'time' ? 'active' : ''}
            onClick={() => setSortBy('time')}
          >
            Departure time
          </button>
        </div>
      </div>

      <div className="flights-list">
        {filteredFlights.map((flight) => (
          <FlightCard key={flight._id} flight={flight} onBook={handleBook} />
        ))}
      </div>
    </div>
  );
}
