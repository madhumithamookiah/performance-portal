/**
 * ASCEND – Faculty Feedback Hub View
 * Structured mentorship guidance system limited to the selected class.
 * Features feedback composition with recommended next steps, optional follow-ups,
 * unread state indicators, and feedback history. Zero goal-tracking remnants.
 */

/* ── Render Feedback Hub ─────────────────────────────────────── */
function renderFacultyGoalsFeedback() {
  const { getClasses, getSelectedClass, getStudents, getFeedback } = window.AscendFacultyData;
  const { Icons, formatDate } = window.AscendUI;

  const classes = getClasses();
  const selectedClass = getSelectedClass();
  const classStudents = getStudents(selectedClass.id);
  const classFeedback = getFeedback(selectedClass.id);

  const unreadCount = classFeedback.filter(f => !f.isRead).length;
  const followUpCount = classFeedback.filter(f => f.followUpState === 'scheduled' || f.followUpState === 'due').length;

  return `
    <!-- Header -->
    <div class="section-header" style="margin-bottom:var(--sp-5);">
      <div>
        <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;color:var(--c-text);">Feedback Hub</h1>
        <div style="font-size:var(--text-sm);color:var(--c-text-2);margin-top:4px;">
          Deliver targeted mentorship guidance, assign recommended next steps, and monitor student follow-ups
        </div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="FacultyViews.openGlobalFeedbackModal()">
        ${Icons.messageSquare} Compose Feedback
      </button>
    </div>

    <!-- Prominent Class / Cohort Selector Card -->
    <div class="card" style="margin-bottom:var(--sp-5);border-left:4px solid var(--c-primary);padding:var(--sp-4) var(--sp-5);">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);">
        <div style="display:flex;align-items:center;gap:var(--sp-3);">
          <div style="width:38px;height:38px;border-radius:var(--r-md);background:var(--c-primary-light);color:var(--c-primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${Icons.users}
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;color:var(--c-primary);text-transform:uppercase;letter-spacing:0.05em;">Active Cohort</div>
            <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);" id="fb-hub-class-label">${selectedClass.name}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:var(--sp-3);">
          <label for="fb-class-select" style="font-size:var(--text-xs);font-weight:600;color:var(--c-text-2);">Switch Class:</label>
          <select class="form-input form-select" id="fb-class-select" style="min-width:240px;font-weight:600;" onchange="FacultyViews.onFeedbackClassChange(this.value)">
            ${classes.map(c => `<option value="${c.id}" ${c.id === selectedClass.id ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>

    <!-- Compact Metrics Row -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--sp-4);margin-bottom:var(--sp-6);" class="faculty-grid-4">
      <div class="metric-card" style="--metric-accent:var(--c-primary);">
        <div class="metric-number">${classFeedback.length}</div>
        <div class="metric-label">Total Feedback Sent</div>
        <div class="metric-change">${selectedClass.shortName}</div>
      </div>
      <div class="metric-card" style="--metric-accent:#2563EB;">
        <div class="metric-number" style="color:#2563EB;">${unreadCount}</div>
        <div class="metric-label">Unread by Students</div>
        <div class="metric-change">Pending student review</div>
      </div>
      <div class="metric-card" style="--metric-accent:#D97706;">
        <div class="metric-number" style="color:#D97706;">${followUpCount}</div>
        <div class="metric-label">Scheduled Follow-Ups</div>
        <div class="metric-change">Upcoming review dates</div>
      </div>
      <div class="metric-card" style="--metric-accent:var(--c-verified);">
        <div class="metric-number" style="color:var(--c-verified);">${classStudents.length}</div>
        <div class="metric-label">Students in Class</div>
        <div class="metric-change">Available for feedback</div>
      </div>
    </div>

    <!-- Main 2-Column: Class Students Directory + Feedback History -->
    <div style="display:grid;grid-template-columns:320px 1fr;gap:var(--sp-5);" class="faculty-grid-2">
      <!-- Left Column: Class Students Roster -->
      <div>
        <div class="card" style="padding:var(--sp-4);">
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin-bottom:var(--sp-3);display:flex;align-items:center;justify-content:space-between;">
            <span>Class Students</span>
            <span class="badge badge-normal" style="font-size:10px;">${classStudents.length}</span>
          </div>
          <div class="search-input-wrap" style="margin-bottom:var(--sp-3);">
            ${Icons.search}
            <input type="search" class="form-input search-input" id="fb-roster-search"
              placeholder="Search students…" oninput="FacultyViews.filterRosterList()">
          </div>
          <div id="fb-roster-list" style="display:flex;flex-direction:column;gap:var(--sp-2);max-height:540px;overflow-y:auto;">
            ${renderRosterList(classStudents)}
          </div>
        </div>
      </div>

      <!-- Right Column: Feedback History Panel -->
      <div>
        <div class="card" style="padding:var(--sp-4);margin-bottom:var(--sp-4);">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);margin-bottom:var(--sp-3);">
            <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Feedback History</div>
            <div style="font-size:var(--text-xs);color:var(--c-text-3);">Showing records for ${selectedClass.shortName}</div>
          </div>

          <!-- Filters -->
          <div style="display:flex;flex-wrap:wrap;gap:var(--sp-3);align-items:center;">
            <div class="search-input-wrap" style="flex:1;min-width:200px;">
              ${Icons.search}
              <input type="search" class="form-input search-input" id="fb-filter-search"
                placeholder="Search feedback text, next steps…" oninput="FacultyViews.filterFeedbackHistory()">
            </div>
            <select class="form-input form-select" id="fb-filter-student" style="width:auto;" onchange="FacultyViews.filterFeedbackHistory()">
              <option value="">All students in class</option>
              ${classStudents.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
            </select>
            <select class="form-input form-select" id="fb-filter-cat" style="width:auto;" onchange="FacultyViews.filterFeedbackHistory()">
              <option value="">All categories</option>
              <option value="Portfolio">Portfolio</option>
              <option value="Career Direction">Career Direction</option>
              <option value="Project">Project</option>
              <option value="Skill Development">Skill Development</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>

        <!-- Feedback Cards List -->
        <div id="fb-history-list" style="display:flex;flex-direction:column;gap:var(--sp-3);">
          ${renderFeedbackHistory(classFeedback)}
        </div>
      </div>
    </div>

    <!-- Compose Feedback Modal (Limited to Selected Class) -->
    <div id="fb-compose-modal" class="modal-overlay">
      <div class="modal" style="max-width:580px;">
        <div class="modal-header">
          <span class="modal-title">Compose Mentorship Feedback</span>
          <button class="modal-close" onclick="AscendUI.closeModal('fb-compose-modal')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:var(--sp-4);">
          <div>
            <label class="form-label" for="fb-modal-student">Select Student (${selectedClass.shortName}) <span class="required">*</span></label>
            <select class="form-input form-select" id="fb-modal-student">
              ${classStudents.map(s => `<option value="${s.id}" data-name="${s.name}">${s.name} (${s.rollNo})</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="form-label" for="fb-modal-category">Feedback Category <span class="required">*</span></label>
            <select class="form-input form-select" id="fb-modal-category" onchange="FacultyViews.updateNextStepLabel('fb-modal-next-step-label','fb-modal-next-step-required')">
              <option value="Portfolio">Portfolio</option>
              <option value="Career Direction">Career Direction</option>
              <option value="Project">Project</option>
              <option value="Skill Development">Skill Development</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label class="form-label" for="fb-modal-message">Feedback Message <span class="required">*</span></label>
            <textarea class="form-input form-textarea" id="fb-modal-message" rows="4" placeholder="Provide constructive mentorship observation, strengths, or areas for refinement…"></textarea>
          </div>

          <div>
            <label class="form-label" for="fb-modal-next-step">
              <span id="fb-modal-next-step-label">Recommended Next Step</span>
              <span class="required" id="fb-modal-next-step-required">*</span>
              <span id="fb-modal-next-step-optional" style="display:none;color:var(--c-text-2);font-weight:400;"> (optional)</span>
            </label>
            <input class="form-input" id="fb-modal-next-step" placeholder="e.g. Publish project repository with architecture diagram and live demo link">
          </div>

          <div>
            <label class="form-label" for="fb-modal-followup">Optional Follow-Up Date</label>
            <input class="form-input" type="date" id="fb-modal-followup">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="AscendUI.closeModal('fb-compose-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="FacultyViews.submitComposeFeedback()">Send Feedback</button>
        </div>
      </div>
    </div>`;
}

/* ── Roster List Sub-Renderer ────────────────────────────────── */
function renderRosterList(students) {
  if (!students.length) return `<div style="text-align:center;padding:var(--sp-4);color:var(--c-text-3);font-size:var(--text-xs);">No students found.</div>`;

  return students.map(s => `
    <div style="padding:var(--sp-2) var(--sp-3);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);display:flex;align-items:center;justify-content:space-between;gap:var(--sp-2);cursor:pointer;transition:background var(--dur-fast);" class="roster-item" onclick="FacultyViews.openStudentDetail('${s.id}')">
      <div style="display:flex;align-items:center;gap:var(--sp-2);min-width:0;">
        <div class="avatar avatar-sm" style="flex-shrink:0;">${s.initials}</div>
        <div style="min-width:0;">
          <div style="font-size:var(--text-xs);font-weight:700;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.name}</div>
          <div style="font-size:10px;color:var(--c-text-3);font-family:monospace;">${s.rollNo}</div>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" style="font-size:11px;padding:3px 8px;flex-shrink:0;" onclick="event.stopPropagation();FacultyViews.openDirectFeedbackModal('${s.id}')">
        Message
      </button>
    </div>`).join('');
}

/* ── Feedback History Sub-Renderer ───────────────────────────── */
function renderFeedbackHistory(feedbacks) {
  const { formatDate } = window.AscendUI;
  if (!feedbacks.length) {
    return `
      <div class="card" style="text-align:center;padding:var(--sp-8);color:var(--c-text-3);">
        <div style="font-size:var(--text-base);font-weight:600;margin-bottom:4px;color:var(--c-text);">No feedback recorded for this class</div>
        <div style="font-size:var(--text-xs);">Use the "Compose Feedback" button to send guidance to a student.</div>
      </div>`;
  }

  return feedbacks.map(fb => `
    <div class="card" style="padding:var(--sp-4);">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);margin-bottom:var(--sp-3);">
        <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
          <div class="avatar avatar-sm">${fb.toStudentName.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
          <div>
            <div style="font-size:var(--text-sm);font-weight:700;color:var(--c-text);">To: ${fb.toStudentName}</div>
            <div style="font-size:11px;color:var(--c-text-3);">${formatDate(fb.date)} · By ${fb.fromName}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
          <span class="badge badge-primary" style="font-size:11px;font-weight:600;">${fb.category}</span>
          <span class="badge ${fb.isRead ? 'badge-normal' : 'badge-feedback'}" style="font-size:10px;">
            ${fb.isRead ? 'Read by student' : 'Unread'}
          </span>
          ${fb.followUpDate ? `
            <span class="badge badge-review" style="font-size:10px;">
              Follow-up: ${formatDate(fb.followUpDate)}
            </span>` : ''}
        </div>
      </div>

      <div style="font-size:var(--text-sm);color:var(--c-text);line-height:1.6;margin-bottom:var(--sp-3);">
        ${fb.message}
      </div>

      ${fb.recommendedNextStep ? `
        <div style="padding:var(--sp-3);background:var(--c-bg);border-left:3px solid var(--c-primary);border-radius:0 var(--r-md) var(--r-md) 0;margin-bottom:var(--sp-3);">
          <div style="font-size:11px;font-weight:700;color:var(--c-primary);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:2px;">Recommended Next Step</div>
          <div style="font-size:var(--text-xs);color:var(--c-text);font-weight:500;">${fb.recommendedNextStep}</div>
        </div>` : ''}

      <div style="display:flex;justify-content:flex-end;">
        <button class="btn btn-outline btn-sm" onclick="FacultyViews.openStudentDetail('${fb.toStudentId}')">
          View Student Profile
        </button>
      </div>
    </div>`).join('');
}

/* ── Event & Filter Handlers ─────────────────────────────────── */
function onFeedbackClassChange(classId) {
  window.AscendFacultyData.setSelectedClass(classId);
  AscendApp.navigate('faculty-goals-feedback');
}

function filterRosterList() {
  const q = (document.getElementById('fb-roster-search')?.value || '').toLowerCase().trim();
  const classStudents = window.AscendFacultyData.getStudents();
  const filtered = q ? classStudents.filter(s => s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q)) : classStudents;
  const container = document.getElementById('fb-roster-list');
  if (container) container.innerHTML = renderRosterList(filtered);
}

function filterFeedbackHistory() {
  const q = (document.getElementById('fb-filter-search')?.value || '').toLowerCase().trim();
  const stuId = document.getElementById('fb-filter-student')?.value || '';
  const cat = document.getElementById('fb-filter-cat')?.value || '';

  const classFeedback = window.AscendFacultyData.getFeedback();
  let data = [...classFeedback];

  if (q) {
    data = data.filter(f =>
      f.toStudentName.toLowerCase().includes(q) ||
      f.message.toLowerCase().includes(q) ||
      (f.recommendedNextStep && f.recommendedNextStep.toLowerCase().includes(q))
    );
  }
  if (stuId) data = data.filter(f => f.toStudentId === stuId);
  if (cat) data = data.filter(f => f.category === cat);

  const container = document.getElementById('fb-history-list');
  if (container) container.innerHTML = renderFeedbackHistory(data);
}

function openGlobalFeedbackModal() {
  AscendUI.openModal('fb-compose-modal');
}

function openDirectFeedbackModal(studentId) {
  const select = document.getElementById('fb-modal-student');
  if (select) select.value = studentId;
  AscendUI.openModal('fb-compose-modal');
}

function submitComposeFeedback() {
  const select = document.getElementById('fb-modal-student');
  const studentId   = select?.value;
  const studentName = select?.options[select.selectedIndex]?.dataset.name || 'Student';
  const category    = document.getElementById('fb-modal-category')?.value || 'General';
  const message     = document.getElementById('fb-modal-message')?.value.trim();
  const nextStep    = document.getElementById('fb-modal-next-step')?.value.trim();
  const followUpDate = document.getElementById('fb-modal-followup')?.value || null;

  const nextStepRequired = category !== 'General';
  if (!message || (nextStepRequired && !nextStep)) {
    AscendUI.showToast(
      nextStepRequired
        ? 'Please provide both a feedback message and recommended next step.'
        : 'Please provide a feedback message.',
      'error'
    );
    return;
  }

  window.AscendFacultyData.sendFeedback({
    toStudentId: studentId,
    toStudentName: studentName,
    classId: window.AscendFacultyData.selectedClassId,
    category,
    message,
    recommendedNextStep: nextStep,
    followUpDate,
  });

  AscendUI.closeModal('fb-compose-modal');
  AscendUI.showToast(`Feedback sent to ${studentName}!`, 'success');
  AscendApp.navigate('faculty-goals-feedback');
}

window.FacultyViews = window.FacultyViews || {};
Object.assign(window.FacultyViews, {
  goalsFeedback: renderFacultyGoalsFeedback,
  onFeedbackClassChange,
  filterRosterList,
  filterFeedbackHistory,
  openGlobalFeedbackModal,
  openDirectFeedbackModal,
  submitComposeFeedback,
  updateNextStepLabel(nextStepLabelId, nextStepReqId) {
    const catEl = document.getElementById('fb-modal-category');
    if (!catEl) return;
    const isGeneral = catEl.value === 'General';
    const reqEl = document.getElementById(nextStepReqId);
    const optEl = document.getElementById('fb-modal-next-step-optional');
    if (reqEl) reqEl.style.display = isGeneral ? 'none' : 'inline';
    if (optEl) optEl.style.display = isGeneral ? 'inline' : 'none';
  },
});
