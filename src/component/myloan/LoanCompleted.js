import React from "react";

const LoanCompleted = ({ balance }) => (
  <div className="loan_completed">
    <p>Your Loan has been fully repaid</p>
    <p>Current Balance: {balance}</p>
  </div>
);

export default LoanCompleted;
