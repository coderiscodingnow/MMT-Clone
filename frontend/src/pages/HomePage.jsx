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
          <div className="feature-icon price">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
          </div>
          <h3>Best Price Guarantee</h3>
          <p>We find the cheapest fares across all airlines</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon speed">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </div>
          <h3>Instant Results</h3>
          <p>Real-time availability, no delays</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon secure">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h3>Secure Booking</h3>
          <p>Your data is encrypted and safe</p>
        </div>
      </section>
    </div>
  );
}
