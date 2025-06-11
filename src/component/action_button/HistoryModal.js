import { useState, useEffect } from "react";
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

const HistoryModal = ({ Loanno, selectedrole, onClose }) => {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const apiUrl =
    process.env.REACT_APP_ENV === "production"
      ? "https://fimguide-backend.onrender.com"
      : "http://localhost:3030";

  console.log(apiUrl);
  useEffect(() => {
    const fetchAndCheckPaymentHistory = async () => {
      if (!Loanno) {
        console.warn("Loanno is not defined. Skipping fetch.");
        return;
      }

      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const response = await fetch(`${apiUrl}/paymentverification/${Loanno}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `HTTP error! Status: ${response.status}, Message: ${
              errorData.message || response.statusText
            }`
          );
        }

        const data = await response.json();
        setPaymentHistory(data);

        // Check for pending verifications
        const hasPendingVerification = data.some(
          (record) => record.verification_status === 0
        );
        console.log("Pending verification found:", hasPendingVerification);
        if (hasPendingVerification) {
          toast.warning("Payment verification is pending.");
        }
      } catch (error) {
        console.error("Failed to fetch payment history:", error);
        setHistoryError(`Failed to fetch history: ${error.message}`);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchAndCheckPaymentHistory();
  }, [Loanno]);

  const fetchPaymentHistory = async (Loanno) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const response = await fetch(`${apiUrl}/paymentverification/${Loanno}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${
            errorData.message || response.statusText
          }`
        );
      }
      const data = await response.json();

      // Separate lender and borrower payments
      const lenderPayments = data.filter(
        (record) => record.payer_role === "Lender"
      );
      const borrowerPayments = data.filter(
        (record) => record.payer_role === "Borrower"
      );

      // Sort lender payments by date (newest first)
      lenderPayments.sort(
        (a, b) => new Date(b.payment_date) - new Date(a.payment_date)
      );

      // Sort borrower payments by date (newest first)
      borrowerPayments.sort(
        (a, b) => new Date(b.payment_date) - new Date(a.payment_date)
      );

      // Concatenate lender payments (pinned) followed by borrower payments
      setPaymentHistory([...lenderPayments, ...borrowerPayments]);
    } catch (error) {
      setHistoryError(`Failed to fetch history: ${error.message}`);
      setPaymentHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleVerificationStatusChange = async (recordId, newStatus) => {
    try {
      const response = await fetch(
        `${apiUrl}/paymentverification/${recordId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            verification_status: parseInt(newStatus, 10),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${
            errorData.message || response.statusText
          }`
        );
      }

      setPaymentHistory((prevHistory) =>
        prevHistory.map((record) =>
          record.cfid === recordId
            ? { ...record, verification_status: parseInt(newStatus, 10) }
            : record
        )
      );
    } catch (error) {
      // Use a custom modal or toast for alerts instead of window.alert
      console.error(`Failed to update status: ${error.message}`);
      // Re-fetch to ensure data consistency if update fails
      if (Loanno) {
        fetchPaymentHistory(Loanno);
      }
    }
  };

  const formatNumber = (value, locale = undefined, options = {}) => {
    const safeValue = Number(value) || 0;

    return safeValue.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    });
  };

  // Toast Notification

  return (
    <div className="table-popup">
      <div className="table-header">
        <h2>Confirmation History</h2>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
      </div>
      <table className="custom-table">
        <thead>
          <tr>
            <th>Payment Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Comments</th>
            <th>Attachment</th>
          </tr>
        </thead>
        <tbody>
          {historyLoading && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                Loading history...
              </td>
            </tr>
          )}
          {historyError && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", color: "red" }}>
                {historyError}
              </td>
            </tr>
          )}
          {!historyLoading && !historyError && paymentHistory.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No payment history found.
              </td>
            </tr>
          )}
          {!historyLoading &&
            !historyError &&
            paymentHistory.map((record) => (
              <tr
                key={record.cfid} // Use cfid as the unique key
                className={
                  record.payer_role === "Lender" ? "lender-payment-row" : ""
                } // Apply class for Lender payments
              >
                {console.log(record)}
                <td>
                  {record.payment_date
                    ? formatDateToYYYYMMDD(new Date(record.payment_date))
                    : "N/A"}
                  {record.payer_role === "Lender" && (
                    <span className="lender-payment-badge">
                      {" "}
                      (Lender Payment)
                    </span>
                  )}
                </td>
                <td>${formatNumber(record.amount)}</td>
                <td>
                  {/* BEGIN UPDATED SNIPPET: Conditional rendering for verification status */}
                  {console.log("selected role : ", selectedrole)}
                  {console.log("Payer role : ", record.payer_role)}
                  {selectedrole !== record.payer_role ? (
                    // If current user's role is DIFFERENT from payer's role, show dropdown
                    <select
                      className="History_Modal_Select"
                      value={record.verification_status || ""} // Ensure value is not null/undefined for select
                      onChange={(e) =>
                        handleVerificationStatusChange(
                          record.cfid,
                          e.target.value
                        )
                      }
                    >
                      <option value="1">Unverified</option>
                      <option value="2">Not received</option>
                      <option value="3">Wrong amount</option>
                      <option value="4">Wrong date</option>
                      <option value="5">Verified</option>
                    </select>
                  ) : // If current user's role is the SAME as payer's role, show static text
                  record.verification_status === 1 ? (
                    "Unverified"
                  ) : record.verification_status === 2 ? (
                    "Not received"
                  ) : record.verification_status === 3 ? (
                    "Wrong amount"
                  ) : record.verification_status === 4 ? (
                    "Wrong date"
                  ) : record.verification_status === 5 ? (
                    "Verified"
                  ) : (
                    "Verification Pending"
                  )}
                </td>
                <td>{record.comment}</td>
                <td>
                  {record.receipt_url ? (
                    <a
                      href={record.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    <span>No Attachment</span>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryModal;
