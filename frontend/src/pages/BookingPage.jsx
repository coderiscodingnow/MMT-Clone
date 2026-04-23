import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import './BookingPage.css';

const SPECIAL_CATEGORIES = [
  { id: 'Regular', title: 'Regular Fare', discount: 0 },
  { id: 'Student Discount', title: 'Student', discount: 500, label: 'Upload Student ID Card' },
  { id: 'Armed Forces / Ex-Servicemen', title: 'Armed Forces', discount: 800, label: 'Upload Service / Ex-Servicemen ID' },
  { id: 'Senior Citizen (60+ years)', title: 'Senior Citizen', discount: 600, label: 'Upload Age Proof (Aadhaar / Govt ID)' },
  { id: 'Differently Abled (Divyangjan)', title: 'Differently Abled', discount: 700, label: 'Upload Disability Certificate / UDID Card' },
  { id: 'Unaccompanied Minor', title: 'Unaccompanied Minor', discount: 400, label: 'Upload Birth Certificate / School ID' },
];

const ADDONS = [
  { id: 'Extra Baggage (15kg)', price: 800 },
  { id: 'Travel Insurance', price: 299 },
  { id: 'Priority Boarding', price: 199 },
];

const PROMOS = {
  'FLYEASY10': { type: 'percent', value: 0.1, max: 500 },
  'WELCOME200': { type: 'flat', value: 200 },
  'MONSOON50': { type: 'flat', value: 50 }
};

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const flight = location.state?.flight;

  const [numPassengers, setNumPassengers] = useState(1);
  const [passengers, setPassengers] = useState([
    { id: Date.now().toString(), passengerName: '', passengerAge: '', food: 'No Meal', specialFare: 'Regular', addons: [], uploadedFile: null, fileError: '' }
  ]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  const [travelClass, setTravelClass] = useState('Economy');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    if (!flight) navigate('/home', { replace: true });
  }, [flight, navigate]);

  if (!flight) return null;

  // Change Number of Passengers
  const handleNumPassengersChange = (change) => {
    const newNum = numPassengers + change;
    if (newNum < 1 || newNum > 9) return;
    
    setNumPassengers(newNum);
    
    if (newNum > passengers.length) {
      setPassengers([...passengers, { id: Date.now().toString() + newNum, passengerName: '', passengerAge: '', food: 'No Meal', specialFare: 'Regular', addons: [], uploadedFile: null, fileError: '' }]);
    } else {
      setPassengers(passengers.slice(0, newNum));
    }
    
    if (selectedSeats.length > newNum) {
      setSelectedSeats(selectedSeats.slice(0, newNum));
    }
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handlePaxAddonToggle = (paxIndex, addonId) => {
    const pax = passengers[paxIndex];
    let newAddons = [...pax.addons];
    if (newAddons.includes(addonId)) {
      newAddons = newAddons.filter(id => id !== addonId);
    } else {
      newAddons.push(addonId);
    }
    updatePassenger(paxIndex, 'addons', newAddons);
  };

  const handleFileUpload = (paxIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      updatePassenger(paxIndex, 'fileError', 'File too large. Max size is 5MB');
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      updatePassenger(paxIndex, 'fileError', 'Invalid format. Only JPG/PNG/PDF allowed.');
      return;
    }
    updatePassenger(paxIndex, 'fileError', '');
    updatePassenger(paxIndex, 'uploadedFile', file);
  };

  const handleSeatClick = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      if (selectedSeats.length < numPassengers) {
        setSelectedSeats([...selectedSeats, seatId]);
      }
    }
  };

  const handleApplyPromo = () => {
    setPromoError(''); setPromoSuccess('');
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (PROMOS[code]) {
      setAppliedPromo({ code, ...PROMOS[code] });
      setPromoSuccess(`Promo applied! You save ${PROMOS[code].type === 'flat' ? '₹'+PROMOS[code].value : 'up to ₹'+PROMOS[code].max}`);
    } else {
      setAppliedPromo(null);
      setPromoError('Invalid promo code');
    }
  };

  // --- Calculations ---
  let classMultiplier = 1;
  if (travelClass === 'Business Class') classMultiplier = 2.5;
  if (travelClass === 'First Class') classMultiplier = 4.0;
  const baseFarePerPassenger = Math.round(flight.price * classMultiplier);
  const totalBaseFare = baseFarePerPassenger * numPassengers;

  let totalMeals = 0;
  let totalAddons = 0;
  let totalCategoryDiscount = 0;

  passengers.forEach(pax => {
    if (['Non-Vegetarian', 'Vegan', 'Jain Meal'].includes(pax.food)) totalMeals += 350;
    pax.addons.forEach(addonId => {
      const found = ADDONS.find(a => a.id === addonId);
      if (found) totalAddons += found.price;
    });
    if (pax.specialFare !== 'Regular' && pax.uploadedFile) {
      const cat = SPECIAL_CATEGORIES.find(c => c.id === pax.specialFare);
      if (cat) totalCategoryDiscount += cat.discount;
    }
  });

  let promoDiscount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      promoDiscount = Math.min(Math.round(totalBaseFare * appliedPromo.value), appliedPromo.max);
    } else {
      promoDiscount = appliedPromo.value;
    }
  }

  const currentPrice = Math.max(0, totalBaseFare + totalMeals + totalAddons - totalCategoryDiscount - promoDiscount);

  const allFieldsFilled = selectedSeats.length === numPassengers && passengers.every(pax => pax.passengerName.trim() && pax.passengerAge);

  const handleBooking = async () => {
    if (!allFieldsFilled) {
      setError(`Please ensure you have filled names/ages and selected exactly ${numPassengers} seat(s).`);
      return;
    }
    
    // Check uploads
    for (let i = 0; i < passengers.length; i++) {
      if (passengers[i].specialFare !== 'Regular' && !passengers[i].uploadedFile) {
        setError(`Passenger ${i+1} selected a special fare but didn't upload proof.`);
        return;
      }
    }

    try {
      setLoading(true); setError('');

      const backendPassengers = passengers.map((pax, idx) => ({
        passengerName: pax.passengerName.trim(),
        passengerAge: Number(pax.passengerAge),
        seat: selectedSeats[idx],
        food: pax.food,
        specialFare: pax.specialFare,
        addons: pax.addons
      }));

      const payload = {
        passengers: backendPassengers,
        travelClass,
        promoCode: appliedPromo ? appliedPromo.code : ''
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
        const isSelected = selectedSeats.includes(seatId);
        const isOccupied = (r * c.charCodeAt(0)) % 7 === 0;
        
        rowSeats.push(
          <div key={seatId} className={`seat ${isSelected ? 'selected' : ''} ${isOccupied ? 'occupied' : ''}`}
            onClick={() => !isOccupied && handleSeatClick(seatId)}>
            {isSelected ? (selectedSeats.indexOf(seatId) + 1) : seatId}
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
        <div className="seat-map-header">
          <label className="section-label">Select Your Seats ({selectedSeats.length}/{numPassengers})</label>
          <p className="seat-map-hint">Click seats to assign them to Passenger 1, 2, etc.</p>
        </div>
        <div className="seat-map-legend">
          <div className="legend-item"><div className="seat available"></div> Available</div>
          <div className="legend-item"><div className="seat selected">P</div> Selected</div>
          <div className="legend-item"><div className="seat occupied"></div> Occupied</div>
        </div>
        <div className="seat-map">{seats}</div>
      </div>
    );
  };

  if (bookingResult) {
    return (
      <div className="booking-page">
        <div className="booking-container confirmation-only">
          <div className="confirmation-card">
            <div className="confirm-icon">✓</div>
            <h2>Booking Confirmed!</h2>
            <div className="pnr-badge">PNR: {bookingResult.pnr}</div>

            {bookingResult.passengers.map((pax, i) => (
              <div key={i} className="confirm-details-advanced passenger-ticket">
                <div className="ticket-header">
                  <div>
                    <strong>{flight.airline} {flight.airlineCode}-{Math.floor(Math.random()*900)+100}</strong>
                    <br/>{flight.fromCode} → {flight.toCode}
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <strong>{flight.date}</strong>
                    <br/>{flight.departTime} | {flight.arriveTime}
                  </div>
                </div>
                <div className="ticket-body">
                  <div className="ticket-col">
                    <p><strong>Passenger {i+1}</strong><br/>{pax.passengerName}</p>
                    <p><strong>Age</strong><br/>{pax.passengerAge}</p>
                    <p><strong>Seat</strong><br/>{pax.seat}</p>
                    <p><strong>Class</strong><br/>{bookingResult.travelClass}</p>
                  </div>
                  <div className="ticket-col">
                    <p><strong>Meal Preference</strong><br/>{pax.food}</p>
                    <p><strong>Add-ons</strong><br/>{pax.addons.length > 0 ? pax.addons.join(', ') : 'None'}</p>
                    <p><strong>Special Category</strong><br/>{pax.specialFare !== 'Regular' ? `${pax.specialFare} (Proof Verified ✓)` : 'None'}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="ticket-price-breakdown final-breakdown">
              <div className="detail-row"><span>Base Fare ({numPassengers}x):</span><span>₹{(Math.round(flight.price * classMultiplier) * numPassengers).toLocaleString('en-IN')}</span></div>
              <div className="detail-row total"><span>Total Paid:</span><span>₹{bookingResult.totalPrice.toLocaleString('en-IN')}</span></div>
            </div>

            <button type="button" className="print-btn" onClick={() => window.print()}>Print Tickets 🖨</button>
            <button type="button" className="home-btn" onClick={() => navigate('/home')}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-layout">
        <div className="booking-main">
          
          <div className="global-settings-card card-box">
            <h3>Travel Settings</h3>
            <div className="form-row">
              <div className="form-group flex-1">
                <label>Number of Passengers</label>
                <div className="pax-counter">
                  <button type="button" onClick={()=>handleNumPassengersChange(-1)} disabled={numPassengers<=1}>-</button>
                  <span className="pax-count">{numPassengers}</span>
                  <button type="button" onClick={()=>handleNumPassengersChange(1)} disabled={numPassengers>=9}>+</button>
                </div>
              </div>
              <div className="form-group flex-2">
                <label>Travel Class (Applies to all)</label>
                <select value={travelClass} onChange={(e) => setTravelClass(e.target.value)}>
                  <option value="Economy">Economy</option>
                  <option value="Business Class">Business Class</option>
                  <option value="First Class">First Class</option>
                </select>
              </div>
            </div>
          </div>

          {passengers.map((pax, index) => (
            <div key={pax.id} className="passenger-form-card card-box">
              <h3>Passenger {index + 1} Details {selectedSeats[index] && <span className="pax-seat-badge">Seat {selectedSeats[index]}</span>}</h3>
              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Full Name</label>
                  <input type="text" placeholder="As on government ID" value={pax.passengerName} onChange={(e) => updatePassenger(index, 'passengerName', e.target.value)} />
                </div>
                <div className="form-group flex-1">
                  <label>Age</label>
                  <input type="number" placeholder="e.g. 25" min={1} max={120} value={pax.passengerAge} onChange={(e) => updatePassenger(index, 'passengerAge', e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Meal Preference</label>
                  <select value={pax.food} onChange={(e) => updatePassenger(index, 'food', e.target.value)}>
                    <option value="No Meal">No Meal (FREE)</option>
                    <option value="Vegetarian">Vegetarian (FREE)</option>
                    <option value="Non-Vegetarian">Non-Vegetarian (+₹350)</option>
                    <option value="Vegan">Vegan (+₹350)</option>
                    <option value="Jain Meal">Jain Meal (+₹350)</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label>Special Fares</label>
                  <select value={pax.specialFare} onChange={(e) => { updatePassenger(index, 'specialFare', e.target.value); updatePassenger(index, 'uploadedFile', null); updatePassenger(index, 'fileError', ''); }}>
                    {SPECIAL_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.title} {cat.discount > 0 ? `(-₹${cat.discount})` : ''}</option>)}
                  </select>
                </div>
              </div>

              {pax.specialFare !== 'Regular' && (
                <div className="upload-area pax-upload">
                  <p className="upload-label">{SPECIAL_CATEGORIES.find(c=>c.id===pax.specialFare)?.label}</p>
                  {!pax.uploadedFile ? (
                    <div className="upload-box">
                      <input type="file" id={`file-upload-${index}`} accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileUpload(index, e)} />
                      <label htmlFor={`file-upload-${index}`}>Click or drag file to upload</label>
                    </div>
                  ) : (
                    <div className="uploaded-file-info">
                      <span className="file-icon">{pax.uploadedFile.type.includes('pdf') ? '📄' : '🖼'}</span>
                      <span className="file-name">{pax.uploadedFile.name}</span>
                      <span className="file-tick">✓</span>
                      <button type="button" className="remove-file" onClick={()=>updatePassenger(index, 'uploadedFile', null)}>Remove</button>
                    </div>
                  )}
                  {pax.fileError && <p className="file-error">{pax.fileError}</p>}
                </div>
              )}

              <div className="addons-section">
                <label className="section-label">ADD-ONS</label>
                <div className="addons-grid">
                  {ADDONS.map(addon => (
                    <label key={addon.id} className="addon-item small">
                      <input type="checkbox" checked={pax.addons.includes(addon.id)} onChange={() => handlePaxAddonToggle(index, addon.id)} />
                      <span>{addon.id} <span className="addon-price">+₹{addon.price}</span></span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          ))}

          <div className="card-box">
            {renderSeatMap()}
          </div>

          <div className="offers-card card-box">
            <h3>🎟 Have a Promo Code?</h3>
            <div className="promo-section">
              <div className="promo-input-group">
                <input type="text" placeholder="Enter promo code (e.g., FLYEASY10)" value={promoInput} onChange={(e)=>setPromoInput(e.target.value)} />
                <button type="button" onClick={handleApplyPromo}>Apply</button>
              </div>
              {promoError && <p className="promo-msg error">{promoError}</p>}
              {promoSuccess && <p className="promo-msg success">{promoSuccess}</p>}
            </div>
          </div>

        </div>

        <div className="booking-sidebar">
          <div className="sticky-summary-card">
            <h3 className="summary-title">FLIGHT SUMMARY</h3>
            <p className="summary-subtitle">{flight.airline} · {flight.fromCode} → {flight.toCode}</p>
            <p className="summary-subtitle">{travelClass} · {numPassengers} Traveler{numPassengers > 1 ? 's' : ''}</p>
            
            <hr className="summary-divider" />
            
            <div className="summary-breakdown">
              <div className="summary-row-item base-fare">
                <span>Base Fare ({numPassengers}x)</span><span>₹{totalBaseFare.toLocaleString('en-IN')}</span>
              </div>

              {passengers.some(p => ['Non-Vegetarian', 'Vegan', 'Jain Meal'].includes(p.food)) && (
                <>
                  <div className="summary-section-title">MEALS</div>
                  {passengers.map((pax, i) => {
                    if (['Non-Vegetarian', 'Vegan', 'Jain Meal'].includes(pax.food)) {
                      return <div className="summary-row-item" key={`meal-${i}`}><span>Pax {i+1}: {pax.food}</span><span>+₹350</span></div>
                    }
                    return null;
                  })}
                </>
              )}

              {passengers.some(p => p.addons.length > 0) && (
                <>
                  <div className="summary-section-title">ADD-ONS</div>
                  {passengers.map((pax, i) => 
                    pax.addons.map(addon => (
                      <div className="summary-row-item" key={`addon-${i}-${addon}`}><span>Pax {i+1}: {addon.split('(')[0]}</span><span>+₹{ADDONS.find(a=>a.id===addon)?.price}</span></div>
                    ))
                  )}
                </>
              )}

              {(totalCategoryDiscount > 0 || promoDiscount > 0) && (
                <div className="summary-section-title">OFFERS & DISCOUNTS</div>
              )}
              {passengers.map((pax, i) => {
                if (pax.specialFare !== 'Regular' && pax.uploadedFile) {
                  return <div className="summary-row-item discount-text" key={`disc-${i}`}><span>Pax {i+1}: {pax.specialFare.split(' ')[0]}</span><span>-₹{SPECIAL_CATEGORIES.find(c=>c.id===pax.specialFare)?.discount}</span></div>
                }
                return null;
              })}
              {promoDiscount > 0 && (
                <div className="summary-row-item discount-text">
                  <span>Promo ({appliedPromo.code})</span><span>-₹{promoDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            <hr className="summary-divider" />

            <div className="summary-total">
              <span>TOTAL</span>
              <span>₹{currentPrice.toLocaleString('en-IN')}</span>
            </div>

            {error && <p className="booking-error-msg">{error}</p>}
            
            <button type="button" className="confirm-btn final" onClick={handleBooking} disabled={loading}>
              {loading ? 'Processing...' : 'Confirm & Pay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
