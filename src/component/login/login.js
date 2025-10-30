// Login.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import "./login.css";

const Login = () => {
  const login = () => {
    return `https://www.google.com/`;
  };

  function authCallback() {}

  function authLogout() {}

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <div className="login-container">
      <div>
        <h3>Hello, </h3>
        <button className="login-btn">Logout</button>
      </div>
      <button onClick={login} className="login-btn">
        Login
      </button>
    </div>
  );
};

export default Login;
