import React from "react";
import "./LoanInfo.css";

const LoanInfo = ({ role, amountDue, dueDate }) => (
  <div className="loan_info">
    <div className="Payment_Due">
      <span>
        {role === "borrower"
          ? `Amount due from borrower: $${amountDue}`
          : `Amount to be Received: $${amountDue}`}
      </span>
    </div>
    <div className="Payment_Due_Date">
      <span>Due: {dueDate}</span>
    </div>
  </div>
);

export default LoanInfo;
