import React from "react";
import LoanCompleted from "./LoanCompleted";
import LoanInfo from "./LoanInfo";
import LoanStateMessage from "./LoanStateMessage";
import {
  formatLoanDate,
  formatNumber,
  getLoanMessage,
} from "../utils/loanUtils";
import "./LoanState.css";

const LoanState = ({ loandata }) => {
  //   const currentDate = new Date();
  const currentDate = "2025-01-01";
  const loanMessage = getLoanMessage(loandata, currentDate);

  return (
    <div className="Coming_Up">
      {loandata?.loan_details?.status === "Complete" ? (
        <LoanCompleted balance="$ 0" />
      ) : (
        <>
          <LoanInfo
            role={loandata?.role}
            amountDue={formatNumber(loandata?.coming_up?.amount_due || 0)}
            dueDate={formatLoanDate(loandata?.coming_up?.due_date)}
          />
          <div className="LoanStateMessage">
            <LoanStateMessage
              message={loanMessage.message}
              amount={
                loanMessage.amount ? formatNumber(loanMessage.amount) : null
              }
              date={loanMessage.date ? formatLoanDate(loanMessage.date) : null}
              instructions={loanMessage.instructions}
              loan_state={loandata?.loan_state}
            />
          </div>
          <div className="Current_Balance">
            <div>
              Current Balance: $
              {loandata?.coming_up?.balance !== undefined &&
              loandata?.coming_up?.balance !== null
                ? formatNumber(loandata.coming_up.balance)
                : formatNumber(0)}
            </div>
          </div>
          {/* {console.log(loandata?.loan_state.due_history)} */}
        </>
      )}
    </div>
  );
};

export default LoanState;
