import { useEffect, useState } from "react";
import api, { errorMessage } from "./api";

// Loads all events once (used by the admin Matcher and Attendance pages).
export default function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/events")
      .then((res) => setEvents(res.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return { events, loading, error };
}
