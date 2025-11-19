import { useEffect, useState } from "react";
import axios from "axios";
import "./MyLoan.css";
import Loanstate from "./loanstate";
import FloatingButtonWithTable from "../action_button/FloatingButtonWithTable";
import UploadModal from "../action_button/UploadModal";
import HistoryModal from "../action_button/HistoryModal";

// Common base URL for the API
const API_BASE_URL = process.env.REACT_APP_DEV_URL;
console.log("API_BASE_URL:", API_BASE_URL);

// Fetches all Loan Numbers for user 1
const fetchLoanNumbers = async (userId) => {
  console.log(`${API_BASE_URL}/userloan/${userId}`);
  const { data } = await axios.get(`${API_BASE_URL}userloan/${userId}`, {
    withCredentials: true,
  });
  if (data) {
    return data?.result;
  }
  console.error(data.result);
};

// Fetches loan details
const fetchLoanDetail = async (userId, loanNumbers) => {
  const requestBody = {
    loanNo: loanNumbers,
  };
  const { data } = await axios.post(
    `${API_BASE_URL}loan/${userId}`,
    requestBody,
    {
      withCredentials: true,
      // methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      // allowedHeaders: ["Content-Type", "Authorization"],
    }
  );
  if (data) {
    return data?.result;
  }
  console.error(data.result);
};

const MyLoan = () => {
  // const { userId: userIdFromUrl } = useParams();
  const [inputUserId, setInputUserId] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const verifyUser = async () => {
      try {
        // STEP 1: GET /verify → get stored userId if exists
        const { data } = await axios.get(`${API_BASE_URL}verify`, {
          withCredentials: true,
        });
        if (data?.result[0].usercode_id) {
          setUserId(data.result[0].usercode_id);
          return;
        }

        // If backend returns NO userId → stay on connect account screen
        setUserId("");
      } catch (err) {
        console.error("verify GET failed", err);
        setUserId("");
      }
    };

    verifyUser();
  }, []);

  const handleChange = (e) => {
    setInputUserId(e.target.value);
  };

  // Called when user enters a new ID from input box
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.patch(
        `${API_BASE_URL}verify`,
        { usercode: inputUserId },
        { withCredentials: true }
      );

      setUserId(inputUserId); // 🔥 trigger fetch ONLY AFTER SUBMIT
    } catch (err) {
      console.error("verify PATCH failed", err);
    }
  };

  // Removed Auth0 state
  const [selectedLoanDetails, setSelectedLoanDetails] = useState(null);
  const [selectedLoanNumber, setSelectedLoanNumber] = useState("");
  const [selectedrole, setselectedrole] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [Loanno, setLoanno] = useState([]);
  const [data, setData] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [loannoIsSuccess, setLoannoIsSuccess] = useState(false);

  // New useEffect for data fetching, runs once on mount
  useEffect(() => {
    const fetchAllData = async () => {
      setIsUserLoading(true);
      try {
        console.log(userId);
        const userLoans = await fetchLoanNumbers(userId);

        if (userLoans && userLoans.length > 0) {
          setLoanno(userLoans);
          const loanNumbersToFetch = userLoans.map((loan) =>
            loan.loanNo.toLowerCase()
          );

          // 3. Fetch all details at once
          const detailsResponse = await fetchLoanDetail(
            userId,
            loanNumbersToFetch
          );

          // The API response has a 'data' wrapper
          setData(detailsResponse?.data || null);
          setLoannoIsSuccess(true);
        } else {
          // No loans found
          setLoanno([]);
          setLoannoIsSuccess(true); // Still a "success", just no data
        }
      } catch (error) {
        console.error("Failed to fetch loan data:", error);
        // toast.error("Failed to load loan data."); // Removed toast
      } finally {
        setIsUserLoading(false);
      }
    };

    fetchAllData();
  }, [userId]);

  useEffect(() => {
    if (!selectedLoanNumber || !data) {
      setSelectedLoanDetails(null);
      return;
    }
    const allLoans = data.loan || [];
    const normalizedSelectedLoanNumber = selectedLoanNumber.toLowerCase();

    const matchedLoan = allLoans.find(
      (loan) => loan.loanNo.toLowerCase() === normalizedSelectedLoanNumber
    );
    setSelectedLoanDetails(matchedLoan || null);
  }, [selectedLoanNumber, data]); // 'data' is now a dependency

  // This useEffect sets the *initial* loan number once the list loads
  useEffect(() => {
    // Use 'loan_no' from your Loanno data structure
    if (Loanno && Loanno.length > 0 && !selectedLoanNumber) {
      setSelectedLoanNumber(Loanno[0].loanNo);
      setselectedrole(Loanno[0].role);
    }
  }, [Loanno, selectedLoanNumber]);

  // Removed 'handleSubmit' function

  const formatNumber = (value) => {
    const safeValue = Number(value) || 0;
    return safeValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Use the new loading state
  if (isUserLoading) {
    return <div>Loading....</div>;
  }

  const handleOpenUploadModal = () => setIsUploadModalOpen(true);
  const handleCloseUploadModal = () => setIsUploadModalOpen(false);
  const handleOpenHistoryModal = () => setIsHistoryModalOpen(true);
  const handleCloseHistoryModal = () => setIsHistoryModalOpen(false);

  return (
    <>
      {/* Use the new success state */}
      {loannoIsSuccess && Loanno && Loanno.length > 0 ? (
        <div className="Content">
          <h1>Dashboard</h1>
          <div className="Loan-container">
            <div className="Loan_Details">
              <div className="select-loan" style={{ fontWeight: "bold" }}>
                <select
                  className="loan-select"
                  value={selectedLoanNumber}
                  onChange={(e) => {
                    // (Corrected naming: loan_no)
                    const selected = Loanno.find(
                      (l) => l.loanNo === e.target.value
                    );
                    if (selected) {
                      setSelectedLoanNumber(selected.loanNo);
                      setselectedrole(selected.role);
                    }
                  }}
                >
                  {/* (Corrected naming: loan_no, nickname) */}
                  {Loanno?.map(({ loanNo, nickname }, index) => (
                    <option key={index} value={loanNo}>
                      {nickname}
                    </option>
                  ))}
                </select>
              </div>
              <div className="Loan_Number">
                <label>Loan Number &nbsp;</label>
                <span>{selectedLoanNumber}</span>
              </div>
              <div className="Status">
                {/* (Corrected naming: loan_details.status) */}
                Status: <span>{selectedLoanDetails?.loan_details?.status}</span>
              </div>
            </div>
            <div className="first-row">
              <div className="left-container">
                <p className="Heading">Coming up</p>
                <Loanstate loandata={selectedLoanDetails} />
              </div>
              <div className="right-grid">
                <div className="Heading">Payment confirmation</div>
                <div className="upload-section">
                  <div className="item-1">
                    <button className="btn" onClick={handleOpenUploadModal}>
                      Upload
                    </button>
                  </div>
                  <div className="item-2">
                    <button className="btn" onClick={handleOpenHistoryModal}>
                      Confirmation History
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {isUploadModalOpen && (
              <UploadModal
                Loanno={selectedLoanNumber}
                role={selectedrole}
                onClose={handleCloseUploadModal}
                selectedrole={selectedrole}
              />
            )}
            {isHistoryModalOpen && (
              <HistoryModal
                Loanno={selectedLoanNumber}
                selectedrole={selectedrole}
                onClose={handleCloseHistoryModal}
              />
            )}

            <div className="Loan-section">
              <div className="Heading">Loan Details</div>
              <table className="Loan_Table" border="1">
                <thead>
                  <tr>
                    <th>Loan Amount</th>
                    <th>Interest Rate (%)</th>
                    <th>Contract Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {/* (Corrected naming: loan_details.loan_amount etc.) */}
                    <td>
                      $
                      {formatNumber(
                        selectedLoanDetails?.loanDetail?.loanAmount
                      )}
                    </td>
                    <td>{selectedLoanDetails?.loanDetail?.interestRate}</td>
                    <td>{selectedLoanDetails?.loanDetail?.contractDate}</td>
                    <td>{selectedLoanDetails?.loanDetail?.endDate}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="section">
              <div className="Heading">Payment History</div>
              <div className="Recent_Payments">
                <table className="Recent_Payment_Table" border="1">
                  <thead>
                    <tr>
                      <th>Scheduled Date</th>
                      <th>Date Paid</th>

                      <th>Scheduled Amount</th>
                      <th>Actual amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* (Corrected naming: recentPayments) */}
                    {selectedLoanDetails?.recentPayment?.map(
                      (payment, index) => (
                        <tr key={index}>
                          <td>{payment.scheduledDate}</td>
                          <td>{payment.actualDate}</td>
                          <td>${formatNumber(payment.scheduledPaidAmount)}</td>
                          <td>${formatNumber(payment.paidAmount)}</td>
                          <td>{payment.status}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Replaced form with a simple message for when no loans are found
        <div className="Content">
          <h1>Dashboard</h1>
          <div>
            <h1>Connect with Fim account</h1>
            <div
              style={{
                maxWidth: "400px",
                margin: "0 auto",
                marginTop: "20px",
                padding: "20px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <div>
                  <label
                    htmlFor="id"
                    style={{ display: "block", marginBottom: "5px" }}
                  >
                    User Code
                  </label>

                  <input
                    type="text"
                    id="id"
                    name="id"
                    value={inputUserId}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                    required
                  />
                </div>

                <button className="btn" type="submit">
                  submit
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      <FloatingButtonWithTable Loanno={{ selectedLoanNumber, selectedrole }} />
    </>
  );
};

export default MyLoan;
