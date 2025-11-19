// src/components/ProfileCard.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import SettingsModal from "./settingsModal";

const API = process.env.REACT_APP_DEV_URL;

// Redirect to login
const devauthlogin = () => {
  window.location.href = `${API}auth-login`;
};

// Redirect to logout
const devauthlogout = () => {
  window.location.href = `${API}auth-logout`;
};

const ProfileCard = () => {
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [auth, setAuth] = useState({
    isLoggedIn: false,
    userName: "",
    profilePic: "",
  });

  const profileCardRef = useRef(null);

  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

  // =============================
  //   FETCH USER PROFILE (Axios)
  // =============================
  const loadUser = async () => {
    try {
      const res = await axios.get(`${API}userprofile`, {
        withCredentials: true,
      });

      const data = res.data;

      if (data.message === "success") {
        setAuth({
          isLoggedIn: true,
          userName: data.user?.name || "User",
          profilePic: data.user?.picture || "",
        });
      } else {
        setAuth({
          isLoggedIn: false,
          userName: "",
          profilePic: "",
        });
      }
    } catch (err) {
      console.error("Profile load error:", err);
      setAuth({
        isLoggedIn: false,
        userName: "",
        profilePic: "",
      });
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <div style={{ position: "relative" }} ref={profileCardRef}>
      {/* =============================
          Not Logged In → Login + Signup
      ============================= */}
      {!auth.isLoggedIn && (
        <div style={{ display: "flex", gap: "8px" }}>
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
          >
            Signup
          </button>
        </div>
      )}

      {/* =============================
          Logged In → Profile Icon
      ============================= */}
      {auth.isLoggedIn && (
        <img
          src={auth.profilePic || ""}
          alt="Profile"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            cursor: "pointer",
          }}
          onClick={() => setIsProfileCardOpen((prev) => !prev)}
        />
      )}

      {/* =============================
          Profile Dropdown
      ============================= */}
      {auth.isLoggedIn && isProfileCardOpen && (
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
              src={auth.profilePic || ""}
              alt=""
              style={{ width: "60px", height: "60px", borderRadius: "50%" }}
            />
            <p style={{ margin: "8px 0 0", fontWeight: "bold" }}>
              {auth.userName}
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
        <SettingsModal onClose={closeSettingsModal} userName={auth.userName} />
      )}
    </div>
  );
};

export default ProfileCard;
