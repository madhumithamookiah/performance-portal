/**
 * ASCEND – Faculty Evaluations View
 * Rubric-based student competency evaluation system.
 * Criteria:
 *   1. Technical competency
 *   2. Project/application ability
 *   3. Communication
 *   4. Collaboration and leadership
 *   5. Career preparedness
 * Each criterion uses: Developing, Meets Expectations, Strong, or Outstanding, plus comment/evidence.
 * Draft and Publish workflows with student visibility upon publication.
 * Zero automated single quality/readiness scores. Professional SVG outline icons.
 */

/* ── Rubric Criteria Configuration ───────────────────────────── */
const RUBRIC_CRITERIA = [
  {
    key: 'technical',
    label: 'Technical Competency',
    desc: 'Foundational theory, domain knowledge, programming fluency, system debugging',
  },
  {
    key: 'projectAbility',
    label: 'Project / Application Ability',
    desc: 'Translating concepts into working software/hardware, architecture design, practical delivery',
  },
  {
    key: 'communication',
    label: 'Communication',
    desc: 'Technical writing, repository documentation, verbal defense, and clarity of explanation',
  },
  {
    key: 'leadership',
    label: 'Collaboration & Leadership',
    desc: 'Team dynamics, peer mentorship, initiative in group workflows, accountability',
  },
  {
    key: 'careerPreparedness',
    label: 'Career Preparedness',
    desc: 'Professionalism, public portfolio quality, industry readiness, career roadmap alignment',
  },
];

const RUBRIC_LEVELS = ['Developing', 'Meets Expectations', 'Strong', 'Outstanding'];

/* ── Qualitative Badge Helper ────────────────────────────────── */
function evalRubricLevelBadge(level) {
  const map = {
    'Outstanding':        { bg: 'rgba(26, 115, 232, 0.12)', text: '#1A73E8', border: 'rgba(26, 115, 232, 0.3)' },
    'Strong':             { bg: 'rgba(21, 87, 208, 0.12)',  text: '#1557D0', border: 'rgba(21, 87, 208, 0.3)' },
    'Meets Expectations': { bg: 'rgba(66, 133, 244, 0.12)',  text: '#1A73E8', border: 'rgba(66, 133, 244, 0.3)' },
    'Developing':         { bg: 'rgba(217, 119, 6, 0.12)',  text: '#D97706', border: 'rgba(217, 119, 6, 0.3)' },
  };
  const c = map[level] || { bg: 'var(--c-bg)', text: 'var(--c-text-2)', border: 'var(--c-border)' };
  return `<span class="badge" style="background:${c.bg};color:${c.text};border:1px solid ${c.border};font-weight:600;font-size:11px;">${level}</span>`;
}

/* ── Main Render ─────────────────────────────────────────────── */
function renderFacultyEvaluations() {
  const { evaluations } = window.AscendFacultyData;
  const { Icons } = window.AscendUI;

  const draftEvals = evaluations.filter(e => e.status === 'draft');
  const publishedEvals = evaluations.filter(e => e.status === 'published');

  const preselectedStudentId = window._newEvalStudentId || '';
  window._newEvalStudentId = null;

  return `
    <!-- Header -->
    <div class="section-header" style="margin-bottom:var(--sp-5);">
      <div>
        <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;color:var(--c-text);">Student Evaluations</h1>
        <div style="font-size:var(--text-sm);color:var(--c-text-2);margin-top:4px;">
          Comprehensive faculty rubric assessments across 5 core development criteria
        </div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="FacultyViews.openCreateEvalModal('${preselectedStudentId}')">
        ${Icons.plus} Start New Evaluation
      </button>
    </div>

    <!-- Summary Metrics Row (Zero arbitrary automated quality scores) -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--sp-4);margin-bottom:var(--sp-6);" class="faculty-grid-4">
      <div class="metric-card" style="--metric-accent:var(--c-primary);">
        <div class="metric-number">${evaluations.length}</div>
        <div class="metric-label">Total Evaluations Recorded</div>
        <div class="metric-change">Assigned student cohorts</div>
      </div>
      <div class="metric-card" style="--metric-accent:var(--c-verified);">
        <div class="metric-number" style="color:var(--c-verified);">${publishedEvals.length}</div>
        <div class="metric-label">Published to Students</div>
        <div class="metric-change">Visible in student portals</div>
      </div>
      <div class="metric-card" style="--metric-accent:#2563EB;">
        <div class="metric-number" style="color:#2563EB;">${draftEvals.length}</div>
        <div class="metric-label">Drafts in Progress</div>
        <div class="metric-change">Private faculty notes</div>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="card" style="padding:var(--sp-3) var(--sp-4);margin-bottom:var(--sp-5);">
      <div style="display:flex;flex-wrap:wrap;gap:var(--sp-3);align-items:center;">
        <div class="search-input-wrap" style="flex:1;min-width:240px;">
          ${Icons.search}
          <input type="search" class="form-input search-input" id="eval-search"
            placeholder="Search by student name or program…" oninput="FacultyViews.filterEvaluations()">
        </div>
        <select class="form-input form-select" id="eval-filter-status" style="width:auto;" onchange="FacultyViews.filterEvaluations()">
          <option value="">All evaluation states</option>
          <option value="published">Published to student</option>
          <option value="draft">Drafts in progress</option>
        </select>
        <select class="form-input form-select" id="eval-filter-period" style="width:auto;" onchange="FacultyViews.filterEvaluations()">
          <option value="">All periods</option>
          <option value="Semester 5">Semester 5 (Jul – Nov 2026)</option>
          <option value="Semester 3">Semester 3 (Jul – Nov 2026)</option>
          <option value="Semester 1">Semester 1 (Jul – Nov 2026)</option>
        </select>
      </div>
    </div>

    <!-- Evaluation Cards List -->
    <div id="evaluations-list" style="display:flex;flex-direction:column;gap:var(--sp-4);">
      ${renderEvaluationsList(evaluations)}
    </div>

    <!-- Create / Edit Evaluation Modal -->
    <div id="eval-form-modal" class="modal-overlay">
      <div class="modal" style="max-width:760px;" id="eval-form-modal-content">
        <!-- Rendered dynamically -->
      </div>
    </div>`;
}

/* ── Evaluations List Sub-Renderer ───────────────────────────── */
function renderEvaluationsList(evals) {
  const { formatDate } = window.AscendUI;
  if (!evals.length) {
    return `
      <div class="card" style="text-align:center;padding:var(--sp-10);color:var(--c-text-3);">
        <div style="font-size:var(--text-base);font-weight:600;color:var(--c-text);margin-bottom:4px;">No evaluations match criteria</div>
        <div style="font-size:var(--text-xs);">Start a new evaluation or adjust your search filter.</div>
      </div>`;
  }

  return evals.map(ev => `
    <div class="card" style="padding:var(--sp-5);">
      <!-- Top Card Row -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);padding-bottom:var(--sp-3);border-bottom:1px solid var(--c-border);margin-bottom:var(--sp-4);">
        <div style="display:flex;align-items:center;gap:var(--sp-3);">
          <div class="avatar avatar-md" style="background:var(--c-primary-light);color:var(--c-primary);font-weight:700;">
            ${ev.studentName.split(' ').map(n=>n[0]).join('').slice(0,2)}
          </div>
          <div>
            <div style="font-size:var(--text-lg);font-weight:700;color:var(--c-text);">${ev.studentName}</div>
            <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
              ${ev.studentProgram} · ${ev.evaluationPeriod}
            </div>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:var(--sp-2);">
          <span class="badge ${ev.status === 'published' ? 'badge-verified' : 'badge-draft'}" style="font-size:11px;">
            ${ev.status === 'published' ? 'Published (Visible to Student)' : 'Draft in Progress'}
          </span>
          <button class="btn btn-outline btn-sm" onclick="FacultyViews.openEditEvalModal('${ev.id}')">
            ${ev.status === 'draft' ? 'Edit Draft' : 'View / Edit'}
          </button>
        </div>
      </div>

      <!-- 5 Rubric Criteria Ratings Grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:var(--sp-3);margin-bottom:var(--sp-4);">
        ${RUBRIC_CRITERIA.map(c => {
          const item = ev.scores ? ev.scores[c.key] : null;
          const level = (item && item.level) || 'Developing';
          const comm = (item && item.comment) || '';
          return `
            <div style="padding:var(--sp-3);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);display:flex;flex-direction:column;gap:5px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                <div style="font-size:11px;font-weight:700;color:var(--c-text);text-transform:uppercase;letter-spacing:0.03em;">${c.label}</div>
                ${evalRubricLevelBadge(level)}
              </div>
              ${comm ? `<div style="font-size:var(--text-xs);color:var(--c-text-2);line-height:1.4;margin-top:2px;">"${comm}"</div>` : ''}
            </div>`;
        }).join('')}
      </div>

      <!-- Overall Faculty Summary & Recommendations -->
      <div style="padding:var(--sp-4);background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);margin-bottom:var(--sp-3);">
        <div style="font-size:11px;font-weight:700;color:var(--c-text-3);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:var(--sp-2);">
          Faculty Evaluation Summary &amp; Recommendations
        </div>
        <div style="font-size:var(--text-sm);color:var(--c-text);line-height:1.7;">
          ${ev.overallSummary || 'No overall summary provided.'}
        </div>
      </div>

      <!-- Footer Metadata & Profile Shortcut -->
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);font-size:var(--text-xs);color:var(--c-text-3);">
        <div>
          Evaluator: ${ev.evaluatorName} · ${ev.status === 'published' ? `Published ${formatDate(ev.publishedAt)}` : `Saved ${formatDate(ev.lastUpdated)}`}
        </div>
        <button class="btn btn-ghost btn-sm" onclick="FacultyViews.openStudentDetail('${ev.studentId}')">
          View Student Profile →
        </button>
      </div>
    </div>`).join('');
}

/* ── Filter Logic ────────────────────────────────────────────── */
function filterEvaluations() {
  const q = (document.getElementById('eval-search')?.value || '').toLowerCase().trim();
  const status = document.getElementById('eval-filter-status')?.value || '';
  const period = document.getElementById('eval-filter-period')?.value || '';

  let evals = [...window.AscendFacultyData.evaluations];
  if (q) evals = evals.filter(e => e.studentName.toLowerCase().includes(q) || e.studentProgram.toLowerCase().includes(q));
  if (status) evals = evals.filter(e => e.status === status);
  if (period) evals = evals.filter(e => e.evaluationPeriod.includes(period));

  const list = document.getElementById('evaluations-list');
  if (list) list.innerHTML = renderEvaluationsList(evals);
}

/* ── Evaluation Form Modal (Create & Edit) ────────────────────── */
function openCreateEvalModal(preselectedStudentId = '') {
  const { students } = window.AscendFacultyData;
  const student = students.find(s => s.id === preselectedStudentId) || students[0];

  // All criteria start unselected — faculty must choose explicitly before publishing
  const defaultScores = {};
  RUBRIC_CRITERIA.forEach(c => {
    defaultScores[c.key] = { level: null, comment: '' };
  });

  renderEvalFormModal({
    isNew: true,
    evalId: null,
    studentId: student.id,
    period: 'Semester 5 (Jul – Nov 2026)',
    scores: defaultScores,
    overallSummary: '',
    status: 'draft',
  });
}

function openEditEvalModal(evalId) {
  const item = window.AscendFacultyData.evaluations.find(e => e.id === evalId);
  if (!item) return;

  renderEvalFormModal({
    isNew: false,
    evalId: item.id,
    studentId: item.studentId,
    period: item.evaluationPeriod,
    scores: item.scores,
    overallSummary: item.overallSummary,
    status: item.status,
  });
}

function renderEvalFormModal(state) {
  const { students, facultyUser } = window.AscendFacultyData;
  const student = students.find(s => s.id === state.studentId) || students[0];

  const modalHTML = `
    <div class="modal-header">
      <div>
        <span class="modal-title">${state.isNew ? 'New Faculty Evaluation' : `Edit Evaluation – ${student.name}`}</span>
        <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">
          Evaluator: ${facultyUser.name} · Student Development Rubric
        </div>
      </div>
      <button class="modal-close" onclick="AscendUI.closeModal('eval-form-modal')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div class="modal-body" style="max-height:75vh;overflow-y:auto;gap:var(--sp-4);">

      <!-- Notice Banner -->
      <div style="padding:var(--sp-3) var(--sp-4);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);font-size:var(--text-xs);color:var(--c-text-2);line-height:1.5;">
        <strong>Publishing Notice:</strong> Published evaluations become visible to the student in their portal. Drafts remain private to faculty.
      </div>

      <!-- Student & Period Selectors -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4);" class="faculty-grid-2">
        <div class="form-group">
          <label class="form-label" for="eval-form-student">Student <span class="required">*</span></label>
          <select class="form-input form-select" id="eval-form-student" ${!state.isNew ? 'disabled' : ''} onchange="FacultyViews.updateEvalFormStudent(this.value)">
            ${students.map(s => `<option value="${s.id}" ${s.id === state.studentId ? 'selected' : ''}>${s.name} (${s.program})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="eval-form-period">Evaluation Period <span class="required">*</span></label>
          <select class="form-input form-select" id="eval-form-period">
            <option value="Semester 5 (Jul – Nov 2026)" ${state.period.includes('Semester 5') ? 'selected' : ''}>Semester 5 (Jul – Nov 2026)</option>
            <option value="Semester 3 (Jul – Nov 2026)" ${state.period.includes('Semester 3') ? 'selected' : ''}>Semester 3 (Jul – Nov 2026)</option>
            <option value="Semester 1 (Jul – Nov 2026)" ${state.period.includes('Semester 1') ? 'selected' : ''}>Semester 1 (Jul – Nov 2026)</option>
          </select>
        </div>
      </div>

      <!-- 5 Rubric Criteria Form -->
      <div style="display:flex;flex-direction:column;gap:var(--sp-4);">
        <div style="font-size:var(--text-xs);font-weight:700;color:var(--c-text-3);text-transform:uppercase;letter-spacing:0.06em;">
          Evaluation Rubric Criteria &amp; Evidence
        </div>

        ${RUBRIC_CRITERIA.map(c => {
          const currentItem = state.scores ? state.scores[c.key] : null;
          const currentLevel   = (currentItem && currentItem.level) || null;
          const currentComment = (currentItem && currentItem.comment) || '';

          return `
            <div class="card" style="padding:var(--sp-4);background:var(--c-bg);border:1px solid var(--c-border);" id="criterion-card-${c.key}">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);margin-bottom:var(--sp-2);">
                <div>
                  <div style="font-size:var(--text-sm);font-weight:700;color:var(--c-text);">${c.label}</div>
                  <div style="font-size:11px;color:var(--c-text-2);margin-top:2px;">${c.desc}</div>
                </div>
              </div>

              <!-- 4 Qualitative Levels — all outline until faculty explicitly selects -->
              ${!currentLevel ? `<div style="font-size:11px;color:var(--c-review);font-weight:600;margin-bottom:var(--sp-2);">&#9679; Selection required before publishing</div>` : ''}
              <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);margin-bottom:var(--sp-3);" id="level-group-${c.key}">
                ${RUBRIC_LEVELS.map(lvl => `
                  <button type="button" class="btn btn-sm ${lvl === currentLevel ? 'btn-primary' : 'btn-outline'}"
                    style="font-size:11px;padding:4px 10px;"
                    data-criterion="${c.key}" data-level="${lvl}"
                    onclick="FacultyViews.selectRubricLevel('${c.key}', '${lvl}')">
                    ${lvl}
                  </button>`).join('')}
              </div>

              <div>
                <input class="form-input" style="font-size:var(--text-xs);"
                  id="eval-comment-${c.key}"
                  placeholder="Observation notes or evidence for ${c.label.toLowerCase()}…"
                  value="${currentComment}">
              </div>
            </div>`;
        }).join('')}
      </div>

      <!-- Overall Summary -->
      <div class="form-group">
        <label class="form-label" for="eval-form-summary">Overall Evaluation Summary &amp; Recommendations <span class="required">*</span></label>
        <textarea class="form-input form-textarea" id="eval-form-summary" rows="4"
          placeholder="Summarize developmental trajectory, strengths demonstrated, and faculty recommendations for future coursework and projects…">${state.overallSummary}</textarea>
        <div class="form-error" id="eval-summary-err" style="display:none;margin-top:4px;">Summary is required before saving or publishing.</div>
      </div>
    </div>

    <!-- Modal Footer Actions: Save as Draft & Publish Evaluation -->
    <div class="modal-footer" style="justify-content:space-between;">
      <button class="btn btn-ghost" onclick="AscendUI.closeModal('eval-form-modal')">Cancel</button>
      <div style="display:flex;gap:var(--sp-3);">
        <button class="btn btn-outline" onclick="FacultyViews.saveRubricEvaluation('${state.evalId || ''}', false)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Save Draft
        </button>
        <button class="btn btn-primary" onclick="FacultyViews.saveRubricEvaluation('${state.evalId || ''}', true)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg>Publish Evaluation
        </button>
      </div>
    </div>`;

  const container = document.getElementById('eval-form-modal-content');
  if (container) container.innerHTML = modalHTML;
  AscendUI.openModal('eval-form-modal');
}

/* ── Level Selector Helper ───────────────────────────────────── */
function selectRubricLevel(criterionKey, selectedLevel) {
  const group = document.getElementById(`level-group-${criterionKey}`);
  if (!group) return;
  group.querySelectorAll('button').forEach(btn => {
    const isTarget = btn.dataset.level === selectedLevel;
    btn.classList.toggle('btn-primary', isTarget);
    btn.classList.toggle('btn-outline', !isTarget);
  });
}

function updateEvalFormStudent(studentId) {
  const student = window.AscendFacultyData.students.find(s => s.id === studentId);
  if (student) {
    const defaultScores = {};
    RUBRIC_CRITERIA.forEach(c => {
      defaultScores[c.key] = { level: null, comment: '' }; // start unselected
    });
    renderEvalFormModal({
      isNew: true,
      evalId: null,
      studentId: student.id,
      period: 'Semester 5 (Jul – Nov 2026)',
      scores: defaultScores,
      overallSummary: '',
      status: 'draft',
    });
  }
}

/* ── Save / Publish Action Handler ───────────────────────────── */
function saveRubricEvaluation(evalId, isPublish) {
  const studentSelect = document.getElementById('eval-form-student');
  const studentId = studentSelect ? studentSelect.value : '';
  const period = document.getElementById('eval-form-period')?.value || 'Semester 5 (Jul – Nov 2026)';
  const summary = document.getElementById('eval-form-summary')?.value.trim() || '';

  const errEl = document.getElementById('eval-summary-err');
  if (!summary) {
    if (errEl) errEl.style.display = 'block';
    return;
  }
  if (errEl) errEl.style.display = 'none';

  const student = window.AscendFacultyData.students.find(s => s.id === studentId);
  const scoresObj = {};
  let unselectedCriteria = [];

  RUBRIC_CRITERIA.forEach(c => {
    const activeBtn = document.querySelector(`#level-group-${c.key} button.btn-primary`);
    const lvl  = activeBtn ? activeBtn.dataset.level : null;
    const comm = document.getElementById(`eval-comment-${c.key}`)?.value.trim() || '';
    scoresObj[c.key] = { level: lvl, comment: comm };
    if (!lvl) unselectedCriteria.push(c.label);
  });

  // Block publish if any criterion is unselected
  if (isPublish && unselectedCriteria.length > 0) {
    AscendUI.showToast(`Please rate all criteria before publishing. Missing: ${unselectedCriteria.join(', ')}.`, 'error');
    // Highlight unselected criterion cards
    unselectedCriteria.forEach(label => {
      const c = RUBRIC_CRITERIA.find(rc => rc.label === label);
      if (c) {
        const card = document.getElementById(`criterion-card-${c.key}`);
        if (card) card.style.borderColor = 'var(--c-rejected)';
        const hint = document.querySelector(`#level-group-${c.key}`)?.previousElementSibling;
        if (hint) hint.style.display = 'block';
      }
    });
    return;
  }

  const performSave = () => {
    window.AscendFacultyData.saveEvaluation(evalId, {
      studentId,
      studentName: student ? student.name : 'Student',
      studentProgram: student ? student.program : 'B.Tech CSE',
      classId: student ? student.classId : 'class-cse-5a',
      period,
      scores: scoresObj,
      overallSummary: summary,
    }, isPublish);

    AscendUI.closeModal('eval-form-modal');
    AscendUI.showToast(isPublish ? 'Evaluation published to student portal!' : 'Evaluation saved as draft.', isPublish ? 'success' : 'info');
    filterEvaluations();
  };

  if (isPublish) {
    AscendUI.confirmDialog({
      title: 'Publish Evaluation',
      message: `Publish this evaluation for ${student ? student.name : 'the student'}? The scores, criteria comments, and recommendations will become immediately visible in their portal.`,
      confirmLabel: 'Publish to Student',
      danger: false,
      onConfirm: performSave,
    });
  } else {
    performSave();
  }
}

window.FacultyViews = window.FacultyViews || {};
Object.assign(window.FacultyViews, {
  evaluations: renderFacultyEvaluations,
  filterEvaluations,
  openCreateEvalModal,
  openEditEvalModal,
  selectRubricLevel,
  updateEvalFormStudent,
  saveRubricEvaluation,
});
