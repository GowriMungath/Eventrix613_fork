import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_CONFIG from '../config/api';
import './AdminAnalytics.css';

function AdminAnalytics() {
  const [eventAnalytics, setEventAnalytics] = useState(null);
  const [bookingAnalytics, setBookingAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [eventResponse, bookingResponse] = await Promise.all([
        axios.get(`${API_CONFIG.event}/events/analytics/summary`, { headers }),
        axios.get(`${API_CONFIG.booking}/bookings/analytics`, { headers })
      ]);

      setEventAnalytics(eventResponse.data);
      setBookingAnalytics(bookingResponse.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (error) {
    return (
      <div className="analytics-error">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchAnalytics}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      <div className="analytics-header">
        <h1>Platform Analytics</h1>
        <button className="btn btn-secondary" onClick={fetchAnalytics}>Refresh</button>
      </div>

      <section className="analytics-grid">
        <div className="card">
          <p className="label">Total Events</p>
          <h2>{eventAnalytics.events.totalEvents}</h2>
        </div>
        <div className="card">
          <p className="label">Upcoming</p>
          <h2>{eventAnalytics.events.upcoming}</h2>
        </div>
        <div className="card">
          <p className="label">Ongoing</p>
          <h2>{eventAnalytics.events.ongoing}</h2>
        </div>
        <div className="card">
          <p className="label">Completed</p>
          <h2>{eventAnalytics.events.completed}</h2>
        </div>
        <div className="card">
          <p className="label">Cancelled</p>
          <h2>{eventAnalytics.events.cancelled}</h2>
        </div>
      </section>

      <section className="analytics-grid">
        <div className="card">
          <p className="label">Total Bookings</p>
          <h2>{bookingAnalytics.stats.totalBookings}</h2>
        </div>
        <div className="card">
          <p className="label">Confirmed</p>
          <h2>{bookingAnalytics.stats.confirmedBookings}</h2>
        </div>
        <div className="card">
          <p className="label">Cancelled</p>
          <h2>{bookingAnalytics.stats.cancelledBookings}</h2>
        </div>
        <div className="card">
          <p className="label">Waitlisted</p>
          <h2>{bookingAnalytics.stats.waitlistedBookings}</h2>
        </div>
        <div className="card">
          <p className="label">Tickets Sold</p>
          <h2>{bookingAnalytics.stats.totalTicketsSold}</h2>
        </div>
        <div className="card">
          <p className="label">Revenue</p>
          <h2>₹{bookingAnalytics.stats.totalRevenue}</h2>
        </div>
      </section>

      <section className="analytics-section">
        <div>
          <h2>Top Rated Events</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Average Rating</th>
                  <th>Feedback Count</th>
                </tr>
              </thead>
              <tbody>
                {eventAnalytics.feedback.topRated.length === 0 && (
                  <tr><td colSpan="3">No feedback yet</td></tr>
                )}
                {eventAnalytics.feedback.topRated.map((item) => (
                  <tr key={item.eventId}>
                    <td>{item.title}</td>
                    <td>{item.averageRating.toFixed(2)}</td>
                    <td>{item.totalFeedback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2>Waitlists</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>People Waiting</th>
                </tr>
              </thead>
              <tbody>
                {bookingAnalytics.waitlistByEvent.length === 0 && (
                  <tr><td colSpan="2">No active waitlists</td></tr>
                )}
                {bookingAnalytics.waitlistByEvent.map((entry) => (
                  <tr key={entry._id}>
                    <td>{entry.title}</td>
                    <td>{entry.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminAnalytics;
