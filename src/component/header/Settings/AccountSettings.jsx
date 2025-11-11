// src/components/Settings/AccountSettings.jsx
import React, { useState, useEffect } from "react";

const AccountSettings = ({ userName }) => {
  const [email, setEmail] = useState(""); // Initialize with an empty string
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const userId = sessionStorage.getItem("userId");
  // Retrieve updatedEmail from sessionStorage
  const sessionStoredEmail = sessionStorage.getItem("email");

  // Correctly define apiUrl
  const apiUrl = process.env.REACT_APP_DEV_URL;

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
            setMessage("Failed to load user email.");
            setIsError(true);
            // Keep email as empty string to show placeholder
          }
        } catch (error) {
          console.error("Error fetching user email:", error);
          setMessage("Error loading user email. Check network.");
          setIsError(true);
          // Keep email as empty string to show placeholder
        }
      };
      fetchUserEmail();
    }
  }, [userId, apiUrl, sessionStoredEmail]); // Add sessionStoredEmail to dependencies

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setMessage("");
    setIsError(false);
  };

  const handleSaveSettings = async () => {
    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email address.");
      setIsError(true);
      return;
    }

    if (!userId) {
      setMessage("User ID is missing. Cannot update email.");
      setIsError(true);
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
        setMessage(data.message || "Email updated successfully!");
        setIsError(false);
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
          setMessage(
            errorData.message || "Failed to update email. Please try again."
          );
        } else {
          const errorText = await response.text();
          console.error("Non-JSON error response:", errorText);
          setMessage(
            `Server error: ${response.status}. Please try again later.`
          );
        }
        setIsError(true);
      }
    } catch (error) {
      console.error("Error updating email:", error);
      setMessage(
        "An unexpected network error occurred. Please check your connection."
      );
      setIsError(true);
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
