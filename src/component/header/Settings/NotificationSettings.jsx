import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const apiUrl = process.env.REACT_APP_DEV_URL;

const NotificationSettings = () => {
  const { userId: userIdFromUrl } = useParams();
  const userId = userIdFromUrl || "1";

  // Loan dropdown
  const [loans, setLoans] = useState([]);
  const [selectedLoanNo, setSelectedLoanNo] = useState("");
  const [loadingLoans, setLoadingLoans] = useState(true);

  // Rule IDs
  const [dueRuleId, setDueRuleId] = useState(null);
  const [receiveRuleId, setReceiveRuleId] = useState(null);

  // Form state
  const [email, setEmail] = useState("");
  const [dueEnabled, setDueEnabled] = useState(false);
  const [receiveEnabled, setReceiveEnabled] = useState(false);
  const [dueDays, setDueDays] = useState(7);
  const [receiveDays, setReceiveDays] = useState(7);

  const [initial, setInitial] = useState(null);
  const [saving, setSaving] = useState(false);

  // FETCH LOANS FOR DROPDOWN
  useEffect(() => {
    const loadLoans = async () => {
      try {
        setLoadingLoans(true);

        const res = await axios.get(`${apiUrl}userloan/${userId}`);

        // Backend returns: { success, res: [...] }
        const data = res.data?.result || [];

        setLoans(data);

        if (data.length > 0) {
          setSelectedLoanNo(data[0].loanNo);
        }
      } catch (err) {
        toast.error("Failed to load loans.");
      } finally {
        setLoadingLoans(false);
      }
    };

    loadLoans();
  }, [userId]);

  // FETCH NOTIFICATION SETTINGS FOR SELECTED LOAN
  useEffect(() => {
    if (!selectedLoanNo) return;

    const loadNotificationSettings = async () => {
      try {
        const res = await axios.get(
          `${apiUrl}notification/${userId}/${selectedLoanNo}`
        );

        const rules = res.data?.res || [];

        // Reset default UI
        setDueRuleId(null);
        setReceiveRuleId(null);
        setEmail("");
        setDueEnabled(false);
        setReceiveEnabled(false);
        setDueDays(7);
        setReceiveDays(7);

        let initSnapshot = {
          email: "",
          dueEnabled: false,
          dueDays: 7,
          receiveEnabled: false,
          receiveDays: 7,
        };

        rules.forEach((rule) => {
          // DUE RULE
          console.log(rule);
          if (rule.nr_notification_type === "Payment_Due_Reminder") {
            setDueRuleId(rule.nr_rule_id);
            setEmail(rule.nr_email);
            setDueEnabled(rule.nr_is_enabled === 1);
            setDueDays(rule.nr_interval_days);

            initSnapshot.email = rule.nr_email;
            initSnapshot.dueEnabled = rule.nr_is_enabled === 1;
            initSnapshot.dueDays = rule.nr_interval_days;
          }

          // RECEIVABLE RULE
          if (rule.nr_notification_type === "Payment_Receiveable_Reminder") {
            setReceiveRuleId(rule.nr_rule_id);
            setEmail(rule.nr_email);
            setReceiveEnabled(rule.nr_is_enabled === 1);
            setReceiveDays(rule.nr_interval_days);

            initSnapshot.email = rule.nr_email;
            initSnapshot.receiveEnabled = rule.nr_is_enabled === 1;
            initSnapshot.receiveDays = rule.nr_interval_days;
          }
        });

        setInitial(initSnapshot);
      } catch (err) {
        toast.error("Failed to load notification settings.");
      }
    };

    loadNotificationSettings();
  }, [selectedLoanNo, userId]);

  // DIRTY CHECK
  const isDirty =
    initial &&
    (email !== initial.email ||
      dueEnabled !== initial.dueEnabled ||
      dueDays !== initial.dueDays ||
      receiveEnabled !== initial.receiveEnabled ||
      receiveDays !== initial.receiveDays);

  // SAVE SETTINGS
  const handleSave = async () => {
    if (!isDirty) return;
    setSaving(true);

    // PATCH requires nr_email
    const duePatchPayload = {
      nr_email: email,
      nr_is_enabled: dueEnabled ? 1 : 0,
      nr_interval_days: dueDays,
    };

    const recvPatchPayload = {
      nr_email: email,
      nr_is_enabled: receiveEnabled ? 1 : 0,
      nr_interval_days: receiveDays,
    };

    // POST requires emailId
    const duePostPayload = {
      emailId: email,
      isEnabled: dueEnabled ? 1 : 0,
      intervalDays: dueDays,
      newRuleUserId: parseInt(userId),
      loanNo: selectedLoanNo,
      notificationType: "Payment_Due_Reminder",
    };

    const recvPostPayload = {
      emailId: email,
      isEnabled: receiveEnabled ? 1 : 0,
      intervalDays: receiveDays,
      newRuleUserId: parseInt(userId),
      loanNo: selectedLoanNo,
      notificationType: "Payment_Receiveable_Reminder",
    };

    try {
      // DUE RULE
      if (dueRuleId) {
        await axios.patch(
          `${apiUrl}notification/${dueRuleId}`,
          duePatchPayload
        );
      } else {
        await axios.post(`${apiUrl}notification`, duePostPayload);
      }

      // RECEIVABLE RULE
      if (receiveRuleId) {
        await axios.patch(
          `${apiUrl}notification/${receiveRuleId}`,
          recvPatchPayload
        );
      } else {
        await axios.post(`${apiUrl}notification`, recvPostPayload);
      }

      toast.success("Settings updated!");
      setInitial({
        email,
        dueEnabled,
        dueDays,
        receiveEnabled,
        receiveDays,
      });
    } catch (err) {
      toast.error("Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  // UI
  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-2xl mx-auto my-8">
      <h3 className="text-2xl font-bold mb-4">Notification Settings</h3>

      {/* Loan Dropdown */}
      <div className="mb-8">
        <label className="block text-lg font-semibold mb-2">Select Loan:</label>

        <select
          value={selectedLoanNo}
          onChange={(e) => setSelectedLoanNo(e.target.value)}
          className="w-full px-4 py-3 border rounded-md"
        >
          {loadingLoans ? (
            <option>Loading...</option>
          ) : loans.length > 0 ? (
            loans.map((loan) => (
              <option key={loan.loanNo} value={loan.loanNo}>
                {loan.nickname} ({loan.loanNo})
              </option>
            ))
          ) : (
            <option>No loans found</option>
          )}
        </select>
      </div>

      {/* Email */}
      <div className="p-4 border rounded-lg shadow-sm mb-6">
        <label className="text-lg font-semibold mb-2 block">Email</label>
        <input
          type="email"
          value={email}
          className="w-full border px-3 py-2 rounded-md"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Due Reminder */}
      <div className="mb-5">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={dueEnabled}
            onChange={() => setDueEnabled(!dueEnabled)}
            className="h-5 w-5 mr-3"
          />
          <span className="text-lg">Receive Due Reminders</span>
        </label>
      </div>

      {dueEnabled && (
        <div className="ml-8 mb-6">
          <label className="flex items-center text-lg">
            Remind me
            <input
              type="number"
              value={dueDays}
              onChange={(e) => setDueDays(parseInt(e.target.value))}
              min="0"
              max="14"
              className="w-20 mx-3 border p-2 rounded-md text-center"
            />
            days before
          </label>
        </div>
      )}

      {/* Receivable Reminder */}
      <div className="mb-5">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={receiveEnabled}
            onChange={() => setReceiveEnabled(!receiveEnabled)}
            className="h-5 w-5 mr-3"
          />
          <span className="text-lg">Receive Payment Reminders</span>
        </label>
      </div>

      {receiveEnabled && (
        <div className="ml-8 mb-6">
          <label className="flex items-center text-lg">
            Remind me
            <input
              type="number"
              value={receiveDays}
              onChange={(e) => setReceiveDays(parseInt(e.target.value))}
              min="0"
              max="14"
              className="w-20 mx-3 border p-2 rounded-md text-center"
            />
            days before
          </label>
        </div>
      )}

      {/* Save Button */}
      <button
        disabled={!isDirty || saving}
        onClick={handleSave}
        className={`w-full py-3 rounded-lg font-semibold mt-4 ${
          !isDirty || saving
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
};

export default NotificationSettings;
