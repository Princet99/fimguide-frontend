import React, { useEffect, useState } from "react";
import "./MyLoan.css";

const MyLoan = () => {
  const [data, setData] = useState(null); // Store fetched data
  const [selectedLoanDetails, setSelectedLoanDetails] = useState(null); // Loan details for selected nickname
  const [selectedLoanNumber, setSelectedLoanNumber] = useState(""); // Selected loan number

  // Get userId from sessionStorage
  const userId = sessionStorage.getItem("userId");

  const apiUrl =
    process.env.NODE_ENV === "production"
      ? "https://fimguide-backend-production.up.railway.app"
      : "http://localhost:3030";

  useEffect(() => {
    fetch(`${apiUrl}/my-loans/${userId}/loanNo/FA0001`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log("API Response:", data);
        if (!data.errors) {
          setData(data);
        } else {
          setData(null); // Handle case when data contains errors
        }
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, [userId]);

  // Extract all nicknames and corresponding loan numbers
  const getAllLoans = (data) => {
    if (!data) return [];
    const lenderLoans = Object.entries(data.lender || {}).map(
      ([loanNumber, details]) => ({
        loanNumber: `lender-${loanNumber}`, // Unique identifier
        originalLoanNumber: loanNumber, // Keep the original loanNumber if needed
        nickname: details.nickname,
        role: "lender",
      })
    );
    const borrowerLoans = Object.entries(data.borrower || {}).map(
      ([loanNumber, details]) => ({
        loanNumber: `borrower-${loanNumber}`, // Unique identifier
        originalLoanNumber: loanNumber, // Keep the original loanNumber if needed
        nickname: details.nickname,
        role: "borrower",
      })
    );
    return [...borrowerLoans, ...lenderLoans];
  };

  // Handle nickname selection
  const handleLoanChange = (event) => {
    const uniqueLoanNumber = event.target.value; // e.g., "borrower-fa0002" or "lender-fa0002"
    setSelectedLoanNumber(uniqueLoanNumber);

    // Extract role and original loan number
    const [role, originalLoanNumber] = uniqueLoanNumber.split("-");

    // Access the loan details based on role and original loan number
    const loanDetails = data[role]?.[originalLoanNumber];
    setSelectedLoanDetails(loanDetails || null);
    console.log("Selected Loan Details:", loanDetails);
  };

  return (
    <>
      <div className="Content">
        <h1>My Loans</h1>
        <div className="Loan-container">
          {/* Loan Details */}
          <div className="Loan_Details">
            <div className="select-loan" style={{ fontWeight: "bold" }}>
              <label className="label-loanname">Loan Name &nbsp;</label>
              <select
                id="loan-select"
                value={selectedLoanNumber}
                onChange={handleLoanChange}
              >
                <option className="options" value="">select loan</option>
                {getAllLoans(data).map(({ loanNumber, nickname }, index) => (
                  <option key={index} value={loanNumber}>
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
          <div className="section">
            {/* Coming Up Section */}
            <div className="Heading">Coming up</div>
            <div className="Coming_Up">
              <div className="Payment_Due">
                <span>
                  {selectedLoanNumber.startsWith("borrower")
                    ? `Amount Due: $${
                        selectedLoanDetails?.coming_up?.amount_due || 0
                      }`
                    : `Amount to be Received: $${
                        selectedLoanDetails?.coming_up?.amount_due || 0
                      }`}
                </span>
              </div>
              <div className="Payment_Due_Date">
                <span>
                  Due Date:{" "}
                  {selectedLoanDetails?.coming_up?.due_date
                    ? (() => {
                        const date = new Date(
                          selectedLoanDetails.coming_up.due_date
                        );
                        const month = date.toLocaleString(undefined, {
                          month: "long",
                        });
                        const day = date.toLocaleString(undefined, {
                          day: "numeric",
                        });
                        const year = date.toLocaleDateString(undefined,{
                          year: "numeric"
                        })
                        return `${month} ${day}, ${year}`;
                      })()
                    : ""}
                </span>
              </div>
              <div className="Current_Balance">
                <span>
                  Current Balance: $
                  {selectedLoanDetails?.coming_up?.balance !== undefined &&
                  selectedLoanDetails?.coming_up?.balance !== null
                    ? Number(
                        selectedLoanDetails.coming_up.balance
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                      })
                    : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Scoring Section */}
          <div className="section">
            <div className="Loan_Score">
              <div className="Heading">Loan Score</div>
              <div className="Score">
                {selectedLoanDetails?.loan_details.score}
              </div>
            </div>
          </div>

          {/* Loan Details Section */}
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
                  <td>${selectedLoanDetails?.loan_details?.loan_amount}</td>
                  <td>{selectedLoanDetails?.loan_details?.interest_rate}</td>
                  <td>{selectedLoanDetails?.loan_details?.contract_date}</td>
                  <td>{selectedLoanDetails?.loan_details?.end_date}</td>
                </tr>
              </tbody>
            </table>

            {/* Loan Full Details */}
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
          </div>

          {/* Recent Payments Section */}
          <div className="section">
            <div className="Heading">Recent Payments</div>
            <div className="Recent_Payments">
              <table className="Recent_Payment_Table" border="1">
                <thead>
                  <tr>
                    <th>Scheduled Date</th>
                    <th>Date Paid</th>
                    <th>Scheduled Amount</th>
                    <th>Amount Paid</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedLoanDetails?.recentPayments?.map(
                    (payment, index) => (
                      <tr key={index}>
                        <td>{payment.scheduledDate}</td>
                        <td>{payment.actualDate}</td>
                        <td>
                          $
                          {Number(payment.scheduledPaidAmount).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 0,
                            }
                          )}
                        </td>
                        <td>
                          $
                          {Number(payment.paidAmount).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 0,
                            }
                          )}
                        </td>
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
    </>
  );
};

export default MyLoan;
