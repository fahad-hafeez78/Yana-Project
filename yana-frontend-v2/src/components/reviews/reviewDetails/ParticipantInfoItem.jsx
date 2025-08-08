export default function ParticipantInfoItem({ label, value, accentColor = "primary" }) {
  return (
    <div className="bg-white px-4 py-2 rounded-lg border border-gray-light hover:border-primary transition-colors duration-200 shadow-sm">
      <p className="text-xs font-medium text-gray uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-${accentColor} font-semibold text-lg`}>
        {value || <span className="text-gray-light">—</span>}
      </p>
    </div>
  );
}