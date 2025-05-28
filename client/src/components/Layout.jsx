import PropTypes from 'prop-types';

const Layout = ({ children }) => {
  return (
    <div className="min-vh-100 d-flex flex-column">
      {children}
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
