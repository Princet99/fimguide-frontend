{
  paymentHistory.length > 0 && (
    <>
      {/* Use a fragment to group the rows */}
      <tr>
        <td
          colSpan="6"
          style={{
            textAlign: "center",
            fontWeight: "bold",
            paddingTop: "20px",
          }}
        >
          Confirmation History
        </td>
      </tr>
      {paymentHistory.map((record, index) => (
        <tr key={record.id || index}>
          {/* Use a unique key, like record.id from your DB */}
          <td>{record.luid}</td>
          {/* Assuming 'luid' is a property in your history data */}
          {/* MODIFIED: Format date from history data */}
          <td>
            {console.log(record)}
            {record.payment_date
              ? formatDateToYYYYMMDD(new Date(record.payment_date))
              : "N/A"}
          </td>
          <td>{record.amount}</td>
          {/* Assuming 'amount' is a property */}
          <td>{record.comments}</td>
          {/* Assuming 'comments' is a property */}
          <td>
            {/* Assuming your history record has an attachment URL property, e.g., 'attachment_url' */}
            {record.receipt_url ? (
              <a href={record.receipt_url} target="_blank" rel="noreferrer">
                View
              </a>
            ) : (
              <span>No Attachment</span>
            )}
          </td>
          <td>
            {/* Display status from history if available, or a default */}
            {record.status || "Uploaded"}
            {/* Assuming 'status' is a property */}
          </td>
        </tr>
      ))}
    </>
  );
}
