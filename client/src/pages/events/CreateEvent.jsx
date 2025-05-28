import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { createEvent } from '../../services/eventService';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaArrowLeft } from 'react-icons/fa';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    totalSeats: 100,
    availableSeats: 100
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate available seats is not greater than total seats
    if (parseInt(formData.availableSeats) > parseInt(formData.totalSeats)) {
      setError('Available seats cannot be greater than total seats');
      return;
    }
    
    setLoading(true);

    try {
      // Combine date and time for the event
      const eventData = {
        title: formData.title,
        description: formData.description,
        dateTime: new Date(`${formData.date}T${formData.time}`).toISOString(),
        location: formData.location,
        totalSeats: parseInt(formData.totalSeats),
        availableSeats: parseInt(formData.availableSeats),
        image: formData.image || undefined
      };

      await createEvent(eventData);
      navigate('/events', { state: { message: 'Event created successfully!' } });
    } catch (err) {
      setError(err.message || 'Failed to create event. Please try again.');
      console.error('Error creating event:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <div className="mb-4">
        <Button 
          variant="light" 
          onClick={() => navigate(-1)}
          className="mb-3 d-flex align-items-center"
        >
          <FaArrowLeft className="me-2" /> Back to Events
        </Button>
        <h1 className="fw-bold text-primary">Create New Event</h1>
        <p className="text-muted">Fill in the details below to create a new event</p>
      </div>

      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-4">
              {error && <Alert variant="danger" className="border-0">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Event Title</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter event title"
                        className="form-control-lg border-2"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        placeholder="Enter event description"
                        className="border-2"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold"><FaCalendarAlt className="me-2" />Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="border-2"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold"><FaClock className="me-2" />Time</Form.Label>
                      <Form.Control
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                        className="border-2"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="fw-bold"><FaMapMarkerAlt className="me-2" />Location</Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        placeholder="Enter event location"
                        className="border-2"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold"><FaUsers className="me-2" />Total Seats</Form.Label>
                      <Form.Control
                        type="number"
                        name="totalSeats"
                        min="1"
                        value={formData.totalSeats}
                        onChange={handleChange}
                        required
                        className="border-2"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold"><FaUsers className="me-2" />Available Seats</Form.Label>
                      <Form.Control
                        type="number"
                        name="availableSeats"
                        min="0"
                        max={formData.totalSeats}
                        value={formData.availableSeats}
                        onChange={handleChange}
                        required
                        className="border-2"
                      />
                      <small className="text-muted">
                        Must be less than or equal to total seats
                      </small>
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="d-grid mt-4">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    disabled={loading}
                    className="py-3 fw-bold"
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
                        Creating Event...
                      </>
                    ) : 'Create Event'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateEvent;
