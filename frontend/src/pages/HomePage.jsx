import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCities = async () => {
      try {
        setCitiesLoading(true);
        const response = await axiosInstance.get('/flights/cities');
        setCities(response.data.cities || []);
      } catch (requestError) {
        setError('Unable to load city list. Please ensure backend is running and flights are seeded.');
      } finally {
        setCitiesLoading(false);
      }
    };

    loadCities();
  }, []);

  const handleSwap = () => {
    const fromValue = from;
    setFrom(to);
    setTo(fromValue);
  };

  const handleSearch = async () => {
    if (!from || !to) {
      setError('Please select both source and destination cities');
      return;
    }

    if (from === to) {
      setError('Source and destination cannot be the same city');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axiosInstance.get('/flights', {
        params: {
          from,
          to,
          date: date || undefined
        }
      });

      navigate('/flights', {
        state: {
          flights: response.data.flights,
          query: { from, to, date }
        }
      });
    } catch (requestError) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">India's smartest flight search ✈</div>
          <h1>Where do you want to fly?</h1>
          <p>Discover the best fares across 500+ routes. Instant results, zero fees.</p>

          <div className="search-card">
            <div className="search-fields">
              <div className="field-group">
                <label>FROM</label>
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  disabled={citiesLoading}
                >
                  <option value="">Select source city</option>
                  {cities.map((city) => (
                    <option key={`${city.code}-${city.name}`} value={city.name}>
                      {city.name} ({city.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="swap-icon" onClick={handleSwap} role="button" tabIndex={0}>
                ⇄
              </div>

              <div className="field-group">
                <label>TO</label>
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  disabled={citiesLoading}
                >
                  <option value="">Select destination city</option>
                  {cities.map((city) => (
                    <option key={`${city.code}-${city.name}-to`} value={city.name}>
                      {city.name} ({city.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-group">
                <label>DATE</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <button type="button" className="search-btn" onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search Flights'}
            </button>

            {error && <p className="home-error-msg">{error}</p>}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">💸</div>
          <h3>Best Price Guarantee</h3>
          <p>We find the cheapest fares across all airlines</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Instant Results</h3>
          <p>Real-time availability, no delays</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Secure Booking</h3>
          <p>Your data is encrypted and safe</p>
        </div>
      </section>
    </div>
  );
}
