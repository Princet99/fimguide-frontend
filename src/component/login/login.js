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
      await loginWithRedirect({
        appState: { returnTo: "/loan" },
      });
    } catch (error) {
      toast.error("Failed to redirect to Auth0 login.");
    }
  };
  useEffect(() => {
    const fetchAccessToken = async () => {
      if (isLoading) return;

      if (isAuthenticated) {
        try {
          const accessToken = await getAccessTokenSilently();
          localStorage.setItem("access_token", accessToken);
          localStorage.setItem("user", JSON.stringify(user));
          setIsLoggedIn(true);

          // Prevent repeated redirects
          if (window.location.pathname === "/login") {
            navigate("/loan");
          }
        } catch (error) {
          console.error("Error getting access token:", error);
          toast.error("Failed to retrieve access token.");
        }
      }
    };

    fetchAccessToken();
  }, [
    isAuthenticated,
    isLoading,
    navigate,
    user,
    setIsLoggedIn,
    getAccessTokenSilently,
  ]);

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="login-container">
      {isAuthenticated ? (
        <div>
          <h3>Hello, {user?.name}</h3>
          <button onClick={handleLogout} className="login-btn">
            Logout
          </button>
        </div>
      ) : (
        <button onClick={handleAuth0Login} className="login-btn">
          Login
        </button>
      )}
    </div>
  );
};

export default Login;
