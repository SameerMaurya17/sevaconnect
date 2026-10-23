// A row of toggle chips. `options` = [{ value, label }], `selected` = array of values.
export default function CheckboxGroup({ options, selected, onChange }) {
  const toggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <label
            key={opt.value}
            className={`cursor-pointer select-none rounded-full border px-3 py-1.5 text-sm transition ${
              active
                ? "border-emerald-700 bg-emerald-700 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={active}
              onChange={() => toggle(opt.value)}
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
