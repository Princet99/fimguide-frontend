import React, { useState, useRef, useEffect } from "react";

const ProfileCard = ({
  isLoggedIn,
  userName,
  profilePic,
  onLogin,
  onSignUp,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const profileCardRef = useRef(null);

  // Close the card when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileCardRef.current &&
        !profileCardRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleCard = () => {
    if (isLoggedIn) {
      setIsOpen(!isOpen);
    }
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
            onClick={toggleCard}
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
      {isLoggedIn && isOpen && (
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
              alt="Profile"
              style={{ width: "60px", height: "60px", borderRadius: "50%" }}
            />
            <p style={{ margin: "8px 0 0", fontWeight: "bold" }}>{userName}</p>
          </div>

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
    </div>
  );
};

export default ProfileCard;
