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
  const uploadFunction = () => {
    if (!Loanno || !amount || !selectedDate || !selectedrole) {
      toast.warn("Please fill all required fields before uploading.");
      setUploadStatus(
        "Please ensure LUID is provided, fill in Amount, select a Payment Date, and ensure your role is set."
      );
      return;
    }
    // Programmatically click the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      setFileName(file.name); // Set the file name state
      setUploadStatus("Uploading...");
      setUploadedFileData(null); // Clear previous upload data

      const formData = new FormData();
      formData.append("image", file);
      formData.append("luid", Loanno);
      formData.append("payment_date", formatDateToYYYYMMDD(selectedDate));
      formData.append("amount", amount);
      formData.append("comments", comments);
      formData.append("payer_role", selectedrole); // <--- NEW: Include the payer_role

      const apiUrl =
        process.env.REACT_APP_ENV === "production"
          ? "https://fimguide-backend.onrender.com"
          : "http://localhost:3030";

      try {
        const response = await fetch(`${apiUrl}/api/photo/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          toast.warn("Please fill all required fields before uploading.");
        }

        const data = await response.json();

        if (data.success) {
          setUploadStatus("Upload successful!");
          setUploadedFileData(data); // Store the API response data
          // Reset form fields after successful upload
          setSelectedDate(null);
          setAmount("");
          setComments("");
          setFileName(""); // Clear file name display
          // Clear the file input value to allow re-uploading the same file
          if (fileInputRef.current) {
            fileInputRef.current.value = null;
          }
        } else {
          setUploadStatus(
            `Upload failed: ${data.message || "Unknown error from backend"}`
          );
        }
      } catch (error) {
        setUploadStatus(`Upload failed: ${error.message}`);
      } finally {
        // Ensure the file input value is cleared even on error
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
      }
    } else {
      setFileName(""); // Clear file name if no file is selected (e.g., user cancels file dialog)
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
              <button
                className="Button"
                onClick={uploadFunction}
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
