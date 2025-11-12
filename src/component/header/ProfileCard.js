// src/components/ProfileCard.jsx
import { useState, useRef } from "react";
import SettingsModal from "./settingsModal"; // Import the new SettingsModal component

const devauthlogin = () => {
  window.location.href = `https://api.fimdreams.com/dev-auth-login`;
};

const devauthlogout = () => {
  window.location.href = `https://api.fimdreams.com/dev-auth-logout`;
};

const ProfileCard = () => {
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const profileCardRef = useRef(null);

  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

  return (
    <div style={{ position: "relative" }} ref={profileCardRef}>
      {/* Profile Icon / Login Buttons */}
      <div style={{ display: "flex", gap: "8px", cursor: "pointer" }}>
        <img
          src=""
          alt="Profile"
          style={{ width: "40px", height: "40px", borderRadius: "50%" }}
          onClick={() => setIsProfileCardOpen((prev) => !prev)}
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
            onClick={() => console.log("Signup")}
          >
            Signup
          </button>
        </>
      </div>

      {/* Profile Card */}
      {isProfileCardOpen && (
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
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <img
              src={"profilePic"}
              alt=""
              style={{ width: "60px", height: "60px", borderRadius: "50%" }}
            />
            <p style={{ margin: "8px 0 0", fontWeight: "bold" }}>
              {"userName"}
            </p>
          </div>

          <button
            onClick={openSettingsModal}
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
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <SettingsModal onClose={closeSettingsModal} userName={"userName"} />
      )}
    </div>
  );
};

export default ProfileCard;
