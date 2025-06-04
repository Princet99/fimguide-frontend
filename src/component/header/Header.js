import React from "react";
import "./Header.css";
import ProfileCard from "./ProfileCard";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "react-toastify";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect, logout, user, isLoading } =
    useAuth0();

  const handleAuth0Login = async () => {
    try {
      await loginWithRedirect();
    } catch (error) {
      console.error("Auth0 login error:", error);
      toast.error("Failed to redirect to Auth0 login.");
    }
  };

  // New signup handler using Auth0 screen_hint
  const handleAuth0SignUp = async () => {
    try {
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: "signup",
        },
      });
    } catch (error) {
      console.error("Auth0 signup error:", error);
      toast.error("Failed to redirect to Auth0 signup.");
    }
  };

  const handleAuth0Logout = () => {
    try {
      logout({ returnTo: window.location.origin }); // Redirect to home page after logout
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Auth0 logout error:", error);
      toast.error("Failed to logout.");
    }
  };

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
              Dashboard
            </Link>
          </li>
        </ul>
        <nav>
          <ProfileCard
            isLoggedIn={isAuthenticated}
            userName={user?.name}
            profilePic={user?.picture}
            onLogin={handleAuth0Login}
            onSignUp={handleAuth0SignUp} // passed signup handler
            onLogout={handleAuth0Logout}
          />
        </nav>
      </div>
    </nav>
  );
};

export default Header;
