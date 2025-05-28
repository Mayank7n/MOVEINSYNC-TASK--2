import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Navbar as BsNavbar, Nav, Container, NavDropdown } from 'react-bootstrap';
// Icons are now imported from react-bootstrap via CSS

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName') || 'User';

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setExpanded(false);
    navigate('/login');
  };

  const closeNavbar = () => setExpanded(false);

  return (
    <BsNavbar 
      expand="lg" 
      expanded={expanded}
      className={`fixed-top ${scrolled ? 'navbar-scrolled' : ''}`}
      variant="light"
    >
      <Container>
        <BsNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <span className="gradient-text fw-bold">EventFlow</span>
        </BsNavbar.Brand>
        
        <BsNavbar.Toggle 
          aria-controls="basic-navbar-nav" 
          onClick={() => setExpanded(expanded ? false : true)}
        />
        
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link 
              as={Link} 
              to="/events" 
              onClick={closeNavbar}
              className={`mx-2 nav-link-hover ${location.pathname === '/events' ? 'active' : ''}`}
            >
              <i className="bi bi-calendar-event me-1"></i> Events
            </Nav.Link>
            
            {isAuthenticated && userRole === 'admin' && (
              <Nav.Link 
                as={Link} 
                to="/admin/events" 
                onClick={closeNavbar}
                className={`mx-2 nav-link-hover ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
              >
                <i className="bi bi-gear me-1"></i> Manage Events
              </Nav.Link>
            )}
            
            {isAuthenticated && (
              <Nav.Link 
                as={Link} 
                to="/user/bookings" 
                onClick={closeNavbar}
                className={`mx-2 nav-link-hover ${location.pathname.startsWith('/user') ? 'active' : ''}`}
              >
                <i className="bi bi-list-check me-1"></i> My Bookings
              </Nav.Link>
            )}
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <div className="d-flex align-items-center">
                <NavDropdown
                  title={
                    <div className="d-flex align-items-center">
                      <i className="bi bi-person-circle me-1"></i>
                      <span>{userName}</span>
                    </div>
                  }
                  id="user-dropdown"
                  align="end"
                  className="user-dropdown"
                >
                  <NavDropdown.Item 
                    onClick={() => {
                      closeNavbar();
                      handleLogout();
                    }}
                    className="text-danger d-flex align-items-center"
                  >
                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </div>
            ) : (
              <div className="d-flex">
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="outline-primary" 
                  className="me-2"
                  onClick={closeNavbar}
                >
                  Login
                </Button>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="primary"
                  className="px-4"
                  onClick={closeNavbar}
                >
                  Get Started
                </Button>
              </div>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;

// Add these styles to your App.css
const additionalStyles = `
  /* Navbar Styles */
  .navbar {
    transition: all 0.3s ease;
    padding: 0.8rem 0;
  }
  
  .navbar-scrolled {
    background: rgba(255, 255, 255, 0.98) !important;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1) !important;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 0.5rem 0;
  }
  
  .gradient-text {
    background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 800;
    font-size: 1.8rem;
    letter-spacing: -0.5px;
  }
  
  .nav-link-hover {
    position: relative;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.3s ease;
  }
  
  .nav-link-hover:not(.active):hover {
    background: rgba(67, 97, 238, 0.1);
    transform: translateY(-2px);
  }
  
  .nav-link-hover.active {
    color: #4361ee !important;
    font-weight: 600;
  }
  
  .nav-link-hover.active::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 5px;
    height: 5px;
    background: #4361ee;
    border-radius: 50%;
  }
  
  .user-dropdown .dropdown-toggle::after {
    display: none;
  }
  
  .user-dropdown .dropdown-menu {
    border: none;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    padding: 0.5rem 0;
    margin-top: 10px;
  }
  
  .user-dropdown .dropdown-item {
    padding: 0.5rem 1.5rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .user-dropdown .dropdown-item:hover {
    background: rgba(67, 97, 238, 0.1);
    color: #4361ee;
    transform: translateX(5px);
  }
`;

// Add styles to the document
const styleElement = document.createElement('style');
styleElement.textContent = additionalStyles;
document.head.appendChild(styleElement);
