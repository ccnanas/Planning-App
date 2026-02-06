import { useState } from "react";
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Badge } from './Badge';
import { PhaseCard } from './PhaseCard';
import { SectionCard } from './SectionCard';
import { CommentSection } from './CommentSection';
import { Editor } from './Editor';
import defaultPlan from '../data/defaultPlan.json';

export default function MigrationPlan() {
  // Plan data — persisted in localStorage, initialized from defaultPlan.json
  const [planData, setPlanData] = useLocalStorage('plan-data', defaultPlan);

  const [activeTab, setActiveTab] = useState("overview");
  const [openPhases, setOpenPhases] = useState(new Set([1]));
  const [openSections, setOpenSections] = useState(new Set());

  // Persistent state for checkboxes and comments
  const [checkedTasks, setCheckedTasks] = useLocalStorage('plan-checked-tasks', []);
  const [comments, setComments] = useLocalStorage('plan-comments', []);

  const checkedTasksSet = new Set(checkedTasks);

  // Extract theme from plan config
  const colors = planData.config?.colors || defaultPlan.config.colors;
  const theme = {
    primary: colors.primary || '#0055A4',
    dark: colors.dark || '#0D1B2A',
    light: colors.light || '#E8F0FE',
    accent: colors.accent || '#00C2FF',
    surface: colors.surface || '#F7F9FC',
    border: colors.border || '#D1D9E6',
  };

  const phases = planData.phases || [];
  const sections = planData.sections || [];
  const techStack = planData.techStack || {};
  const risks = planData.risks || [];
  const overview = planData.overview || {};

  const toggleTask = (taskId) => {
    setCheckedTasks(prev => {
      const set = new Set(prev);
      set.has(taskId) ? set.delete(taskId) : set.add(taskId);
      return Array.from(set);
    });
  };

  const addComment = (comment) => setComments(prev => [...prev, comment]);
  const deleteComment = (commentId) => setComments(prev => prev.filter(c => c.id !== commentId));

  const togglePhase = (id) => {
    setOpenPhases(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSection = (name) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const expandAll = (type) => {
    if (type === "phases") setOpenPhases(new Set(phases.map(p => p.id)));
    if (type === "sections") setOpenSections(new Set(sections.map(s => s.name)));
  };

  const collapseAll = (type) => {
    if (type === "phases") setOpenPhases(new Set());
    if (type === "sections") setOpenSections(new Set());
  };

  // Progress
  const totalTasks = phases.reduce((sum, p) => sum + (p.tasks?.length || 0), 0);
  const completedTasks = checkedTasks.length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Editor handlers
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(planData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plan.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (data) => {
    setPlanData(data);
  };

  const handleReset = () => {
    if (window.confirm('Reset all plan data to defaults? This will erase your edits.')) {
      setPlanData(defaultPlan);
      setCheckedTasks([]);
      setComments([]);
    }
  };

  // Compute max week for timeline
  const parseWeeks = (weekStr) => {
    if (!weekStr) return [];
    const parts = weekStr.replace(/–/g, '-').split('-').map(s => parseInt(s.trim()));
    if (parts.length === 1) return [parts[0]];
    const result = [];
    for (let i = parts[0]; i <= parts[1]; i++) result.push(i);
    return result;
  };

  const maxWeek = phases.reduce((max, p) => {
    const weeks = parseWeeks(p.weeks);
    return Math.max(max, ...weeks, 0);
  }, 0);

  const phaseColors = ['#0055A4', '#1A73E8', '#34A853', '#FB8C00', '#7B1FA2', '#EA4335', '#00897B', '#5C6BC0'];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "phases", label: "Phases" },
    { id: "sections", label: "Sections" },
    { id: "tech", label: "Tech Stack" },
    { id: "risks", label: "Risks" },
    { id: "editor", label: "Editor" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: theme.surface,
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.dark} 0%, ${theme.primary} 100%)`,
        padding: "48px 32px 36px", color: "#fff",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 4, background: theme.accent, borderRadius: 2 }} />
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>
              {planData.config?.brandName || 'Your Company'}
            </span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            {planData.config?.title || 'Project Plan'}
          </h1>
          <p style={{ fontSize: 16, opacity: 0.75, margin: 0, maxWidth: 640, lineHeight: 1.6 }}>
            {planData.config?.subtitle || ''}
          </p>
          <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
            {[
              { label: "Phases", value: String(phases.length) },
              { label: "Total Tasks", value: String(totalTasks) },
              { label: "Timeline", value: maxWeek > 0 ? `${maxWeek} Weeks` : '—' },
              { label: "Progress", value: `${overallProgress}%` },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)",
              }}>
                <div style={{ fontSize: 11, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{
              height: 8, background: 'rgba(255,255,255,0.2)',
              borderRadius: 4, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${overallProgress}%`,
                background: overallProgress === 100 ? '#34A853' : theme.accent,
                borderRadius: 4, transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
              {completedTasks} of {totalTasks} tasks completed
            </div>
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div style={{
        background: "#fff", borderBottom: `1px solid ${theme.border}`, position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", gap: 0, overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: "14px 20px", border: "none", background: "none", cursor: "pointer",
              fontSize: 14, fontWeight: activeTab === t.id ? 700 : 500,
              color: activeTab === t.id ? theme.primary : "#6B7280",
              borderBottom: activeTab === t.id ? `3px solid ${theme.primary}` : "3px solid transparent",
              transition: "all 0.2s", whiteSpace: "nowrap",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 16px 64px" }}>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Summary */}
            {overview.summary && (
              <div style={{
                background: "#fff", borderRadius: 12, padding: 28, border: `1px solid ${theme.border}`,
              }}>
                <h2 style={{ margin: "0 0 16px", fontSize: 22, fontWeight: 800, color: theme.dark, letterSpacing: "-0.01em" }}>Summary</h2>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.8, color: "#374151" }}>
                  {overview.summary}
                </p>
                <CommentSection comments={comments} onAddComment={addComment} onDeleteComment={deleteComment} sectionId="overview-summary" theme={theme} />
              </div>
            )}

            {/* Goals */}
            {overview.goals?.length > 0 && (
              <div style={{
                background: "#fff", borderRadius: 12, padding: 24, border: `1px solid ${theme.border}`,
              }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700, color: theme.dark }}>
                  Project Goals
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {overview.goals.map((item, i) => (
                    <div key={i} style={{ padding: "12px 16px", background: theme.surface, borderRadius: 8, border: `1px solid ${theme.border}` }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: theme.dark, marginBottom: 4 }}>{item.goal}</div>
                      <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {phases.length > 0 && maxWeek > 0 && (
              <div style={{
                background: "#fff", borderRadius: 12, padding: 28, border: `1px solid ${theme.border}`,
              }}>
                <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700, color: theme.dark }}>
                  Timeline
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {phases.map((p, i) => {
                    const weeks = parseWeeks(p.weeks);
                    return (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 200, fontSize: 13, fontWeight: 500, color: theme.dark, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.icon} Phase {p.id}: {p.title}
                        </div>
                        <div style={{ flex: 1, display: "flex", gap: 4 }}>
                          {Array.from({ length: maxWeek }, (_, wi) => wi + 1).map(week => (
                            <div
                              key={week}
                              style={{
                                flex: 1, height: 24, borderRadius: 4,
                                background: weeks.includes(week) ? (phaseColors[i % phaseColors.length]) : `${theme.border}50`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 10, fontWeight: 600,
                                color: weeks.includes(week) ? "#fff" : "#9CA3AF",
                              }}
                            >
                              {week}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 11, color: "#9CA3AF" }}>
                  <span>Week 1</span>
                  <span>Week {maxWeek}</span>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {[
                { label: "Total Phases", value: phases.length, color: theme.primary },
                { label: "Total Tasks", value: totalTasks, color: "#1A73E8" },
                { label: "Completed", value: completedTasks, color: "#34A853" },
                { label: "Remaining", value: totalTasks - completedTasks, color: "#FB8C00" },
              ].map((stat, i) => (
                <div key={i} style={{
                  background: "#fff", borderRadius: 12, padding: 20, border: `1px solid ${theme.border}`,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHASES TAB */}
        {activeTab === "phases" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: theme.dark }}>Phases</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => expandAll("phases")} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${theme.border}`, background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#6B7280" }}>Expand All</button>
                <button onClick={() => collapseAll("phases")} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${theme.border}`, background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#6B7280" }}>Collapse All</button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {phases.map(p => (
                <PhaseCard
                  key={p.id}
                  phase={p}
                  isOpen={openPhases.has(p.id)}
                  toggle={() => togglePhase(p.id)}
                  checkedTasks={checkedTasksSet}
                  onToggleTask={toggleTask}
                  comments={comments}
                  onAddComment={addComment}
                  onDeleteComment={deleteComment}
                  theme={theme}
                />
              ))}
            </div>
            {phases.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
                No phases yet. Go to the Editor tab to add phases.
              </div>
            )}
          </div>
        )}

        {/* SECTIONS TAB */}
        {activeTab === "sections" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: theme.dark }}>Sections ({sections.length})</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => expandAll("sections")} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${theme.border}`, background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#6B7280" }}>Expand All</button>
                <button onClick={() => collapseAll("sections")} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${theme.border}`, background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#6B7280" }}>Collapse All</button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sections.map(s => (
                <SectionCard
                  key={s.name}
                  section={s}
                  isOpen={openSections.has(s.name)}
                  toggle={() => toggleSection(s.name)}
                  comments={comments}
                  onAddComment={addComment}
                  onDeleteComment={deleteComment}
                  theme={theme}
                />
              ))}
            </div>
            {sections.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
                No sections yet. Go to the Editor tab to add sections.
              </div>
            )}
          </div>
        )}

        {/* TECH STACK TAB */}
        {activeTab === "tech" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {Object.entries(techStack).map(([key, items], gi) => (
              <div key={key} style={{
                background: "#fff", borderRadius: 12, border: `1px solid ${theme.border}`, overflow: "hidden",
              }}>
                <div style={{ padding: "20px 24px 0" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700, color: theme.dark, textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}
                  </h3>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: theme.surface }}>
                      <th style={{ textAlign: "left", padding: "10px 24px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7280" }}>Name</th>
                      <th style={{ textAlign: "left", padding: "10px 24px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7280" }}>Purpose</th>
                      <th style={{ textAlign: "left", padding: "10px 24px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7280" }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row, ri) => (
                      <tr key={ri} style={{ borderTop: `1px solid ${theme.border}` }}>
                        <td style={{ padding: "14px 24px", fontWeight: 600, fontSize: 14, color: theme.dark }}>{row.name}</td>
                        <td style={{ padding: "14px 24px", fontSize: 14, color: "#374151" }}>{row.purpose}</td>
                        <td style={{ padding: "14px 24px", fontSize: 13, color: "#6B7280" }}>{row.cost || row.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: "0 24px 20px" }}>
                  <CommentSection comments={comments} onAddComment={addComment} onDeleteComment={deleteComment} sectionId={`tech-${gi}`} theme={theme} />
                </div>
              </div>
            ))}
            {Object.keys(techStack).length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
                No tech stack defined. Go to the Editor tab to add your tech stack.
              </div>
            )}
          </div>
        )}

        {/* RISKS TAB */}
        {activeTab === "risks" && (
          <div>
            <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800, color: theme.dark }}>Risks & Mitigation</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {risks.map((r, i) => (
                <div key={i} style={{
                  background: "#fff", borderRadius: 12, padding: 24, border: `1px solid ${theme.border}`,
                }}>
                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr auto 2fr", gap: 20, alignItems: "start",
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: theme.dark }}>{r.risk}</div>
                    <Badge color={r.impact === "High" ? "#EA4335" : r.impact === "Medium" ? "#FB8C00" : "#34A853"}>{r.impact}</Badge>
                    <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{r.mitigation}</div>
                  </div>
                  <CommentSection comments={comments} onAddComment={addComment} onDeleteComment={deleteComment} sectionId={`risk-${i}`} theme={theme} />
                </div>
              ))}
            </div>
            {risks.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
                No risks defined. Go to the Editor tab to add risks.
              </div>
            )}
          </div>
        )}

        {/* EDITOR TAB */}
        {activeTab === "editor" && (
          <div>
            <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800, color: theme.dark }}>Plan Editor</h2>
            <Editor
              planData={planData}
              onUpdate={setPlanData}
              onImport={handleImport}
              onExport={handleExport}
              onReset={handleReset}
              theme={theme}
            />
          </div>
        )}
      </div>
    </div>
  );
}
