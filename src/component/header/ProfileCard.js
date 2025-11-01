// src/components/ProfileCard.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import SettingsModal from "./settingsModal"; // Import the new SettingsModal component

const devauthlogin = () => {
  window.location.href = `http://api.fimdreams.com/dev-auth-login`;
};

const devauthcallback = () => {};

const devauthlogout = () => {};

const ProfileCard = () => {
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // New state for settings modal
  const profileCardRef = useRef(null);

  return (
    <div style={{ position: "relative" }} ref={profileCardRef}>
      {/* Profile Icon or Login/Signup Buttons */}
      <div style={{ display: "flex", gap: "8px", cursor: "pointer" }}>
        <img
          src=""
          alt="Profile"
          style={{ width: "40px", height: "40px", borderRadius: "50%" }}
          onClick={""}
        />
        <>
          <button
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={devauthlogin}
          >
            Login
          </button>
          <button
            style={{
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            onClick={""}
          >
            Signup
          </button>
        </>
      </div>

      {/* Profile Card (only visible when logged in and expanded) */}
      
        <div
          style={{
            position: "absolute",
            top: "50px",
            right: "0",
            backgroundColor: "#fff",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            borderRadius: "8px",
            padding: "16px",
            width: "200px",
            zIndex: 1000,
          }}
        >
          {/* User Info */}
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <img
              src={"profilePic"}
              alt=""
              style={{ width: "60px", height: "60px", borderRadius: "50%" }}
            />
            <p style={{ margin: "8px 0 0", fontWeight: "bold" }}>{"userName"}</p>
          </div>

          {/* Settings Button */}
          <button
            onClick={"openSettingsModal"} // New handler to open settings
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "#6c757d",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "8px",
            }}
          >
            Settings
          </button>

          {/* Logout Button */}
          <button
            onClick={devauthlogout}
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "#ff4444",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <SettingsModal onClose={"closeSettingsModal"} userName={"userName"} />
      )}
    </div>
  );
};

export default ProfileCard;
