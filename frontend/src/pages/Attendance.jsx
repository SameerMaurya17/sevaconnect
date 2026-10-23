import { useCallback, useEffect, useState } from "react";
import api, { errorMessage } from "../api";
import Alert from "../components/Alert";
import useEvents from "../useEvents";
import { btnSmPrimary, card, input, inputSmall, label, pageTitle } from "../ui";
import { formatDate } from "../constants";

function AttendanceRow({ registration, onSaved, onError }) {
  const [attended, setAttended] = useState(registration.attended);
  const [hours, setHours] = useState(registration.hours);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await api.put(`/api/admin/registrations/${registration.id}/attendance`, {
        attended,
        hours: attended ? Number(hours) || 0 : 0,
      });
      setHours(res.data.hours);
      setSaved(true);
      onSaved();
    } catch (err) {
      onError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="border-b border-slate-100">
      <td className="py-2 pr-4">
        <div className="font-medium">{registration.userName}</div>
        <div className="text-xs text-slate-500">{registration.userEmail}</div>
      </td>
      <td className="py-2 pr-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={attended}
            onChange={(e) => {
              setAttended(e.target.checked);
              setSaved(false);
            }}
            className="h-4 w-4 accent-emerald-700"
          />
          Present
        </label>
      </td>
      <td className="py-2 pr-4">
        <input
          type="number"
          min="0"
          step="0.5"
          disabled={!attended}
          value={attended ? hours : 0}
          onChange={(e) => {
            setHours(e.target.value);
            setSaved(false);
          }}
          className={inputSmall}
        />
      </td>
      <td className="py-2">
        <div className="flex items-center gap-2">
          <button onClick={save} disabled={saving} className={btnSmPrimary}>
            {saving ? "Saving..." : "Save"}
          </button>
          {saved && <span className="text-xs text-emerald-700">Saved</span>}
        </div>
      </td>
    </tr>
  );
}

export default function Attendance() {
  const { events, loading, error } = useEvents();
  const [selectedId, setSelectedId] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [regLoading, setRegLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (events.length > 0 && selectedId === "") {
      setSelectedId(String(events[0].id));
    }
  }, [events, selectedId]);

  const loadRegistrations = useCallback(async (id) => {
    try {
      const res = await api.get(`/api/admin/events/${id}/registrations`);
      setRegistrations(res.data);
      setMessage("");
    } catch (err) {
      setMessage(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setRegLoading(true);
    loadRegistrations(selectedId).finally(() => setRegLoading(false));
  }, [selectedId, loadRegistrations]);

  const totalHours = registrations.reduce((sum, r) => sum + (r.attended ? r.hours : 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`${pageTitle} mb-1`}>Attendance and hours</h1>
        <p className="text-slate-600">Mark who attended each event and record their volunteer hours.</p>
      </div>

      <Alert>{error}</Alert>
      {loading && <p className="text-slate-500">Loading events...</p>}
      {!loading && events.length === 0 && <p className="text-slate-500">No events yet.</p>}

      {events.length > 0 && (
        <div className={card}>
          <label className={label} htmlFor="event">Choose an event</label>
          <select id="event" className={input} value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({formatDate(ev.eventDate)})
              </option>
            ))}
          </select>
        </div>
      )}

      <Alert>{message}</Alert>

      {selectedId && (
        <div className={card}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Registered volunteers ({registrations.length})</h2>
            <span className="text-sm text-slate-600">Total hours logged: {totalHours}</span>
          </div>

          {regLoading && <p className="text-sm text-slate-500">Loading...</p>}
          {!regLoading && registrations.length === 0 && (
            <p className="text-sm text-slate-500">No volunteers have joined this event yet.</p>
          )}

          {!regLoading && registrations.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-4 font-medium">Volunteer</th>
                    <th className="py-2 pr-4 font-medium">Attendance</th>
                    <th className="py-2 pr-4 font-medium">Hours</th>
                    <th className="py-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r) => (
                    <AttendanceRow
                      key={r.id}
                      registration={r}
                      onSaved={() => loadRegistrations(selectedId)}
                      onError={setMessage}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
