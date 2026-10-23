import { useCallback, useEffect, useState } from "react";
import api, { errorMessage } from "../api";
import Alert from "../components/Alert";
import CheckboxGroup from "../components/CheckboxGroup";
import { btnOutline, btnPrimary, btnSmDanger, btnSmOutline, card, input, label, pageTitle } from "../ui";
import { CATEGORIES, SKILLS, categoryLabel, formatDate, toCsv, toList } from "../constants";

const emptyForm = {
  title: "",
  description: "",
  category: "FOOD",
  location: "",
  eventDate: "",
  capacity: 10,
  requiredSkills: [],
};

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/api/events");
      setEvents(res.data);
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      location: form.location,
      eventDate: form.eventDate,
      capacity: Number(form.capacity),
      requiredSkills: toCsv(form.requiredSkills),
    };
    try {
      if (editingId) {
        await api.put(`/api/admin/events/${editingId}`, payload);
        setMessage({ type: "success", text: "Event updated." });
      } else {
        await api.post("/api/admin/events", payload);
        setMessage({ type: "success", text: "Event created." });
      }
      resetForm();
      await load();
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (ev) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      description: ev.description || "",
      category: ev.category,
      location: ev.location,
      eventDate: ev.eventDate,
      capacity: ev.capacity,
      requiredSkills: toList(ev.requiredSkills),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (ev) => {
    if (!window.confirm(`Delete "${ev.title}" and all its registrations?`)) return;
    setMessage(null);
    try {
      await api.delete(`/api/admin/events/${ev.id}`);
      setMessage({ type: "success", text: "Event deleted." });
      if (editingId === ev.id) resetForm();
      await load();
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`${pageTitle} mb-1`}>Manage events</h1>
        <p className="text-slate-600">Create events for food distribution, plantation, cleanliness drives and more.</p>
      </div>

      {message && <Alert type={message.type}>{message.text}</Alert>}

      <form onSubmit={handleSubmit} className={card}>
        <h2 className="mb-4 text-lg font-semibold">{editingId ? "Edit event" : "Create a new event"}</h2>

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label} htmlFor="title">Title</label>
            <input id="title" required className={input} value={form.title} onChange={update("title")} />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={3}
              maxLength={1000}
              className={input}
              value={form.description}
              onChange={update("description")}
            />
          </div>
          <div>
            <label className={label} htmlFor="category">Category</label>
            <select id="category" className={input} value={form.category} onChange={update("category")}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{categoryLabel(c)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="location">Location</label>
            <input id="location" required className={input} value={form.location} onChange={update("location")} />
          </div>
          <div>
            <label className={label} htmlFor="eventDate">Date</label>
            <input id="eventDate" type="date" required className={input} value={form.eventDate} onChange={update("eventDate")} />
          </div>
          <div>
            <label className={label} htmlFor="capacity">Number of volunteers needed</label>
            <input
              id="capacity"
              type="number"
              min="1"
              required
              className={input}
              value={form.capacity}
              onChange={update("capacity")}
            />
          </div>
        </div>

        <div className="mb-5">
          <span className={label}>Skills needed</span>
          <CheckboxGroup
            options={SKILLS.map((s) => ({ value: s, label: s }))}
            selected={form.requiredSkills}
            onChange={(list) => setForm({ ...form, requiredSkills: list })}
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? "Saving..." : editingId ? "Save changes" : "Create event"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className={btnOutline}>
              Cancel editing
            </button>
          )}
        </div>
      </form>

      <div className={card}>
        <h2 className="mb-4 text-lg font-semibold">All events</h2>
        {loading && <p className="text-sm text-slate-500">Loading...</p>}
        {!loading && events.length === 0 && (
          <p className="text-sm text-slate-500">No events yet. Create your first event above.</p>
        )}
        {events.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-medium">Event</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Location</th>
                  <th className="py-2 pr-4 font-medium">Volunteers</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} className="border-b border-slate-100 align-top">
                    <td className="py-2 pr-4">
                      <div className="font-medium">{ev.title}</div>
                      <div className="text-xs text-slate-500">{categoryLabel(ev.category)}</div>
                    </td>
                    <td className="py-2 pr-4">{formatDate(ev.eventDate)}</td>
                    <td className="py-2 pr-4">{ev.location}</td>
                    <td className="py-2 pr-4">{ev.registeredCount} / {ev.capacity}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(ev)} className={btnSmOutline}>Edit</button>
                        <button onClick={() => handleDelete(ev)} className={btnSmDanger}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
