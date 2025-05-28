import { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert, Row, Col, Button } from 'react-bootstrap';
import { getMyBookings, cancelBooking } from '../../services/bookingService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching user bookings...');
      
      const response = await getMyBookings();
      console.log('Bookings data from server:', response);
      
      if (response && response.success) {
        const userBookings = Array.isArray(response.data) ? response.data : [];
        console.log('User bookings:', userBookings);
        
        setBookings(userBookings);
        
        if (userBookings.length === 0) {
          setError('You have no active bookings.');
        }
      } else {
        throw new Error(response?.message || 'Failed to load bookings');
      }
      
    } catch (err) {
      console.error('Error in fetchBookings:', err);
      
      let errorMessage = 'Failed to load your bookings. Please try again later.';
      
      if (err.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (err.isNetworkError) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      if (err.status !== 401) {
        toast.error(errorMessage, { autoClose: 5000 });
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      try {
        setLoading(true);
        const response = await cancelBooking(bookingId);
        
        console.log('Cancel booking response:', response);
        
        if (response && response.success) {
          toast.success(response.message || 'Booking cancelled successfully!');
          // Refresh the bookings list
          await fetchBookings();
        } else {
          toast.error(response?.message || 'Failed to cancel booking');
        }
      } catch (error) {
        console.error('Error cancelling booking:', error);
        toast.error(
          error.message || 
          error.response?.data?.message || 
          'Failed to cancel booking. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading your bookings...</span>
        </Spinner>
        <p className="mt-2">Loading your bookings...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">My Bookings</h2>
      
      {error && !loading && (
        <Alert variant="info" className="mb-4">
          {error}
        </Alert>
      )}
      
      {!loading && bookings.length === 0 && !error && (
        <Alert variant="info">
          You don't have any active bookings yet.
        </Alert>
      )}
      
      <div className="row g-4">
        {bookings.map((booking) => (
          <div key={booking._id} className="col-12">
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={3}>
                    {booking.event?.image ? (
                      <img 
                        src={booking.event.image} 
                        alt={booking.event.title} 
                        className="img-fluid rounded"
                        style={{ maxHeight: '150px', objectFit: 'cover', width: '100%' }}
                      />
                    ) : (
                      <div 
                        className="bg-light d-flex align-items-center justify-content-center" 
                        style={{ height: '150px', borderRadius: '0.25rem' }}
                      >
                        <span className="text-muted">No image available</span>
                      </div>
                    )}
                  </Col>
                  
                  <Col md={5}>
                    <h5 className="card-title">{booking.event?.title || 'Event not found'}</h5>
                    <p className="card-text text-muted mb-2">
                      <i className="bi bi-calendar-event me-2"></i>
                      {formatDateTime(booking.event?.dateTime)}
                    </p>
                    <p className="card-text text-muted mb-2">
                      <i className="bi bi-geo-alt me-2"></i>
                      {booking.event?.location || 'Location not specified'}
                    </p>
                    <p className="card-text mb-0">
                      <strong>Booking ID:</strong> {booking._id.substring(0, 8)}...
                    </p>
                    <p className="card-text mb-0">
                      <strong>Tickets:</strong> {booking.numberOfTickets}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <Card.Text className="mb-0">
                        <strong>Status:</strong> {booking.status}
                      </Card.Text>
                      {booking.status !== 'cancelled' && (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={loading}
                        >
                          <FaTrash className="me-1" /> Cancel
                        </Button>
                      )}
                    </div>
                  </Col>
                  
                  <Col md={4} className="d-flex flex-column justify-content-center align-items-end">
                    <div className="d-flex flex-column gap-2">
                      <span className="badge bg-success">Confirmed</span>
                      <div className="text-muted small text-end">
                        Booked on: {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default MyBookings;
