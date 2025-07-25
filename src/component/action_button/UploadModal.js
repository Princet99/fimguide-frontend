import React, { useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";

// Helper function to format Date object to YYYY/MM/DD string
const formatDateToYYYYMMDD = (date) => {
  if (!date) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

// UploadModal component now accepts 'selectedrole' as a prop
const UploadModal = ({ Loanno, selectedrole, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [amount, setAmount] = useState("");
  const [comments, setComments] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [uploadedFileData, setUploadedFileData] = useState(null); // This holds API response data
  const [fileName, setFileName] = useState(""); // New state to hold the selected file's name
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef(null);

  console.log("loan no : ", Loanno);
  console.log("selected role : ", selectedrole);
  console.log("onClose : ", onClose);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setUploadStatus(""); // Reset status when a new file is selected
      setUploadedFileData(null); // Clear previous data
    } else {
      setSelectedFile(null);
      setFileName("");
    }
  };

  const handleSubmit = async () => {
    setUploadStatus("Uploading...");
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("luid", Loanno);
    formData.append("payment_date", formatDateToYYYYMMDD(selectedDate));
    formData.append("amount", amount);
    formData.append("comments", comments);
    formData.append("payer_role", selectedrole);

    // Determine API URL based on environment
    // In a real Canvas app, you might not use process.env directly in the browser.
    // This is kept for consistency with your original code.
    const apiUrl =
      process.env.REACT_APP_ENV === "production"
        ? "https://fimguide-backend.onrender.com"
        : "http://localhost:3030"; // Default to localhost if process is not defined (e.g. in simple browser env)

    try {
      const response = await fetch(`${apiUrl}/api/photo/upload`, {
        method: "POST",
        body: formData,
        // Note: 'Content-Type' header is automatically set by the browser
        // for FormData, so you don't usually need to set it manually.
      });
      if (!selectedFile) {
        toast.warn("Please select a file to upload.");
        setUploadStatus("No file selected.");
        return;
      }

      // Basic validation for other fields (add more as needed)
      if (!Loanno || !selectedDate || !amount || !selectedrole) {
        toast.warn("Please fill all required fields before uploading.");
        setUploadStatus("Missing required fields.");
        return;
      }
      // It's good practice to check if the response is JSON before parsing
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        // Handle non-JSON responses if necessary, or throw an error
        const textResponse = await response.text();
        throw new Error(
          `Unexpected response format: ${textResponse || "Empty response"}`
        );
      }

      if (!response.ok) {
        // Use message from backend if available, otherwise use a generic one
        const errorMessage =
          data?.message || `HTTP error! status: ${response.status}`;
        toast.warn(errorMessage);
        setUploadStatus(`Upload failed: ${errorMessage}`);
        return; // Important to return here to prevent further processing
      }

      if (data.success) {
        setUploadStatus("Upload successful!");
        toast.success("Upload successful!");
        setUploadedFileData(data);
        // Reset form fields after successful upload
        setSelectedFile(null);
        setFileName("");
        setSelectedDate(null); // Or reset to a default date
        setAmount("");
        setComments("");
        // setSelectedrole(""); // You might want to keep the role or reset it

        // Clear the file input value to allow re-uploading the same file
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
      } else {
        setUploadStatus(
          `Upload failed: ${data.message || "Unknown error from backend"}`
        );
        toast.error(`Upload failed: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus(`Upload failed: ${error.message}`);
      toast.error(`Upload error: ${error.message}`);
    }
  };

  return (
    <div className="table-popup">
      <div className="table-header">
        <h2>Payment Confirmation</h2>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
      </div>
      <table className="custom-table">
        <thead>
          <tr>
            <th>Payment Date</th>
            <th>Amount</th>
            <th>Attachment</th>
            <th>Comment</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                placeholderText="Select a date"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                dateFormat="yyyy/MM/dd"
                isClearable
                className="custom-datepicker"
              />
            </td>
            <td>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter Amount"
                required
                style={{
                  textAlign: "center",
                  width: "100%",
                }}
              />
            </td>
            <td>
              <label htmlFor="screenshot-upload" className="upload-label">
                <i className="fas fa-upload" style={{ marginRight: "8px" }}></i>
                Upload Screenshot
              </label>
              <input
                type="file"
                id="screenshot-upload"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                style={{ display: "none" }} /* Hide the default input */
              />
              {/* Display the selected file name */}
              <p
                id="file-name-display"
                className="file-name-display"
                style={{ display: fileName ? "block" : "none" }} // Show only if fileName exists
              >
                {fileName}
              </p>
            </td>
            <td>
              <input
                type="text"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter comment"
                style={{
                  textAlign: "center",
                  width: "100%",
                }}
              />
            </td>
            <td>
              <button
                className="Button"
                onClick={handleSubmit}
                disabled={
                  uploadStatus === "Uploading..." || !amount || !selectedDate
                }
              >
                Submit
              </button>
              {/* You can display uploadStatus here if needed */}
            </td>
          </tr>
        </tbody>
      </table>
      {uploadStatus && (
        <div
          className={`upload-status ${
            uploadStatus.includes("successful") ? "success" : "error"
          }`}
        >
          {uploadStatus}
        </div>
      )}
    </div>
  );
};

export default UploadModal;
