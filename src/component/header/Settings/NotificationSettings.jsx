import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Import useParams
import axios from "axios";
import { toast } from "react-toastify";

// --- API Layer using Axios ---

const apiUrl = "https://api.fimdreams.com";

// Helper function to handle API responses that might be a single object or an array
const normalizetoArray = (data) => {
  if (Array.isArray(data)) {
    return data;
  }
  if (data) {
    return [data];
  }
  return [];
};

const NotificationSettings = () => {
  const { userId: userIdFromUrl } = useParams();
  const userId = userIdFromUrl || "1";

  // State for the list of loans
  const [loans, setLoans] = useState([]);
  const [areLoansLoading, setAreLoansLoading] = useState(true);

  // State for the settings form
  const [isSaving, setIsSaving] = useState(false);

  // State to manage which loan is currently selected in the dropdown
  const [selectedLoanNo, setSelectedLoanNo] = useState("");

  // Local state for form inputs
  const [email, setEmail] = useState("");
  const [dueNofiications, setdueNofiications] = useState(false);
  const [recieveNofiications, setrecieveNofiications] = useState(false);
  const [duereminderDays, setduereminderDays] = useState(7);
  const [receivereminderDays, setreceivereminderDays] = useState(7);

  // --- Data Fetching: Loans ---
  useEffect(() => {
    if (!userId) return;

    const fetchLoans = async () => {
      setAreLoansLoading(true);
      try {
        const response = await axios.get(`${apiUrl}/userloan/${userId}`);
        const loanData = normalizetoArray(response.data);
        setLoans(loanData);

        if (loanData.length > 0) {
          setSelectedLoanNo(loanData[0].loanNo);
        }
      } catch (err) {
        toast.error("Failed to fetch loans.");
        console.error(err);
      } finally {
        setAreLoansLoading(false);
      }
    };

    fetchLoans();
  }, [userId]);

  const handleSaveSettings = async () => {
    if (!selectedLoanNo || !userId) {
      toast.error("No loan selected.");
      return;
    }

    setIsSaving(true);
    // Payload for the 'Due Reminder'
    const dueRulePayload = {
      newRuleUserId: parseInt(userId, 10),
      loanUserId: parseInt(userId, 10),
      loanNo: selectedLoanNo,
      emailId: email,
      notificationType: "Payment_Due_Reminder",
      deliveryMethod: "Email",
      isEnabled: dueNofiications ? 1 : 0,
      intervalDays: parseInt(duereminderDays, 10),
    };

    // 2. Payload for the 'Received Reminder'
    const receivedRulePayload = {
      newRuleUserId: parseInt(userId, 10),
      loanUserId: parseInt(userId, 10),
      loanNo: selectedLoanNo,
      emailId: email,
      notificationType: "Payment_Received_Reminder", // Assumed type
      deliveryMethod: "Email",
      isEnabled: recieveNofiications ? 1 : 0,
      intervalDays: parseInt(receivereminderDays, 10),
    };

    try {
      // We make two POST requests, one for each rule.
      await axios.post(`${apiUrl}/notification`, dueRulePayload);
      await axios.post(`${apiUrl}/notification`, receivedRulePayload);

      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Combined loading state
  const isLoading = areLoansLoading || "";

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-2xl mx-auto my-8 font-inter">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Notifications</h3>

      {/* Loan Selector Dropdown */}
      <div className="mb-8">
        <label
          htmlFor="loan-selector"
          className="block text-lg font-semibold mb-2"
        >
          Select a Loan to Manage:
        </label>
        <select
          id="loan-selector"
          value={selectedLoanNo}
          onChange={(e) => setSelectedLoanNo(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-lg"
          disabled={areLoansLoading || loans.length === 0}
        >
          {areLoansLoading ? (
            <option>Loading loans...</option>
          ) : loans.length === 0 ? (
            <option>No loans found.</option>
          ) : (
            loans.map((loan) => (
              // Use loanNo as key, based on your JSON sample
              <option key={loan.loanNo} value={loan.loanNo}>
                {loan.nickname} ({loan.loanNo}) - {loan.role}
              </option>
            ))
          )}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          Loading settings for {selectedLoanNo}...
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md mb-6 p-4 border">
            <label htmlFor="email" className="block text-lg font-semibold mb-2">
              Your Preferred Contact Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <h4 className="text-xl font-semibold text-gray-800 my-6">
            Optional Notifications
          </h4>
          <div className="mb-5">
            <label className="flex items-center cursor-pointer text-gray-700">
              <input
                type="checkbox"
                checked={dueNofiications}
                // BUG FIX: Was checking !emailNotifications, now checks !dueNofiications
                onChange={() => setdueNofiications(!dueNofiications)}
                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 mr-3"
              />
              <span className="text-lg">Receive due Reminders</span>
            </label>
          </div>

          {dueNofiications && (
            <div className="mb-6 ml-8 transition-all duration-300 ease-in-out">
              <label
                htmlFor="reminderDays"
                className="text-lg text-gray-700 flex items-center"
              >
                Remind me
                <input
                  type="number"
                  id="reminderDays"
                  value={duereminderDays}
                  onChange={(e) =>
                    setduereminderDays(parseInt(e.target.value, 10))
                  }
                  min="0"
                  max="14"
                  className="w-20 ml-3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg"
                />
                <span className="ml-2">days before</span>
              </label>
            </div>
          )}

          <div className="mb-5">
            <label className="flex items-center cursor-pointer text-gray-700">
              <input
                type="checkbox"
                checked={recieveNofiications}
                onChange={() => setrecieveNofiications(!recieveNofiications)}
                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 mr-3"
              />
              <span className="text-lg">Receive Payment Reminders</span>
            </label>
          </div>

          {/* BUG FIX: Was checking emailNotifications, now checks recieveNofiications */}
          {recieveNofiications && (
            <div className="mb-6 ml-8 transition-all duration-300 ease-in-out">
              <label
                htmlFor="reminderDays"
                className="text-lg text-gray-700 flex items-center"
              >
                Remind me
                <input
                  type="number"
                  id="reminderDays"
                  value={receivereminderDays}
                  onChange={(e) =>
                    setreceivereminderDays(parseInt(e.target.value, 10))
                  }
                  min="0"
                  max="14"
                  className="w-20 ml-3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg"
                />
                <span className="ml-2">days before</span>
              </label>
            </div>
          )}

          <button
            onClick={handleSaveSettings}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={isSaving || isLoading}
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </>
      )}
    </div>
  );
};

export default NotificationSettings;
