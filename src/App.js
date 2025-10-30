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
  
  return (
    <Router>
      <Header/>
      <Routes>
        {/* Home Route */}
        <Route path="/" element={<Home />} />

        {/* Loan Route (Protected) */}
        <Route
          path="/userloan"
          element={<MyLoan />}
        />

        <Route
          path="/userloan/:userId"
          element={<MyLoan />}
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
