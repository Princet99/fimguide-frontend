// src/components/ProfileCard.jsx
import React, { useState, useRef, useEffect } from "react";
import SettingsModal from "./settingsModal"; // Import the new SettingsModal component

const ProfileCard = ({
  isLoggedIn,
  userName,
  profilePic,
  onLogin,
  onSignUp,
  onLogout,
}) => {
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // New state for settings modal
  const profileCardRef = useRef(null);

  // Close the profile card when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileCardRef.current &&
        !profileCardRef.current.contains(event.target) &&
        !isSettingsModalOpen // Don't close if settings modal is open
      ) {
        setIsProfileCardOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSettingsModalOpen]); // Depend on isSettingsModalOpen to prevent premature closing

  const toggleProfileCard = () => {
    if (isLoggedIn) {
      setIsProfileCardOpen(!isProfileCardOpen);
    }
  };

  const openSettingsModal = () => {
    setIsSettingsModalOpen(true);
    setIsProfileCardOpen(false); // Close the profile card when opening settings
  };

  const closeSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };

  return (
    <div style={{ position: "relative" }} ref={profileCardRef}>
      {/* Profile Icon or Login/Signup Buttons */}
      <div style={{ display: "flex", gap: "8px", cursor: "pointer" }}>
        {isLoggedIn ? (
          <img
            src={profilePic}
            alt="Profile"
            style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            onClick={toggleProfileCard}
          />
        ) : (
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
              onClick={onLogin}
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
              onClick={onSignUp}
            >
              Signup
            </button>
          </>
        )}
      </div>

      {/* Profile Card (only visible when logged in and expanded) */}
      {isLoggedIn && isProfileCardOpen && (
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
              src={profilePic}
              alt=""
              style={{ width: "60px", height: "60px", borderRadius: "50%" }}
            />
            <p style={{ margin: "8px 0 0", fontWeight: "bold" }}>{userName}</p>
          </div>

          {/* Settings Button */}
          <button
            onClick={openSettingsModal} // New handler to open settings
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
            onClick={onLogout}
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
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <SettingsModal onClose={closeSettingsModal} userName={userName} />
      )}
    </div>
  );
};

export default ProfileCard;
