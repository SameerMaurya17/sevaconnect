// Shared Tailwind class strings so every page looks consistent.
export const card = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";
export const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200";
export const label = "mb-1 block text-sm font-medium text-slate-700";
export const btn =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
export const btnPrimary = `${btn} bg-emerald-700 text-white hover:bg-emerald-800`;
export const btnOutline = `${btn} border border-slate-300 bg-white text-slate-700 hover:bg-slate-100`;
export const btnDanger = `${btn} border border-red-200 bg-white text-red-700 hover:bg-red-50`;
export const pageTitle = "text-2xl font-bold text-slate-900";

// Compact variants for table rows
const btnSm = "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
export const btnSmPrimary = `${btnSm} bg-emerald-700 text-white hover:bg-emerald-800`;
export const btnSmOutline = `${btnSm} border border-slate-300 bg-white text-slate-700 hover:bg-slate-100`;
export const btnSmDanger = `${btnSm} border border-red-200 bg-white text-red-700 hover:bg-red-50`;
export const inputSmall =
  "w-24 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-100 disabled:text-slate-400";
