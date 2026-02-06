import { useState, useRef } from 'react';

// Reusable input style
const inputStyle = (border) => ({
  width: '100%', padding: '8px 12px', borderRadius: 6,
  border: `1px solid ${border}`, fontSize: 13, outline: 'none',
  fontFamily: 'inherit',
});

const textareaStyle = (border) => ({
  ...inputStyle(border),
  minHeight: 60, resize: 'vertical',
});

const btnStyle = (color, small) => ({
  padding: small ? '4px 10px' : '8px 16px',
  borderRadius: 6, border: 'none',
  background: color, color: '#fff',
  fontSize: small ? 11 : 13, fontWeight: 600,
  cursor: 'pointer', transition: 'opacity 0.2s',
  whiteSpace: 'nowrap',
});

const dangerBtnStyle = (small) => ({
  ...btnStyle('#EA4335', small),
  background: '#FEE2E2', color: '#EA4335',
  border: '1px solid #FECACA',
});

function CollapsibleSection({ title, count, isOpen, toggle, onAdd, addLabel, theme, children }) {
  const { primary, dark, border } = theme;
  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: `1px solid ${border}`,
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', cursor: 'pointer',
      }} onClick={toggle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 16, color: '#9CA3AF',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}>▾</span>
          <span style={{ fontWeight: 700, fontSize: 16, color: dark }}>{title}</span>
          {count !== undefined && (
            <span style={{
              background: `${primary}15`, color: primary,
              padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600,
            }}>{count}</span>
          )}
        </div>
        {onAdd && (
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            style={btnStyle(primary, true)}
          >
            + {addLabel || 'Add'}
          </button>
        )}
      </div>
      {isOpen && (
        <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${border}` }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function Editor({ planData, onUpdate, onImport, onExport, onReset, theme }) {
  const { primary, dark, border, surface } = theme;
  const fileInputRef = useRef(null);

  const [openSections, setOpenSections] = useState(new Set(['config']));

  const toggleSection = (key) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Helper to update nested plan data
  const update = (path, value) => {
    const newData = JSON.parse(JSON.stringify(planData));
    let obj = newData;
    const keys = path.split('.');
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onUpdate(newData);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        onImport(data);
      } catch {
        alert('Invalid JSON file. Please check the format and try again.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── Phase helpers ──
  const addPhase = () => {
    const phases = [...planData.phases];
    const newId = phases.length > 0 ? Math.max(...phases.map(p => p.id)) + 1 : 1;
    phases.push({
      id: newId,
      title: 'New Phase',
      weeks: '',
      icon: '📋',
      summary: '',
      tasks: [],
    });
    update('phases', phases);
  };

  const removePhase = (index) => {
    const phases = [...planData.phases];
    phases.splice(index, 1);
    update('phases', phases);
  };

  const updatePhase = (index, field, value) => {
    const phases = JSON.parse(JSON.stringify(planData.phases));
    phases[index][field] = value;
    onUpdate({ ...planData, phases });
  };

  const addTask = (phaseIndex) => {
    const phases = JSON.parse(JSON.stringify(planData.phases));
    const phase = phases[phaseIndex];
    const taskNum = phase.tasks.length + 1;
    phase.tasks.push({
      id: `${phase.id}-${taskNum}`,
      task: '',
      detail: '',
    });
    onUpdate({ ...planData, phases });
  };

  const removeTask = (phaseIndex, taskIndex) => {
    const phases = JSON.parse(JSON.stringify(planData.phases));
    phases[phaseIndex].tasks.splice(taskIndex, 1);
    onUpdate({ ...planData, phases });
  };

  const updateTask = (phaseIndex, taskIndex, field, value) => {
    const phases = JSON.parse(JSON.stringify(planData.phases));
    phases[phaseIndex].tasks[taskIndex][field] = value;
    onUpdate({ ...planData, phases });
  };

  // ── Section helpers ──
  const addSection = () => {
    const sections = [...planData.sections];
    sections.push({
      name: 'New Section',
      layout: 'new_section',
      color: '#6B7280',
      fields: [],
    });
    update('sections', sections);
  };

  const removeSection = (index) => {
    const sections = [...planData.sections];
    sections.splice(index, 1);
    update('sections', sections);
  };

  const updateSection = (index, field, value) => {
    const sections = JSON.parse(JSON.stringify(planData.sections));
    sections[index][field] = value;
    onUpdate({ ...planData, sections });
  };

  const addField = (sectionIndex) => {
    const sections = JSON.parse(JSON.stringify(planData.sections));
    sections[sectionIndex].fields.push({ name: '', type: 'Text' });
    onUpdate({ ...planData, sections });
  };

  const removeField = (sectionIndex, fieldIndex) => {
    const sections = JSON.parse(JSON.stringify(planData.sections));
    sections[sectionIndex].fields.splice(fieldIndex, 1);
    onUpdate({ ...planData, sections });
  };

  const updateField = (sectionIndex, fieldIndex, key, value) => {
    const sections = JSON.parse(JSON.stringify(planData.sections));
    sections[sectionIndex].fields[fieldIndex][key] = value;
    onUpdate({ ...planData, sections });
  };

  // ── Tech Stack helpers ──
  const techCategories = Object.keys(planData.techStack || {});

  const addTechItem = (category) => {
    const techStack = JSON.parse(JSON.stringify(planData.techStack));
    techStack[category].push({ name: '', purpose: '' });
    onUpdate({ ...planData, techStack });
  };

  const removeTechItem = (category, index) => {
    const techStack = JSON.parse(JSON.stringify(planData.techStack));
    techStack[category].splice(index, 1);
    onUpdate({ ...planData, techStack });
  };

  const updateTechItem = (category, index, field, value) => {
    const techStack = JSON.parse(JSON.stringify(planData.techStack));
    techStack[category][index][field] = value;
    onUpdate({ ...planData, techStack });
  };

  const addTechCategory = () => {
    const name = prompt('Category name (e.g., "devops", "monitoring"):');
    if (!name) return;
    const key = name.toLowerCase().replace(/\s+/g, '_');
    const techStack = JSON.parse(JSON.stringify(planData.techStack));
    techStack[key] = [];
    onUpdate({ ...planData, techStack });
  };

  // ── Risk helpers ──
  const addRisk = () => {
    const risks = [...planData.risks];
    risks.push({ risk: '', impact: 'Medium', mitigation: '' });
    update('risks', risks);
  };

  const removeRisk = (index) => {
    const risks = [...planData.risks];
    risks.splice(index, 1);
    update('risks', risks);
  };

  const updateRisk = (index, field, value) => {
    const risks = JSON.parse(JSON.stringify(planData.risks));
    risks[index][field] = value;
    onUpdate({ ...planData, risks });
  };

  // ── Overview helpers ──
  const updateOverview = (field, value) => {
    const overview = { ...planData.overview, [field]: value };
    onUpdate({ ...planData, overview });
  };

  const addGoal = () => {
    const goals = [...(planData.overview?.goals || [])];
    goals.push({ goal: '', desc: '' });
    updateOverview('goals', goals);
  };

  const removeGoal = (index) => {
    const goals = [...(planData.overview?.goals || [])];
    goals.splice(index, 1);
    updateOverview('goals', goals);
  };

  const updateGoal = (index, field, value) => {
    const goals = JSON.parse(JSON.stringify(planData.overview?.goals || []));
    goals[index][field] = value;
    updateOverview('goals', goals);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Import / Export / Reset toolbar */}
      <div style={{
        background: '#fff', borderRadius: 12, border: `1px solid ${border}`,
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ fontSize: 14, color: '#6B7280' }}>
          Edit your plan below, or import/export as JSON.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button onClick={handleImportClick} style={{
            ...btnStyle(primary, false), background: surface,
            color: dark, border: `1px solid ${border}`,
          }}>
            Import JSON
          </button>
          <button onClick={onExport} style={btnStyle(primary, false)}>
            Export JSON
          </button>
          <button onClick={onReset} style={dangerBtnStyle(false)}>
            Reset to Default
          </button>
        </div>
      </div>

      {/* Config Section */}
      <CollapsibleSection
        title="Project Configuration"
        isOpen={openSections.has('config')}
        toggle={() => toggleSection('config')}
        theme={theme}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>Project Title</label>
            <input
              value={planData.config?.title || ''}
              onChange={(e) => update('config.title', e.target.value)}
              style={inputStyle(border)}
              placeholder="My Project Plan"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>Subtitle</label>
            <input
              value={planData.config?.subtitle || ''}
              onChange={(e) => update('config.subtitle', e.target.value)}
              style={inputStyle(border)}
              placeholder="Phase-by-phase implementation guide"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>Brand Name</label>
            <input
              value={planData.config?.brandName || ''}
              onChange={(e) => update('config.brandName', e.target.value)}
              style={inputStyle(border)}
              placeholder="Your Company"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Brand Colors</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              {['primary', 'dark', 'light', 'accent'].map(key => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="color"
                    value={planData.config?.colors?.[key] || '#000000'}
                    onChange={(e) => {
                      const colors = { ...planData.config?.colors, [key]: e.target.value };
                      update('config.colors', colors);
                    }}
                    style={{ width: 36, height: 36, border: `1px solid ${border}`, borderRadius: 6, cursor: 'pointer', padding: 2 }}
                  />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: dark, textTransform: 'capitalize' }}>{key}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: "'JetBrains Mono', monospace" }}>
                      {planData.config?.colors?.[key] || '#000000'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Overview Section */}
      <CollapsibleSection
        title="Overview"
        count={planData.overview?.goals?.length}
        isOpen={openSections.has('overview')}
        toggle={() => toggleSection('overview')}
        onAdd={addGoal}
        addLabel="Add Goal"
        theme={theme}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>Summary</label>
            <textarea
              value={planData.overview?.summary || ''}
              onChange={(e) => updateOverview('summary', e.target.value)}
              style={textareaStyle(border)}
              placeholder="Brief project summary..."
            />
          </div>

          {(planData.overview?.goals || []).map((g, i) => (
            <div key={i} style={{
              padding: 14, background: surface, borderRadius: 8, border: `1px solid ${border}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Goal {i + 1}</span>
                <button onClick={() => removeGoal(i)} style={dangerBtnStyle(true)}>Remove</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  value={g.goal}
                  onChange={(e) => updateGoal(i, 'goal', e.target.value)}
                  style={inputStyle(border)}
                  placeholder="Goal title"
                />
                <input
                  value={g.desc}
                  onChange={(e) => updateGoal(i, 'desc', e.target.value)}
                  style={inputStyle(border)}
                  placeholder="Goal description"
                />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Phases Section */}
      <CollapsibleSection
        title="Phases"
        count={planData.phases?.length}
        isOpen={openSections.has('phases')}
        toggle={() => toggleSection('phases')}
        onAdd={addPhase}
        addLabel="Add Phase"
        theme={theme}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          {(planData.phases || []).map((phase, pi) => (
            <PhaseEditorCard
              key={phase.id}
              phase={phase}
              index={pi}
              onUpdate={updatePhase}
              onRemove={() => removePhase(pi)}
              onAddTask={() => addTask(pi)}
              onRemoveTask={(ti) => removeTask(pi, ti)}
              onUpdateTask={(ti, field, value) => updateTask(pi, ti, field, value)}
              theme={theme}
            />
          ))}
        </div>
      </CollapsibleSection>

      {/* Sections */}
      <CollapsibleSection
        title="Sections"
        count={planData.sections?.length}
        isOpen={openSections.has('sections')}
        toggle={() => toggleSection('sections')}
        onAdd={addSection}
        addLabel="Add Section"
        theme={theme}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          {(planData.sections || []).map((section, si) => (
            <SectionEditorCard
              key={si}
              section={section}
              index={si}
              onUpdate={updateSection}
              onRemove={() => removeSection(si)}
              onAddField={() => addField(si)}
              onRemoveField={(fi) => removeField(si, fi)}
              onUpdateField={(fi, key, value) => updateField(si, fi, key, value)}
              theme={theme}
            />
          ))}
        </div>
      </CollapsibleSection>

      {/* Tech Stack */}
      <CollapsibleSection
        title="Tech Stack"
        count={techCategories.reduce((sum, cat) => sum + (planData.techStack[cat]?.length || 0), 0)}
        isOpen={openSections.has('tech')}
        toggle={() => toggleSection('tech')}
        onAdd={addTechCategory}
        addLabel="Add Category"
        theme={theme}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          {techCategories.map(category => (
            <div key={category}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 10,
              }}>
                <span style={{
                  fontSize: 14, fontWeight: 700, color: dark, textTransform: 'capitalize',
                }}>{category.replace(/_/g, ' ')}</span>
                <button onClick={() => addTechItem(category)} style={btnStyle(primary, true)}>+ Add Item</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(planData.techStack[category] || []).map((item, i) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '1fr 2fr auto auto',
                    gap: 8, alignItems: 'center',
                    padding: '8px 12px', background: surface, borderRadius: 8,
                    border: `1px solid ${border}`,
                  }}>
                    <input
                      value={item.name}
                      onChange={(e) => updateTechItem(category, i, 'name', e.target.value)}
                      style={inputStyle(border)}
                      placeholder="Name"
                    />
                    <input
                      value={item.purpose}
                      onChange={(e) => updateTechItem(category, i, 'purpose', e.target.value)}
                      style={inputStyle(border)}
                      placeholder="Purpose"
                    />
                    <input
                      value={item.cost || item.note || ''}
                      onChange={(e) => updateTechItem(category, i, item.cost !== undefined ? 'cost' : 'note', e.target.value)}
                      style={{ ...inputStyle(border), width: 120 }}
                      placeholder="Cost/Note"
                    />
                    <button onClick={() => removeTechItem(category, i)} style={dangerBtnStyle(true)}>Remove</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Risks */}
      <CollapsibleSection
        title="Risks"
        count={planData.risks?.length}
        isOpen={openSections.has('risks')}
        toggle={() => toggleSection('risks')}
        onAdd={addRisk}
        addLabel="Add Risk"
        theme={theme}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          {(planData.risks || []).map((risk, i) => (
            <div key={i} style={{
              padding: 14, background: surface, borderRadius: 8, border: `1px solid ${border}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Risk {i + 1}</span>
                <button onClick={() => removeRisk(i)} style={dangerBtnStyle(true)}>Remove</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  value={risk.risk}
                  onChange={(e) => updateRisk(i, 'risk', e.target.value)}
                  style={inputStyle(border)}
                  placeholder="Risk description"
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    value={risk.impact}
                    onChange={(e) => updateRisk(i, 'impact', e.target.value)}
                    style={{ ...inputStyle(border), flex: '0 0 120px' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <input
                    value={risk.mitigation}
                    onChange={(e) => updateRisk(i, 'mitigation', e.target.value)}
                    style={inputStyle(border)}
                    placeholder="Mitigation strategy"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}

// ── Sub-components ──

function PhaseEditorCard({ phase, index, onUpdate, onRemove, onAddTask, onRemoveTask, onUpdateTask, theme }) {
  const { dark, border, surface, primary } = theme;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      background: surface, borderRadius: 10, border: `1px solid ${border}`, overflow: 'hidden',
    }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', gap: 10,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ fontSize: 20 }}>{phase.icon}</span>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: dark }}>
          Phase {phase.id}: {phase.title || 'Untitled'}
        </span>
        <span style={{ fontSize: 12, color: '#9CA3AF' }}>{phase.tasks.length} tasks</span>
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} style={dangerBtnStyle(true)}>Remove</button>
        <span style={{
          fontSize: 16, color: '#9CA3AF',
          transform: isOpen ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
        }}>▾</span>
      </div>

      {isOpen && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 60px', gap: 8, marginTop: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 2 }}>Title</label>
              <input
                value={phase.title}
                onChange={(e) => onUpdate(index, 'title', e.target.value)}
                style={inputStyle(border)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 2 }}>Weeks</label>
              <input
                value={phase.weeks}
                onChange={(e) => onUpdate(index, 'weeks', e.target.value)}
                style={inputStyle(border)}
                placeholder="1-2"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 2 }}>Icon</label>
              <input
                value={phase.icon}
                onChange={(e) => onUpdate(index, 'icon', e.target.value)}
                style={inputStyle(border)}
              />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 2 }}>Summary</label>
            <textarea
              value={phase.summary}
              onChange={(e) => onUpdate(index, 'summary', e.target.value)}
              style={textareaStyle(border)}
            />
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Tasks</span>
              <button onClick={onAddTask} style={btnStyle(primary, true)}>+ Add Task</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {phase.tasks.map((task, ti) => (
                <div key={task.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: 8, alignItems: 'center',
                  padding: '6px 10px', background: '#fff', borderRadius: 6, border: `1px solid ${border}`,
                }}>
                  <input
                    value={task.task}
                    onChange={(e) => onUpdateTask(ti, 'task', e.target.value)}
                    style={inputStyle(border)}
                    placeholder="Task name"
                  />
                  <input
                    value={task.detail}
                    onChange={(e) => onUpdateTask(ti, 'detail', e.target.value)}
                    style={inputStyle(border)}
                    placeholder="Details"
                  />
                  <button onClick={() => onRemoveTask(ti)} style={dangerBtnStyle(true)}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionEditorCard({ section, index, onUpdate, onRemove, onAddField, onRemoveField, onUpdateField, theme }) {
  const { dark, border, surface, primary } = theme;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      background: surface, borderRadius: 10, border: `1px solid ${border}`, overflow: 'hidden',
    }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', gap: 10,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ width: 10, height: 10, borderRadius: 3, background: section.color, flexShrink: 0 }} />
        <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: dark }}>
          {section.name || 'Untitled'}
        </span>
        <span style={{ fontSize: 12, color: '#9CA3AF' }}>{section.fields.length} fields</span>
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} style={dangerBtnStyle(true)}>Remove</button>
        <span style={{
          fontSize: 16, color: '#9CA3AF',
          transform: isOpen ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
        }}>▾</span>
      </div>

      {isOpen && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 60px', gap: 8, marginTop: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 2 }}>Name</label>
              <input
                value={section.name}
                onChange={(e) => onUpdate(index, 'name', e.target.value)}
                style={inputStyle(border)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 2 }}>Layout Key</label>
              <input
                value={section.layout}
                onChange={(e) => onUpdate(index, 'layout', e.target.value)}
                style={inputStyle(border)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 2 }}>Color</label>
              <input
                type="color"
                value={section.color}
                onChange={(e) => onUpdate(index, 'color', e.target.value)}
                style={{ width: '100%', height: 36, border: `1px solid ${border}`, borderRadius: 6, cursor: 'pointer', padding: 2 }}
              />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280' }}>Fields</span>
              <button onClick={onAddField} style={btnStyle(primary, true)}>+ Add Field</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {section.fields.map((field, fi) => (
                <div key={fi} style={{
                  display: 'grid', gridTemplateColumns: '1fr 100px auto',
                  gap: 8, alignItems: 'center',
                  padding: '6px 10px', background: '#fff', borderRadius: 6, border: `1px solid ${border}`,
                }}>
                  <input
                    value={field.name}
                    onChange={(e) => onUpdateField(fi, 'name', e.target.value)}
                    style={inputStyle(border)}
                    placeholder="Field name"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => onUpdateField(fi, 'type', e.target.value)}
                    style={inputStyle(border)}
                  >
                    {['Text', 'Textarea', 'Rich Text', 'Image', 'Link', 'Select', 'Repeater', 'Number', 'Date', 'File'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button onClick={() => onRemoveField(fi)} style={dangerBtnStyle(true)}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
