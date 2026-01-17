// src/components/Settings/AccountSettings.jsx
import React, { useState, useEffect } from "react";

const AccountSettings = ({ userName }) => {
  const [email, setEmail] = useState(""); // Initialize with an empty string
 
  const userId = sessionStorage.getItem("userId");
  // Retrieve updatedEmail from sessionStorage
  const sessionStoredEmail = sessionStorage.getItem("email");

  // Correctly define apiUrl
  const apiUrl =
    process.env.NODE_ENV === "production"
      ? "https://fimguide-backend.onrender.com"
      : "http://localhost:3030";

  useEffect(() => {
    // If there's an email in session storage, prioritize it
    if (sessionStoredEmail) {
      setEmail(sessionStoredEmail);
    } else if (userId) {
      // Otherwise, fetch from the backend if userId exists
      const fetchUserEmail = async () => {
        try {
          const response = await fetch(`${apiUrl}/users/${userId}/email`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.email) {
              setEmail(data.email);
            } else {
              console.warn("Backend did not return an email for user:", userId);
              // If no email is returned, email state remains an empty string,
              // which will trigger the placeholder.
            }
          } else {
            const errorText = await response.text();
            console.error(
              `Failed to fetch user email: ${response.status} - ${errorText}`
            );
            // Keep email as empty string to show placeholder
          }
        } catch (error) {
          console.error("Error fetching user email:", error);
          // Keep email as empty string to show placeholder
        }
      };
      fetchUserEmail();
    }
  }, [userId, apiUrl, sessionStoredEmail]); // Add sessionStoredEmail to dependencies

    if (!userId) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/users/${userId}/email`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // 'Authorization': 'Bearer YOUR_AUTH_TOKEN' // Uncomment if you have auth
        },
        body: JSON.stringify({ newEmail: email }),
      });

      if (response.ok) {
        const data = await response.json();
  
        // If the backend confirms the email, update state AND session storage
        if (data.updatedEmail) {
          setEmail(data.updatedEmail);
          sessionStorage.setItem("email", data.updatedEmail); // Store the updated email in session storage
        } else {
          // If backend doesn't return updatedEmail, but the update was successful,
          // assume the current 'email' state is the new email and store it.
          sessionStorage.setItem("email", email);
        }
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
  
        } else {
          const errorText = await response.text();
          console.error("Non-JSON error response:", errorText);
        }
      }
    } catch (error) {
      console.error("Error updating email:", error);
    }
  };

  return (
    <div>
      <h3>Account Settings</h3>
      <p>Welcome, {userName}!</p>
      
    </div>
  );
};

export default AccountSettings;
