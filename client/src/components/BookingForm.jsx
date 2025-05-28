import { useState } from 'react';
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { bookEvent } from '../services/bookingService';
import { toast } from 'react-toastify';

const BookingForm = ({ show, onHide, event, onBookingSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    numberOfTickets: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticketError, setTicketError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'numberOfTickets') {
      const numTickets = parseInt(value, 10);
      if (isNaN(numTickets) || numTickets < 1) {
        setTicketError('Number of tickets must be at least 1');
      } else if (numTickets > event.availableSeats) {
        setTicketError(`Only ${event.availableSeats} seats available`);
      } else {
        setTicketError('');
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous errors
    setError('');
    
    if (!formData.name || !formData.email || !formData.phone) {
      const missingFields = [];
      if (!formData.name) missingFields.push('name');
      if (!formData.email) missingFields.push('email');
      if (!formData.phone) missingFields.push('phone');
      
      console.error('Form validation failed - missing fields:', missingFields);
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    if (ticketError) {
      console.error('Ticket validation error:', ticketError);
      setError(ticketError);
      return;
    }
    
    setLoading(true);
    setError('');
    
    console.log('Submitting booking with data:', {
      eventId: event._id,
      ...formData,
      numberOfTickets: parseInt(formData.numberOfTickets, 10)
    });
    
    try {
      console.log('Starting booking process...');
      console.log('Event ID:', event._id);
      
      const result = await bookEvent(event._id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        numberOfTickets: parseInt(formData.numberOfTickets, 10)
      });
      
      console.log('Booking API result:', result);
      
      if (result.success) {
        console.log('Booking successful!', result.data);
        const successMessage = result.message || `Successfully booked ${formData.numberOfTickets} ticket(s) for ${event.title}!`;
        toast.success(successMessage);
        
        setFormData({
          name: '',
          email: '',
          phone: '',
          numberOfTickets: 1
        });
        
        if (typeof onBookingSuccess === 'function') {
          try {
            await onBookingSuccess();
          } catch (refreshError) {
            console.error('Error refreshing events:', refreshError);
          }
        }
        
        onHide();
      } else {
        console.error('Booking failed:', result.message);
        setError(result.message || 'Failed to book event. Please try again.');
      }
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      
      // Get the error message
      const errorMessage = error.message || 'Failed to book event. Please try again.';
      
      console.log('Setting error message:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Book Tickets - {event?.title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert 
              variant="danger" 
              className="mt-3" 
              onClose={() => setError('')} 
              dismissible
              style={{ whiteSpace: 'pre-line' }}
            >
              {error}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Full Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Email *</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Phone Number *</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Number of Tickets *</Form.Label>
            <Form.Control
              type="number"
              name="numberOfTickets"
              min="1"
              max={event?.availableSeats}
              value={formData.numberOfTickets}
              onChange={handleChange}
              isInvalid={!!ticketError}
              required
            />
            {ticketError && (
              <Form.Control.Feedback type="invalid">
                {ticketError}
              </Form.Control.Feedback>
            )}
            <Form.Text className="text-muted">
              {event?.availableSeats} seats available
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading || !!ticketError}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Processing...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default BookingForm;
