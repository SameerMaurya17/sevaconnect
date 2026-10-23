import { useEffect, useState } from "react";
import api, { errorMessage } from "../api";
import Alert from "../components/Alert";
import useEvents from "../useEvents";
import { card, input, label, pageTitle } from "../ui";
import { categoryLabel, formatDate, toList } from "../constants";

function Badge({ ok, children }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        ok ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
      }`}
    >
      {ok ? "Yes: " : "No: "}
      {children}
    </span>
  );
}

export default function Matcher() {
  const { events, loading, error } = useEvents();
  const [selectedId, setSelectedId] = useState("");
  const [matches, setMatches] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");

  // Select the first event once events are loaded.
  useEffect(() => {
    if (events.length > 0 && selectedId === "") {
      setSelectedId(String(events[0].id));
    }
  }, [events, selectedId]);

  // Load matches whenever the selected event changes.
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setMatchLoading(true);
    setMatchError("");
    api
      .get(`/api/admin/events/${selectedId}/matches`)
      .then((res) => {
        if (!cancelled) setMatches(res.data);
      })
      .catch((err) => {
        if (!cancelled) setMatchError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setMatchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const selected = events.find((e) => String(e.id) === selectedId);

  const barColor = (score) =>
    score >= 70 ? "bg-emerald-600" : score >= 40 ? "bg-amber-500" : "bg-slate-400";

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`${pageTitle} mb-1`}>Smart volunteer matcher</h1>
        <p className="text-slate-600">
          Volunteers are ranked by skills (50%), interests (30%) and availability on the event day (20%).
        </p>
      </div>

      <Alert>{error}</Alert>

      {loading && <p className="text-slate-500">Loading events...</p>}
      {!loading && events.length === 0 && (
        <p className="text-slate-500">Create an event first to see matching volunteers.</p>
      )}

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

          {selected && (
            <p className="mt-3 text-sm text-slate-600">
              {categoryLabel(selected.category)} event at {selected.location}. Skills needed:{" "}
              {toList(selected.requiredSkills).length > 0 ? toList(selected.requiredSkills).join(", ") : "none"}.
              Spots filled: {selected.registeredCount} of {selected.capacity}.
            </p>
          )}
        </div>
      )}

      <Alert>{matchError}</Alert>
      {matchLoading && <p className="text-slate-500">Finding the best volunteers...</p>}

      {!matchLoading && selectedId && matches.length === 0 && !matchError && (
        <p className="text-slate-500">No volunteers left to match. Everyone has already joined this event.</p>
      )}

      <div className="space-y-3">
        {!matchLoading &&
          matches.map((m, index) => (
            <div key={m.userId} className={card}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">
                    #{index + 1} {m.name}
                  </div>
                  <div className="text-sm text-slate-600">
                    {m.email}
                    {m.phone ? ` | ${m.phone}` : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-800">{m.score}%</div>
                  <div className="text-xs text-slate-500">match score</div>
                </div>
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full ${barColor(m.score)}`} style={{ width: `${m.score}%` }} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Badge ok={m.skillPercent > 0}>
                  Skills {m.skillPercent}%
                  {m.matchedSkills.length > 0 ? ` (${m.matchedSkills.join(", ")})` : ""}
                </Badge>
                <Badge ok={m.interestMatch}>Interest</Badge>
                <Badge ok={m.availabilityMatch}>Available that day</Badge>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
