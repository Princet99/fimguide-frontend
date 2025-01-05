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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!sessionStorage.getItem("userId") // Initialize based on session
  );

  const handleLogout = () => {
    sessionStorage.removeItem("userId"); // Clear user ID from session
    setIsLoggedIn(false); // Set login state to false
    toast.success("Logged out successfully!");
  };

  return (
    <Router>
      <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
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
              <Login setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
