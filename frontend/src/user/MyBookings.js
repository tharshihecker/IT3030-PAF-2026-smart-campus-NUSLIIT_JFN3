import React, { useCallback, useEffect, useState } from 'react';
import { fetchUserBookings, cancelBooking, createBooking, fetchFacilities } from '../api';
import './Profile.css';

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
  CANCELLED: '#6b7280',
  COMPLETED: '#3b82f6',
};

function statusBadge(status) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.7rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#fff',
        background: STATUS_COLORS[status] || '#999',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {status}
    </span>
  );
}

function MyBookings() {
  const userId = localStorage.getItem('smartcampus_user_id');

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

  /* New booking form */
  const [showForm, setShowForm] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    facilityId: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    notes: '',
    attendeeCount: 1,
  });

  /* Filter */
  const [statusFilter, setStatusFilter] = useState('');

  const loadBookings = useCallback(() => {
    if (!userId) {
      setError('User session not found. Please log in again.');
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchUserBookings(userId)
      .then(data => {
        setBookings(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load bookings');
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const loadFacilities = () => {
    fetchFacilities({ status: 'ACTIVE', sortBy: 'name', sortDir: 'asc' })
      .then(data => setFacilities(data))
      .catch(() => setFacilities([]));
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    setActionMsg({ type: '', text: '' });
    try {
      await cancelBooking(bookingId, userId);
      setActionMsg({ type: 'success', text: 'Booking cancelled successfully.' });
      loadBookings();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to cancel booking' });
    }
  };

  const handleFormChange = e => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: name === 'attendeeCount' ? Number(value) : value }));
  };

  const handleCreateBooking = async e => {
    e.preventDefault();
    setFormLoading(true);
    setActionMsg({ type: '', text: '' });
    try {
      await createBooking({ ...bookingForm, userId: Number(userId) });
      setActionMsg({ type: 'success', text: 'Booking created! Awaiting admin approval.' });
      setShowForm(false);
      setBookingForm({ facilityId: '', bookingDate: '', startTime: '', endTime: '', purpose: '', notes: '', attendeeCount: 1 });
      loadBookings();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to create booking' });
    } finally {
      setFormLoading(false);
    }
  };

  const openBookingForm = () => {
    loadFacilities();
    setShowForm(true);
    setActionMsg({ type: '', text: '' });
  };

  const filtered = statusFilter ? bookings.filter(b => b.status === statusFilter) : bookings;

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <section className="profile-shell">
      <h2>My Bookings</h2>
      <p className="profile-subtitle">View your facility reservations, create new bookings, and manage existing ones.</p>

      {actionMsg.text && <div className={`profile-alert ${actionMsg.type}`}>{actionMsg.text}</div>}

      {/* ── New Booking Button / Form ── */}
      <div className="profile-card">
        <h3>
          <span className="card-icon">➕</span>
          New Booking
          {!showForm && (
            <button type="button" className="btn-edit-trigger" onClick={openBookingForm}>
              Book a Facility
            </button>
          )}
        </h3>

        {showForm && (
          <form onSubmit={handleCreateBooking} className="profile-form">
            <div className="profile-form-row">
              <label>
                Facility *
                <select name="facilityId" value={bookingForm.facilityId} onChange={handleFormChange} required>
                  <option value="">Select a facility</option>
                  {facilities.map(f => (
                    <option key={f.id} value={f.id}>{f.name} — {f.location} (Cap: {f.capacity})</option>
                  ))}
                </select>
              </label>
              <label>
                Date *
                <input type="date" name="bookingDate" min={todayStr} value={bookingForm.bookingDate} onChange={handleFormChange} required />
              </label>
            </div>
            <div className="profile-form-row">
              <label>
                Start Time *
                <input type="time" name="startTime" value={bookingForm.startTime} onChange={handleFormChange} required />
              </label>
              <label>
                End Time *
                <input type="time" name="endTime" value={bookingForm.endTime} onChange={handleFormChange} required />
              </label>
            </div>
            <div className="profile-form-row">
              <label>
                Purpose *
                <input name="purpose" value={bookingForm.purpose} onChange={handleFormChange} placeholder="e.g. Guest Lecture, Workshop" required />
              </label>
              <label>
                Attendee Count
                <input type="number" name="attendeeCount" min="1" value={bookingForm.attendeeCount} onChange={handleFormChange} />
              </label>
            </div>
            <label>
              Notes (optional)
              <textarea name="notes" value={bookingForm.notes} onChange={handleFormChange} placeholder="Additional notes for the admin..." rows={2} />
            </label>
            <div className="profile-form-actions">
              <button type="submit" className="btn-profile primary" disabled={formLoading}>
                {formLoading ? 'Submitting...' : 'Submit Booking'}
              </button>
              <button type="button" className="btn-profile secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* ── Bookings List ── */}
      <div className="profile-card">
        <h3>
          <span className="card-icon">📅</span>
          Reservation History
        </h3>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#666' }}>Filter:</span>
          {['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '16px',
                border: statusFilter === s ? '2px solid #4f8cff' : '1.5px solid #ddd',
                background: statusFilter === s ? '#eef4ff' : '#fff',
                fontWeight: statusFilter === s ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                color: statusFilter === s ? '#4f8cff' : '#555',
              }}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        {loading && <p style={{ color: '#888' }}>Loading bookings...</p>}
        {error && <p style={{ color: '#c33' }}>{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</p>
            <p>{statusFilter ? `No ${statusFilter.toLowerCase()} bookings.` : 'No bookings yet. Book a facility above to get started!'}</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map(b => (
              <div
                key={b.id}
                style={{
                  border: '1.5px solid #eee',
                  borderRadius: '10px',
                  padding: '1.2rem',
                  background: '#fafafa',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{b.facilityName || `Facility #${b.facilityId}`}</h4>
                  {statusBadge(b.status)}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.88rem', color: '#555' }}>
                  <span>📅 {b.bookingDate}</span>
                  <span>🕐 {b.startTime} — {b.endTime}</span>
                  <span>👥 {b.attendeeCount} attendees</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Purpose:</strong> {b.purpose}</p>
                {b.notes && <p style={{ margin: 0, fontSize: '0.85rem', color: '#777' }}><em>Notes:</em> {b.notes}</p>}
                {b.adminRemarks && (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#1a73e8', background: '#eef4fe', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
                    <strong>Admin Remarks:</strong> {b.adminRemarks}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                  {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                    <button
                      type="button"
                      className="btn-profile danger"
                      style={{ padding: '0.35rem 1rem', fontSize: '0.82rem' }}
                      onClick={() => handleCancel(b.id)}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#aaa' }}>
                  Booked: {new Date(b.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default MyBookings;
