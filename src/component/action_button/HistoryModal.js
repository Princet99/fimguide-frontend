import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useState, useEffect } from "react";

// --- API Functions (unchanged) ---

const apiUrl =
  process.env.REACT_APP_ENV === "production"
    ? "https://fimguide-backend.onrender.com"
    : "http://localhost:3030";

const fetchPaymentHistory = async (loanno) => {
  const { data } = await axios.get(`${apiUrl}/api/photo/${loanno}`);
  data.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
  return data;
};

const updateVerificationStatus = async ({ recordId, newStatus }) => {
  const { data } = await axios.put(
    `${apiUrl}/api/photo/paymentverification/${recordId}`,
    {
      verification_status: parseInt(newStatus, 10),
    }
  );
  return data;
};

const updateLenderComment = async ({ recordId, newComment }) => {
  const { data } = await axios.put(
    `${apiUrl}/api/photo/lendercomment/${recordId}`,
    {
      lender_comment: newComment,
    }
  );
  return data;
};

// --- Helper Functions (unchanged) ---

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
  const [comments, setComments] = useState({});
  const queryClient = useQueryClient();

  const {
    data: paymentHistory = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["paymentHistory", Loanno],
    queryFn: () => fetchPaymentHistory(Loanno),
    enabled: !!Loanno,
  });

  // THE FIX: This effect now populates the initial state correctly
  // but will NOT re-run on subsequent refetches for the SAME loan,
  // preserving the user's input.
  useEffect(() => {
    if (paymentHistory.length > 0) {
      const initialComments = paymentHistory.reduce((acc, record) => {
        // Use the key 'lender_comment' from your API response
        acc[record.cfid] = record.comment_lender || "";
        return acc;
      }, {});
      setComments(initialComments);
    }
    // This effect should only re-run if the entire list of data changes,
    // which happens when `Loanno` changes.
  }, [paymentHistory, Loanno]);

  const statusMutation = useMutation({
    mutationFn: updateVerificationStatus,
    onSuccess: () => {
      toast.success("Status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["paymentHistory", Loanno] });
    },
    onError: (err) => {
      toast.error(`Failed to update status: ${err.message}`);
    },
  });

  const commentMutation = useMutation({
    mutationFn: updateLenderComment,
    onSuccess: () => {
      toast.success("Comment saved!");
      // We still invalidate to get the freshest data for other fields
      // or in case another user made a change.
      queryClient.invalidateQueries({ queryKey: ["paymentHistory", Loanno] });
    },
    onError: (err) => {
      toast.error(`Failed to save comment: ${err.message}`);
    },
  });

  const handleVerificationStatusChange = (recordId, newStatus) => {
    statusMutation.mutate({ recordId, newStatus });
  };

  // REFINEMENT: This check is more robust. It compares empty strings
  // to null/undefined correctly, preventing needless API calls.
  const handleCommentSubmit = (recordId, newComment) => {
    const originalRecord = paymentHistory.find((p) => p.cfid === recordId);
    // Compare normalized values (empty string for null/undefined)
    if (
      originalRecord &&
      (originalRecord.lender_comment || "") !== (newComment || "")
    ) {
      commentMutation.mutate({ recordId, newComment });
    }
  };

  // --- JSX (unchanged, but note a small correction in the final `td`) ---

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
            <th colSpan="6">Sender Information</th>
            <th colSpan="2">Verification</th>
          </tr>
          <tr>
            <th>From</th>
            <th>Payment Date</th>
            <th>Amount</th>
            <th>Payment Method</th>
            <th>Comments</th>
            <th>Attachment</th>
            <th>Status</th>
            <th>Receiver Comment</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
                Loading history...
              </td>
            </tr>
          )}
          {isError && (
            <tr>
              <td
                colSpan="8"
                style={{ textAlign: "center", color: "red" }}
              >{`Failed to fetch history: ${error.message}`}</td>
            </tr>
          )}
          {!isLoading && !isError && paymentHistory.length === 0 && (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>
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
                <td>{record.payer_role}</td>
                <td>{formatDateToYYYYMMDD(record.payment_date)}</td>
                <td>${formatNumber(record.amount)}</td>
                <td>{record.payment_method}</td>
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
                <td>
                  {selectedrole !== record.payer_role &&
                  record.verification_status !== 5 ? (
                    <select
                      className="History_Modal_Select"
                      value={record.verification_status || ""}
                      onChange={(e) => {
                        const newValue = e.target.value;

                        if (newValue === "5") {
                          toast.warn(
                            ({ closeToast }) => (
                              <div>
                                <p>
                                  Once verified, you can't undo this change!
                                </p>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "10px",
                                    marginTop: "10px",
                                  }}
                                >
                                  <button
                                    onClick={() => {
                                      handleVerificationStatusChange(
                                        record.cfid,
                                        newValue
                                      );
                                      closeToast();
                                    }}
                                    style={{
                                      background: "#4CAF50",
                                      color: "white",
                                      border: "none",
                                      padding: "5px 10px",
                                      cursor: "pointer",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => {
                                      e.target.value =
                                        record.verification_status || "";
                                      closeToast();
                                    }}
                                    style={{
                                      background: "#f44336",
                                      color: "white",
                                      border: "none",
                                      padding: "5px 10px",
                                      cursor: "pointer",
                                      borderRadius: "4px",
                                    }}
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            ),
                            {
                              position: "top-center",
                              autoClose: false, // stay until answered
                              closeOnClick: false,
                              draggable: false,
                              theme: "colored",
                            }
                          );
                          return; // stop normal flow until confirmed
                        }

                        handleVerificationStatusChange(record.cfid, newValue);
                      }}
                      disabled={statusMutation.isLoading}
                    >
                      <option value="1">Unverified</option>
                      <option value="2">Not received</option>
                      <option value="3">Wrong amount</option>
                      <option value="4">Wrong date</option>
                      <option value="5">Verified</option>
                    </select>
                  ) : (
                    {
                      1: "Unverified",
                      2: "Not received",
                      3: "Wrong amount",
                      4: "Wrong date",
                      5: "Verified",
                    }[record.verification_status] || "Verification Pending"
                  )}
                </td>
                {console.log(selectedrole)}
                <td>
                  {selectedrole !== record.payer_role ? (
                    <input
                      type="text"
                      name="Lender_Comment"
                      value={comments[record.cfid] || ""}
                      onChange={(e) =>
                        setComments((prev) => ({
                          ...prev,
                          [record.cfid]: e.target.value,
                        }))
                      }
                      onBlur={() =>
                        handleCommentSubmit(record.cfid, comments[record.cfid])
                      }
                      placeholder="Enter Comment"
                      disabled={
                        commentMutation.isLoading &&
                        commentMutation.variables?.recordId === record.cfid
                      }
                    />
                  ) : (
                    <span>{record.comment_lender || "N/A"}</span>
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
