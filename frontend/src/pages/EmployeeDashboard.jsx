import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function EmployeeDashboard() {
  const { user } = useAuth();
  const [salary, setSalary] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [leaveMsg, setLeaveMsg] = useState("");
  const [leaveErr, setLeaveErr] = useState("");
  const [leaveBusy, setLeaveBusy] = useState(false);
  const [attMsg, setAttMsg] = useState("");
  const [attErr, setAttErr] = useState("");
  const [attBusy, setAttBusy] = useState(false);

  async function load() {
    const [s, a, l] = await Promise.all([
      api.get("/api/salaries/me"),
      api.get("/api/attendance/me"),
      api.get("/api/leaves/me"),
    ]);
    setSalary(s.data.records || []);
    setAttendance(a.data.records || []);
    setLeaves(l.data.records || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold">Employee Dashboard</div>
          <div className="mt-1 text-sm text-slate-600">Welcome, {user?.name}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <div className="font-semibold">Apply Leave</div>
          {leaveErr ? (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {leaveErr}
            </div>
          ) : null}
          {leaveMsg ? (
            <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {leaveMsg}
            </div>
          ) : null}
          <div className="mt-2 text-xs text-slate-500">API: {api.defaults.baseURL}</div>
          <form
            className="mt-3 grid gap-3 sm:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              setLeaveErr("");
              setLeaveMsg("");
              setLeaveBusy(true);
              try {
                const fd = new FormData(form);
                const fromDate = String(fd.get("fromDate") || "");
                const toDate = String(fd.get("toDate") || "");
                const reason = String(fd.get("reason") || "");

                if (!fromDate || !toDate) {
                  setLeaveErr("Please select From and To dates.");
                  return;
                }

                await api.post("/api/leaves", { fromDate, toDate, reason });
                form.reset();
                setLeaveMsg("Leave submitted.");
                await load();
              } catch (err) {
                // eslint-disable-next-line no-console
                console.error("leave_submit_error", err);
                const status = err?.response?.status;
                const serverMsg = err?.response?.data?.message;
                const fallbackMsg = err?.message || "Leave submit failed";
                setLeaveErr(
                  serverMsg ? `(${status}) ${serverMsg}` : status ? `(${status}) ${fallbackMsg}` : `Network: ${fallbackMsg}`
                );
              } finally {
                setLeaveBusy(false);
              }
            }}
          >
            <div>
              <label className="text-sm font-medium">From</label>
              <input
                required
                name="fromDate"
                type="date"
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">To</label>
              <input
                required
                name="toDate"
                type="date"
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Reason</label>
              <input name="reason" className="mt-1 w-full rounded-md border px-3 py-2" placeholder="Optional" />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={leaveBusy}
                className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {leaveBusy ? "Submitting..." : "Submit Leave"}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="font-semibold">Mark Attendance</div>
          {attErr ? (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {attErr}
            </div>
          ) : null}
          {attMsg ? (
            <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {attMsg}
            </div>
          ) : null}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={attBusy}
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
              onClick={async () => {
                setAttErr("");
                setAttMsg("");
                setAttBusy(true);
                try {
                  await api.post("/api/attendance/check-in");
                  setAttMsg("Checked in.");
                  await load();
                } catch (err) {
                  const status = err?.response?.status;
                  const serverMsg = err?.response?.data?.message;
                  const fallbackMsg = err?.message || "Check-in failed";
                  setAttErr(
                    serverMsg
                      ? `(${status}) ${serverMsg}`
                      : status
                        ? `(${status}) ${fallbackMsg}`
                        : `Network: ${fallbackMsg}`
                  );
                } finally {
                  setAttBusy(false);
                }
              }}
            >
              Check In
            </button>
            <button
              type="button"
              disabled={attBusy}
              className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white"
              onClick={async () => {
                setAttErr("");
                setAttMsg("");
                setAttBusy(true);
                try {
                  await api.post("/api/attendance/check-out");
                  setAttMsg("Checked out.");
                  await load();
                } catch (err) {
                  const status = err?.response?.status;
                  const serverMsg = err?.response?.data?.message;
                  const fallbackMsg = err?.message || "Check-out failed";
                  setAttErr(
                    serverMsg
                      ? `(${status}) ${serverMsg}`
                      : status
                        ? `(${status}) ${fallbackMsg}`
                        : `Network: ${fallbackMsg}`
                  );
                } finally {
                  setAttBusy(false);
                }
              }}
            >
              Check Out
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <div className="font-semibold">Salary</div>
          <div className="mt-3 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-600">
                <tr>
                  <th className="py-2">Month</th>
                  <th className="py-2">Year</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {salary.map((r) => (
                  <tr key={r._id} className="border-t">
                    <td className="py-2">{r.month}</td>
                    <td className="py-2">{r.year}</td>
                    <td className="py-2 text-right">{r.amount}</td>
                  </tr>
                ))}
                {!salary.length ? (
                  <tr>
                    <td className="py-3 text-slate-500" colSpan={3}>
                      No salary records yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="font-semibold">Attendance</div>
          <div className="mt-3 space-y-2 text-sm">
            {attendance.slice(0, 8).map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div className="text-slate-700">{r.date}</div>
                <div className="text-slate-600">
                  {r.checkInAt ? new Date(r.checkInAt).toLocaleTimeString() : "--"} /{" "}
                  {r.checkOutAt ? new Date(r.checkOutAt).toLocaleTimeString() : "--"} • {r.status}
                </div>
              </div>
            ))}
            {!attendance.length ? <div className="text-slate-500">No attendance yet.</div> : null}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-white p-5">
        <div className="font-semibold">Leave Requests</div>
        <div className="mt-3 space-y-2 text-sm">
          {leaves.map((r) => (
            <div key={r._id} className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="text-slate-700">
                {r.fromDate} → {r.toDate}
              </div>
              <div className="text-slate-600">{r.status}</div>
            </div>
          ))}
          {!leaves.length ? <div className="text-slate-500">No leaves yet.</div> : null}
        </div>
      </div>
    </div>
  );
}

