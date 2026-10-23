export const SKILLS = [
  "Cooking",
  "Driving",
  "First Aid",
  "Teaching",
  "Gardening",
  "Cleaning",
  "Photography",
  "Organizing",
];

export const CATEGORIES = ["FOOD", "PLANTATION", "CLEANLINESS", "EDUCATION", "HEALTH", "OTHER"];

export const DAYS = [
  { value: "MON", label: "Mon" },
  { value: "TUE", label: "Tue" },
  { value: "WED", label: "Wed" },
  { value: "THU", label: "Thu" },
  { value: "FRI", label: "Fri" },
  { value: "SAT", label: "Sat" },
  { value: "SUN", label: "Sun" },
];

export const toList = (csv) =>
  csv
    ? csv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

export const toCsv = (list) => list.join(",");

export const categoryLabel = (c) => (c ? c.charAt(0) + c.slice(1).toLowerCase() : "");

export const formatDate = (iso) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// Today as YYYY-MM-DD in the browser's local time
export const todayISO = () => new Date().toLocaleDateString("en-CA");
