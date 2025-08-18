import React, { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";

import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";

// --- API Functions using Axios ---
const API_URL =
  process.env.REACT_APP_ENV === "production"
    ? "https://fimguide-backend.onrender.com"
    : "http://localhost:3030";

/**
 * Uploads the payment confirmation file and data.
 * @param {FormData} formData - The form data containing the file and other details.
 * @returns {Promise<object>} - The response data from the server.
 */
const uploadPaymentConfirmation = async (formData) => {
  const { data } = await axios.post(`${API_URL}/api/photo/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

/**
 * Sends a notification email to the admin.
 * @param {object} details - The payment details for the email body.
 * @returns {Promise<object>} - The response data from the server.
 */
const sendAdminNotification = async (details) => {
  const { data } = await axios.post(
    `${API_URL}/api/notify/payment-confirmation`,
    details
  );
  return data;
};

// --- Helper Function ---
const formatDateToYYYYMMDD = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

// --- UploadModal Component ---
// This component assumes QueryClientProvider and ToastContainer are wrapping the app elsewhere.
const UploadModal = ({ Loanno, selectedrole, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [amount, setAmount] = useState("");
  const [comments, setComments] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [fileName, setFileName] = useState("");
  const [paymentMethod, setpaymentMethod] = useState("");
  const fileInputRef = useRef(null);

  // Mutation for sending the email notification
  const notificationMutation = useMutation({
    mutationFn: sendAdminNotification,
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Could not send admin notification.";
      toast.warn(errorMessage);
    },
  });

  // Mutation for uploading the file
  const uploadMutation = useMutation({
    mutationFn: uploadPaymentConfirmation,
    onSuccess: (data) => {
      toast.success("Upload successful!");

      notificationMutation.mutate({
        loanno: Loanno,
        amount: amount,
        paymentDate: formatDateToYYYYMMDD(selectedDate),
        comments: comments,
        imageUrl: data.imageUrl || "Image URL not available in response",
      });

      // Reset form state
      setSelectedFile(null);
      setFileName("");
      setSelectedDate(null);
      setAmount("");
      setpaymentMethod("");
      setComments("");
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Upload failed due to a server error.";
      toast.error(errorMessage);
    },
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = () => {
    if (
      !selectedFile ||
      !Loanno ||
      !selectedDate ||
      !amount ||
      !selectedrole ||
      !paymentMethod
    ) {
      toast.warn("Please fill all required fields before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("ln_no", Loanno);
    formData.append("payment_date", formatDateToYYYYMMDD(selectedDate));
    formData.append("amount", amount);
    formData.append("paymentMethod", paymentMethod);
    formData.append("comments", comments);
    formData.append("payer_role", selectedrole);

    uploadMutation.mutate(formData);
  };

  const isUploading = uploadMutation.isLoading;
  const uploadStatus = isUploading
    ? "Uploading..."
    : uploadMutation.isError
    ? "Upload Failed"
    : uploadMutation.isSuccess
    ? "Upload Successful"
    : "";

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
            <th>From</th>
            <th>Payment Date</th>
            <th>Amount</th>
            <th>Attachment</th>
            <th>Payment Method</th>
            <th>Comment</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{selectedrole}</td>
            <td>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                placeholderText="Select a date"
                dateFormat="MM/dd/yyyy"
                isClearable
                className="custom-datepicker"
                maxDate={new Date()}
              />
            </td>
            <td>
              <input
                type="number"
                step="1"
                min="0"
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
                style={{ display: "none" }}
              />
              <p
                id="file-name-display"
                className="file-name-display"
                style={{ display: fileName ? "block" : "none" }}
              >
                {fileName}
              </p>
            </td>
            {/* Payment Method Row */}
            <td>
              <select
                name="select-payment"
                id="select-payment"
                value={paymentMethod}
                onChange={(e) => setpaymentMethod(e.target.value)}
              >
                <option value="" selected disabled>
                  Select Payment Option
                </option>
                <option value="Zelle">Zelle</option>
                <option value="Paypal">Paypal</option>
                <option value="Venmo">Venmo</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </td>
            <td>
              <input
                type="text"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Enter comment"
              />
            </td>
            <td>
              <button
                className="Button"
                onClick={handleSubmit}
                disabled={isUploading}
              >
                {isUploading ? "Submitting..." : "Submit"}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      {uploadStatus && (
        <div
          className={`upload-status ${
            uploadMutation.isSuccess ? "success" : "error"
          }`}
        >
          {uploadStatus}
        </div>
      )}
    </div>
  );
};

export default UploadModal;
