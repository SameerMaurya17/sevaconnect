import { useCallback, useEffect, useState } from "react";
import api, { errorMessage } from "../api";
import Alert from "../components/Alert";
import { btnOutline, btnPrimary, card, pageTitle } from "../ui";
import { categoryLabel, formatDate, todayISO, toList } from "../constants";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null); // { type, text }
  const [busyId, setBusyId] = useState(null);

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

  const toggleJoin = async (event) => {
    setBusyId(event.id);
    setMessage(null);
    try {
      if (event.joined) {
        await api.delete(`/api/events/${event.id}/join`);
        setMessage({ type: "success", text: `You cancelled your spot in "${event.title}".` });
      } else {
        await api.post(`/api/events/${event.id}/join`);
        setMessage({ type: "success", text: `You joined "${event.title}". Thank you!` });
      }
      await load();
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const today = todayISO();

  return (
    <div>
      <h1 className={`${pageTitle} mb-1`}>Upcoming events</h1>
      <p className="mb-5 text-slate-600">Pick an event and join as a volunteer.</p>

      {message && <Alert type={message.type}>{message.text}</Alert>}

      {loading && <p className="text-slate-500">Loading events...</p>}
      {!loading && events.length === 0 && (
        <p className="text-slate-500">No events yet. Please check back soon.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {events.map((ev) => {
          const past = ev.eventDate < today;
          const full = ev.registeredCount >= ev.capacity;
          const spotsLeft = Math.max(ev.capacity - ev.registeredCount, 0);

          return (
            <div key={ev.id} className={`${card} flex flex-col`}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <h2 className="text-lg font-semibold">{ev.title}</h2>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
                  {categoryLabel(ev.category)}
                </span>
              </div>

              <p className="mb-3 text-sm text-slate-600">{ev.description}</p>

              <dl className="mb-4 space-y-1 text-sm text-slate-700">
                <div><span className="font-medium">When:</span> {formatDate(ev.eventDate)}</div>
                <div><span className="font-medium">Where:</span> {ev.location}</div>
                <div>
                  <span className="font-medium">Spots:</span> {ev.registeredCount} of {ev.capacity} filled
                  {!full && !past ? ` (${spotsLeft} left)` : ""}
                </div>
                {toList(ev.requiredSkills).length > 0 && (
                  <div>
                    <span className="font-medium">Skills needed:</span> {toList(ev.requiredSkills).join(", ")}
                  </div>
                )}
              </dl>

              <div className="mt-auto">
                {past ? (
                  <button disabled className={`${btnOutline} w-full`}>Event has ended</button>
                ) : ev.joined ? (
                  <button
                    onClick={() => toggleJoin(ev)}
                    disabled={busyId === ev.id}
                    className={`${btnOutline} w-full`}
                  >
                    {busyId === ev.id ? "Please wait..." : "Cancel my spot"}
                  </button>
                ) : (
                  <button
                    onClick={() => toggleJoin(ev)}
                    disabled={full || busyId === ev.id}
                    className={`${btnPrimary} w-full`}
                  >
                    {full ? "Event is full" : busyId === ev.id ? "Please wait..." : "Join event"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
