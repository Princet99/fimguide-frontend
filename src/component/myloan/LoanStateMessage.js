import "./LoanStateMessage.css";

const LoanStateMessage = ({
  message,
  amount,
  date,
  instructions,
  loan_state,
}) => (
  <div className="loan_state">
    <div className="loan_state_payment">
      <p>{message}</p>
      {amount && (
        <p>
          ${amount}
          <span className="loan-state-message">
            {/* Display Question Mark with Tooltip */}
            {loan_state?.due_history?.length > 0 && (
              <div className="ml-2 relative inline-block group">
                {/* Trigger Element */}
                <span className="tooltip-trigger" title="Hover for details">
                  ?
                </span>

                {/* Tooltip */}
                <div className="loan-tooltip">
                  <h4>Past Due Breakdown</h4>
                  <table className="Pastdue_breakdown">
                    <thead>
                      <tr>
                        <th>Schedule Date</th>
                        <th>Interest</th>
                        <th>Principal</th>
                        <th>Total Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loan_state.due_history.map((item, index) => (
                        <tr key={index}>
                          <td>{item.schedule_date}</td>
                          <td>{item.interest}</td>
                          <td>{item.principal}</td>
                          <td>{item.due_amount}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td>Total</td>
                        <td>
                          {loan_state.due_history
                            .reduce(
                              (sum, item) => sum + parseFloat(item.interest),
                              0
                            )
                            .toFixed(2)}
                        </td>
                        <td>
                          {loan_state.due_history
                            .reduce(
                              (sum, item) => sum + parseFloat(item.principal),
                              0
                            )
                            .toFixed(2)}
                        </td>
                        <td>
                          {loan_state.due_history
                            .reduce(
                              (sum, item) => sum + parseFloat(item.due_amount),
                              0
                            )
                            .toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </span>
        </p>
      )}
      {date && <p>By {date}</p>}
      {instructions && <p>{instructions}</p>}
    </div>
  </div>
);

export default LoanStateMessage;
