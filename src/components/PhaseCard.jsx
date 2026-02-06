import { Badge } from './Badge';
import { TaskCheckbox } from './TaskCheckbox';
import { CommentSection } from './CommentSection';

export function PhaseCard({ phase, isOpen, toggle, checkedTasks, onToggleTask, comments, onAddComment, onDeleteComment, theme }) {
  const { primary, dark, border } = theme;
  const completedCount = phase.tasks.filter(t => checkedTasks.has(t.id)).length;
  const totalTasks = phase.tasks.length;
  const progressPercent = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  return (
    <div style={{
      background: "#fff", borderRadius: 12, border: `1px solid ${border}`,
      overflow: "hidden", transition: "box-shadow 0.2s",
      boxShadow: isOpen ? `0 4px 20px ${primary}15` : "0 1px 3px rgba(0,0,0,0.06)",
    }}>
      <button onClick={toggle} style={{
        width: "100%", padding: "20px 24px", display: "flex", alignItems: "center",
        gap: 16, background: "none", border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, background: `${primary}10`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0,
        }}>{phase.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: primary }}>PHASE {phase.id}</span>
            <Badge color={primary}>Weeks {phase.weeks}</Badge>
            <Badge color={progressPercent === 100 ? '#34A853' : progressPercent > 0 ? '#FB8C00' : '#9CA3AF'}>
              {completedCount}/{totalTasks} tasks
            </Badge>
          </div>
          <div style={{ fontWeight: 700, fontSize: 17, color: dark }}>{phase.title}</div>
          <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4, lineHeight: 1.5 }}>{phase.summary}</div>
          <div style={{ marginTop: 10, height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progressPercent}%`,
              background: progressPercent === 100 ? '#34A853' : primary,
              borderRadius: 2, transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
        <span style={{ fontSize: 20, color: "#9CA3AF", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>
      {isOpen && (
        <div style={{ padding: "0 24px 24px", borderTop: `1px solid ${border}` }}>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {phase.tasks.map((t, i) => (
              <TaskCheckbox
                key={t.id}
                task={t}
                index={i}
                isChecked={checkedTasks.has(t.id)}
                onToggle={onToggleTask}
                theme={theme}
              />
            ))}
          </div>
          <CommentSection
            comments={comments}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
            sectionId={`phase-${phase.id}`}
            theme={theme}
          />
        </div>
      )}
    </div>
  );
}
