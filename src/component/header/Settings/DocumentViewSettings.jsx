// App.jsx
import React, { useState } from "react";

// DocumentViewSettings component (as provided by you, with updated Tailwind CSS)
const DocumentViewSettings = () => {
  const [theme, setTheme] = useState("light"); // Theme state not used in provided snippet, but kept

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">
        Document View Settings
      </h3>
      {/* The "Default Zoom Level" section has been removed as requested. */}
      {/* Theme setting could be added here if needed */}
      <button
        className="w-full sm:w-auto px-5 py-2 rounded-md bg-blue-600 text-white font-semibold
                   hover:bg-blue-700 focus:outline-none focus:ring-2
                   focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
      >
        Save Document View Settings
      </button>
    </div>
  );
};

// Main App component
const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewUrl, setViewUrl] = useState("");
  const [message, setMessage] = useState("");

  // Handler for when a file is selected by the user
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setViewUrl(""); // Reset view URL when a new file is selected
    setMessage(""); // Clear previous messages
  };

  // Handler for uploading the file to a backend endpoint
  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file to upload.");
      return;
    }

    setMessage("Uploading file...");

    // --- IMPORTANT SECURITY NOTE ---
    // This frontend code will send the file to a *hypothetical backend endpoint*.
    // The backend is crucial for securely handling:
    // 1. Authentication with Microsoft Graph (keeping secrets server-side).
    // 2. Uploading the file to SharePoint/OneDrive via Microsoft Graph API.
    // 3. Generating and returning a secure, temporary viewable URL (e.g., @microsoft.graph.downloadUrl).
    // DO NOT attempt to put Microsoft Graph API keys or secrets directly in frontend code.

    const formData = new FormData();
    formData.append("document", selectedFile); // 'document' is the key your backend will expect the file under

    // Replace '/api/upload-document' with your actual backend upload endpoint
    const backendUploadEndpoint = "/api/upload-document"; // Example backend endpoint

    try {
      const response = await fetch(backendUploadEndpoint, {
        method: "POST",
        body: formData, // FormData automatically sets 'Content-Type': 'multipart/form-data'
        // Add any necessary headers like authorization tokens if your backend requires them
        // headers: { 'Authorization': 'Bearer YOUR_FRONTEND_AUTH_TOKEN' }
      });

      if (response.ok) {
        const data = await response.json();
        // Assuming your backend returns a JSON object with a 'viewUrl'
        // For this demo, we'll still use the dummy PDF for viewing since no real backend exists yet.
        // In a real scenario, 'data.viewUrl' would be the actual SharePoint view link.
        const receivedViewUrl =
          data.viewUrl ||
          `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(
            "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
          )}`;

        setViewUrl(receivedViewUrl);
        setMessage(
          `"${selectedFile.name}" uploaded successfully! Click "View Document" to open it.`
        );
      } else {
        const errorData = await response.json();
        setMessage(
          `Upload failed: ${errorData.message || response.statusText}`
        );
        console.error("Backend upload error:", errorData);
      }
    } catch (error) {
      console.error("Network or fetch error:", error);
      setMessage("Upload failed: Could not connect to the server.");
    }
  };

  // Handler for opening the document in a new tab
  const handleView = () => {
    if (viewUrl) {
      window.open(viewUrl, "_blank");
    } else {
      setMessage("Please upload a document first to get a viewable link.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-inter antialiased">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900">
          My Document Viewer
        </h2>

        {/* File Upload Section */}
        <div className="border-b pb-6 border-gray-200">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">
            Upload Document
          </h3>
          <input
            type="file"
            accept=".pdf" // Restrict to PDF for direct viewing in browser
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-purple-100 file:text-purple-700
                       hover:file:bg-purple-200 cursor-pointer
                       mb-6 shadow-sm"
          />
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleUpload}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600
                         text-white font-bold shadow-md
                         hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2
                         focus:ring-green-500 focus:ring-offset-2 transition transform duration-200 hover:scale-105"
            >
              Upload Document
            </button>
            <button
              onClick={handleView}
              disabled={!viewUrl}
              className={`flex-1 px-6 py-3 rounded-xl font-bold shadow-md
                         ${
                           viewUrl
                             ? "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 focus:ring-indigo-500 text-white"
                             : "bg-gray-300 text-gray-600 cursor-not-allowed"
                         }
                         focus:outline-none focus:ring-2
                         focus:ring-offset-2 transition transform duration-200 hover:scale-105`}
            >
              View Document
            </button>
          </div>
          {message && (
            <p
              className="mt-5 text-sm text-center font-medium
                          bg-blue-50 border border-blue-200 text-blue-800
                          p-3 rounded-lg animate-fade-in-down"
            >
              {message}
            </p>
          )}
        </div>

        {/* Document View Settings Section */}
        <DocumentViewSettings />
      </div>
    </div>
  );
};

export default App;
