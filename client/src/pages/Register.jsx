import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Card, Alert } from "react-bootstrap";
import axios from '../utils/axiosConfig';
import "../App.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    role: 'user' // Default role is user
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { name, email, password, password2, role } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (password !== password2) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5000/api/v1/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (res.data && res.data.token) {
        // Show success message and redirect to login
        alert('Registration successful! Please login with your credentials.');
        navigate('/login');
      } else {
        throw new Error('Registration failed - no token received');
      }
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Card className="shadow-sm">
          <Card.Body className="p-4">
            {error ? (
              <Alert variant="danger" className="mb-4">
                {error}
              </Alert>
            ) : (
              <div className="text-center mb-4">
                <h2>Create an account</h2>
                <p className="text-muted">Join us today! It takes only a few steps</p>
              </div>
            )}

            <Form onSubmit={onSubmit}>
              <Form.Group className="mb-4">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Your Name"
                  name="name"
                  value={name}
                  onChange={onChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm password"
                  name="password2"
                  value={password2}
                  onChange={onChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Register As</Form.Label>
                <div className="d-flex gap-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="role"
                      id="userRole"
                      value="user"
                      checked={role === 'user'}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="userRole">
                      User
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="role"
                      id="adminRole"
                      value="admin"
                      checked={role === 'admin'}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="adminRole">
                      Admin
                    </label>
                  </div>
                </div>
              </Form.Group>

              <Button 
                type="submit" 
                variant="primary" 
                className="w-100 mb-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="text-center mt-3">
                <span className="text-muted">Already have an account? </span>
                <Link to="/login" className="text-decoration-none">
                  Sign in
                </Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Register;
