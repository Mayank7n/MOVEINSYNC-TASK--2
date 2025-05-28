import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import EventsList from './pages/events/EventsList';
import CreateEvent from './pages/events/CreateEvent';
import AdminEventsList from './pages/admin/AdminEventsList';
import EditEvent from './pages/admin/EditEvent';
import MyBookings from './pages/user/MyBookings';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Navbar from './components/Navbar';

const UserDashboard = () => <div className="container mt-5"><h1>User Dashboard</h1></div>;
const AdminDashboard = () => <div className="container mt-5"><h1>Admin Dashboard</h1></div>;
const Unauthorized = () => <div className="container mt-5"><h1>Unauthorized Access</h1></div>;

function App() {
  return (
    <Router>
      <Layout>
        <Navbar />
        <main className="py-4">
          <Routes>
            <Route path="/" element={<EventsList />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/bookings" element={<MyBookings />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/events" element={<AdminEventsList />} />
              <Route path="/admin/events/create" element={<CreateEvent />} />
              <Route path="/admin/events/edit/:id" element={<EditEvent />} />
            </Route>
          </Routes>
        </main>
      </Layout>
    </Router>
  );
}

export default App;
