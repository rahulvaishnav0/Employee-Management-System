import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function HrDashboard() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [salaryEmployeeId, setSalaryEmployeeId] = useState("");
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [salaryForm, setSalaryForm] = useState({ month: "", year: "", amount: "" });
  const [empBusy, setEmpBusy] = useState(false);
  const [empErr, setEmpErr] = useState("");
  const [empMsg, setEmpMsg] = useState("");
  const [salBusy, setSalBusy] = useState(false);
  const [salErr, setSalErr] = useState("");
  const [salMsg, setSalMsg] = useState("");

  async function load() {
    const [e, l, a] = await Promise.all([
      api.get("/api/employees"),
      api.get("/api/leaves"),
      api.get("/api/attendance"),
    ]);
    setEmployees(e.data.employees || []);
    setLeaves(l.data.records || []);
    setAttendance(a.data.records || []);
  }

  async function loadSalary(employeeId) {
    if (!employeeId) {
      setSalaryRecords([]);
      return;
    }
    const res = await api.get(`/api/salaries/employee/${employeeId}`);
    setSalaryRecords(res.data.records || []);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    loadSalary(salaryEmployeeId);
  }, [salaryEmployeeId]);

  const employeeOptions = useMemo(() => employees, [employees]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="text-2xl font-semibold">HR Dashboard</div>
      <div className="mt-1 text-sm text-slate-600">Welcome, {user?.name}</div>
      <div className="mt-2 text-xs text-slate-500">API: {api.defaults.baseURL}</div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <div className="font-semibold">Create Employee</div>
          {empErr ? (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {empErr}
            </div>
          ) : null}
          {empMsg ? (
            <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {empMsg}
            </div>
          ) : null}
          <form
            className="mt-3 grid gap-3 sm:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              setEmpErr("");
              setEmpMsg("");
              setEmpBusy(true);
              try {
                const fd = new FormData(form);
                await api.post("/api/employees", {
                  name: String(fd.get("name") || ""),
                  email: String(fd.get("email") || ""),
                  password: String(fd.get("password") || ""),
                  department: String(fd.get("department") || ""),
                  position: String(fd.get("position") || ""),
                  baseSalaryMonthly: Number(fd.get("baseSalaryMonthly") || 0),
                });
                form.reset();
                setEmpMsg("Employee created.");
                await load();
              } catch (err) {
                // eslint-disable-next-line no-console
                console.error("create_employee_error", err);
                const status = err?.response?.status;
                const serverMsg = err?.response?.data?.message;
                const issues = err?.response?.data?.issues;
                const issueText =
                  Array.isArray(issues) && issues.length
                    ? issues
                        .slice(0, 2)
                        .map((i) => `${(i.path || []).join(".") || "field"}: ${i.message}`)
                        .join(" | ")
                    : "";
                const fallbackMsg = err?.message || "Create employee failed";
                setEmpErr(
                  issueText
                    ? `(${status}) ${issueText}`
                    : serverMsg
                      ? `(${status}) ${serverMsg}`
                    : status
                      ? `(${status}) ${fallbackMsg}`
                      : `Network: ${fallbackMsg}`
                );
              } finally {
                setEmpBusy(false);
              }
            }}
          >
            <div>
              <label className="text-sm font-medium">Name</label>
              <input required name="name" className="mt-1 w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input required name="email" className="mt-1 w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input required name="password" type="password" className="mt-1 w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Department</label>
              <input name="department" className="mt-1 w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Position</label>
              <input name="position" className="mt-1 w-full rounded-md border px-3 py-2" />
            </div>
            <div>
              <label className="text-sm font-medium">Base Salary (monthly)</label>
              <input
                name="baseSalaryMonthly"
                type="number"
                className="mt-1 w-full rounded-md border px-3 py-2"
                defaultValue={0}
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={empBusy}
                className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {empBusy ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="font-semibold">Add / Update Salary</div>
          {salErr ? (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {salErr}
            </div>
          ) : null}
          {salMsg ? (
            <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {salMsg}
            </div>
          ) : null}
          <form
            className="mt-3 grid gap-3 sm:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              setSalErr("");
              setSalMsg("");
              setSalBusy(true);
              try {
                const employeeId = String(salaryEmployeeId || "");
                if (!employeeId) {
                  setSalErr("Please select an employee.");
                  return;
                }
                await api.post("/api/salaries", {
                  employeeId,
                  month: Number(salaryForm.month),
                  year: Number(salaryForm.year),
                  amount: Number(salaryForm.amount),
                });
                setSalaryForm({ month: "", year: "", amount: "" });
                setSalMsg("Salary saved.");
                await loadSalary(employeeId);
              } catch (err) {
                // eslint-disable-next-line no-console
                console.error("save_salary_error", err);
                const status = err?.response?.status;
                const serverMsg = err?.response?.data?.message;
                const fallbackMsg = err?.message || "Save salary failed";
                setSalErr(
                  serverMsg
                    ? `(${status}) ${serverMsg}`
                    : status
                      ? `(${status}) ${fallbackMsg}`
                      : `Network: ${fallbackMsg}`
                );
              } finally {
                setSalBusy(false);
              }
            }}
          >
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Select Employee</label>
              <select
                name="employeeId"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={salaryEmployeeId}
                onChange={(e) => setSalaryEmployeeId(e.target.value)}
              >
                <option value="">-- select --</option>
                {employeeOptions.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.name} ({e.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Month (1-12)</label>
              <input
                required
                name="month"
                type="number"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={salaryForm.month}
                onChange={(e) => setSalaryForm((s) => ({ ...s, month: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Year</label>
              <input
                required
                name="year"
                type="number"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={salaryForm.year}
                onChange={(e) => setSalaryForm((s) => ({ ...s, year: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Amount</label>
              <input
                required
                name="amount"
                type="number"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={salaryForm.amount}
                onChange={(e) => setSalaryForm((s) => ({ ...s, amount: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={salBusy}
                className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {salBusy ? "Saving..." : "Save Salary"}
              </button>
            </div>
          </form>

          {salaryEmployeeId ? (
            <div className="mt-5">
              <div className="font-semibold">Salary Records</div>
              <div className="mt-2 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-600">
                    <tr>
                      <th className="py-2">Month</th>
                      <th className="py-2">Year</th>
                      <th className="py-2 text-right">Amount</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryRecords.map((r) => (
                      <tr key={r._id} className="border-t">
                        <td className="py-2">{r.month}</td>
                        <td className="py-2">{r.year}</td>
                        <td className="py-2 text-right">{r.amount}</td>
                        <td className="py-2">
                          <button
                            type="button"
                            className="text-indigo-700 underline"
                            onClick={() => setSalaryForm({ month: String(r.month), year: String(r.year), amount: String(r.amount) })}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!salaryRecords.length ? (
                      <tr>
                        <td className="py-3 text-slate-500" colSpan={4}>
                          No salary records yet for this employee.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Tip: Click <span className="font-medium">Edit</span> to load month/year/amount into the form, then press <span className="font-medium">Save Salary</span>.
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-white p-5">
        <div className="font-semibold">Employees / Users</div>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-600">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
                <th className="py-2">Department</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e._id} className="border-t">
                  <td className="py-2">{e.name}</td>
                  <td className="py-2">{e.email}</td>
                  <td className="py-2">{e.role}</td>
                  <td className="py-2">{e.department}</td>
                  <td className="py-2">
                    <button
                      className="text-red-600 underline"
                      onClick={async () => {
                        await api.delete(`/api/employees/${e._id}`);
                        await load();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!employees.length ? (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={5}>
                    No employees yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <div className="font-semibold">Leave Requests</div>
          <div className="mt-3 space-y-2 text-sm">
            {leaves.map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <div className="text-slate-700">{r.employeeId?.name || "Employee"}</div>
                  <div className="text-slate-600">
                    {r.fromDate} → {r.toDate}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-slate-600">{r.status}</div>
                  {r.status === "pending" ? (
                    <>
                      <button
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                        onClick={async () => {
                          await api.post(`/api/leaves/${r._id}/approve`);
                          await load();
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white"
                        onClick={async () => {
                          await api.post(`/api/leaves/${r._id}/reject`, { note: "Rejected by HR" });
                          await load();
                        }}
                      >
                        Reject
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
            {!leaves.length ? <div className="text-slate-500">No leave requests.</div> : null}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="font-semibold">Attendance</div>
          <div className="mt-3 space-y-2 text-sm">
            {attendance.slice(0, 10).map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <div className="text-slate-700">{r.employeeId?.name || "Employee"}</div>
                  <div className="text-slate-600">{r.date}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-slate-600">{r.status}</div>
                  {r.status === "pending" ? (
                    <>
                      <button
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"
                        onClick={async () => {
                          await api.post(`/api/attendance/${r._id}/approve`);
                          await load();
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white"
                        onClick={async () => {
                          await api.post(`/api/attendance/${r._id}/reject`, { note: "Rejected by HR" });
                          await load();
                        }}
                      >
                        Reject
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
            {!attendance.length ? <div className="text-slate-500">No attendance yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

