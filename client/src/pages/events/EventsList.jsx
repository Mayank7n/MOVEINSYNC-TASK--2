import { useState, useEffect } from 'react';
import { Card, Container, Button, Spinner, Alert, Badge, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getEvents } from '../../services/eventService';
import { getMyBookings } from '../../services/bookingService';
import { toast } from 'react-toastify';
import BookingForm from '../../components/BookingForm';
// Icons are now imported from react-bootstrap via CSS

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(null);
  const [error, setError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userId');

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch events
        const eventsData = await getEvents();
        setEvents(eventsData.data || []);
        
      
        if (isAuthenticated) {
          try {
            const bookingsData = await getMyBookings();
            setMyBookings(bookingsData.data || []);
          } catch (err) {
            console.error('Error fetching user bookings:', err);
          }
        }
        
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
        setLoadingBookings(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);  

  const handleBookNow = (event) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events` } });
      return;
    }
    
    
    if (hasBookedEvent(event._id)) {
      toast.info('You have already booked this event');
      return;
    }
    
    setSelectedEvent(event);
    setShowBookingForm(true);
  };

  const handleBookingSuccess = async () => {
    try {

      toast.success('Event booked successfully!');
      

      const [eventsData, bookingsData] = await Promise.all([
        getEvents(),
        isAuthenticated ? getMyBookings() : Promise.resolve({ data: [] })
      ]);
      
      setEvents(eventsData.data || []);
      
      if (isAuthenticated) {
        setMyBookings(bookingsData.data || []);
      }
      
  
      setShowBookingForm(false);
      setSelectedEvent(null);
      
    } catch (err) {
      console.error('Error refreshing data after booking:', err);
  
      toast.success('Event booked successfully!');
      setShowBookingForm(false);
      setSelectedEvent(null);
    }
  };


  const hasBookedEvent = (eventId) => {
    if (!isAuthenticated) return false;
    return myBookings.some(booking => 
      booking.event?._id === eventId && booking.status === 'confirmed'
    );
  };


  useEffect(() => {
    if (isAuthenticated) {
      const fetchBookings = async () => {
        try {
          const bookingsData = await getMyBookings();
          setMyBookings(bookingsData.data || []);
        } catch (err) {
          console.error('Error fetching user bookings:', err);
        }
      };
      fetchBookings();
    } else {
      setMyBookings([]);
    }
  }, [isAuthenticated]);

  if (loading || (isAuthenticated && loadingBookings)) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading events...</p>
      </div>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="mb-2 display-5 fw-bold">Upcoming Events</h1>
          <p className="text-muted mb-0">Discover and book your next experience</p>
        </div>
        {isAuthenticated && userRole === 'admin' && (
          <Button 
            as={Link} 
            to="/admin/events/create" 
            variant="primary"
            className="px-4 py-2"
          >
            + Create Event
          </Button>
        )}
      </div>
      
      {error && (
        <Alert variant="danger" className="border-0 shadow-sm">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </Alert>
      )}
      
      {events.length === 0 ? (
        <div className="text-center py-5 my-5">
          <div className="mb-4">
            <i className="bi bi-calendar-x" style={{ fontSize: '4rem', color: '#e9ecef' }}></i>
          </div>
          <h3 className="mb-2">No Events Found</h3>
          <p className="text-muted mb-4">There are no upcoming events at the moment. Please check back later!</p>
          {isAuthenticated && userRole === 'admin' && (
            <Button as={Link} to="/admin/events/create" variant="outline-primary">
              Create Your First Event
            </Button>
          )}
        </div>
      ) : (
        <div className="row g-4">
          {events.map((event) => (
            <div key={event._id} className="col-md-6 col-lg-4">
              <Card className="h-100 shadow-sm border-0 overflow-hidden event-card">
                <Card.Body className="d-flex flex-column">
                  <div className="mb-3">
                    <div className="d-flex align-items-start mb-2">
                      <div className="event-date-badge me-3">
                        <span className="month">{new Date(event.dateTime).toLocaleString('default', { month: 'short' })}</span>
                        <span className="day">{new Date(event.dateTime).getDate()}</span>
                      </div>
                      <div className="flex-grow-1">
                        <h3 className="mb-0">{event.title}</h3>
                        <div className="event-status-badges mt-1">
                          {event.availableSeats <= 0 && !hasBookedEvent(event._id) && (
                            <Badge bg="danger" className="me-1">
                              <i className="bi bi-tag-fill me-1"></i> Sold Out
                            </Badge>
                          )}
                          {hasBookedEvent(event._id) && (
                            <Badge bg="success">
                              <i className="bi bi-check-circle-fill me-1"></i> Booked
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-muted mb-3">
                      {event.description?.substring(0, 120)}{event.description?.length > 120 ? '...' : ''}
                    </p>
                  </div>
                  
                  <div className="event-details mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-calendar3 text-primary me-2"></i>
                      <span>{new Date(event.dateTime).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-clock text-primary me-2"></i>
                      <span>{new Date(event.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-geo-alt text-primary me-2"></i>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-people text-primary me-2"></i>
                        <span className={event.availableSeats > 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                          {event.availableSeats} / {event.totalSeats} seats
                        </span>
                      </div>
                      <div>
                        {event.availableSeats / event.totalSeats < 0.3 && event.availableSeats > 0 && (
                          <Badge bg="warning" text="dark">
                            Selling Fast!
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      variant={hasBookedEvent(event._id) ? 'outline-success' : (event.availableSeats > 0 ? 'primary' : 'outline-secondary')}
                      className={`w-100 py-2 ${event.availableSeats > 0 && !hasBookedEvent(event._id) ? 'btn-hover-scale' : ''}`}
                      onClick={() => handleBookNow(event)}
                      disabled={event.availableSeats <= 0 || hasBookedEvent(event._id)}
                    >
                      {hasBookedEvent(event._id) ? (
                        <>
                          <i className="bi bi-check-circle-fill me-2"></i>
                          Already Booked
                        </>
                      ) : event.availableSeats > 0 ? (
                        <>
                          {isAuthenticated ? 'Book Now' : 'Login to Book'}
                          <i className="bi bi-arrow-right ms-2"></i>
                        </>
                      ) : (
                        'Sold Out'
                      )}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
      {selectedEvent && (
        <BookingForm
          show={showBookingForm}
          onHide={() => setShowBookingForm(false)}
          event={selectedEvent}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
      
      <style jsx global>{`n        .event-card {
          transition: all 0.3s ease;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .event-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
        }
        
        .event-date-badge {
          background: #f8f9ff;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 6px 10px;
          text-align: center;
          min-width: 50px;
          flex-shrink: 0;
        }
        
        .event-date-badge .month {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: #4361ee;
          text-transform: uppercase;
          line-height: 1;
        }
        
        .event-date-badge .day {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1;
        }
        
        .event-status-badges {
          position: absolute;
          top: 15px;
          right: 15px;
          z-index: 1;
        }
        
        .event-details {
          background: #f8f9ff;
          border-radius: 10px;
          padding: 15px;
        }
        
        .event-details svg {
          min-width: 20px;
        }
        
        .btn-hover-scale {
          transition: all 0.3s ease;
        }
        
        .btn-hover-scale:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3) !important;
        }
      `}</style>
    </Container>
  );
};

export default EventsList;
