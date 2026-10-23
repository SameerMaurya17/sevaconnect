import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import api, { errorMessage } from "../api";
import Alert from "../components/Alert";
import CheckboxGroup from "../components/CheckboxGroup";
import { btnPrimary, card, input, label, pageTitle } from "../ui";
import { CATEGORIES, DAYS, SKILLS, categoryLabel, formatDate, toCsv, toList } from "../constants";

export default function Profile() {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [skills, setSkills] = useState(toList(user.skills));
  const [interests, setInterests] = useState(toList(user.interests));
  const [days, setDays] = useState(toList(user.availableDays));
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const [registrations, setRegistrations] = useState([]);
  const [regError, setRegError] = useState("");

  useEffect(() => {
    api
      .get("/api/me/registrations")
      .then((res) => setRegistrations(res.data))
      .catch((err) => setRegError(errorMessage(err)));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const res = await api.put("/api/me", {
        name,
        phone,
        skills: toCsv(skills),
        interests: toCsv(interests),
        availableDays: toCsv(days),
      });
      setUser(res.data);
      setMessage({ type: "success", text: "Profile saved." });
    } catch (err) {
      setMessage({ type: "error", text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const totalHours = registrations.reduce((sum, r) => sum + (r.attended ? r.hours : 0), 0);
  const eventsAttended = registrations.filter((r) => r.attended).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`${pageTitle} mb-1`}>My profile and hours</h1>
        <p className="text-slate-600">
          Your skills, interests and free days help the foundation match you with the right events.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={card}>
          <div className="text-3xl font-bold text-emerald-800">{totalHours}</div>
          <div className="text-sm text-slate-600">Volunteer hours</div>
        </div>
        <div className={card}>
          <div className="text-3xl font-bold text-emerald-800">{eventsAttended}</div>
          <div className="text-sm text-slate-600">Events attended</div>
        </div>
      </div>

      <form onSubmit={handleSave} className={card}>
        <h2 className="mb-4 text-lg font-semibold">Profile details</h2>
        {message && <Alert type={message.type}>{message.text}</Alert>}

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="pname">Full name</label>
            <input id="pname" required className={input} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={label} htmlFor="pphone">Phone</label>
            <input id="pphone" className={input} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        <div className="mb-4">
          <span className={label}>My skills</span>
          <CheckboxGroup
            options={SKILLS.map((s) => ({ value: s, label: s }))}
            selected={skills}
            onChange={setSkills}
          />
        </div>

        <div className="mb-4">
          <span className={label}>Causes I care about</span>
          <CheckboxGroup
            options={CATEGORIES.map((c) => ({ value: c, label: categoryLabel(c) }))}
            selected={interests}
            onChange={setInterests}
          />
        </div>

        <div className="mb-5">
          <span className={label}>Days I am available</span>
          <CheckboxGroup options={DAYS} selected={days} onChange={setDays} />
        </div>

        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>

      <div className={card}>
        <h2 className="mb-4 text-lg font-semibold">My events</h2>
        <Alert>{regError}</Alert>
        {registrations.length === 0 ? (
          <p className="text-sm text-slate-500">You have not joined any events yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-medium">Event</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Attendance</th>
                  <th className="py-2 font-medium">Hours</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4">{r.eventTitle}</td>
                    <td className="py-2 pr-4">{formatDate(r.eventDate)}</td>
                    <td className="py-2 pr-4">{r.attended ? "Attended" : "Not marked yet"}</td>
                    <td className="py-2">{r.attended ? r.hours : "-"}</td>
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
