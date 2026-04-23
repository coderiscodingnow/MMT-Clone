You are a senior full-stack engineer. I need you to build a complete, production-quality flight booking web application called "FlyEasy" from scratch. I will give you every detail — follow it exactly, write complete code for every file, no placeholders, no "// TODO", no truncation.

════════════════════════════════════════
TECH STACK (DO NOT DEVIATE)
════════════════════════════════════════
Frontend  : React 18 + Vite 5, React Router DOM v6, Axios, plain CSS (no Tailwind, no MUI)
Backend   : Node.js 20, Express 4, Mongoose 8, bcryptjs, jsonwebtoken, cors, dotenv
Database  : MongoDB Atlas (cloud) — Mongoose ODM
Dev tools : nodemon for backend, Vite dev server for frontend
Ports     : Frontend → 5173, Backend → 3000
Vite proxy: /api → http://localhost:3000 (so frontend never hard-codes localhost:3000)

════════════════════════════════════════
EXACT FOLDER STRUCTURE — CREATE ALL FILES
════════════════════════════════════════
flyeasy/
├── backend/
│   ├── package.json
│   ├── .env
│   ├── server.js
│   ├── seed.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Flight.js
│   │   └── Booking.js
│   └── routes/
│       ├── authRoutes.js
│       ├── flightRoutes.js
│       └── bookingRoutes.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── App.css
        ├── index.css
        ├── api/
        │   └── axiosInstance.js
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Navbar.css
        │   ├── FlightCard.jsx
        │   └── FlightCard.css
        └── pages/
            ├── HomePage.jsx
            ├── HomePage.css
            ├── FlightsPage.jsx
            ├── FlightsPage.css
            ├── BookingPage.jsx
            ├── BookingPage.css
            ├── LoginPage.jsx
            ├── SignupPage.jsx
            └── AuthPage.css

════════════════════════════════════════
BACKEND — COMPLETE SPEC
════════════════════════════════════════

─── backend/package.json ───
{
  "name": "flyeasy-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.4.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}

─── backend/.env ───
MONGO_URI=YOUR_MONGODB_ATLAS_URI_HERE
JWT_SECRET=flyeasy_super_secret_jwt_key_2024
PORT=3000

─── backend/server.js ───
- Import express, cors, dotenv, mongoose
- dotenv.config() at the very top
- Create express app
- Middleware: cors({ origin: 'http://localhost:5173', credentials: true }), express.json()
- Mount routes: app.use('/api/auth', authRoutes), app.use('/api/flights', flightRoutes), app.use('/api/bookings', bookingRoutes)
- Connect Mongoose to process.env.MONGO_URI, log "MongoDB connected" on success, log error on failure
- app.listen(process.env.PORT, () => console.log('Server running on port 3000'))

─── backend/models/User.js ───
Mongoose Schema:
  name: { type: String, required: true, trim: true }
  email: { type: String, required: true, unique: true, lowercase: true, trim: true }
  password: { type: String, required: true }
  timestamps: true
Export as 'User'

─── backend/models/Flight.js ───
Mongoose Schema:
  airline: { type: String, required: true }
  airlineCode: { type: String, required: true }  — e.g. "6E", "AI", "SG"
  from: { type: String, required: true }         — e.g. "Delhi"
  fromCode: { type: String, required: true }     — e.g. "DEL"
  to: { type: String, required: true }           — e.g. "Mumbai"
  toCode: { type: String, required: true }       — e.g. "BOM"
  date: { type: String, required: true }         — stored as "YYYY-MM-DD" string
  departTime: { type: String, required: true }   — e.g. "06:00"
  arriveTime: { type: String, required: true }   — e.g. "08:10"
  duration: { type: String, required: true }     — e.g. "2h 10m"
  price: { type: Number, required: true }
  seatsLeft: { type: Number, required: true, default: 50 }
Export as 'Flight'

─── backend/models/Booking.js ───
Mongoose Schema:
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true }
  passengerName: { type: String, required: true, trim: true }
  passengerAge: { type: Number, required: true, min: 1, max: 120 }
  pnr: { type: String, required: true, unique: true }  — generate random 8-char alphanumeric on creation
  totalPrice: { type: Number, required: true }
  createdAt: { type: Date, default: Date.now }
Export as 'Booking'

─── backend/middleware/authMiddleware.js ───
- Export a middleware function called 'protect'
- Read Authorization header, split on 'Bearer ', take second part as token
- If no token: return res.status(401).json({ message: 'No token, access denied' })
- jwt.verify(token, process.env.JWT_SECRET) — if error return 401
- Attach req.user = decoded (the JWT payload) and call next()

─── backend/routes/authRoutes.js ───
POST /signup:
  - Validate: name, email, password all present → 400 if missing
  - Check if email already exists in User collection → 400 "Email already registered"
  - Hash password: bcrypt.hash(password, 12)
  - Save new User
  - Generate JWT: jwt.sign({ id: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
  - Return 201: { token, user: { id, name, email } }

POST /login:
  - Validate: email, password present → 400 if missing
  - Find user by email → 401 "Invalid email or password" if not found (do NOT say which field)
  - bcrypt.compare(password, user.password) → 401 if mismatch
  - Generate JWT same as above
  - Return 200: { token, user: { id, name, email } }

─── backend/routes/flightRoutes.js ───
GET /flights:
  - Read query params: from, to, date (all optional)
  - Build mongoose filter object dynamically:
    - If 'from' provided: { from: { $regex: from, $options: 'i' } } — case-insensitive
    - If 'to' provided: { to: { $regex: to, $options: 'i' } }
    - If 'date' provided: { date: date } — exact match on string
  - If none provided, return ALL flights (for seeding/testing)
  - Sort results by price ascending
  - Return 200: { count: results.length, flights: results }

─── backend/routes/bookingRoutes.js ───
POST /bookings (PROTECTED — use authMiddleware.protect):
  - Body: { flightId, passengerName, passengerAge }
  - Validate all fields present → 400
  - Find Flight by flightId → 404 "Flight not found"
  - Check flight.seatsLeft > 0 → 400 "No seats available"
  - Generate PNR: 'FLYEZ-' + Math.random().toString(36).substr(2,6).toUpperCase()
  - Create and save Booking: { userId: req.user.id, flightId, passengerName, passengerAge, pnr, totalPrice: flight.price }
  - Decrement flight.seatsLeft by 1 and save flight
  - Populate booking with flight details: booking.populate('flightId')
  - Return 201: { message: 'Booking confirmed', booking }

GET /bookings/my (PROTECTED — use authMiddleware.protect):
  - Find all bookings where userId === req.user.id
  - Populate flightId
  - Sort by createdAt desc
  - Return 200: { bookings }

─── backend/seed.js ───
Standalone script. Run with: node seed.js
- dotenv.config() and import mongoose + Flight model
- Connect to MONGO_URI
- If process.argv includes '--force': delete all existing flights first
- Insert exactly these 12 flights as seed data:

1.  IndiGo (6E), DEL→BOM, Delhi→Mumbai, date: "2025-05-10", depart: "06:00", arrive: "08:10", duration: "2h 10m", price: 3499, seats: 42
2.  Air India (AI), DEL→BOM, Delhi→Mumbai, date: "2025-05-10", depart: "09:30", arrive: "11:45", duration: "2h 15m", price: 5200, seats: 18
3.  SpiceJet (SG), DEL→BOM, Delhi→Mumbai, date: "2025-05-10", depart: "14:00", arrive: "16:20", duration: "2h 20m", price: 2899, seats: 5
4.  Vistara (UK), DEL→MAA, Delhi→Chennai, date: "2025-05-11", depart: "07:15", arrive: "10:00", duration: "2h 45m", price: 4800, seats: 30
5.  IndiGo (6E), BOM→DEL, Mumbai→Delhi, date: "2025-05-11", depart: "11:00", arrive: "13:05", duration: "2h 05m", price: 3100, seats: 55
6.  Air India (AI), BOM→BLR, Mumbai→Bengaluru, date: "2025-05-11", depart: "08:45", arrive: "10:15", duration: "1h 30m", price: 3750, seats: 22
7.  GoFirst (G8), MAA→DEL, Chennai→Delhi, date: "2025-05-12", depart: "05:30", arrive: "08:20", duration: "2h 50m", price: 2500, seats: 14
8.  SpiceJet (SG), BLR→HYD, Bengaluru→Hyderabad, date: "2025-05-12", depart: "16:30", arrive: "17:40", duration: "1h 10m", price: 1899, seats: 60
9.  IndiGo (6E), HYD→BOM, Hyderabad→Mumbai, date: "2025-05-12", depart: "20:00", arrive: "21:35", duration: "1h 35m", price: 2200, seats: 38
10. Vistara (UK), DEL→BLR, Delhi→Bengaluru, date: "2025-05-13", depart: "06:45", arrive: "09:20", duration: "2h 35m", price: 5900, seats: 10
11. Air India (AI), MAA→BOM, Chennai→Mumbai, date: "2025-05-13", depart: "12:00", arrive: "14:00", duration: "2h 00m", price: 4100, seats: 25
12. GoFirst (G8), DEL→HYD, Delhi→Hyderabad, date: "2025-05-14", depart: "09:00", arrive: "11:20", duration: "2h 20m", price: 2750, seats: 45

- Log "Seeded 12 flights" and disconnect mongoose

════════════════════════════════════════
FRONTEND — COMPLETE SPEC
════════════════════════════════════════

─── frontend/package.json ───
{
  "name": "flyeasy-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.2.12"
  }
}

─── frontend/vite.config.js ───
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})

─── frontend/src/api/axiosInstance.js ───
- Create axios instance: baseURL: '/api'
- Add request interceptor: read token from localStorage.getItem('flyeasy_token'), if exists set headers['Authorization'] = 'Bearer ' + token
- Export as default

─── frontend/src/context/AuthContext.jsx ───
- Create AuthContext with React.createContext
- AuthProvider component:
  - State: user (object with {id, name, email}) and token (string)
  - On mount: read 'flyeasy_token' and 'flyeasy_user' from localStorage, parse user JSON, set state
  - login(token, userObj): save to state AND localStorage
  - logout(): clear state AND remove both localStorage keys
  - Value: { user, token, login, logout, isAuthenticated: !!token }
- Export AuthProvider as default, export useAuth() custom hook that uses useContext(AuthContext)

─── frontend/src/App.jsx ───
- Import BrowserRouter, Routes, Route, Navigate from react-router-dom
- Import AuthProvider, useAuth
- Import all pages and Navbar
- Protected route wrapper component: if not isAuthenticated → Navigate to /login, else render children
- Routes:
  /            → HomePage
  /flights     → FlightsPage
  /booking     → ProtectedRoute → BookingPage
  /login       → LoginPage
  /signup      → SignupPage
  *            → Navigate to /
- Navbar renders on ALL routes (outside Routes)

─── frontend/src/index.css ───
- CSS reset + base styles:
  * { box-sizing: border-box; margin: 0; padding: 0 }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f6f9; color: #1a1a2e; line-height: 1.5 }
  a { text-decoration: none; color: inherit }
  button { cursor: pointer; font-family: inherit }
  input, select, textarea { font-family: inherit }

─── frontend/src/components/Navbar.jsx ───
Structure:
  <nav class="navbar">
    <div class="navbar-inner">
      <Link to="/" class="navbar-logo">FlyEasy <span>✈</span></Link>
      <div class="navbar-right">
        if isAuthenticated:
          <span class="navbar-greeting">Hi, {user.name}</span>
          <button class="btn-logout" onClick={logout then navigate('/')}>Logout</button>
        else:
          <Link to="/login" class="btn-nav">Login</Link>
          <Link to="/signup" class="btn-nav btn-nav-primary">Sign Up</Link>
      </div>
    </div>
  </nav>

─── frontend/src/components/Navbar.css ───
.navbar: position sticky, top 0, z-index 100, background #0a1628, border-bottom 1px solid rgba(255,255,255,0.08), box-shadow 0 2px 20px rgba(0,0,0,0.3)
.navbar-inner: max-width 1100px, margin auto, padding 0 24px, height 60px, display flex, align-items center, justify-content space-between
.navbar-logo: color white, font-size 20px, font-weight 700, letter-spacing -0.5px
.navbar-logo span: color #3b9eff
.navbar-right: display flex, gap 12px, align-items center
.navbar-greeting: color rgba(255,255,255,0.7), font-size 14px
.btn-nav: color rgba(255,255,255,0.8), font-size 13px, padding 7px 16px, border-radius 7px, border 1px solid rgba(255,255,255,0.2), transition all 0.2s
.btn-nav:hover: background rgba(255,255,255,0.1)
.btn-nav-primary: background #1a73e8, color white, border-color #1a73e8
.btn-nav-primary:hover: background #1558b0
.btn-logout: same as btn-nav but color #ff6b6b, border-color rgba(255,107,107,0.4)

─── frontend/src/pages/HomePage.jsx ───
State: from, to, date (strings), loading (bool), error (string)

Structure:
  <div class="home-page">
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">India's smartest flight search ✈</div>
        <h1>Where do you want to fly?</h1>
        <p>Discover the best fares across 500+ routes. Instant results, zero fees.</p>
        <div class="search-card">
          <div class="search-fields">
            <div class="field-group">
              <label>FROM</label>
              <input type="text" placeholder="City or airport (e.g. Delhi)" value={from} onChange=... />
            </div>
            <div class="swap-icon" onClick={swap from and to}>⇄</div>
            <div class="field-group">
              <label>TO</label>
              <input type="text" placeholder="City or airport (e.g. Mumbai)" value={to} onChange=... />
            </div>
            <div class="field-group">
              <label>DATE</label>
              <input type="date" value={date} onChange=... min={today's date} />
            </div>
          </div>
          <button class="search-btn" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search Flights'}
          </button>
          {error && <p class="error-msg">{error}</p>}
        </div>
      </div>
    </section>
    <section class="features">
      <div class="feature-card"><div class="feature-icon">💸</div><h3>Best Price Guarantee</h3><p>We find the cheapest fares across all airlines</p></div>
      <div class="feature-card"><div class="feature-icon">⚡</div><h3>Instant Results</h3><p>Real-time availability, no delays</p></div>
      <div class="feature-card"><div class="feature-icon">🔒</div><h3>Secure Booking</h3><p>Your data is encrypted and safe</p></div>
    </section>
  </div>

handleSearch:
  - If from or to empty: setError('Please fill in both From and To fields')
  - setLoading(true), clear error
  - Call GET /api/flights?from=from&to=to&date=date using axiosInstance
  - On success: navigate('/flights', { state: { flights: response.data.flights, query: {from, to, date} } })
  - On error: setError('Something went wrong. Please try again.')
  - setLoading(false) in finally

─── frontend/src/pages/HomePage.css ───
.hero: background linear-gradient(135deg, #0a1628 0%, #1a3a6e 60%, #0d5fa0 100%), min-height 500px, display flex, align-items center, padding 60px 24px
.hero-content: max-width 800px, margin auto, text-align center, width 100%
.hero-badge: inline-block, background rgba(59,158,255,0.15), color #7ec8ff, font-size 13px, padding 6px 16px, border-radius 20px, border 1px solid rgba(59,158,255,0.3), margin-bottom 16px
.hero h1: color white, font-size 40px, font-weight 800, margin-bottom 10px, line-height 1.2
.hero p: color rgba(255,255,255,0.6), font-size 16px, margin-bottom 32px
.search-card: background rgba(255,255,255,0.08), backdrop-filter blur(12px), border 1px solid rgba(255,255,255,0.15), border-radius 16px, padding 24px, text-align left
.search-fields: display grid, grid-template-columns 1fr auto 1fr 1fr, gap 12px, align-items end, margin-bottom 16px
.field-group label: display block, color rgba(255,255,255,0.5), font-size 10px, font-weight 600, letter-spacing 0.08em, text-transform uppercase, margin-bottom 6px
.field-group input: width 100%, background rgba(255,255,255,0.1), border 1px solid rgba(255,255,255,0.2), border-radius 8px, color white, font-size 14px, padding 12px 14px, outline none, transition border 0.2s
.field-group input:focus: border-color #3b9eff, background rgba(255,255,255,0.15)
.field-group input::placeholder: color rgba(255,255,255,0.35)
.swap-icon: color rgba(255,255,255,0.5), font-size 20px, cursor pointer, padding 12px 4px, align-self flex-end, transition color 0.2s
.swap-icon:hover: color #3b9eff
.search-btn: width 100%, background #1a73e8, color white, border none, border-radius 10px, padding 14px, font-size 16px, font-weight 600, letter-spacing 0.02em, transition all 0.2s
.search-btn:hover:not(:disabled): background #1558b0, transform translateY(-1px)
.search-btn:disabled: opacity 0.6, cursor not-allowed
.features: max-width 1100px, margin 60px auto, padding 0 24px, display grid, grid-template-columns repeat(3, 1fr), gap 24px
.feature-card: background white, border-radius 12px, padding 24px, border 1px solid #e8ecf0, text-align center
.feature-icon: font-size 32px, margin-bottom 12px
.feature-card h3: font-size 15px, font-weight 600, color #1a1a2e, margin-bottom 8px
.feature-card p: font-size 13px, color #666, line-height 1.6
.error-msg: color #ff6b6b, font-size 13px, margin-top 12px, text-align center

─── frontend/src/pages/FlightsPage.jsx ───
- Read from useLocation().state: flights array, query object
- Local state: sortBy ('price' | 'time'), filteredFlights
- useEffect: when sortBy changes, sort flights accordingly
  - 'price': sort by price ascending
  - 'time': sort by departTime string ascending
- If no flights in state: show "No flights found" with a back button
- Structure:
  <div class="flights-page">
    <div class="flights-header">
      <div class="flights-title">
        <button class="back-btn" onClick navigate(-1)>← Back</button>
        <h2>{query.from} → {query.to}</h2>
        <span class="flights-count">{flights.length} flights found</span>
      </div>
      <div class="sort-controls">
        <label>Sort by:</label>
        <button class={sortBy==='price'?'active':''} onClick={setSortBy('price')}>Price ↑</button>
        <button class={sortBy==='time'?'active':''} onClick={setSortBy('time')}>Departure time</button>
      </div>
    </div>
    <div class="flights-list">
      {filteredFlights.map(flight => <FlightCard key={flight._id} flight={flight} onBook={handleBook} />)}
    </div>
  </div>

handleBook(flight): navigate('/booking', { state: { flight } })

─── frontend/src/components/FlightCard.jsx ───
Props: flight, onBook
Structure:
  <div class="flight-card">
    <div class="airline-section">
      <div class="airline-logo">{flight.airlineCode}</div>
      <div>
        <div class="airline-name">{flight.airline}</div>
        <div class="flight-meta">{flight.duration} · {flight.seatsLeft} seats left</div>
      </div>
    </div>
    <div class="route-section">
      <div class="time-block">
        <div class="time">{flight.departTime}</div>
        <div class="city-code">{flight.fromCode}</div>
        <div class="city-name">{flight.from}</div>
      </div>
      <div class="route-line">
        <div class="line-bar"></div>
        <div class="plane-icon">✈</div>
      </div>
      <div class="time-block right">
        <div class="time">{flight.arriveTime}</div>
        <div class="city-code">{flight.toCode}</div>
        <div class="city-name">{flight.to}</div>
      </div>
    </div>
    <div class="price-section">
      <div class="price-amount">₹{flight.price.toLocaleString('en-IN')}</div>
      <div class="price-label">per person</div>
      <button class="book-btn" onClick={onBook(flight)} disabled={flight.seatsLeft===0}>
        {flight.seatsLeft===0 ? 'Sold Out' : 'Book Now'}
      </button>
    </div>
  </div>

─── frontend/src/components/FlightCard.css ───
.flight-card: background white, border-radius 12px, border 1px solid #e8ecf0, padding 20px 24px, display grid, grid-template-columns 220px 1fr 160px, align-items center, gap 20px, transition all 0.2s, margin-bottom 12px
.flight-card:hover: border-color #1a73e8, box-shadow 0 4px 20px rgba(26,115,232,0.1), transform translateY(-1px)
.airline-logo: width 48px, height 48px, border-radius 10px, background #e8f0fe, color #1a73e8, display flex, align-items center, justify-content center, font-size 14px, font-weight 700, margin-right 12px
.airline-name: font-size 15px, font-weight 600, color #1a1a2e
.flight-meta: font-size 12px, color #888, margin-top 2px
.route-section: display flex, align-items center, gap 16px
.time: font-size 22px, font-weight 700, color #1a1a2e
.city-code: font-size 13px, font-weight 600, color #555, margin-top 2px
.city-name: font-size 11px, color #aaa
.route-line: flex 1, display flex, align-items center, gap 6px, color #bbb
.line-bar: flex 1, height 1px, background #ddd
.plane-icon: color #1a73e8, font-size 16px
.right: text-align right
.price-amount: font-size 24px, font-weight 800, color #1a73e8
.price-label: font-size 11px, color #aaa, margin-bottom 10px
.book-btn: background #1a73e8, color white, border none, border-radius 8px, padding 10px 20px, font-size 13px, font-weight 600, width 100%, transition all 0.2s
.book-btn:hover:not(:disabled): background #1558b0
.book-btn:disabled: background #ccc, color #999, cursor not-allowed

─── frontend/src/pages/BookingPage.jsx ───
- Read flight from useLocation().state.flight — if missing redirect to /
- State: passengerName, passengerAge, loading, error, bookingResult (null or booking object)
- Structure:
  <div class="booking-page">
    <div class="booking-container">
      if bookingResult:
        <div class="confirmation-card">
          <div class="confirm-icon">✓</div>
          <h2>Booking Confirmed!</h2>
          <div class="pnr-badge">PNR: {bookingResult.pnr}</div>
          <div class="confirm-details">
            <div class="detail-row"><span>Flight</span><span>{flight.airline} · {flight.fromCode} → {flight.toCode}</span></div>
            <div class="detail-row"><span>Date</span><span>{flight.date}</span></div>
            <div class="detail-row"><span>Departure</span><span>{flight.departTime} → {flight.arriveTime}</span></div>
            <div class="detail-row"><span>Passenger</span><span>{bookingResult.passengerName}</span></div>
            <div class="detail-row"><span>Amount Paid</span><span class="price">₹{bookingResult.totalPrice.toLocaleString('en-IN')}</span></div>
          </div>
          <button class="print-btn" onClick={window.print()}>Print Ticket 🖨</button>
          <button class="home-btn" onClick={navigate('/')}>Back to Home</button>
        </div>
      else:
        <div class="flight-summary-card">
          <h3>Your Selected Flight</h3>
          <div class="summary-row"><span>{flight.airline}</span><span>{flight.fromCode} → {flight.toCode}</span><span>{flight.departTime} – {flight.arriveTime}</span><span class="price">₹{flight.price.toLocaleString('en-IN')}</span></div>
        </div>
        <div class="passenger-form-card">
          <h3>Passenger Details</h3>
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="As on government ID" value={passengerName} onChange=... />
          </div>
          <div class="form-group">
            <label>Age</label>
            <input type="number" placeholder="e.g. 25" min=1 max=120 value={passengerAge} onChange=... />
          </div>
          {error && <p class="error-msg">{error}</p>}
          <button class="confirm-btn" onClick={handleBooking} disabled={loading}>
            {loading ? 'Confirming...' : `Confirm & Pay ₹${flight.price.toLocaleString('en-IN')}`}
          </button>
        </div>
    </div>
  </div>

handleBooking:
  - Validate passengerName not empty and passengerAge > 0 → setError if not
  - setLoading(true)
  - POST /api/bookings with { flightId: flight._id, passengerName, passengerAge: Number(passengerAge) }
  - On success: setBookingResult(response.data.booking)
  - On error 401: navigate('/login')
  - On other error: setError(error.response?.data?.message || 'Booking failed')
  - setLoading(false)

─── frontend/src/pages/LoginPage.jsx + SignupPage.jsx ───
Both use the shared AuthPage.css

LoginPage structure:
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">FlyEasy ✈</div>
      <h2>Welcome back</h2>
      <p class="auth-sub">Sign in to your account</p>
      <div class="form-group"><label>Email</label><input type="email" /></div>
      <div class="form-group"><label>Password</label><input type="password" /></div>
      {error && <p class="error-msg">{error}</p>}
      <button class="auth-btn" onClick={handleLogin} disabled={loading}>{loading?'Signing in...':'Sign In'}</button>
      <p class="auth-switch">Don't have an account? <Link to="/signup">Sign up</Link></p>
    </div>
  </div>

handleLogin: POST /api/auth/login → on success call auth.login(token, user) then navigate('/')

SignupPage structure: same but with Name field added, heading "Create your account", button "Create Account"
handleSignup: POST /api/auth/signup → on success call auth.login(token, user) then navigate('/')

─── frontend/src/pages/AuthPage.css ───
.auth-page: min-height 100vh, background linear-gradient(135deg, #0a1628, #1a3a6e), display flex, align-items center, justify-content center, padding 24px
.auth-card: background white, border-radius 16px, padding 40px, width 100%, max-width 420px, box-shadow 0 20px 60px rgba(0,0,0,0.3)
.auth-logo: color #1a73e8, font-size 22px, font-weight 700, text-align center, margin-bottom 20px
.auth-card h2: font-size 24px, font-weight 700, color #1a1a2e, text-align center, margin-bottom 6px
.auth-sub: color #888, text-align center, font-size 14px, margin-bottom 28px
.form-group: margin-bottom 16px
.form-group label: display block, font-size 13px, font-weight 500, color #444, margin-bottom 6px
.form-group input: width 100%, border 1px solid #dde0e7, border-radius 8px, padding 12px 14px, font-size 14px, outline none, transition border 0.2s
.form-group input:focus: border-color #1a73e8, box-shadow 0 0 0 3px rgba(26,115,232,0.1)
.auth-btn: width 100%, background #1a73e8, color white, border none, border-radius 10px, padding 14px, font-size 15px, font-weight 600, margin-top 8px, transition all 0.2s
.auth-btn:hover:not(:disabled): background #1558b0
.auth-btn:disabled: opacity 0.6, cursor not-allowed
.auth-switch: text-align center, font-size 13px, color #888, margin-top 20px
.auth-switch a: color #1a73e8, font-weight 500
.error-msg: color #e53935, font-size 13px, margin: 8px 0, text-align center

════════════════════════════════════════
IMPORTANT TECHNICAL NOTES — MUST FOLLOW
════════════════════════════════════════
1. In every async route handler in Express, wrap logic in try-catch and call next(err) — avoid unhandled promise rejections
2. Never use CommonJS require() in frontend — it's ESM (Vite). Use import/export everywhere.
3. In backend, use ES modules style OR CommonJS consistently — pick CommonJS (require/module.exports) for simplicity to avoid "Cannot use import statement" errors
4. All form inputs in React must be controlled (value + onChange) — never uncontrolled
5. In React Router v6, use useNavigate() hook not history.push. Use <Link> not <a> for internal links.
6. Pass flight data between pages ONLY via React Router navigate state (not localStorage, not Redux)
7. axiosInstance must be used for ALL API calls in the frontend — never use fetch() or plain axios
8. BookingPage must handle the case where state is null (user navigates directly) — redirect to home
9. All CSS class names must be unique per component — prefix with component name if needed to avoid collision
10. Do NOT use any external UI library. Do NOT use Tailwind. All styling via plain CSS files as specified.
11. The backend must use CORS with explicit origin 'http://localhost:5173' — wildcard '*' will break credentials

════════════════════════════════════════
OUTPUT FORMAT
════════════════════════════════════════
Output every file in this exact order, using this header format for each file:

// ===== FILE: path/to/filename.ext =====

Then the complete file contents. No explanations between files. No truncation. No "rest of code here". Every line of every file must be present and functional.

After all files, output the following exactly:

SETUP COMMANDS:
1. cd flyeasy/backend && npm install
2. (Edit .env: add your MongoDB Atlas URI)
3. node seed.js --force
4. npm run dev

In a second terminal:
5. cd flyeasy/frontend && npm install
6. npm run dev

Then open: http://localhost:5173    