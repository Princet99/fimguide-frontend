import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

// --- API Layer using Axios ---

const apiUrl =
  process.env.NODE_ENV === "production"
    ? "https://fimguide-backend.onrender.com"
    : "http://localhost:3030";

// Fetches notification settings for a specific user via their ID.
const fetchNotificationSettings = async (userId) => {
  if (!userId) return null;
  // Use the correct endpoint with the user's ID
  const { data } = await axios.get(`${apiUrl}/api/reminders/${userId}`);
  return data;
};

// Saves (creates/updates) notification settings
const saveNotificationSettings = async (payload) => {
  if (!payload.userId) throw new Error("User ID is missing in payload");
  const { data } = await axios.post(
    `${apiUrl}/api/reminders/notification-settings`,
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return data;
};

const NotificationSettings = () => {
  // --- Hooks and State ---
  const queryClient = useQueryClient();
  const userId = sessionStorage.getItem("userId")?.replace(/"/g, ""); // Get clean userId
  const sessionStoredUser = JSON.parse(sessionStorage.getItem("user") || "{}");

  // Local state for form inputs, email is now sourced only from session
  const [email, setEmail] = useState(sessionStoredUser?.email || "");
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [reminderDays, setReminderDays] = useState(7);

  // Static values for the "Payment Reminder" rule
  const notificationType = "Payment Reminder";
  const deliveryMethod = "Email";
  const sc_ln_no = "fa0011";
  const sc_payor = "1";

  // --- React Query Hooks ---

  // Query to fetch existing notification settings using the user's ID
  const { data: settingsData, isLoading: areSettingsLoading } = useQuery({
    queryKey: ["notificationSettings", userId],
    queryFn: () => fetchNotificationSettings(userId),
    enabled: !!userId, // This query runs as soon as the userId is available
    onError: (error) => {
      if (error.response?.status !== 404) {
        console.error("Error fetching notification settings:", error);
        toast.error("Failed to load your notification settings.");
      }
    },
  });

  // **FIX:** Use useEffect to reliably sync query data with local state.
  // This ensures the UI updates correctly even when data is served from cache.
  useEffect(() => {
    if (settingsData) {
      // Use the correct keys from the API response
      setEmailNotifications(!!settingsData.nr_is_enabled); // Convert 1/0 to boolean
      setReminderDays(settingsData.nr_interval_days ?? 7); // Default to 7 if null/undefined
      // Optionally update the email field from the rule's email
      if (settingsData.nr_email) {
        setEmail(settingsData.nr_email);
      }
    }
  }, [settingsData]); // This effect runs whenever the fetched data changes.

  // Mutation to save notification settings
  const saveSettingsMutation = useMutation({
    mutationFn: saveNotificationSettings,
    onSuccess: (data) => {
      toast.success("Settings saved successfully!");
      // Invalidate the query to refetch fresh data after a successful save
      queryClient.invalidateQueries({
        queryKey: ["notificationSettings", userId],
      });
    },
    onError: (error) => {
      console.error("Error saving settings:", error);
      toast.error(error.response?.data?.message || "Failed to save settings.");
    },
  });

  // --- Event Handlers ---

  const handleSaveSettings = async () => {
    if (!userId) {
      toast.error("User ID not found. Cannot save settings.");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address before saving.");
      return;
    }

    const settingsPayload = {
      userId: parseInt(userId, 10),
      userEmail: email,
      // Convert boolean back to 1 or 0 for the backend
      receiveNotifications: emailNotifications ? 1 : 0,
      intervalDays: emailNotifications ? reminderDays : 7,
      sc_ln_no,
      sc_payor,
      notificationType,
      deliveryMethod,
    };

    saveSettingsMutation.mutate(settingsPayload);
  };

  const handleReminderDaysChange = (e) => {
    const value = e.target.value === "" ? "" : parseInt(e.target.value, 10);
    if (value === "" || (!isNaN(value) && value >= 0 && value <= 14)) {
      setReminderDays(value);
    }
  };

  // --- Render Logic ---

  const isLoading = areSettingsLoading;
  const isSaving = saveSettingsMutation.isLoading;

  if (isLoading) {
    return <div className="p-6 text-center">Loading settings...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-2xl mx-auto my-8 font-inter">
      <h3 className="text-2xl font-bold text-gray-800 my-6">Notifications</h3>

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

      <h3 className="text-2xl font-bold text-gray-800 my-6">
        Optional Notifications
      </h3>

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
              onChange={handleReminderDaysChange}
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
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Settings"}
      </button>

      <div className="mt-10">
        <h4 className="text-xl font-semibold text-gray-800 mb-4">
          Required Notifications
        </h4>
        <div className="p-6 bg-gray-50 rounded-lg shadow-sm space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked
              disabled
              className="form-checkbox h-5 w-5 text-gray-400 cursor-not-allowed mr-3"
            />
            <span className="text-lg text-gray-800">Past Due Notice</span>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked
              disabled
              className="form-checkbox h-5 w-5 text-gray-400 cursor-not-allowed mr-3"
            />
            <span className="text-lg text-gray-800">
              Notice Before Credit Reporting
            </span>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked
              disabled
              className="form-checkbox h-5 w-5 text-gray-400 cursor-not-allowed mr-3"
            />
            <span className="text-lg text-gray-800">
              Notice After a Negative Credit Report
            </span>
          </div>
        </div>
      </div>

      <footer className="bg-gray-100 p-4 text-sm italic border-t text-red-700 mt-6 rounded-b-lg">
        Please keep in mind: you are responsible for resolving Past Due amounts
        even if these notices are not received.
      </footer>
    </div>
  );
};

export default NotificationSettings;
