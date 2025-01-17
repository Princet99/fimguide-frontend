import React, { useState } from "react";
import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
const Header = ({ isLoggedIn, handleLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const username = sessionStorage.getItem("username");
  const handleLoginLogout = () => {
    if (isLoggedIn) {
      handleLogout(); // Call the logout function
      navigate("/"); // Redirect to home
    } else {
      navigate("/Login"); // Redirect to login page
    }
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  return (
    <nav className="navbar navbar-expand-lg shadow">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <img
            src="/logo.png"
            alt="FIM_LOAN"
            style={{ width: "100px", height: "auto" }}
          />
        </Link>
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          <li className="nav-item">
            <Link className="nav-link active" aria-current="page" to="/loan">
              My Loan
            </Link>
          </li>
        </ul>
        {/* Dynamic Login/Logout Link */}
        <nav>
          {isLoggedIn && (
            <div style={{ position: "relative", display: "inline-block" }}>
              <span onClick={toggleDropdown} style={{ cursor: "pointer" }}>
                Hello {username}
              </span>
              {showDropdown && (
                <div style={{ position: "absolute", top: "100%", left: 0 }}>
                  <button onClick={handleLoginLogout}>Logout</button>
                </div>
              )}
            </div>
          )}
          {!isLoggedIn && <button onClick={handleLoginLogout}>Login</button>}
        </nav>
      </div>
    </nav>
  );
};

export default Header;
