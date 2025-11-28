import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_CONFIG from '../config/api';
import './EventDetail.css';

function EventDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState(1);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({ averageRating: 0, total: 0, breakdown: {} });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    fetchEvent();
    fetchFeedback();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.event}/events/${id}`);
      setEvent(response.data);
    } catch (err) {
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.event}/events/${id}/feedback`);
      setFeedback(response.data.feedback);
      setFeedbackStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setBooking(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_CONFIG.booking}/bookings`,
        {
          eventId: event._id,
          numberOfTickets: tickets,
          paymentMethod: 'credit_card',
          joinWaitlist: event.availableSeats < tickets
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage(response.data.message || 'Booking confirmed!');
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setFeedbackSubmitting(true);
    setFeedbackMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_CONFIG.event}/events/${id}/feedback`,
        { rating: Number(rating), comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedbackMessage('Thank you for sharing your feedback!');
      setComment('');
      setRating(5);
      fetchFeedback();
    } catch (err) {
      setFeedbackMessage(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const renderBookingSection = () => {
    if (event.availableSeats > 0) {
      return (
        <div className="booking-section">
          <label>Number of tickets:</label>
          <input
            type="number"
            min="1"
            max={Math.min(event.availableSeats, 10)}
            value={tickets}
            onChange={(e) => setTickets(parseInt(e.target.value) || 1)}
          />
          <p className="total">Total: ₹{event.price * tickets}</p>
          <button
            onClick={handleBooking}
            className="btn btn-primary"
            disabled={booking}
          >
            {booking ? 'Booking...' : 'Book Now'}
          </button>
        </div>
      );
    }

    return (
      <div className="booking-section">
        <p className="sold-out">This event is currently full.</p>
        <label>Join the waitlist:</label>
        <input
          type="number"
          min="1"
          max={10}
          value={tickets}
          onChange={(e) => setTickets(parseInt(e.target.value) || 1)}
        />
        <button
          onClick={handleBooking}
          className="btn btn-secondary"
          disabled={booking}
        >
          {booking ? 'Submitting...' : 'Join Waitlist'}
        </button>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading event...</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="event-detail">
      <img src={event.imageUrl} alt={event.title} className="event-detail-image" />
      <div className="event-detail-content">
        <h1>{event.title}</h1>
        <span className="event-category">{event.category}</span>
        <p className="event-description">{event.description}</p>

        <div className="event-details">
          <div className="detail-item">
            <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
          </div>
          <div className="detail-item">
            <strong>Time:</strong> {event.time}
          </div>
          <div className="detail-item">
            <strong>Venue:</strong> {event.venue}
          </div>
          <div className="detail-item">
            <strong>Organizer:</strong> {event.organizer}
          </div>
          <div className="detail-item">
            <strong>Price:</strong> ₹{event.price} per ticket
          </div>
          <div className="detail-item">
            <strong>Available Seats:</strong> {event.availableSeats} / {event.capacity}
          </div>
          <div className="detail-item">
            <strong>Average Rating:</strong> {feedbackStats.averageRating.toFixed(2)} ({feedbackStats.total} reviews)
          </div>
        </div>

        {renderBookingSection()}

        {message && (
          <div className={message.toLowerCase().includes('fail') || message.toLowerCase().includes('error') ? 'error' : 'success'}>
            {message}
          </div>
        )}

        <div className="feedback-section">
          <h2>Feedback</h2>
          <div className="feedback-summary">
            <div>
              <p className="label">Average</p>
              <p className="value">{feedbackStats.averageRating.toFixed(2)}</p>
            </div>
            <div>
              <p className="label">Responses</p>
              <p className="value">{feedbackStats.total}</p>
            </div>
            <div className="breakdown">
              {Object.entries(feedbackStats.breakdown).map(([score, count]) => (
                <span key={score}>{score}★: {count}</span>
              ))}
            </div>
          </div>

          <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
            <div className="form-row">
              <label>Rating</label>
              <select value={rating} onChange={(e) => setRating(e.target.value)}>
                {[5,4,3,2,1].map((value) => (
                  <option key={value} value={value}>{value} - {value === 5 ? 'Excellent' : value === 1 ? 'Poor' : 'Good'}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Comments</label>
              <textarea
                value={comment}
                placeholder="Share your experience"
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={feedbackSubmitting}>
              {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
            {feedbackMessage && <p className="feedback-message">{feedbackMessage}</p>}
          </form>

          <div className="feedback-list">
            {feedback.length === 0 && <p>No feedback yet. Be the first to review this event!</p>}
            {feedback.map(item => (
              <div key={item._id} className="feedback-card">
                <div className="feedback-header">
                  <strong>{item.userName}</strong>
                  <span className="rating">{item.rating}★</span>
                </div>
                <p className="feedback-comment">{item.comment || 'No comment provided.'}</p>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;
