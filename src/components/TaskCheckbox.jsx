export function TaskCheckbox({ task, index, isChecked, onToggle, theme }) {
  const { primary, dark, surface, border } = theme;

  return (
    <div style={{
      display: "flex", gap: 12, padding: "12px 16px", borderRadius: 8,
      background: isChecked ? `${primary}08` : (index % 2 === 0 ? surface : "#fff"),
      border: `1px solid ${isChecked ? primary + '30' : border}`,
      transition: 'all 0.2s',
      opacity: isChecked ? 0.85 : 1,
    }}>
      <label style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        cursor: 'pointer',
        flex: 1,
      }}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => onToggle(task.id)}
          style={{
            width: 20,
            height: 20,
            marginTop: 2,
            cursor: 'pointer',
            accentColor: primary,
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 600,
            fontSize: 14,
            color: dark,
            textDecoration: isChecked ? 'line-through' : 'none',
            opacity: isChecked ? 0.7 : 1,
          }}>
            {task.task}
          </div>
          <div style={{
            fontSize: 13,
            color: "#6B7280",
            marginTop: 2,
            lineHeight: 1.5,
            textDecoration: isChecked ? 'line-through' : 'none',
            opacity: isChecked ? 0.7 : 1,
          }}>
            {task.detail}
          </div>
        </div>
      </label>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: `2px solid ${isChecked ? primary : primary + '40'}`,
        background: isChecked ? primary : 'transparent',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        color: isChecked ? '#fff' : primary,
        flexShrink: 0,
        marginTop: 2,
      }}>
        {isChecked ? '✓' : index + 1}
      </div>
    </div>
  );
}
