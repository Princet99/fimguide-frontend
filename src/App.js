import "./App.css";
import React, { useState } from "react";
import Home from "./component/Home";
import Header from "./component/header/Header";
import Login from "./component/login/login";
import MyLoan from "./component/myloan/MyLoan";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  const { logout } = useAuth0(); // Get Auth0 logout function
  
  const handleLogout = () => {
    console.log("App.js: handleLogout called");
    setIsLoggedIn(false);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("access_token");
    logout({
      returnTo: window.location.origin, // Make sure to return to the right page
    });
    // sessionStorage.removeItem("userId"); // Clear user ID from session
    setIsLoggedIn(false); // Set login state to false
    toast.success("Logged out successfully!");
  };
  
  return (
    <Router>
      <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} user={user} />
      <Routes>
        {/* Home Route */}
        <Route path="/" element={<Home />} />

        {/* Loan Route (Protected) */}
        <Route
          path="/loan"
          element={isLoggedIn ? <MyLoan /> : <Navigate to="/login" />}
        />

        {/* Login Route */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/loan" />
            ) : (
              <Login setIsLoggedIn={setIsLoggedIn} setUser={setUser} />
            )
          }
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
