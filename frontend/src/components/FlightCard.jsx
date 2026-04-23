import './FlightCard.css';

export default function FlightCard({ flight, onBook }) {
  return (
    <div className="flight-card">
      <div className="airline-section">
        <div className="airline-logo">{flight.airlineCode}</div>
        <div>
          <div className="airline-name">{flight.airline}</div>
          <div className="flight-meta">
            {flight.duration} · {flight.seatsLeft} seats left
          </div>
        </div>
      </div>

      <div className="route-section">
        <div className="time-block">
          <div className="time">{flight.departTime}</div>
          <div className="city-code">{flight.fromCode}</div>
          <div className="city-name">{flight.from}</div>
        </div>

        <div className="route-line">
          <div className="line-bar" />
          <div className="plane-icon">✈</div>
        </div>

        <div className="time-block right">
          <div className="time">{flight.arriveTime}</div>
          <div className="city-code">{flight.toCode}</div>
          <div className="city-name">{flight.to}</div>
        </div>
      </div>

      <div className="price-section">
        <div className="price-amount">₹{flight.price.toLocaleString('en-IN')}</div>
        <div className="price-label">per person</div>
        <button
          type="button"
          className="book-btn"
          onClick={() => onBook(flight)}
          disabled={flight.seatsLeft === 0}
        >
          {flight.seatsLeft === 0 ? 'Sold Out' : 'Book Now'}
        </button>
      </div>
    </div>
  );
}
