// utils.js

import { useState, useRef } from "react";

/**
 * Custom hook for managing file uploads.
 * @returns {Object} Methods and state for handling file uploads.
 */
export const useFileUpload = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  /**
   * Trigger the file input click event programmatically.
   */
  const uploadFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Handle file selection and update the uploaded file state.
   * @param {Event} event - The file input change event.
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Uploading file:", file.name);
      setUploadedFile(file.name); // Update the state with the uploaded file name
      alert(`File uploaded: ${file.name}`);
    }
  };

  return {
    fileInputRef: {
      ref: fileInputRef,
      onChange: handleFileChange,
      style: { display: "none" },
    },
    uploadedFile,
    uploadFile,
  };
};
