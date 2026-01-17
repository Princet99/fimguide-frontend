import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

// --- API Layer using Axios ---

const apiUrl =
  process.env.NODE_ENV === "production"
    ? "https://fimguide-backend.onrender.com"
    : "http://localhost:3030";

// MODIFIED: Fetches the LIST of loans for a user
const fetchUserLoans = async (userId) => {
  if (!userId) return [];
  const { data } = await axios.get(`${apiUrl}/my-loans/${userId}`);
  return data; // Returns the array of loans
};

// MODIFIED: Fetches notification settings for a SPECIFIC loan
const fetchNotificationSettings = async (userId, loanNo) => {
  if (!userId || !loanNo) return null;
  // NOTE: Assuming the endpoint now includes the loan_no
  const { data } = await axios.get(
    `${apiUrl}/api/reminders/${userId}/${loanNo}`,
  );
  return data;
};

// MODIFIED: Saves notification settings, now must include the loan_no
const saveNotificationSettings = async (payload) => {
  if (!payload.userId || !payload.sc_ln_no) {
    throw new Error("User ID or Loan Number is missing in payload");
  }
  const { data } = await axios.post(
    `${apiUrl}/api/reminders/notification-settings`,
    payload,
    { headers: { "Content-Type": "application/json" } },
  );
  return data;
};

const NotificationSettings = () => {
  // --- Hooks and State ---
  const queryClient = useQueryClient();
  const userId = sessionStorage.getItem("userId")?.replace(/"/g, "");

  // NEW: State to manage which loan is currently selected in the dropdown
  const [selectedLoanNo, setSelectedLoanNo] = useState("");

  // Local state for form inputs
  const [email, setEmail] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [reminderDays, setReminderDays] = useState(7);

  // --- React Query Hooks ---

  // 1. Query to fetch the list of all user loans for the dropdown
  const { data: loansData, isLoading: areLoansLoading } = useQuery({
    queryKey: ["userLoans", userId],
    queryFn: () => fetchUserLoans(userId),
    enabled: !!userId,
  });

  // NEW: Effect to auto-select the first loan once the list is loaded
  useEffect(() => {
    if (loansData && loansData.length > 0 && !selectedLoanNo) {
      setSelectedLoanNo(loansData[0].loan_no);
    }
  }, [loansData, selectedLoanNo]);

  // 2. Query to fetch settings for the CURRENTLY SELECTED loan
  // MODIFIED: The query key and function now depend on 'selectedLoanNo'
  const { data: settingsData, isLoading: areSettingsLoading } = useQuery({
    queryKey: ["notificationSettings", userId, selectedLoanNo],
    queryFn: () => fetchNotificationSettings(userId, selectedLoanNo),
    // MODIFIED: Only run this query if a loan has been selected
    enabled: !!userId && !!selectedLoanNo,
    retry: false,
    onError: (err) => {
      // A 404 is now expected for a loan that has no settings yet.
      if (err.response?.status !== 404) {
        console.error("Error fetching notification settings:", err);
        toast.error("Failed to load your notification settings.");
      } else {
        // Reset form to defaults if no settings are found for this loan
        const sessionEmail =
          JSON.parse(sessionStorage.getItem("user") || "{}")?.email || "";
        setEmail(sessionEmail);
        setEmailNotifications(false);
        setReminderDays(7);
      }
    },
  });

  // Syncs fetched settings data with local state when it changes
  useEffect(() => {
    if (settingsData && Object.keys(settingsData).length > 0) {
      setEmailNotifications(!!settingsData.nr_is_enabled);
      setReminderDays(settingsData.nr_interval_days ?? 7);
      setEmail(
        settingsData.nr_email ||
          JSON.parse(sessionStorage.getItem("user") || "{}")?.email ||
          "",
      );
    }
  }, [settingsData]);

  // Mutation to save settings
  const saveSettingsMutation = useMutation({
    mutationFn: saveNotificationSettings,
    onSuccess: () => {
      toast.success("Settings saved successfully!");
      // MODIFIED: Invalidate the specific query for the loan that was just saved
      queryClient.invalidateQueries({
        queryKey: ["notificationSettings", userId, selectedLoanNo],
      });
    },
    onError: (error) => {
      console.error("Error saving settings:", error);
      toast.error(error.response?.data?.message || "Failed to save settings.");
    },
  });

  // --- Event Handlers ---

  const handleSaveSettings = async () => {
    if (!selectedLoanNo) {
      toast.error("Please select a loan before saving.");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // Find the role for the selected loan from the fetched loans data
    const selectedLoan = loansData?.find(
      (loan) => loan.loan_no === selectedLoanNo,
    );
    if (!selectedLoan) {
      toast.error("Could not find details for the selected loan.");
      return;
    }

    const sc_payor = selectedLoan.role.toLowerCase() === "lender" ? "2" : "1";

    const settingsPayload = {
      userId: parseInt(userId, 10),
      userEmail: email,
      receiveNotifications: emailNotifications ? 1 : 0,
      intervalDays: emailNotifications ? reminderDays : 7,
      sc_ln_no: selectedLoanNo, // Use the selected loan number
      sc_payor: sc_payor,
      notificationType: "Payment Reminder",
      deliveryMethod: "Email",
    };

    saveSettingsMutation.mutate(settingsPayload);
  };

  // --- Render Logic ---

  const isLoading = areLoansLoading || areSettingsLoading;
  const isSaving = saveSettingsMutation.isLoading;

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-2xl mx-auto my-8 font-inter">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Notifications</h3>

      {/* NEW: Loan Selector Dropdown */}
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
          disabled={areLoansLoading}
        >
          {areLoansLoading ? (
            <option>Loading loans...</option>
          ) : (
            loansData?.map((loan) => (
              <option key={loan.loan_no} value={loan.loan_no}>
                {loan.nickname} ({loan.loan_no}) - {loan.role}
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
                checked={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 mr-3"
              />
              <span className="text-lg">Receive Payment Reminders</span>
            </label>
          </div>

          {emailNotifications && (
            <div className="mb-6 ml-8 transition-all duration-300 ease-in-out">
              <label
                htmlFor="reminderDays"
                className="text-lg text-gray-700 flex items-center"
              >
                Remind me
                <input
                  type="number"
                  id="reminderDays"
                  value={reminderDays}
                  onChange={(e) =>
                    setReminderDays(parseInt(e.target.value, 10))
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

          {/* ... Required Notifications Section and Footer ... */}
        </>
      )}
    </div>
  );
};

export default NotificationSettings;
