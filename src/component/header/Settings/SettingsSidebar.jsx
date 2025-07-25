// src/components/Settings/SettingsSidebar.jsx
import React from "react";

const SettingsSidebar = ({ activeSection, setActiveSection }) => {
  const sidebarItems = [
    { id: "account", label: "Account Settings" },
    { id: "notifications", label: "Notifications" },
    { id: "documentView", label: "Document View" },
    // Add more settings sections here
  ];

  return (
    <div
      style={{
        width: "250px",
        backgroundColor: "#f4f7fa",
        padding: "20px",
        borderRight: "1px solid #eee",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {sidebarItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveSection(item.id)}
          style={{
            display: "block",
            width: "100%",
            padding: "10px 15px",
            textAlign: "left",
            backgroundColor:
              activeSection === item.id ? "#e0e7ed" : "transparent",
            color: activeSection === item.id ? "#007bff" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: activeSection === item.id ? "bold" : "normal",
            transition: "background-color 0.2s ease",
            "&:hover": {
              backgroundColor: "#e0e7ed",
            },
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default SettingsSidebar;
