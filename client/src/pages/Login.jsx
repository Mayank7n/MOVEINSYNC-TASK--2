import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { login } from '../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password, role } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await login(email, password, role);
      
      if (res && res.token) {
        
        const { token, role: userRole } = res;
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', userRole);
        
  
        navigate('/events');
      } else {
        throw new Error('No token received');
      }
    } catch (err) {
      
      setError(err.message);
      
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light align-items-center justify-content-center p-3">
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <Card className="shadow-sm">
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <h2>Login</h2>
              <p className="text-muted">Welcome back! Please enter your details.</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={onSubmit}>
              <Form.Group className="mb-3">
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

              <Form.Group className="mb-3">
                <div className="d-flex justify-content-between">
                  <Form.Label>Password</Form.Label>
                  <a href="/forgot-password" className="text-decoration-none">
                    Forgot password?
                  </a>
                </div>
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
                <Form.Label>Login As</Form.Label>
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
                    Signing in...
                  </>
                ) : (
                  `Sign in as ${role === 'admin' ? 'Admin' : 'User'}`
                )}
              </Button>


              <div className="text-center mt-3">
                <span className="text-muted">Don't have an account? </span>
                <Link to="/register" className="text-decoration-none">
                  Sign up
                </Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Login;
