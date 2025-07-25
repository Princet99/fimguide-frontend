import React, { useEffect, useState } from "react";
import "./MyLoan.css";
import { toast } from "react-toastify";

import { useAuth0 } from "@auth0/auth0-react";

import Loanstate from "./loanstate";

import FloatingButtonWithTable from "../action_button/FloatingButtonWithTable";

import UploadModal from "../action_button/UploadModal";

import HistoryModal from "../action_button/HistoryModal";

const MyLoan = () => {
  const { getAccessTokenSilently, loginWithRedirect, isAuthenticated } =
    useAuth0();

  const [user, setUser] = useState(null);

  const [data, setData] = useState(null); // Store fetched data

  const [selectedLoanDetails, setSelectedLoanDetails] = useState(null); // Loan details for selected nickname

  const [selectedLoanNumber, setSelectedLoanNumber] = useState(""); // Selected loan number

  const [selectedrole, setselectedrole] = useState("");

  const [Loanno, setLoanno] = useState(null);

  const [loading, setLoading] = useState(true);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [paymentHistory, setPaymentHistory] = useState([]); // toast notification

  useEffect(() => {
    // Fetch payment history and check for pending verifications on page load

    const fetchPaymentHistory = async () => {
      if (!selectedLoanNumber) return;

      try {
        const response = await fetch(
          `${apiUrl}/paymentverification/${selectedLoanNumber}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch payment history.");
        }

        const data = await response.json();

        setPaymentHistory(data); // Check for pending verifications

        const hasPendingVerification = data.some(
          (record) => record.verification_status === 0
        );

        if (hasPendingVerification) {
          toast.warning("Payment verification is pending.");
        }
      } catch (error) {
        console.error("Error fetching payment history:", error);
      }
    };

    fetchPaymentHistory();
  }, [selectedLoanNumber]); // connect id setup

  const [formData, setFormData] = useState({
    id: "",

    first_name: "",

    last_name: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  }; // Get userId from sessionStorage // const userId = sessionStorage.getItem("userId");

  const userSession = sessionStorage.getItem("user");

  const users = userSession ? JSON.parse(userSession) : null;

  const apiUrl =
    process.env.REACT_APP_ENV === "production"
      ? "https://fimguide-backend.onrender.com"
      : "http://localhost:3030"; // To get user details and loan details

  console.log(apiUrl);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.REACT_APP_AUTH_AUDIENCE,

            scope: "read:posts",
          },
        }); // console.log(users.sub);

        const response = await fetch(`${apiUrl}/sub?auth0_sub=${users.sub}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(await response.json());

        setLoading(false);
      } catch (e) {
        if (e.error === "consent_required" || e.error === "login_required") {
          // Redirect to login to request consent

          await loginWithRedirect({
            authorizationParams: {
              audience: process.env.REACT_APP_AUTH_AUDIENCE,

              scope: "read:posts",
            },
          });
        } else {
          console.error(e);
        }
      }
    };

    if (isAuthenticated) {
      fetchPosts();
    }
  }, [getAccessTokenSilently, loginWithRedirect, isAuthenticated, apiUrl]); // console.log(user);

  const userId = user?.details?.us_id || null;

  const email = user?.details?.us_email || null;

  sessionStorage.setItem("email", email);

  sessionStorage.setItem("userId", JSON.stringify(userId)); // console.log(userId); // This hook for displaying getting all Loan Number

  useEffect(() => {
    // console.log(userId, "userId");

    if (!userId || !apiUrl) return;

    fetch(`${apiUrl}/my-loans/${userId}`, {
      method: "GET",

      headers: {
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch loans");
        }

        return res.json();
      })

      .then((data) => {
        if (data && data.length > 0) {
          setLoanno(data); // Set the default loan number to the first loan if no loan is selected

          if (!selectedLoanNumber) {
            setSelectedLoanNumber(data[0].loan_no);

            setselectedrole(data[0].role); // Default to first loan number
          }
        } else {
          setLoanno(null);

          setselectedrole(null);
        }
      })

      .catch((error) => {
        console.error("Error fetching loans:", error);

        setLoanno(null);
      });
  }, [apiUrl, userId, selectedLoanNumber]);

  console.log(Loanno, "selectedLoanNumber");

  console.log(selectedrole); // This hook for displaying Loan Details

  useEffect(() => {
    if (!selectedLoanNumber) return;

    fetch(`${apiUrl}/my-loans/${userId}/loanNo/${selectedLoanNumber}`, {
      method: "GET",

      headers: {
        Accept: "application/json",
      },
    })
      .then((res) => res.json())

      .then((data) => {
        if (!data.errors) {
          setData(data);
        } else {
          setData(null);
        }
      })

      .catch((err) => console.error("Error fetching data:", err));
  }, [apiUrl, userId, selectedLoanNumber]); // console.log(data);

  useEffect(() => {
    if (!selectedLoanNumber || !data) return; // Merge borrower and lender data to match loan number

    const combinedLoans = {
      ...data.borrower,

      ...data.lender,
    };

    const normalizedSelectedLoanNumber = selectedLoanNumber.toLowerCase();

    const matchedLoan = combinedLoans[normalizedSelectedLoanNumber];

    if (matchedLoan) {
      setSelectedLoanDetails(matchedLoan);
    } else {
      setSelectedLoanDetails(null);
    }
  }, [selectedLoanNumber, data]); // Use `data` in the dependency array // Handle Logic For connecting id

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH_AUDIENCE,

          scope: "update:users", // Update the scope as needed
        },
      });

      if (!users || !formData.id) {
        console.error("User or ID is missing");

        return;
      }

      const auth0Sub = users.sub;

      const response = await fetch(`${apiUrl}/update`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          id: formData.id,

          auth0_sub: auth0Sub,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update auth0_sub: ${response.statusText}`);
      }

      const result = await response.json(); // console.log("Update successful:", result); // Display a toast notification with the user's first name

      toast.success(`Id Connected Succesfully!`, {
        position: "top-right",

        autoClose: 3000,

        hideProgressBar: false,

        closeOnClick: true,

        pauseOnHover: true,

        draggable: true,
      }); // Refresh the page after a short delay (e.g., 3 seconds)

      setTimeout(() => {
        window.location.reload();
      }, 3000); // Adjust the delay as needed
    } catch (e) {
      if (e.error === "consent_required" || e.error === "login_required") {
        await loginWithRedirect({
          authorizationParams: {
            audience: process.env.REACT_APP_AUTH_AUDIENCE,

            scope: "update:users",
          },
        });
      } else {
        console.error("Error updating auth0_sub:", e);
      }
    }
  }; // Number format => decimal precision upto 2 point and comma in between numbers

  const formatNumber = (value, locale = undefined, options = {}) => {
    const safeValue = Number(value) || 0;

    return safeValue.toLocaleString(locale, {
      minimumFractionDigits: 2,

      maximumFractionDigits: 2,

      ...options,
    });
  }; // Condtional render to no displya connecting id filed on slow load

  if (loading) {
    return <div> Loading....</div>;
  } // --- HANDLER FUNCTIONS TO CONTROL MODALS ---

  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const handleOpenHistoryModal = () => {
    setIsHistoryModalOpen(true);
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
  };

  return (
    <>
           {" "}
      {selectedLoanNumber ? (
        <div className="Content">
                    <h1>Dashboard</h1>         {" "}
          <div className="Loan-container">
                        {/* Loan Details */}           {" "}
            <div className="Loan_Details">
                           {" "}
              <div className="select-loan" style={{ fontWeight: "bold" }}>
                               {" "}
                <select
                  className="loan-select"
                  value={selectedLoanNumber || Loanno?.[0]?.loan_no || ""}
                  onChange={(e) => setSelectedLoanNumber(e.target.value)}
                >
                                    {/* {console.log(Loanno)} */}               
                   {" "}
                  {Loanno?.map(({ loan_no, nickname }, index) => (
                    <option key={index} value={loan_no}>
                                            {nickname}                   {" "}
                    </option>
                  ))}
                                 {" "}
                </select>
                             {" "}
              </div>
                           {" "}
              <div className="Loan_Number">
                                <label>Loan Number &nbsp;</label>               {" "}
                <span>{selectedLoanNumber}</span>             {" "}
              </div>
                           {" "}
              <div className="Status">
                                Status:{" "}
                <span>{selectedLoanDetails?.loan_details?.status}</span>       
                     {" "}
              </div>
                         {" "}
            </div>
                       {" "}
            <div className="first-row">
                           {" "}
              <div className="left-container">
                                {/* Coming Up Section */}               {" "}
                <p className="Heading">Coming up</p>               {" "}
                {/* Loan State Component */}               {" "}
                {<Loanstate loandata={selectedLoanDetails} />}             {" "}
              </div>
                            {/* Scoring Section */}             {" "}
              <div className="right-grid">
                               {" "}
                <div className="Heading">Payment confirmation</div>             
                  {/*  */}               {" "}
                {/* <div className="Score">

                  <div className="financial-snapshot-container">

                    Loan Score&nbsp;

                    {selectedLoanDetails?.loan_details?.score}

                  </div>

                </div> */}
                               {" "}
                <div className="upload-section">
                                   {" "}
                  <div className="item-1">
                                       {" "}
                    <button className="btn" onClick={handleOpenUploadModal}>
                                            Upload                    {" "}
                    </button>
                                     {" "}
                  </div>
                                   {" "}
                  <div className="item-2">
                                       {" "}
                    <button className="btn" onClick={handleOpenHistoryModal}>
                                            Confirmation History                
                         {" "}
                    </button>
                                     {" "}
                  </div>
                                 {" "}
                </div>
                             {" "}
              </div>
                         {" "}
            </div>
                        {/* --- CONDITIONAL RENDERING OF MODALS --- */}         
             {" "}
            {/* The UploadModal is now only rendered when isUploadModalOpen is true */}
                       {" "}
            {isUploadModalOpen && (
              <UploadModal
                Loanno={selectedLoanNumber}
                onClose={handleCloseUploadModal} // Pass the close function as a prop
                selectedrole={selectedrole}
              />
            )}
                       {" "}
            {/* The HistoryModal is now only rendered when isHistoryModalOpen is true */}
                        {/* {console.log(selectedrole)} */}           {" "}
            {isHistoryModalOpen && (
              <HistoryModal
                Loanno={selectedLoanNumber}
                selectedrole={selectedrole}
                paymentHistory={paymentHistory}
                onClose={handleCloseHistoryModal} // Pass the close function as a prop
              />
            )}
                        {/* Loan Details Section */}           {" "}
            <div className="Loan-section">
                            <div className="Heading">Loan Details</div>         
                 {" "}
              <table className="Loan_Table" border="1">
                               {" "}
                <thead>
                                   {" "}
                  <tr>
                                        <th>Loan Amount</th>                   {" "}
                    <th>Interest Rate (%)</th>                   {" "}
                    <th>Contract Date</th>                    <th>End Date</th> 
                                   {" "}
                  </tr>
                                 {" "}
                </thead>
                               {" "}
                <tbody>
                                   {" "}
                  <tr>
                                       {" "}
                    <td>
                                            $                      {" "}
                      {formatNumber(
                        selectedLoanDetails?.loan_details?.loan_amount
                      )}
                                         {" "}
                    </td>
                                       {" "}
                    <td>{selectedLoanDetails?.loan_details?.interest_rate}</td> 
                                     {" "}
                    <td>{selectedLoanDetails?.loan_details?.contract_date}</td> 
                                     {" "}
                    <td>{selectedLoanDetails?.loan_details?.end_date}</td>     
                               {" "}
                  </tr>
                                 {" "}
                </tbody>
                             {" "}
              </table>
                            {/* Loan Full Details */}             {" "}
              {/* <p>Loan Payment Details Breakdown</p>

            <table className="Loan_Payment_Details" border="1">

              <thead>

                <tr>

                  <th>Payment Type</th>

                  <th>Number</th>

                  <th>Amount</th>

                  <th>Points</th>

                </tr>

              </thead>

              <tbody>

                {Object.entries(loan)

                  .filter(

                    ([key]) =>

                      key !== "loanNumber" &&

                      key !== "loanAmount" &&

                      key !== "interestRate" &&

                      key !== "contractDate" &&

                      key !== "endDate" &&

                      key !== "loanScore" &&

                      key !== "currentBalance" &&

                      key !== "upcomingPayment" &&

                      key !== "recentPayments" &&

                      key !== "status"

                  )

                  .map(([paymentType, payment], index) => (

                    <tr key={index}>

                      <td>{paymentType}</td>

                      <td>{payment.number}</td>

                      <td>${payment.amount}</td>

                      <td>{payment.points}</td>

                    </tr>

                  ))}

              </tbody>

            </table> */}
                         {" "}
            </div>
                        {/* Recent Payments Section */}           {" "}
            <div className="section">
                            <div className="Heading">Payment History</div>     
                     {" "}
              <div className="Recent_Payments">
                               {" "}
                <table className="Recent_Payment_Table" border="1">
                                   {" "}
                  <thead>
                                       {" "}
                    <tr>
                                            <th>Scheduled Date</th>             
                              <th>Date Paid</th>                     {" "}
                      <th>Scheduled Amount</th>                     {" "}
                      <th>Actual amount</th>                     {" "}
                      <th>Status</th>                   {" "}
                    </tr>
                                     {" "}
                  </thead>
                                   {" "}
                  <tbody>
                                       {" "}
                    {selectedLoanDetails?.recentPayments?.map(
                      (payment, index) => (
                        <tr key={index}>
                                                   {" "}
                          <td>{payment.scheduledDate}</td>                     
                              <td>{payment.actualDate}</td>                     
                             {" "}
                          <td>${formatNumber(payment.scheduledPaidAmount)}</td> 
                                                 {" "}
                          <td>${formatNumber(payment.paidAmount)}</td>         
                                          <td>{payment.status}</td>             
                                   {" "}
                        </tr>
                      )
                    )}
                                     {" "}
                  </tbody>
                                 {" "}
                </table>
                             {" "}
              </div>
                         {" "}
            </div>
                     {" "}
          </div>
                 {" "}
        </div>
      ) : (
        // To connect with Fim Loans if Logged in user not found with any id

        <>
                   {" "}
          <div>
                        <h1>Connect with Fim account</h1>           {" "}
            <div
              style={{
                maxWidth: "400px",

                margin: "0 auto",

                marginTop: "20px",

                padding: "10px",

                border: "1px solid #ccc",

                borderRadius: "8px",
              }}
            >
                           {" "}
              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",

                  flexDirection: "column",

                  gap: "10px",
                }}
              >
                               {" "}
                <div>
                                   {" "}
                  <label
                    htmlFor="id"
                    style={{ display: "block", marginBottom: "5px" }}
                  >
                                        User Code                  {" "}
                  </label>
                                   {" "}
                  <input
                    type="text"
                    id="id"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    style={{
                      width: "100%",

                      padding: "8px",

                      border: "1px solid #ccc",

                      borderRadius: "4px",
                    }}
                    required
                  />
                                 {" "}
                </div>
                               {" "}
                <button className="btn" type="submit">
                                    Submit                {" "}
                </button>
                             {" "}
              </form>
                         {" "}
            </div>
                        {/* <ToastContainer /> */}         {" "}
          </div>
                   {" "}
          {/* {console.log(posts)}

      {console.log(user.sub)} */}
                 {" "}
        </>
      )}
           {" "}
      <FloatingButtonWithTable Loanno={{ selectedLoanNumber, selectedrole }} /> 
          {/* {console.log(selectedLoanNumber, selectedrole)} */}   {" "}
    </>
  );
};

export default MyLoan;
