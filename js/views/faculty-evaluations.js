/**
 * ASCEND – Faculty Semester Evaluation View
 * Formal, faculty-led semester evaluations across 5 developmental criteria.
 * Features:
 * - 3 clear tabs (To Evaluate, Drafts, Published)
 * - Class selector, evaluation period selector, search, filters, and sorting
 * - Factual student rows with exact action labels: Start, Continue Draft, View Published
 * - Top Activity Brief labeled: "Activity summary for faculty reference — not an automatic performance score."
 * - 5 rubric criteria rated on 4 levels: Emerging, Developing, Proficient, Outstanding
 * - Mandatory comments/rationale strictly required for Developing and Outstanding ratings
 * - Read-only view modal for published evaluations with "Create Evaluation for New Semester" action
 * - Pure professional SVG icons — zero emojis.
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

const RUBRIC_LEVELS = ['Emerging', 'Developing', 'Proficient', 'Outstanding'];

/* ── Qualitative Badge Helper (Professional SVG Icons) ────────── */
function evalRubricLevelBadge(level) {
  const map = {
    'Outstanding':        { bg: 'rgba(26, 115, 232, 0.12)', text: '#1A73E8', border: 'rgba(26, 115, 232, 0.3)' },
    'Strong':             { bg: 'rgba(21, 87, 208, 0.12)',  text: '#1557D0', border: 'rgba(21, 87, 208, 0.3)' },
    'Proficient':         { bg: 'rgba(46, 125, 50, 0.12)',  text: '#2E7D32', border: 'rgba(46, 125, 50, 0.3)' },
    'Meets Expectations': { bg: 'rgba(46, 125, 50, 0.12)',  text: '#2E7D32', border: 'rgba(46, 125, 50, 0.3)' },
    'Developing':         { bg: 'rgba(217, 119, 6, 0.12)',  text: '#D97706', border: 'rgba(217, 119, 6, 0.3)' },
    'Emerging':           { bg: 'rgba(107, 114, 128, 0.12)', text: '#4B5563', border: 'rgba(107, 114, 128, 0.3)' },
  };
  const c = map[level] || { bg: 'var(--c-bg)', text: 'var(--c-text-2)', border: 'var(--c-border)' };
  return `<span class="badge" style="background:${c.bg};color:${c.text};border:1px solid ${c.border};font-weight:600;font-size:11px;">${level || 'Not rated'}</span>`;
}

/* ── Active Evaluation Tab, Search, Filter & Sort State ───────── */
window._facultyEvalActiveTab = window._facultyEvalActiveTab || 'to-evaluate';
window._facultyEvalPeriod = window._facultyEvalPeriod || 'Semester 5 · July–November 2026';
window._facultyEvalSearch = window._facultyEvalSearch || '';
window._facultyEvalFilter = window._facultyEvalFilter || 'all';
window._facultyEvalSort = window._facultyEvalSort || 'name-asc';

/* ── Main Render ─────────────────────────────────────────────── */
function renderFacultyEvaluations() {
  const { evaluations, students, selectedClassId, classes, getSemesterEvaluationsDue } = window.AscendFacultyData;
  const { Icons } = window.AscendUI;

  const currentPeriod = window._facultyEvalPeriod || 'Semester 5 · July–November 2026';
  const activeTab = window._facultyEvalActiveTab || 'to-evaluate';
  const currentClassId = selectedClassId || 'all';

  // Get full roster status for current period and class
  const rosterData = getSemesterEvaluationsDue
    ? getSemesterEvaluationsDue(currentClassId, 'Semester 5')
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

  const classList = Array.isArray(classes) && classes.length > 0 ? classes : [
    { id: 'all', name: 'All Classes', shortName: 'All Classes' },
    { id: 'class-bca-cc', name: 'BCA-CC', shortName: 'BCA-CC' },
    { id: 'class-bca-ds', name: 'BCA-DS', shortName: 'BCA-DS' },
    { id: 'class-bsc-cyber', name: 'BSc-Cyber', shortName: 'BSc-Cyber' },
    { id: 'class-mba', name: 'MBA', shortName: 'MBA' },
    { id: 'class-bba-aviation', name: 'BBA-Aviation', shortName: 'BBA-Aviation' },
    { id: 'class-bsc-aiml', name: 'BSc-AIML', shortName: 'BSc-AIML' },
  ];

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

    <!-- Selectors & Controls Card -->
    <div class="card" style="padding:var(--sp-4);margin-bottom:var(--sp-5);background:var(--c-surface);">
      <!-- Top Row: Class Selector + Period Selector + Guidance Notice -->
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);margin-bottom:var(--sp-4);">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <!-- Class Selector -->
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:var(--text-xs);font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:var(--c-text-2);">
              Class:
            </span>
            <select class="form-input form-select" id="eval-class-select" style="font-size:var(--text-xs);font-weight:600;width:auto;"
              onchange="FacultyViews.onSelectEvalClass(this.value)">
              <option value="all" ${currentClassId === 'all' ? 'selected' : ''}>All Assigned Students</option>
              ${classList.map(c => `
                <option value="${c.id}" ${c.id === currentClassId ? 'selected' : ''}>
                  ${c.name}
                </option>`).join('')}
            </select>
          </div>

          <!-- Evaluation Period Selector -->
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:var(--text-xs);font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:var(--c-text-2);">
              Period:
            </span>
            <select class="form-input form-select" id="eval-period-select" style="font-size:var(--text-xs);font-weight:600;width:auto;"
              onchange="FacultyViews.onSelectEvalPeriod(this.value)">
              <option value="Semester 5 · July–November 2026" ${currentPeriod.includes('Semester 5') ? 'selected' : ''}>Semester 5 · July–November 2026 (Active)</option>
              <option value="Semester 4 · January–May 2026" ${currentPeriod.includes('Semester 4') ? 'selected' : ''}>Semester 4 · January–May 2026</option>
              <option value="Semester 3 · July–November 2025" ${currentPeriod.includes('Semester 3') ? 'selected' : ''}>Semester 3 · July–November 2025</option>
              <option value="Semester 1 · July–November 2024" ${currentPeriod.includes('Semester 1') ? 'selected' : ''}>Semester 1 · July–November 2024</option>
            </select>
          </div>
        </div>

        <div style="font-size:var(--text-xs);color:var(--c-text-3);">
          Faculty validates &bull; Published evaluations become visible to students; Drafts remain private
        </div>
      </div>

      <!-- 3 Clear Tabs: To Evaluate / Drafts / Published -->
      <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--c-border);padding-top:var(--sp-3);flex-wrap:wrap;gap:var(--sp-3);">
        <div style="display:flex;gap:var(--sp-2);flex-wrap:wrap;">
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

        <!-- Filter, Search & Sort Bar -->
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <input type="text" class="form-input" id="eval-search-input"
            style="font-size:12px;padding:4px 10px;width:180px;"
            placeholder="Search student or roll…"
            value="${window._facultyEvalSearch || ''}"
            oninput="FacultyViews.onEvalSearch(this.value)">

          <select class="form-input form-select" id="eval-filter-select"
            style="font-size:12px;padding:4px 24px 4px 8px;width:auto;"
            onchange="FacultyViews.onEvalFilter(this.value)">
            <option value="all" ${window._facultyEvalFilter === 'all' ? 'selected' : ''}>All Students</option>
            <option value="active-month" ${window._facultyEvalFilter === 'active-month' ? 'selected' : ''}>Active This Month</option>
            <option value="inactive-30d" ${window._facultyEvalFilter === 'inactive-30d' ? 'selected' : ''}>Inactive (30+ Days)</option>
          </select>

          <select class="form-input form-select" id="eval-sort-select"
            style="font-size:12px;padding:4px 24px 4px 8px;width:auto;"
            onchange="FacultyViews.onEvalSort(this.value)">
            <option value="name-asc" ${window._facultyEvalSort === 'name-asc' ? 'selected' : ''}>Sort: Name (A–Z)</option>
            <option value="activity-desc" ${window._facultyEvalSort === 'activity-desc' ? 'selected' : ''}>Sort: Recent Activity</option>
            <option value="roll-asc" ${window._facultyEvalSort === 'roll-asc' ? 'selected' : ''}>Sort: Roll Number</option>
          </select>
        </div>
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
    </div>

    <!-- Read-Only View Published Evaluation Modal -->
    <div id="view-published-eval-modal" class="modal-overlay">
      <div class="modal" style="max-width:760px;" id="view-published-eval-modal-content">
        <!-- Rendered dynamically for published evaluations -->
      </div>
    </div>`;
}

/* ── Evaluations Tab Content Renderer ────────────────────────── */
function renderEvaluationsTabContent(activeTab, rosterData) {
  const { Icons, formatDate } = window.AscendUI;

  // 1. Tab Status Filter
  let filtered = rosterData.filter(item => {
    if (activeTab === 'to-evaluate') return item.status === 'to-evaluate';
    if (activeTab === 'draft') return item.status === 'draft';
    if (activeTab === 'published') return item.status === 'published';
    return true;
  });

  // 2. Keyword Search Filter
  const q = (window._facultyEvalSearch || '').trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(item => {
      const s = item.student || {};
      return (s.name && s.name.toLowerCase().includes(q)) ||
             (s.rollNo && s.rollNo.toLowerCase().includes(q)) ||
             (s.email && s.email.toLowerCase().includes(q));
    });
  }

  // 3. Activity Filter
  const filterKey = window._facultyEvalFilter || 'all';
  if (filterKey === 'active-month') {
    filtered = filtered.filter(item => {
      const s = item.student || {};
      const sum = s.monthlySummaries && s.monthlySummaries[0];
      const hasRecent = (sum && (sum.achievementsAdded > 0 || sum.projectsUpdated > 0)) ||
                        (s.daysInactive !== undefined && s.daysInactive <= 14);
      return hasRecent;
    });
  } else if (filterKey === 'inactive-30d') {
    filtered = filtered.filter(item => {
      const s = item.student || {};
      return (s.daysInactive !== undefined && s.daysInactive >= 30) || s.attentionStatus === 'inactive-30d';
    });
  }

  // 4. Sorting
  const sortKey = window._facultyEvalSort || 'name-asc';
  filtered.sort((a, b) => {
    const sA = a.student || {};
    const sB = b.student || {};
    if (sortKey === 'name-asc') {
      return (sA.name || '').localeCompare(sB.name || '');
    }
    if (sortKey === 'activity-desc') {
      const dA = new Date(sA.lastActivity || 0).getTime();
      const dB = new Date(sB.lastActivity || 0).getTime();
      return dB - dA;
    }
    if (sortKey === 'roll-asc') {
      return (sA.rollNo || '').localeCompare(sB.rollNo || '');
    }
    return 0;
  });

  if (!filtered.length) {
    const tabLabels = {
      'to-evaluate': 'No students waiting for evaluation in this period matching the selected criteria.',
      'draft': 'No draft evaluations found matching the selected criteria.',
      'published': 'No evaluations published to students yet for this period matching the selected criteria.',
    };
    return `
      <div class="card" style="text-align:center;padding:var(--sp-8);color:var(--c-text-3);">
        <div style="font-size:var(--text-base);font-weight:600;color:var(--c-text);margin-bottom:4px;">
          ${tabLabels[activeTab] || 'No records found'}
        </div>
        <div style="font-size:var(--text-xs);">
          Switch tabs, clear search filters, or select another evaluation period.
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

          // Exact action labels: Start, Continue Draft, View Published
          const actionButton = item.status === 'published'
            ? `<button class="btn btn-outline btn-sm" onclick="FacultyViews.openViewPublishedModal('${ev.id}')">View Published</button>`
            : (item.status === 'draft'
              ? `<button class="btn btn-primary btn-sm" onclick="FacultyViews.openEditEvalModal('${ev.id}')">Continue Draft</button>`
              : `<button class="btn btn-primary btn-sm" onclick="FacultyViews.openCreateEvalModal('${s.id}')">Start</button>`);

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

              <!-- Latest Monthly Activity Summary (Factual Record) -->
              <div style="flex:1;min-width:260px;background:var(--c-bg);padding:10px 14px;border-radius:var(--r-md);border:1px solid var(--c-border);">
                <div style="font-size:11px;font-weight:700;color:var(--c-text-2);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:2px;">
                  Latest Monthly Summary:
                </div>
                <div style="font-size:var(--text-xs);color:var(--c-text);line-height:1.4;">
                  ${item.latestSummary}
                </div>
                <div style="font-size:10.5px;color:var(--c-text-3);margin-top:4px;">
                  Last portfolio activity: ${item.lastActivityDate ? item.lastActivityDate.slice(0, 10) : 'Recently'}
                </div>
              </div>

              <!-- Action Buttons -->
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
function openCreateEvalModal(preselectedStudentId = '', periodOverride = '') {
  const { students } = window.AscendFacultyData;
  const student = students.find(s => s.id === preselectedStudentId) || students[0];

  const defaultScores = {};
  RUBRIC_CRITERIA.forEach(c => {
    defaultScores[c.key] = { level: null, comment: '' };
  });

  renderEvalFormModal({
    isNew: true,
    evalId: null,
    studentId: student ? student.id : '',
    period: periodOverride || window._facultyEvalPeriod || 'Semester 5 · July–November 2026',
    scores: defaultScores,
    strengths: '',
    priorityGrowthArea: '',
    recommendedNextSteps: '',
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
    period: item.evaluationPeriod || window._facultyEvalPeriod || 'Semester 5 · July–November 2026',
    scores: item.scores || {},
    strengths: item.strengths || '',
    priorityGrowthArea: item.priorityGrowthArea || '',
    recommendedNextSteps: item.recommendedNextSteps || '',
    overallSummary: item.overallSummary || '',
    status: item.status || 'draft',
  });
}

/* ── Evaluation Form Modal Renderer with Top Activity Brief ──── */
function renderEvalFormModal(state) {
  const { students, facultyUser, getActivityBrief } = window.AscendFacultyData;
  const student = students.find(s => s.id === state.studentId) || students[0] || {};

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
        <span class="modal-title">${state.isNew ? 'New Semester Evaluation' : `Edit Evaluation – ${student.name || 'Student'}`}</span>
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
            Activity summary for faculty reference &mdash; not an automatic performance score.
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
            ${students.map(s => `<option value="${s.id}" ${s.id === state.studentId ? 'selected' : ''}>${s.name} (${s.className || s.program || 'B.Tech CSE'})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="eval-form-period">Evaluation Period <span class="required">*</span></label>
          <select class="form-input form-select" id="eval-form-period">
            <option value="Semester 5 · July–November 2026" ${state.period.includes('Semester 5') ? 'selected' : ''}>Semester 5 · July–November 2026</option>
            <option value="Semester 4 · January–May 2026" ${state.period.includes('Semester 4') ? 'selected' : ''}>Semester 4 · January–May 2026</option>
            <option value="Semester 3 · July–November 2025" ${state.period.includes('Semester 3') ? 'selected' : ''}>Semester 3 · July–November 2025</option>
            <option value="Semester 1 · July–November 2024" ${state.period.includes('Semester 1') ? 'selected' : ''}>Semester 1 · July–November 2024</option>
          </select>
        </div>
      </div>

      <!-- 5 Rubric Criteria Form -->
      <div style="display:flex;flex-direction:column;gap:var(--sp-4);">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
          <div style="font-size:var(--text-xs);font-weight:700;color:var(--c-text-3);text-transform:uppercase;letter-spacing:0.06em;">
            Evaluation Rubric Criteria (Rate all 5 areas before publishing)
          </div>
          <div style="font-size:11px;color:#D97706;font-weight:600;">
            * Comments required for Developing &amp; Outstanding ratings
          </div>
        </div>

        ${RUBRIC_CRITERIA.map(c => {
          const currentItem = state.scores ? state.scores[c.key] : null;
          let currentLevel = null;
          if (currentItem) {
            currentLevel = typeof currentItem === 'string' ? currentItem : currentItem.level;
            if (currentLevel === 'Meets Expectations' || currentLevel === 'Strong') currentLevel = 'Proficient';
          }
          const currentComment = (currentItem && currentItem.comment) || '';
          const isMandatoryComment = currentLevel === 'Developing' || currentLevel === 'Outstanding';

          return `
            <div class="card" style="padding:var(--sp-4);background:var(--c-bg);border:1px solid var(--c-border);transition:border-color 0.2s;" id="criterion-card-${c.key}">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);margin-bottom:var(--sp-2);">
                <div>
                  <div style="font-size:var(--text-sm);font-weight:700;color:var(--c-text);">${c.label}</div>
                  <div style="font-size:11px;color:var(--c-text-2);margin-top:2px;">${c.desc}</div>
                </div>
              </div>

              <!-- 4 Qualitative Levels -->
              ${!currentLevel ? `<div style="font-size:11px;color:var(--c-review);font-weight:600;margin-bottom:var(--sp-2);" id="level-req-${c.key}">&#9679; Selection required before publishing</div>` : ''}
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
                  placeholder="${isMandatoryComment ? `Required observation rationale for ${currentLevel} rating on ${c.label.toLowerCase()}…` : `Observation notes or evidence for ${c.label.toLowerCase()}…`}"
                  value="${currentComment}">
                <div class="form-error" id="eval-comment-err-${c.key}" style="display:none;font-size:11px;margin-top:4px;">
                  Comment/rationale is required when rated ${currentLevel || 'Developing/Outstanding'}.
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>

      <!-- Strengths Noted -->
      <div class="form-group">
        <label class="form-label" for="eval-form-strengths">Strengths Noted</label>
        <textarea class="form-input form-textarea" id="eval-form-strengths" rows="2"
          placeholder="Demonstrated technical strengths, project ownership, or positive learning habits…">${state.strengths}</textarea>
      </div>

      <!-- Priority Growth Area for Next Semester -->
      <div class="form-group">
        <label class="form-label" for="eval-form-growth-area">Priority Growth Area for Next Semester</label>
        <input class="form-input" id="eval-form-growth-area"
          placeholder="E.g., Team leadership in software sprints, containerized deployment, or technical documentation…"
          value="${state.priorityGrowthArea}">
      </div>

      <!-- Recommended Next Steps -->
      <div class="form-group">
        <label class="form-label" for="eval-form-next-steps">Recommended Next Steps</label>
        <input class="form-input" id="eval-form-next-steps"
          placeholder="E.g., Complete AWS certification, present project architecture, or contribute to open-source repository…"
          value="${state.recommendedNextSteps}">
      </div>

      <!-- Overall Summary & Guidance -->
      <div class="form-group">
        <label class="form-label" for="eval-form-summary">Overall Evaluation Summary &amp; Faculty Guidance <span class="required">*</span></label>
        <textarea class="form-input form-textarea" id="eval-form-summary" rows="3"
          placeholder="Summarize developmental trajectory and faculty mentorship recommendations for upcoming semester…">${state.overallSummary}</textarea>
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

  const reqEl = document.getElementById(`level-req-${criterionKey}`);
  if (reqEl) reqEl.style.display = 'none';

  // Toggle placeholder guidance for comment
  const commentInput = document.getElementById(`eval-comment-${criterionKey}`);
  if (commentInput) {
    if (selectedLevel === 'Developing' || selectedLevel === 'Outstanding') {
      commentInput.placeholder = `Required observation rationale for ${selectedLevel} rating…`;
    } else {
      commentInput.placeholder = `Observation notes or evidence…`;
    }
  }
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
      strengths: '',
      priorityGrowthArea: '',
      recommendedNextSteps: '',
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
  const strengths = document.getElementById('eval-form-strengths')?.value.trim() || '';
  const priorityGrowthArea = document.getElementById('eval-form-growth-area')?.value.trim() || '';
  const recommendedNextSteps = document.getElementById('eval-form-next-steps')?.value.trim() || '';

  const errEl = document.getElementById('eval-summary-err');
  if (!summary && isPublish) {
    if (errEl) errEl.style.display = 'block';
    AscendUI.showToast('Please provide an overall evaluation summary before publishing.', 'error');
    return;
  }
  if (errEl) errEl.style.display = 'none';

  const scoresObj = {};
  let unselectedCriteria = [];
  let missingCommentCriteria = [];

  RUBRIC_CRITERIA.forEach(c => {
    const activeBtn = document.querySelector(`#level-group-${c.key} button.btn-primary`);
    const lvl  = activeBtn ? activeBtn.dataset.level : null;
    const comm = document.getElementById(`eval-comment-${c.key}`)?.value.trim() || '';
    scoresObj[c.key] = { level: lvl, comment: comm };

    if (!lvl) {
      unselectedCriteria.push(c.label);
    } else if (isPublish && (lvl === 'Developing' || lvl === 'Outstanding') && !comm) {
      missingCommentCriteria.push({ label: c.label, key: c.key, level: lvl });
    }
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

  // Block publish if comment is missing for Developing or Outstanding
  if (isPublish && missingCommentCriteria.length > 0) {
    const missingNames = missingCommentCriteria.map(m => `"${m.label}" (${m.level})`).join(', ');
    AscendUI.showToast(`Comment/rationale is required for Developing and Outstanding ratings to ensure actionable feedback: ${missingNames}.`, 'error');
    missingCommentCriteria.forEach(item => {
      const card = document.getElementById(`criterion-card-${item.key}`);
      const errSpan = document.getElementById(`eval-comment-err-${item.key}`);
      if (card) card.style.borderColor = '#D97706';
      if (errSpan) errSpan.style.display = 'block';
    });
    return;
  }

  const student = window.AscendFacultyData.students.find(s => s.id === studentId);
  const studentProgram = (student && student.className) ? student.className : (student?.program || 'B.Tech CSE');

  window.AscendFacultyData.saveEvaluation(evalId, {
    studentId,
    studentName: student ? student.name : 'Student',
    studentProgram,
    period,
    scores: scoresObj,
    strengths,
    priorityGrowthArea,
    recommendedNextSteps,
    overallSummary: summary,
  }, isPublish);

  AscendUI.closeModal('eval-form-modal');
  AscendUI.showToast(isPublish ? 'Evaluation published to student portal!' : 'Draft evaluation saved privately.', 'success');

  // Refresh evaluations view
  AscendApp.navigate('faculty-evaluations');
}

/* ── Read-Only View Published Modal ──────────────────────────── */
function openViewPublishedModal(evalId) {
  const { evaluations, students } = window.AscendFacultyData;
  const { Icons, formatDate } = window.AscendUI;

  const item = (evaluations || []).find(e => e.id === evalId);
  if (!item) {
    AscendUI.showToast('Evaluation record not found.', 'error');
    return;
  }

  const student = (students || []).find(s => s.id === item.studentId) || {
    name: item.studentName || 'Student',
    rollNo: '',
    program: item.studentProgram || 'B.Tech CSE',
  };

  const scores = item.scores || {};
  const pubDate = item.publishedAt ? formatDate(item.publishedAt) : 'Recently';

  const modalHTML = `
    <div class="modal-header">
      <div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="modal-title">Published Evaluation &bull; ${student.name}</span>
          <span class="badge" style="background:#E8F0FE;color:#1A73E8;border:1px solid #C2D8FF;font-weight:600;font-size:11px;">Published</span>
        </div>
        <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:3px;">
          ${student.rollNo ? `${student.rollNo} &bull; ` : ''}${student.className || student.program || 'B.Tech CSE'} &bull; ${item.evaluationPeriod || 'Semester Evaluation'}
        </div>
      </div>
      <button class="modal-close" onclick="AscendUI.closeModal('view-published-eval-modal')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div class="modal-body" style="max-height:75vh;overflow-y:auto;gap:var(--sp-4);">
      <!-- Attribution Banner -->
      <div style="padding:12px 16px;background:var(--c-bg);border:1px solid var(--c-border);border-left:4px solid #1A73E8;border-radius:var(--r-md);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <div style="font-size:var(--text-xs);color:var(--c-text-2);">
          Evaluator: <strong>${item.evaluatorName || 'Faculty Advisor'}</strong> &bull; Published on ${pubDate}
        </div>
        <div style="font-size:11px;color:var(--c-text-3);">
          Formal semester record &bull; Visible to student in student portal
        </div>
      </div>

      <!-- 5 Rubric Criteria Results -->
      <div>
        <div style="font-size:11.5px;font-weight:700;color:var(--c-text-3);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">
          Rubric Criteria Ratings &amp; Rationale
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${RUBRIC_CRITERIA.map(c => {
            const sc = scores[c.key] || {};
            const lvl = typeof sc === 'string' ? sc : sc.level;
            const comm = typeof sc === 'object' ? sc.comment : '';
            return `
              <div style="padding:10px 14px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-sm);">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                  <span style="font-size:var(--text-sm);font-weight:700;color:var(--c-text);">${c.label}</span>
                  ${evalRubricLevelBadge(lvl)}
                </div>
                ${comm ? `
                  <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:6px;line-height:1.4;background:var(--c-bg);padding:6px 10px;border-radius:var(--r-sm);">
                    &ldquo;${comm}&rdquo;
                  </div>` : ''}
              </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Strengths, Priority Growth Area & Recommended Next Steps -->
      <div style="display:grid;grid-template-columns:1fr;gap:10px;">
        ${item.strengths ? `
          <div style="padding:12px 14px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-sm);">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#1A73E8;margin-bottom:4px;">
              Strengths Noted
            </div>
            <div style="font-size:var(--text-xs);color:var(--c-text);line-height:1.5;">${item.strengths}</div>
          </div>` : ''}

        ${item.priorityGrowthArea ? `
          <div style="padding:12px 14px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-sm);">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#D97706;margin-bottom:4px;">
              Priority Growth Area for Next Semester
            </div>
            <div style="font-size:var(--text-xs);color:var(--c-text);line-height:1.5;">${item.priorityGrowthArea}</div>
          </div>` : ''}

        ${item.recommendedNextSteps ? `
          <div style="padding:12px 14px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-sm);">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#059669;margin-bottom:4px;">
              Recommended Next Steps
            </div>
            <div style="font-size:var(--text-xs);color:var(--c-text);line-height:1.5;">${item.recommendedNextSteps}</div>
          </div>` : ''}

        ${item.overallSummary ? `
          <div style="padding:12px 14px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-sm);">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:var(--c-text-2);margin-bottom:4px;">
              Overall Evaluation Summary
            </div>
            <div style="font-size:var(--text-xs);color:var(--c-text);line-height:1.5;">${item.overallSummary}</div>
          </div>` : ''}
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="modal-footer" style="justify-content:space-between;flex-wrap:wrap;gap:8px;">
      <button class="btn btn-ghost" onclick="AscendUI.closeModal('view-published-eval-modal')">Close</button>
      <div style="display:flex;align-items:center;gap:8px;">
        <button class="btn btn-outline btn-sm" onclick="AscendUI.closeModal('view-published-eval-modal');FacultyViews.openEditEvalModal('${item.id}')">
          Edit Published Evaluation
        </button>
        <button class="btn btn-primary btn-sm" onclick="AscendUI.closeModal('view-published-eval-modal');FacultyViews.openCreateEvalModal('${item.studentId}', 'Semester 6 · January–May 2027')">
          ${Icons.plus} Create Evaluation for New Semester
        </button>
      </div>
    </div>`;

  const container = document.getElementById('view-published-eval-modal-content');
  if (container) container.innerHTML = modalHTML;
  AscendUI.openModal('view-published-eval-modal');
}

/* ── Delete Evaluation Handler ───────────────────────────────── */
function deleteEvaluation(evalId, studentId) {
  if (!confirm('Are you sure you want to delete this evaluation record?')) return;
  window.AscendFacultyData.deleteEvaluation(evalId);
  AscendUI.closeModal('eval-form-modal');
  AscendUI.showToast('Evaluation record deleted.', 'success');
  AscendApp.navigate('faculty-evaluations');
}

/* ── Tab Switcher & Filter Handlers ──────────────────────────── */
function switchEvalTab(tabKey) {
  window._facultyEvalActiveTab = tabKey;
  const content = document.getElementById('app-content-area');
  if (content && window.FacultyViews && window.FacultyViews.evaluations) {
    content.innerHTML = window.FacultyViews.evaluations();
  }
}

function onSelectEvalClass(classId) {
  if (window.AscendFacultyData && window.AscendFacultyData.setSelectedClass) {
    window.AscendFacultyData.setSelectedClass(classId);
  }
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

function onEvalSearch(term) {
  window._facultyEvalSearch = term;
  const listContainer = document.getElementById('evaluations-tab-content');
  if (listContainer) {
    const { evaluations, students, selectedClassId, getSemesterEvaluationsDue } = window.AscendFacultyData;
    const currentPeriod = window._facultyEvalPeriod || 'Semester 5 · July–November 2026';
    const activeTab = window._facultyEvalActiveTab || 'to-evaluate';
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
    listContainer.innerHTML = renderEvaluationsTabContent(activeTab, rosterData);
  }
}

function onEvalFilter(filterKey) {
  window._facultyEvalFilter = filterKey;
  const content = document.getElementById('app-content-area');
  if (content && window.FacultyViews && window.FacultyViews.evaluations) {
    content.innerHTML = window.FacultyViews.evaluations();
  }
}

function onEvalSort(sortKey) {
  window._facultyEvalSort = sortKey;
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
  openViewPublishedModal,
  selectRubricLevel,
  updateEvalFormStudent,
  saveRubricEvaluation,
  deleteEvaluation,
  switchEvalTab,
  onSelectEvalClass,
  onSelectEvalPeriod,
  onEvalSearch,
  onEvalFilter,
  onEvalSort,
});
