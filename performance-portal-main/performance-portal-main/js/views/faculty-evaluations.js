/**
 * ASCEND – Faculty Semester Evaluation View
 * Formal, faculty-led semester evaluations across 5 developmental criteria.
 * Features 3 clear tabs (To Evaluate, Drafts, Published), factual student rows,
 * and an Activity Brief at the top of the evaluation form modal.
 * Pure professional SVG icons — zero emojis.
 */

/* ── Evaluation Rubric Criteria ───────────────────────────────── */
const RUBRIC_CRITERIA = [
  {
    key: 'technical',
    label: 'Technical Competency',
    desc: 'Core subject knowledge, algorithms, tooling, and specialized framework proficiency.',
  },
  {
    key: 'projectAbility',
    label: 'Project / Application Ability',
    desc: 'Ability to independently build, deliver, and maintain non-trivial practical projects.',
  },
  {
    key: 'communication',
    label: 'Communication',
    desc: 'Clarity of technical documentation, code comments, verbal presentation, and reports.',
  },
  {
    key: 'leadership',
    label: 'Collaboration & Leadership',
    desc: 'Team contributions, peer support, initiative in group work, and accountability.',
  },
  {
    key: 'careerPreparedness',
    label: 'Career Preparedness',
    desc: 'Portfolio professionalism, industry readiness, career interests, and verified credentials.',
  },
];

const RUBRIC_LEVELS = ['Developing', 'Meets Expectations', 'Strong', 'Outstanding'];

/* ── Qualitative Badge Helper (Professional SVG Icons) ────────── */
function evalRubricLevelBadge(level) {
  const map = {
    'Outstanding':        { bg: 'rgba(26, 115, 232, 0.12)', text: '#1A73E8', border: 'rgba(26, 115, 232, 0.3)' },
    'Strong':             { bg: 'rgba(21, 87, 208, 0.12)',  text: '#1557D0', border: 'rgba(21, 87, 208, 0.3)' },
    'Meets Expectations': { bg: 'rgba(46, 125, 50, 0.12)',  text: '#2E7D32', border: 'rgba(46, 125, 50, 0.3)' },
    'Developing':         { bg: 'rgba(217, 119, 6, 0.12)',  text: '#D97706', border: 'rgba(217, 119, 6, 0.3)' },
  };
  const c = map[level] || { bg: 'var(--c-bg)', text: 'var(--c-text-2)', border: 'var(--c-border)' };
  return `<span class="badge" style="background:${c.bg};color:${c.text};border:1px solid ${c.border};font-weight:600;font-size:11px;">${level}</span>`;
}

/* ── Active Evaluation Tab State ──────────────────────────────── */
window._facultyEvalActiveTab = window._facultyEvalActiveTab || 'to-evaluate';
window._facultyEvalPeriod = window._facultyEvalPeriod || 'Semester 5 · July–November 2026';

/* ── Main Render ─────────────────────────────────────────────── */
function renderFacultyEvaluations() {
  const { evaluations, students, selectedClassId, getSemesterEvaluationsDue } = window.AscendFacultyData;
  const { Icons } = window.AscendUI;

  const currentPeriod = window._facultyEvalPeriod || 'Semester 5 · July–November 2026';
  const activeTab = window._facultyEvalActiveTab || 'to-evaluate';

  // Get full roster status for current period
  const rosterData = getSemesterEvaluationsDue
    ? getSemesterEvaluationsDue(selectedClassId, 'Semester 5')
    : (students || []).map(s => {
        const ev = (evaluations || []).find(e => e.studentId === s.id && e.evaluationPeriod?.includes('Semester 5'));
        return {
          student: s,
          evaluation: ev,
          status: ev ? ev.status : 'to-evaluate',
          period: currentPeriod,
          latestSummary: s.latestMonthlySummary || 'September summary: Activity recorded.',
          lastActivityDate: s.lastActivity || 'Recently',
        };
      });

  const toEvaluateList = rosterData.filter(item => item.status === 'to-evaluate');
  const draftsList = rosterData.filter(item => item.status === 'draft');
  const publishedList = rosterData.filter(item => item.status === 'published');

  const preselectedStudentId = window._newEvalStudentId || '';
  window._newEvalStudentId = null;

  return `
    <!-- Header -->
    <div class="section-header" style="margin-bottom:var(--sp-5);">
      <div>
        <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;color:var(--c-text);margin:0 0 4px;">
          Semester Evaluations
        </h1>
        <div style="font-size:var(--text-sm);color:var(--c-text-2);">
          Faculty-led formal rubric evaluations &bull; Factual activity briefs &bull; No automated grades or rankings
        </div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="FacultyViews.openCreateEvalModal('${preselectedStudentId}')">
        ${Icons.plus} Start Evaluation
      </button>
    </div>

    <!-- Evaluation Period Selector & 3 Clear Tabs Bar -->
    <div class="card" style="padding:var(--sp-4);margin-bottom:var(--sp-5);background:var(--c-surface);">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);margin-bottom:var(--sp-4);">
        <div style="display:flex;align-items:center;gap:var(--sp-3);">
          <span style="font-size:var(--text-xs);font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:var(--c-text-2);">
            Formal Period:
          </span>
          <select class="form-input form-select" id="eval-period-select" style="font-size:var(--text-xs);font-weight:600;width:auto;"
            onchange="FacultyViews.onSelectEvalPeriod(this.value)">
            <option value="Semester 5 · July–November 2026" ${currentPeriod.includes('Semester 5') ? 'selected' : ''}>Semester 5 · July–November 2026 (Active)</option>
            <option value="Semester 3 · July–November 2025" ${currentPeriod.includes('Semester 3') ? 'selected' : ''}>Semester 3 · July–November 2025</option>
            <option value="Semester 1 · July–November 2024" ${currentPeriod.includes('Semester 1') ? 'selected' : ''}>Semester 1 · July–November 2024</option>
          </select>
        </div>

        <div style="font-size:var(--text-xs);color:var(--c-text-3);">
          Faculty validates &bull; Published evaluations become visible to students; Drafts remain private
        </div>
      </div>

      <!-- 3 Clear Tabs: To Evaluate / Drafts / Published -->
      <div style="display:flex;gap:var(--sp-2);border-top:1px solid var(--c-border);padding-top:var(--sp-3);flex-wrap:wrap;">
        <button type="button" class="btn ${activeTab === 'to-evaluate' ? 'btn-primary' : 'btn-outline'} btn-sm"
          onclick="FacultyViews.switchEvalTab('to-evaluate')">
          To Evaluate (${toEvaluateList.length})
        </button>
        <button type="button" class="btn ${activeTab === 'draft' ? 'btn-primary' : 'btn-outline'} btn-sm"
          onclick="FacultyViews.switchEvalTab('draft')">
          Drafts (${draftsList.length})
        </button>
        <button type="button" class="btn ${activeTab === 'published' ? 'btn-primary' : 'btn-outline'} btn-sm"
          onclick="FacultyViews.switchEvalTab('published')">
          Published (${publishedList.length})
        </button>
      </div>
    </div>

    <!-- Active Tab Roster List -->
    <div id="evaluations-tab-content">
      ${renderEvaluationsTabContent(activeTab, rosterData)}
    </div>

    <!-- Create / Edit Evaluation Modal -->
    <div id="eval-form-modal" class="modal-overlay">
      <div class="modal" style="max-width:800px;" id="eval-form-modal-content">
        <!-- Rendered dynamically with Activity Brief at top -->
      </div>
    </div>`;
}

/* ── Evaluations Tab Content Renderer ────────────────────────── */
function renderEvaluationsTabContent(activeTab, rosterData) {
  const { Icons, formatDate } = window.AscendUI;
  const filtered = rosterData.filter(item => {
    if (activeTab === 'to-evaluate') return item.status === 'to-evaluate';
    if (activeTab === 'draft') return item.status === 'draft';
    if (activeTab === 'published') return item.status === 'published';
    return true;
  });

  if (!filtered.length) {
    const tabLabels = {
      'to-evaluate': 'No students waiting for evaluation in this period.',
      'draft': 'No evaluations currently in draft.',
      'published': 'No evaluations published to students yet for this period.',
    };
    return `
      <div class="card" style="text-align:center;padding:var(--sp-8);color:var(--c-text-3);">
        <div style="font-size:var(--text-base);font-weight:600;color:var(--c-text);margin-bottom:4px;">
          ${tabLabels[activeTab] || 'No records found'}
        </div>
        <div style="font-size:var(--text-xs);">
          Switch tabs or select another evaluation period to view other cohorts.
        </div>
      </div>`;
  }

  return `
    <div class="card" style="padding:0;overflow:hidden;">
      <div style="display:flex;flex-direction:column;">
        ${filtered.map(item => {
          const s = item.student;
          const ev = item.evaluation;

          const statusBadge = item.status === 'published'
            ? `<span class="badge" style="background:#E8F0FE;color:#1A73E8;border:1px solid #C2D8FF;font-size:11px;font-weight:600;">Published</span>`
            : (item.status === 'draft'
              ? `<span class="badge" style="background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;font-size:11px;font-weight:600;">Draft (Private)</span>`
              : `<span class="badge" style="background:var(--c-bg);color:var(--c-text-2);border:1px solid var(--c-border);font-size:11px;font-weight:600;">To Evaluate</span>`);

          const actionButton = item.status === 'published'
            ? `<button class="btn btn-outline btn-sm" onclick="FacultyViews.openEditEvalModal('${ev.id}')">View / Edit</button>`
            : (item.status === 'draft'
              ? `<button class="btn btn-primary btn-sm" onclick="FacultyViews.openEditEvalModal('${ev.id}')">Continue Draft</button>`
              : `<button class="btn btn-primary btn-sm" onclick="FacultyViews.openCreateEvalModal('${s.id}')">Start Evaluation</button>`);

          return `
            <div style="padding:18px 24px;border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
              <!-- Student Info -->
              <div style="display:flex;align-items:center;gap:12px;min-width:240px;">
                <div class="avatar avatar-md" style="background:var(--c-primary-light);color:var(--c-primary);font-weight:700;font-size:13px;">
                  ${s.initials || 'ST'}
                </div>
                <div>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">${s.name}</span>
                    ${statusBadge}
                  </div>
                  <div style="font-size:12px;color:var(--c-text-3);margin-top:2px;">
                    ${s.rollNo ? `${s.rollNo} &bull; ` : ''}${s.className || s.program || 'B.Tech CSE'}
                  </div>
                </div>
              </div>

              <!-- Latest Monthly Activity Summary -->
              <div style="flex:1;min-width:260px;background:var(--c-bg);padding:10px 14px;border-radius:var(--r-md);border:1px solid var(--c-border);">
                <div style="font-size:11px;font-weight:700;color:var(--c-text-2);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:2px;">
                  Latest Monthly Summary:
                </div>
                <div style="font-size:var(--text-xs);color:var(--c-text);line-height:1.4;">
                  ${item.latestSummary}
                </div>
                <div style="font-size:10.5px;color:var(--c-text-3);margin-top:4px;">
                  Last portfolio activity: ${item.lastActivityDate ? item.lastActivityDate.slice(0,10) : 'Recently'}
                </div>
              </div>

              <!-- Action button -->
              <div style="display:flex;align-items:center;gap:8px;">
                ${actionButton}
                <button class="btn btn-ghost btn-sm" onclick="FacultyViews.openStudentDetail('${s.id}')" title="View Student Profile">
                  Profile ${Icons.chevronRight}
                </button>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

/* ── Evaluation Form Modal (Create & Edit) ────────────────────── */
function openCreateEvalModal(preselectedStudentId = '') {
  const { students } = window.AscendFacultyData;
  const student = students.find(s => s.id === preselectedStudentId) || students[0];

  const defaultScores = {};
  RUBRIC_CRITERIA.forEach(c => {
    defaultScores[c.key] = { level: null, comment: '' };
  });

  renderEvalFormModal({
    isNew: true,
    evalId: null,
    studentId: student.id,
    period: window._facultyEvalPeriod || 'Semester 5 · July–November 2026',
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

/* ── Evaluation Form Modal Renderer with Top Activity Brief ──── */
function renderEvalFormModal(state) {
  const { students, facultyUser, getActivityBrief } = window.AscendFacultyData;
  const student = students.find(s => s.id === state.studentId) || students[0];

  // Retrieve factual activity brief since previous evaluation
  const brief = getActivityBrief ? getActivityBrief(student.id, state.period) : {
    achievementsCount: (student.achievements || []).length,
    achievementTitles: (student.achievements || []).map(a => a.title),
    projectsCount: (student.projects || []).length,
    projectTitles: (student.projects || []).map(p => p.title),
    feedbackCount: 1,
    feedbackNotes: [],
    mostRecentDate: student.lastActivity ? student.lastActivity.slice(0, 10) : 'Recently',
    inactiveMonths: [],
  };

  const modalHTML = `
    <div class="modal-header">
      <div>
        <span class="modal-title">${state.isNew ? 'New Semester Evaluation' : `Edit Evaluation – ${student.name}`}</span>
        <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">
          Evaluator: ${facultyUser.name} &bull; ${state.period} &bull; Formal Faculty Rubric
        </div>
      </div>
      <button class="modal-close" onclick="AscendUI.closeModal('eval-form-modal')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div class="modal-body" style="max-height:78vh;overflow-y:auto;gap:var(--sp-4);">

      <!-- ── 1. Top Activity Brief (Factual Records Since Previous Evaluation) ── -->
      <div class="card" style="padding:16px 20px;background:var(--c-surface);border:1.5px solid #C2D8FF;border-left:4px solid var(--c-primary);border-radius:var(--r-md);">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
          <div style="font-size:12px;font-weight:700;color:var(--c-primary);text-transform:uppercase;letter-spacing:0.05em;display:flex;align-items:center;gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Activity Brief Since Previous Evaluation
          </div>
          <span class="badge" style="background:#E8F0FE;color:#1A73E8;font-size:11px;font-weight:600;">
            Activity summary &mdash; not a performance score
          </span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:12px;">
          <div style="background:var(--c-bg);padding:8px 12px;border-radius:var(--r-sm);border:1px solid var(--c-border);">
            <div style="font-size:10.5px;color:var(--c-text-3);font-weight:600;">Achievements Added</div>
            <div style="font-size:15px;font-weight:700;color:var(--c-text);">${brief.achievementsCount}</div>
            <div style="font-size:10px;color:var(--c-text-2);">${brief.achievementTitles.slice(0, 2).join(', ') || 'None recorded'}</div>
          </div>
          <div style="background:var(--c-bg);padding:8px 12px;border-radius:var(--r-sm);border:1px solid var(--c-border);">
            <div style="font-size:10.5px;color:var(--c-text-3);font-weight:600;">Projects Added/Updated</div>
            <div style="font-size:15px;font-weight:700;color:var(--c-text);">${brief.projectsCount}</div>
            <div style="font-size:10px;color:var(--c-text-2);">${brief.projectTitles.slice(0, 2).join(', ') || 'None recorded'}</div>
          </div>
          <div style="background:var(--c-bg);padding:8px 12px;border-radius:var(--r-sm);border:1px solid var(--c-border);">
            <div style="font-size:10.5px;color:var(--c-text-3);font-weight:600;">Faculty Feedback Notes</div>
            <div style="font-size:15px;font-weight:700;color:var(--c-text);">${brief.feedbackCount}</div>
            <div style="font-size:10px;color:var(--c-text-2);">Recorded in session</div>
          </div>
          <div style="background:var(--c-bg);padding:8px 12px;border-radius:var(--r-sm);border:1px solid var(--c-border);">
            <div style="font-size:10.5px;color:var(--c-text-3);font-weight:600;">Most Recent Activity</div>
            <div style="font-size:13.5px;font-weight:700;color:var(--c-text);">${brief.mostRecentDate}</div>
            <div style="font-size:10px;color:var(--c-text-2);">Portfolio updated</div>
          </div>
        </div>

        ${brief.inactiveMonths && brief.inactiveMonths.length > 0 ? `
          <div style="font-size:11px;color:#92400E;background:#FEF3C7;border:1px solid #FDE68A;padding:4px 10px;border-radius:var(--r-sm);">
            Months with no recorded activity: <strong>${brief.inactiveMonths.join(', ')}</strong>
          </div>` : ''}
      </div>

      <!-- Student & Period Selectors -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4);" class="faculty-grid-2">
        <div class="form-group">
          <label class="form-label" for="eval-form-student">Student <span class="required">*</span></label>
          <select class="form-input form-select" id="eval-form-student" ${!state.isNew ? 'disabled' : ''} onchange="FacultyViews.updateEvalFormStudent(this.value)">
            ${students.map(s => `<option value="${s.id}" ${s.id === state.studentId ? 'selected' : ''}>${s.name} (${s.className || s.program})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="eval-form-period">Evaluation Period <span class="required">*</span></label>
          <select class="form-input form-select" id="eval-form-period">
            <option value="Semester 5 · July–November 2026" ${state.period.includes('Semester 5') ? 'selected' : ''}>Semester 5 · July–November 2026</option>
            <option value="Semester 3 · July–November 2025" ${state.period.includes('Semester 3') ? 'selected' : ''}>Semester 3 · July–November 2025</option>
            <option value="Semester 1 · July–November 2024" ${state.period.includes('Semester 1') ? 'selected' : ''}>Semester 1 · July–November 2024</option>
          </select>
        </div>
      </div>

      <!-- 5 Rubric Criteria Form -->
      <div style="display:flex;flex-direction:column;gap:var(--sp-4);">
        <div style="font-size:var(--text-xs);font-weight:700;color:var(--c-text-3);text-transform:uppercase;letter-spacing:0.06em;">
          Evaluation Rubric Criteria (Faculty must rate all 5 before publishing)
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

              <!-- 4 Qualitative Levels -->
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
          placeholder="Summarize developmental trajectory, demonstrated strengths, and faculty guidance for upcoming coursework and projects…">${state.overallSummary}</textarea>
        <div class="form-error" id="eval-summary-err" style="display:none;margin-top:4px;">Summary is required before saving or publishing.</div>
      </div>
    </div>

    <!-- Modal Footer Actions: Save as Draft & Publish Evaluation -->
    <div class="modal-footer" style="justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);">
      <div style="display:flex;align-items:center;gap:var(--sp-2);">
        <button class="btn btn-ghost" onclick="AscendUI.closeModal('eval-form-modal')">Cancel</button>
        ${!state.isNew ? `
        <button class="btn btn-ghost btn-sm" style="color:var(--c-rejected);border:1px solid var(--c-border);" onclick="FacultyViews.deleteEvaluation('${state.evalId}', '${state.studentId}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-right:4px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>Delete Evaluation
        </button>` : ''}
      </div>
      <div style="display:flex;gap:var(--sp-3);">
        <button class="btn btn-outline" onclick="FacultyViews.saveRubricEvaluation('${state.evalId || ''}', false)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Save Draft (Private)
        </button>
        <button class="btn btn-primary" onclick="FacultyViews.saveRubricEvaluation('${state.evalId || ''}', true)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg>Publish to Student
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
      defaultScores[c.key] = { level: null, comment: '' };
    });
    renderEvalFormModal({
      isNew: true,
      evalId: null,
      studentId: student.id,
      period: window._facultyEvalPeriod || 'Semester 5 · July–November 2026',
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
  const period = document.getElementById('eval-form-period')?.value || 'Semester 5 · July–November 2026';
  const summary = document.getElementById('eval-form-summary')?.value.trim() || '';

  const errEl = document.getElementById('eval-summary-err');
  if (!summary) {
    if (errEl) errEl.style.display = 'block';
    return;
  }
  if (errEl) errEl.style.display = 'none';

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
    AscendUI.showToast(`Please explicitly select all 5 ratings before publishing. Missing: ${unselectedCriteria.join(', ')}.`, 'error');
    unselectedCriteria.forEach(label => {
      const c = RUBRIC_CRITERIA.find(rc => rc.label === label);
      if (c) {
        const card = document.getElementById(`criterion-card-${c.key}`);
        if (card) card.style.borderColor = 'var(--c-rejected)';
      }
    });
    return;
  }

  const student = window.AscendFacultyData.students.find(s => s.id === studentId);
  const studentProgram = (student && student.className) ? student.className : (student?.program || 'B.Tech CSE');

  window.AscendFacultyData.saveEvaluation(evalId, {
    studentId,
    studentName: student ? student.name : 'Student',
    studentProgram,
    evaluationPeriod: period,
    scores: scoresObj,
    overallSummary: summary,
  }, isPublish);

  AscendUI.closeModal('eval-form-modal');
  AscendUI.showToast(isPublish ? 'Evaluation published to student portal!' : 'Draft evaluation saved privately.', 'success');

  // Refresh evaluations view
  AscendApp.navigate('faculty-evaluations');
}

/* ── Delete Evaluation Handler ───────────────────────────────── */
function deleteEvaluation(evalId, studentId) {
  if (!confirm('Are you sure you want to delete this evaluation record?')) return;
  window.AscendFacultyData.deleteEvaluation(evalId);
  AscendUI.closeModal('eval-form-modal');
  AscendUI.showToast('Evaluation record deleted.', 'success');
  AscendApp.navigate('faculty-evaluations');
}

/* ── Tab Switcher Handler ────────────────────────────────────── */
function switchEvalTab(tabKey) {
  window._facultyEvalActiveTab = tabKey;
  const content = document.getElementById('app-content-area');
  if (content && window.FacultyViews && window.FacultyViews.evaluations) {
    content.innerHTML = window.FacultyViews.evaluations();
  }
}

function onSelectEvalPeriod(period) {
  window._facultyEvalPeriod = period;
  const content = document.getElementById('app-content-area');
  if (content && window.FacultyViews && window.FacultyViews.evaluations) {
    content.innerHTML = window.FacultyViews.evaluations();
  }
}

/* ── Export ──────────────────────────────────────────────────── */
window.FacultyViews = window.FacultyViews || {};
Object.assign(window.FacultyViews, {
  evaluations: renderFacultyEvaluations,
  openCreateEvalModal,
  openEditEvalModal,
  selectRubricLevel,
  updateEvalFormStudent,
  saveRubricEvaluation,
  deleteEvaluation,
  switchEvalTab,
  onSelectEvalPeriod,
});
