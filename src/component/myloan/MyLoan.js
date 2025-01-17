import React, { useEffect, useState } from "react";
import "./MyLoan.css";

const MyLoan = () => {
  const [data, setData] = useState(null); // Store fetched data
  const [selectedLoanDetails, setSelectedLoanDetails] = useState(null); // Loan details for selected nickname
  const [selectedLoanNumber, setSelectedLoanNumber] = useState(""); // Selected loan number
  const [Loanno, setLoanno] = useState(null);

  // Get userId from sessionStorage
  const userId = sessionStorage.getItem("userId");

  const apiUrl =
    process.env.NODE_ENV === "production"
      ? "https://fimguide-backend-production.up.railway.app"
      : "http://localhost:3030";

  // This hook for displaying getting all Loan Number
  useEffect(() => {
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
          setLoanno(data);
          // Set the default loan number to the first loan if no loan is selected
          if (!selectedLoanNumber) {
            setSelectedLoanNumber(data[0].loan_no); // Default to first loan number
          }
        } else {
          setLoanno(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching loans:", error);
        setLoanno(null);
      });
  }, [apiUrl, userId, selectedLoanNumber]);

  // This hook for displaying Loan Details
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
  }, [apiUrl, userId, selectedLoanNumber]);

  console.log(data);

  useEffect(() => {
    if (!selectedLoanNumber || !data) return;

    // Merge borrower and lender data to match loan number
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
  }, [selectedLoanNumber, data]); // Use `data` in the dependency array

  return (
    <>
      <div className="Content">
        <h1>My Loans</h1>
        <div className="Loan-container">
          {/* Loan Details */}
          <div className="Loan_Details">
            <div className="select-loan" style={{ fontWeight: "bold" }}>
              <select
                className="loan-select"
                value={selectedLoanNumber || Loanno?.[0]?.loan_no || ""}
                onChange={(e) => setSelectedLoanNumber(e.target.value)}
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
          <div className="section">
            {/* Coming Up Section */}
            <div className="Heading">Coming up</div>
            <div className="Coming_Up">
              {selectedLoanDetails?.loan_details?.status === "Complete" ? (
                <div className="loan_completed">
                  <p>Your Loan has been fully repaid</p>
                  <p>Current Balance: $ 0</p>
                </div>
              ) : (
                <>
                  <div className="loan_state_info">
                    <div className="loan_info">
                      <div className="Payment_Due">
                        <span>
                          {selectedLoanDetails?.role === "borrower"
                            ? `Amount Due: $${
                                Number(
                                  selectedLoanDetails?.coming_up?.amount_due
                                ).toLocaleString(undefined, {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 2,
                                }) || 0
                              }`
                            : `Amount to be Received: $${
                                Number(
                                  selectedLoanDetails?.coming_up?.amount_due
                                ).toLocaleString(undefined, {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 2,
                                }) || 0
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
                                const year = date.toLocaleDateString(
                                  undefined,
                                  {
                                    year: "numeric",
                                  }
                                );
                                return `${month} ${day}, ${year}`;
                              })()
                            : ""}
                        </span>
                      </div>
                    </div>

                    {selectedLoanDetails?.loan_state?.total_due > 0 && (
                      <div className="loan_state">
                        <div className="loan_state_payment">
                          {selectedLoanDetails?.role === "borrower" ? (
                            <div className="state_borrower">
                              <p>You Have a Past due balance!</p>$
                              {selectedLoanDetails?.loan_state?.total_due}
                            </div>
                          ) : (
                            <div className="state_lender">
                              <p>Borrower has a Past due balance!</p>$
                              {selectedLoanDetails?.loan_state?.total_due}
                              <p>
                                FimGuide will contact borrower and keep you
                                updated
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="loan_state_date">
                          <span></span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="Current_Balance">
                    <div>
                      Current Balance: $
                      {selectedLoanDetails?.coming_up?.balance !== undefined &&
                      selectedLoanDetails?.coming_up?.balance !== null
                        ? Number(
                            selectedLoanDetails.coming_up.balance
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })
                        : ""}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Scoring Section */}
          <div className="section">
            <div className="Loan_Score">
              <div className="Heading">Loan Score</div>
              <div className="Score">
                {selectedLoanDetails?.loan_details?.score}
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
                  <td>
                    $
                    {Number(
                      selectedLoanDetails?.loan_details?.loan_amount
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
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
                              maximumFractionDigits: 2,
                            }
                          )}
                        </td>
                        <td>
                          $
                          {Number(payment.paidAmount).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
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
