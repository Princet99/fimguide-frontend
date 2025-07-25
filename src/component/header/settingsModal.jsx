// src/components/SettingsModal.jsx
import { useState, useEffect, useRef } from "react";
import AccountSettings from "./Settings/AccountSettings";
import NotificationSettings from "./Settings/NotificationSettings";
import DocumentViewSettings from "./Settings/DocumentViewSettings";
import SettingsSidebar from "./Settings/SettingsSidebar";

const SettingsModal = ({ onClose, userName }) => {
  const [activeSection, setActiveSection] = useState("account"); // Default active section
  const modalRef = useRef(null);

  // Close modal when clicking outside of it or pressing Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const renderSection = () => {
    switch (activeSection) {
      case "account":
        return <AccountSettings userName={userName} />;
      case "notifications":
        return <NotificationSettings />;
      case "documentView":
        return <DocumentViewSettings />;
      default:
        return <AccountSettings userName={userName} />;
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Dim background
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000, // Higher z-index than ProfileCard
      }}
    >
      <div
        ref={modalRef}
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
          width: "90%", // Most of the screen
          maxWidth: "1000px", // Limit max width
          height: "85%", // Most of the screen
          maxHeight: "800px", // Limit max height
          display: "flex",
          overflow: "hidden", // Hide overflow for content
        }}
      >
        {/* Settings Sidebar */}
        <SettingsSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        {/* Main Settings Content */}
        <div style={{ flexGrow: 1, padding: "20px", overflowY: "auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: 0 }}>Settings</h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                padding: "0",
              }}
            >
              &times; {/* Close button */}
            </button>
          </div>
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
