import React from "react";
import "./Header.css";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ isLoggedIn, handleLogout }) => {
  const navigate = useNavigate();

  const handleLoginLogout = () => {
    if (isLoggedIn) {
      handleLogout(); // Call the logout function
      navigate("/"); // Redirect to home
    } else {
      navigate("/Login"); // Redirect to login page
    }
  };

  return (
    <nav className="navbar navbar-expand-lg shadow">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          FIM_LOAN
        </Link>
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link className="nav-link active" aria-current="page" to="/loan">
              My_loan
            </Link>
          </li>
        </ul>
        {/* Dynamic Login/Logout Link */}
        <button
          className="btn btn-link nav-link active"
          onClick={handleLoginLogout}
        >
          {isLoggedIn ? "Logout" : "Login"}
        </button>
      </div>
    </nav>
  );
};

export default Header;
