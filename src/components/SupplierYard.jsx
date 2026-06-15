/**
 * Visual supplier yard — pile height scales with average inventory (tons).
 * Push scenarios typically show ~3× taller piles than Pull.
 */
export function SupplierYard({ tons, label, maxTons = 80, variant = 'default' }) {
  const heightPct = Math.min(100, Math.max(8, (tons / maxTons) * 100));
  const barCount = Math.max(2, Math.round(heightPct / 12));

  return (
    <div className={`yard yard--${variant}`}>
      {label && <p className="yard__label">{label}</p>}
      <div className="yard__ground">
        <div className="yard__piles" style={{ height: `${heightPct}%` }}>
          {Array.from({ length: barCount }).map((_, i) => (
            <div
              key={i}
              className="yard__bar"
              style={{ animationDelay: `${i * 0.08}s` }}
            />
          ))}
        </div>
      </div>
      <p className="yard__tons">{tons.toFixed(1)} t avg</p>
    </div>
  );
}
