import { Badge } from './Badge';
import { CommentSection } from './CommentSection';

export function SectionCard({ section, isOpen, toggle, comments, onAddComment, onDeleteComment, theme }) {
  const { dark, border } = theme;

  return (
    <div style={{
      background: "#fff", borderRadius: 12, border: `1px solid ${border}`,
      overflow: "hidden", transition: "box-shadow 0.2s",
      boxShadow: isOpen ? `0 4px 20px ${section.color}20` : "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <button onClick={toggle} style={{
        width: "100%", padding: "16px 20px", display: "flex", alignItems: "center",
        gap: 12, background: "none", border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: 3, background: section.color, flexShrink: 0,
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: dark }}>{section.name}</div>
          <div style={{ fontSize: 12, color: "#6B7280", fontFamily: "'JetBrains Mono', monospace" }}>
            layout: {section.layout}
          </div>
        </div>
        <Badge color={section.color}>{section.fields.length} fields</Badge>
        <span style={{ fontSize: 18, color: "#9CA3AF", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>
      {isOpen && (
        <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${border}` }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12, fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${section.color}30` }}>
                <th style={{ textAlign: "left", padding: "8px 8px", color: "#6B7280", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Field</th>
                <th style={{ textAlign: "left", padding: "8px 8px", color: "#6B7280", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</th>
                <th style={{ textAlign: "left", padding: "8px 8px", color: "#6B7280", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Sub-fields</th>
              </tr>
            </thead>
            <tbody>
              {section.fields.map((f, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${border}` }}>
                  <td style={{ padding: "10px 8px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: dark }}>{f.name}</td>
                  <td style={{ padding: "10px 8px" }}><Badge color={section.color}>{f.type}</Badge></td>
                  <td style={{ padding: "10px 8px", fontSize: 12, color: "#6B7280" }}>
                    {f.sub ? f.sub.map((s, j) => (
                      <div key={j} style={{ padding: "2px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{s}</div>
                    )) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <CommentSection
            comments={comments}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
            sectionId={`section-${section.layout}`}
            theme={theme}
          />
        </div>
      )}
    </div>
  );
}
