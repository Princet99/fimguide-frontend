import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axios from "axios";

// --- API Functions (moved outside for clarity) ---

const apiUrl =
  process.env.REACT_APP_ENV === "production"
    ? "https://fimguide-backend.onrender.com"
    : "http://localhost:3030";

// 1. Function to fetch and process payment history
const fetchPaymentHistory = async (loanno) => {
  const { data } = await axios.get(`${apiUrl}/api/photo/${loanno}`);

  // Separate lender and borrower payments
  const lenderPayments = data.filter(
    (record) => record.payer_role === "Lender"
  );
  const borrowerPayments = data.filter(
    (record) => record.payer_role === "Borrower"
  );

  // Sort both lists by date (newest first)
  const sortDescByDate = (a, b) =>
    new Date(b.payment_date) - new Date(a.payment_date);
  lenderPayments.sort(sortDescByDate);
  borrowerPayments.sort(sortDescByDate);

  // Return lender payments first, then borrower payments
  return [...lenderPayments, ...borrowerPayments];
};

// 2. Function to update verification status
const updateVerificationStatus = async ({ recordId, newStatus }) => {
  const { data } = await axios.put(
    `${apiUrl}/api/photo/paymentverification/${recordId}`,
    {
      verification_status: parseInt(newStatus, 10),
    }
  );
  return data;
};

// --- Helper Functions ---

const formatDateToYYYYMMDD = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

const formatNumber = (value) => {
  const safeValue = Number(value) || 0;
  return safeValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// --- Component ---

const HistoryModal = ({ Loanno, selectedrole, onClose }) => {
  const queryClient = useQueryClient();

  // 1. Use useQuery to fetch data
  const {
    data: paymentHistory = [], // Default to empty array
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["paymentHistory", Loanno],
    queryFn: () => fetchPaymentHistory(Loanno),
    enabled: !!Loanno, // Only run query if Loanno is available
    onSuccess: (data) => {
      // Side-effect: Check for pending verifications on successful fetch
      if (data.some((record) => record.verification_status === 0)) {
        toast.warning("Payment verification is pending.");
      }
    },
  });

  // 2. Use useMutation to handle updates
  const mutation = useMutation({
    mutationFn: updateVerificationStatus,
    onSuccess: () => {
      // On success, invalidate the query to re-fetch fresh data
      toast.success("Status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["paymentHistory", Loanno] });
    },
    onError: (err) => {
      toast.error(`Failed to update status: ${err.message}`);
    },
  });

  // Handler now calls the mutation
  const handleVerificationStatusChange = (recordId, newStatus) => {
    mutation.mutate({ recordId, newStatus });
  };

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
          {isLoading && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                Loading history...
              </td>
            </tr>
          )}
          {isError && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", color: "red" }}>
                {`Failed to fetch history: ${error.message}`}
              </td>
            </tr>
          )}
          {!isLoading && !isError && paymentHistory.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No payment history found.
              </td>
            </tr>
          )}
          {!isLoading &&
            !isError &&
            paymentHistory.map((record) => (
              <tr
                key={record.cfid}
                className={
                  record.payer_role === "Lender" ? "lender-payment-row" : ""
                }
              >
                <td>
                  {formatDateToYYYYMMDD(record.payment_date)}
                  {record.payer_role === "Lender" && (
                    <span className="lender-payment-badge">
                      {" "}
                      (Lender Payment)
                    </span>
                  )}
                </td>
                <td>${formatNumber(record.amount)}</td>
                <td>
                  {selectedrole !== record.payer_role &&
                  record.verification_status !== 5 ? (
                    // Show dropdown ONLY if role is different AND status is NOT 'Verified'
                    <select
                      className="History_Modal_Select"
                      value={record.verification_status || ""}
                      onChange={(e) =>
                        handleVerificationStatusChange(
                          record.cfid,
                          e.target.value
                        )
                      }
                      disabled={mutation.isLoading}
                    >
                      <option value="1">Unverified</option>
                      <option value="2">Not received</option>
                      <option value="3">Wrong amount</option>
                      <option value="4">Wrong date</option>
                      <option value="5">Verified</option>
                    </select>
                  ) : (
                    // Otherwise, show static text
                    {
                      1: "Unverified",
                      2: "Not received",
                      3: "Wrong amount",
                      4: "Wrong date",
                      5: "Verified",
                    }[record.verification_status] || "Verification Pending"
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
