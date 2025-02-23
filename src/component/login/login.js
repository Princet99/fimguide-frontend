// Login.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth0 } from "@auth0/auth0-react";
import "./login.css";

const Login = ({ setIsLoggedIn, setUser }) => {
  const {
    isAuthenticated,
    user,
    loginWithRedirect,
    logout,
    isLoading,
    getAccessTokenSilently,
  } = useAuth0();

  const navigate = useNavigate();

  const handleAuth0Login = async () => {
    try {
      loginWithRedirect();
    } catch (error) {
      console.error("Auth0 login error:", error);
      toast.error("Failed to redirect to Auth0 login.");
    }
  };

  useEffect(() => {
    const fetchAccessToken = async () => {
      if (isAuthenticated) {
        try {
          const accessToken = await getAccessTokenSilently();

          sessionStorage.setItem("user", JSON.stringify(user));
          sessionStorage.setItem("access_token", accessToken);

          setIsLoggedIn(true);
          navigate("/loan");
        } catch (error) {
          console.error("Error getting access token:", error);
          toast.error("Failed to retrieve access token.");
        }
      }
    };

    fetchAccessToken();
  }, [isAuthenticated, navigate, user, setIsLoggedIn, getAccessTokenSilently]);

  const handleLogout = () => {
    console.log("Login.js: handleLogout called");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("access_token");
    setIsLoggedIn(false);
    logout({
      returnTo: window.location.origin,
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="login-container">
      <h2>Login</h2>
      {isAuthenticated ? (
        <div>
          <h3>Hello, {user?.name}</h3>
          <button onClick={handleLogout} className="login-btn">
            Logout
          </button>
        </div>
      ) : (
        <button onClick={handleAuth0Login} className="login-btn">
          Login with Auth0
        </button>
      )}
    </div>
  );
};

export default Login;
