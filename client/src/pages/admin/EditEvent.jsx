import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { getEvent, updateEvent } from '../../services/eventService';
import { toast } from 'react-toastify';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    totalSeats: 100,
    availableSeats: 100,
    image: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await getEvent(id);
        const event = response.data;
        const eventDate = new Date(event.dateTime);
        
        setFormData({
          title: event.title,
          description: event.description,
          date: eventDate.toISOString().split('T')[0],
          time: eventDate.toTimeString().slice(0, 5),
          location: event.location,
          totalSeats: event.totalSeats,
          availableSeats: event.availableSeats,
          image: event.image || ''
        });
      } catch (err) {
        setError('Failed to load event. Please try again.');
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

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
    
    if (parseInt(formData.availableSeats) > parseInt(formData.totalSeats)) {
      setError('Available seats cannot be greater than total seats');
      return;
    }
    
    setSubmitting(true);

    try {
    
      const eventData = {
        title: formData.title,
        description: formData.description,
        dateTime: new Date(`${formData.date}T${formData.time}`).toISOString(),
        location: formData.location,
        totalSeats: parseInt(formData.totalSeats),
        availableSeats: parseInt(formData.availableSeats),
        image: formData.image || undefined
      };

      await updateEvent(id, eventData);
      toast.success('Event updated successfully');
      navigate('/admin/events');
    } catch (err) {
      setError(err.message || 'Failed to update event. Please try again.');
      console.error('Error updating event:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Edit Event</h1>
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
          Back to Events
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Event Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter event title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Enter event description"
              />
            </Form.Group>

            <div className="row">
              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Time</Form.Label>
                <Form.Control
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Enter event location"
              />
            </Form.Group>

            <div className="row">
              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Total Seats</Form.Label>
                <Form.Control
                  type="number"
                  name="totalSeats"
                  min="1"
                  value={formData.totalSeats}
                  onChange={handleChange}
                  required
                />
              </Form.Group>


              <Form.Group className="col-md-6 mb-3">
                <Form.Label>Available Seats</Form.Label>
                <Form.Control
                  type="number"
                  name="availableSeats"
                  min="0"
                  max={formData.totalSeats}
                  value={formData.availableSeats}
                  onChange={handleChange}
                  required
                />
                <Form.Text className="text-muted">
                  Must be less than or equal to total seats
                </Form.Text>
              </Form.Group>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Image URL (Optional)</Form.Label>
              <Form.Control
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button 
                type="submit" 
                variant="primary" 
                size="lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Updating Event...
                  </>
                ) : 'Update Event'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditEvent;
