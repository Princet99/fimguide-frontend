import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import "./MyLoan.css";
import { toast } from "react-toastify";
import { useAuth0 } from "@auth0/auth0-react";
import Loanstate from "./loanstate";
import FloatingButtonWithTable from "../action_button/FloatingButtonWithTable";
import UploadModal from "../action_button/UploadModal";
import HistoryModal from "../action_button/HistoryModal";

// API State Management using Axios and React-Query

const apiUrl =
  process.env.REACT_APP_ENV === "production"
    ? "https://fimguide-backend.onrender.com"
    : "http://localhost:3030";

console.log(apiUrl);

// Fetches User Details by auth0_sub
const fetchUserDetails = async (token, auth0Sub) => {
  const { data } = await axios.get(`${apiUrl}/sub?auth0_sub=${auth0Sub}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Fetches all Loan Numbers for a given UserId
const fetchLoanNumbers = async (userId) => {
  const { data } = await axios.get(`${apiUrl}/my-loans/${userId}`);
  return data;
};

// fetches details for a specific loan
const fetchLoanDetails = async (userId, loanNo) => {
  const { data } = await axios.get(
    `${apiUrl}/my-loans/${userId}/loanNo/${loanNo}`,
  );
  return data.errors ? null : data;
};

// Updates user's auth0_sub (connect ID)
const connectUserAccount = async ({ token, id, auth0_sub }) => {
  const { data } = await axios.post(
    `${apiUrl}/update`,
    { id, auth0_sub },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data;
};

const MyLoan = () => {
  const {
    user: authUser,
    isAuthenticated,
    isLoading: authLoading,
    getAccessTokenSilently,
    loginWithRedirect,
  } = useAuth0();
  const queryClient = useQueryClient();
  const [selectedLoanDetails, setSelectedLoanDetails] = useState(null);
  const [selectedLoanNumber, setSelectedLoanNumber] = useState("");
  const [selectedrole, setselectedrole] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    first_name: "",
    last_name: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  
  // --- React Query Hooks ---
  
  // 1. Query to fetch user details (FIXED: Destructured properties)
  const {
    data: user,
    isLoading: isUserLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["user", authUser?.sub],
    queryFn: async () => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH_AUDIENCE,
        },
      });
      return fetchUserDetails(token, authUser.sub);
    },
    enabled: !!(isAuthenticated && authUser?.sub),
    retry: false,
  });

  useEffect(() => {
    if (user?.details) {
      sessionStorage.setItem("email", user.details.us_email);
      sessionStorage.setItem("userId", JSON.stringify(user.details.us_id));
    }
  }, [user]);
  // UseEffect to handle user not registered
  useEffect(() => {
    if (isError && error?.response?.status === 404) {
      toast.info("Enter the user code! Provided by the Admin");
    }
  }, [isError, error]);
  
  const userId = user?.details?.us_id || null;
  const email = user?.details?.us_email || null;
  sessionStorage.setItem("email", email);
  sessionStorage.setItem("userId", JSON.stringify(userId));

  // 2. Query to fetch loan numbers (FIXED: Destructured properties)
  const { data: Loanno, isSuccess: loannoIsSuccess } = useQuery({
    queryKey: ["loanNumbers", userId],
    queryFn: () => fetchLoanNumbers(userId),
    enabled: !!userId,
  });

  // 3. Query to fetch details of the selected loan (FIXED: Destructured properties)
  const { data } = useQuery({
    queryKey: ["loanDetails", userId, selectedLoanNumber],
    queryFn: () => fetchLoanDetails(userId, selectedLoanNumber),
    enabled: !!userId && !!selectedLoanNumber,
  });

  useEffect(() => {
    if (!selectedLoanNumber || !data) {
      setSelectedLoanDetails(null);
      return;
    }
    const combinedLoans = { ...data.borrower, ...data.lender };
    const normalizedSelectedLoanNumber = selectedLoanNumber.toLowerCase();
    const matchedLoan = combinedLoans[normalizedSelectedLoanNumber];
    setSelectedLoanDetails(matchedLoan || null);
  }, [selectedLoanNumber, data]);

  useEffect(() => {
    if (Loanno && Loanno.length > 0 && !selectedLoanNumber) {
      setSelectedLoanNumber(Loanno[0].loan_no);
      setselectedrole(Loanno[0].role);
    }
  }, [Loanno, selectedLoanNumber]);

  // 4. Mutation for connecting the user's Fim ID
  const connectUserMutation = useMutation({
    mutationFn: connectUserAccount,
    onSuccess: () => {
      toast.success(`Id Connected Successfully!`, {
        position: "top-right",
        autoClose: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["loanNumbers"] });
    },
    onError: async (e) => {
      if (e.error === "consent_required" || e.error === "login_required") {
        await loginWithRedirect({
          authorizationParams: {
            audience: process.env.REACT_APP_AUTH_AUDIENCE,
            scope: "update:users",
          },
        });
      } else {
        console.error("Error updating auth0_sub:", e);
        toast.error("Failed to connect ID. Please try again.");
      }
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authUser || !formData.id) return;
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: process.env.REACT_APP_AUTH_AUDIENCE,
        scope: "update:users",
      },
    });
    connectUserMutation.mutate({
      token,
      id: formData.id,
      auth0_sub: authUser.sub,
    });
  };

  const formatNumber = (value) => {
    const safeValue = Number(value) || 0;
    return safeValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Use the destructured loading state
  if (isUserLoading) {
    return <div>Loading....</div>;
  }

  const handleOpenUploadModal = () => setIsUploadModalOpen(true);
  const handleCloseUploadModal = () => setIsUploadModalOpen(false);
  const handleOpenHistoryModal = () => setIsHistoryModalOpen(true);
  const handleCloseHistoryModal = () => setIsHistoryModalOpen(false);

  if (authLoading) return <div>Loading...</div>;
  if (!isAuthenticated) {
    loginWithRedirect();
    return null;
  }
  return (
    <>
      {/* Use the destructured success state */}
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
                    const selected = Loanno.find(
                      (l) => l.loan_no === e.target.value,
                    );
                    if (selected) {
                      setSelectedLoanNumber(selected.loan_no);
                      setselectedrole(selected.role);
                    }
                  }}
                >
                  {Loanno?.map(({ loan_no, nickname }, index) => (
                    <option key={index} value={loan_no}>
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
                    <td>
                      $
                      {formatNumber(
                        selectedLoanDetails?.loan_details?.loan_amount,
                      )}
                    </td>
                    <td>{selectedLoanDetails?.loan_details?.interest_rate}</td>
                    <td>{selectedLoanDetails?.loan_details?.contract_date}</td>
                    <td>{selectedLoanDetails?.loan_details?.end_date}</td>
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
                    {selectedLoanDetails?.recentPayments?.map(
                      (payment, index) => (
                        <tr key={index}>
                          <td>{payment.scheduledDate}</td>
                          <td>{payment.actualDate}</td>
                          <td>${formatNumber(payment.scheduledPaidAmount)}</td>
                          <td>${formatNumber(payment.paidAmount)}</td>
                          <td>{payment.status}</td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Form to connect account if no loans are found
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
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
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
                  value={formData.id}
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
              <button
                className="btn"
                type="submit"
                disabled={connectUserMutation.isLoading}
              >
                {connectUserMutation.isLoading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}
      <FloatingButtonWithTable Loanno={{ selectedLoanNumber, selectedrole }} />
    </>
  );
};

export default MyLoan;
