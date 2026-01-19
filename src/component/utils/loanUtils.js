export const formatLoanDate = (dateString, locale = undefined) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date)) return "";

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatNumber = (value, locale = undefined, options = {}) => {
  const safeValue = Number(value) || 0;
  return safeValue.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });
};

export const getLoanMessage = (loandata, currentDate) => {
  // console.log(loandata , "loan data");
  const { loan_state, loan_details, role , coming_up } = loandata || {};
  const loanStatus = loan_details?.status;
  // const loanDate = new Date(loan_state?.date);
  // console.log(loan_state);
  const getCurrentDate = () => {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // console.log(getCurrentDate());

  if (loanStatus === "Complete") {
    return { message: "Your Loan has been fully repaid", balance: "$ 0" };
  }

  if (loan_state?.loan_amount_paid === "N") {
    if (role === "borrower") {
      if (getCurrentDate() > loan_state.loan_schedule_date) {
        return {
          message:
            "This loan has not started because the lender has not made the required payment when it was due",
          amount: loan_details.loan_amount,
          date: loan_state.loan_schedule_date,
        };
      }
      return {
        message: "You are scheduled to receive",
        amount: loan_details.loan_amount,
        date: loan_state.loan_schedule_date,
      };
    } else if (role === "lender") {
      if (getCurrentDate() > loan_state.loan_schedule_date) {
        return {
          message:
            "Please Pay to start the loan. The borrower is scheduled to receive",
          amount: loan_details.loan_amount,
          date: loan_state.loan_schedule_date,
        };
      }
      return {
        message: "Please pay",
        amount: loan_details.loan_amount,
        date: loan_state.loan_schedule_date,
      };
    }
  }
  // else if (coming_up?.amount_due) {
  //   return {
  //     message: "Next payment due",
  //     amount: coming_up.amount_due,
  //     instructions: `by ${coming_up.due_date}`,
  //   };
  // }
   else if (loan_state?.total_due > 0) {
    if (loan_state?.status === "On time" && role === "borrower") {
      return {
        message: "You have a past due balance!",
        amount: loan_state.total_due,
      };
    } else if (role === "borrower") {
      return {
        message: "Your payment is past due!",
        amount: loan_state.total_due,
        instructions: "Please pay now or contact FiMguide.",
      };
    } else if (role === "lender") {
      return {
        message: "Borrower has a past due balance!",
        amount: loan_state.total_due,
        instructions:
          "FimGuide will contact the borrower and keep you updated.",
      };
    }
  }
  return { message: "" };
};
