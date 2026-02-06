export function Badge({ children, color = "#0055A4" }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 999,
      background: color + "18", color, fontSize: 12, fontWeight: 600,
      letterSpacing: "0.02em", border: `1px solid ${color}30`,
    }}>{children}</span>
  );
}
