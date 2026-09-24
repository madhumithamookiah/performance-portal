/**
 * ASCEND – Faculty & Mentor Dashboard View
 * Clean, modern interface adhering to Google design principles.
 * Focuses on class oversight, monthly development tracking, and formal semester evaluations.
 * Pure professional SVG icons — zero emojis.
 */

function renderFacultyDashboard() {
  const {
    facultyUser,
    getClasses,
    getStudents,
    getRecentUpdates,
    getEvaluations,
    getStudentsInactive30Days,
    getStudentsUnreviewedMonthly,
    getSemesterEvaluationsDue,
  } = window.AscendFacultyData;
  const { Icons, formatDate } = window.AscendUI;

  // Time-based greeting and faculty name
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  let sessionUser = null;
  try { sessionUser = JSON.parse(sessionStorage.getItem('ascend_user') || 'null'); } catch (e) {}

  let greetingName = 'Dr. Mehta';
  if (sessionUser?.name) {
    greetingName = sessionUser.name.startsWith('Dr.') || sessionUser.name.startsWith('Prof.') ? sessionUser.name : `Dr. ${sessionUser.name.split(' ').pop()}`;
  } else if (facultyUser && facultyUser.name) {
    greetingName = facultyUser.name.startsWith('Dr.') || facultyUser.name.startsWith('Prof.') ? facultyUser.name : `Dr. ${facultyUser.name.replace(/^Dr\.\s*/i, '').split(' ').pop()}`;
  }

  // Classes and cohort selection
  const classes = getClasses();
  let selectedClassId = window.AscendFacultyData.selectedClassId || 'class-cse-5a';
  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0] || {
    id: 'class-cse-5a',
    name: 'B.Tech CSE · Semester 5 · Section A',
    shortName: 'CSE · Sem 5 · Sec A',
    academicYear: '2026–27',
  };

  // Scoped student records from dynamic store
  const rawStudents = getStudents(selectedClassId);
  const seenStudentMap = new Map();
  (rawStudents || []).forEach(s => {
    if (s && s.id && !seenStudentMap.has(s.id)) {
      seenStudentMap.set(s.id, s);
    }
  });
  const classStudents = Array.from(seenStudentMap.values());

  const classUpdates = getRecentUpdates(selectedClassId);
  const classEvals = getEvaluations(selectedClassId);

  // 1. Inactive in past 30 days
  const inactiveStudents = getStudentsInactive30Days ? getStudentsInactive30Days(selectedClassId) : classStudents.filter(s => (s.daysInactive || 0) >= 30);

  // 2. Not reviewed monthly summary
  const unreviewedMonthlyStudents = getStudentsUnreviewedMonthly ? getStudentsUnreviewedMonthly(selectedClassId) : classStudents.filter(s => s.monthlyReviewed === false);

  // 3. Semester evaluations due
  const semesterEvalsDue = getSemesterEvaluationsDue ? getSemesterEvaluationsDue(selectedClassId, 'Semester 5') : classStudents.map(s => {
    const ev = (classEvals || []).find(e => e.studentId === s.id && e.evaluationPeriod?.includes('Semester 5'));
    return {
      student: s,
      evaluation: ev,
      status: ev ? ev.status : 'to-evaluate',
      period: 'Semester 5 · July–November 2026',
      latestSummary: s.latestMonthlySummary || 'September summary: Activity recorded.',
      lastActivityDate: s.lastActivity || 'Recently',
    };
  });

  const publishedCount = (classEvals || []).filter(e => e.status === 'published').length;
  const draftCount = (classEvals || []).filter(e => e.status === 'draft').length;
  const pendingCount = Math.max(0, classStudents.length - (publishedCount + draftCount));

  // Recent activity items (deduplicated by student)
  const seenStudentInFeed = new Set();
  const recentUpdatesToShow = (classUpdates || []).filter(u => {
    const key = u.studentId || u.studentName;
    if (key && seenStudentInFeed.has(key)) return false;
    if (key) seenStudentInFeed.add(key);
    return true;
  }).slice(0, 6);

  // Category badge helper
  function getTypeBadge(type) {
    const map = {
      'Hackathon':     { bg: '#EEF2FF', text: '#3730A3', border: '#C7D2FE' },
      'Certification': { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' },
      'Project':       { bg: '#F3E8FF', text: '#6D28D9', border: '#E9D5FF' },
      'Research':      { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
      'Internship':    { bg: '#FCE7F3', text: '#9D174D', border: '#FBCFE8' },
      'Award':         { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
    };
    const c = map[type] || { bg: 'var(--c-bg)', text: 'var(--c-text-2)', border: 'var(--c-border)' };
    return `<span class="badge" style="background:${c.bg};color:${c.text};border:1px solid ${c.border};font-size:11px;font-weight:600;padding:2px 8px;border-radius:var(--r-sm);">${type}</span>`;
  }

  return `
    <style>
      .admin-layout-grid {
        display: grid;
        grid-template-columns: 7fr 5fr;
        gap: var(--sp-5);
        align-items: start;
      }
      .feed-item-row:hover {
        background: var(--c-surface-hover, rgba(0,0,0,0.015));
      }
      @media (max-width: 1024px) {
        .admin-layout-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>

    <!-- ── 1. Clean Top Header & Quick Actions ──────────────────────── -->
    <div style="margin-bottom:var(--sp-5);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);">
      <div>
        <div style="display:flex;align-items:center;gap:var(--sp-2);margin-bottom:4px;">
          <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;color:var(--c-text);margin:0;">
            ${greeting}, ${greetingName}
          </h1>
          <span class="badge badge-normal" style="font-size:11px;font-weight:600;background:var(--c-primary-light);color:var(--c-primary);">
            Faculty &amp; Mentor
          </span>
        </div>
        <div style="font-size:var(--text-sm);color:var(--c-text-2);">
          Class oversight &bull; Monthly student activity tracking &bull; Semester rubric evaluations
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm" onclick="AscendFacultyData.loadFacultyData().then(()=>AscendApp.navigate('faculty-dashboard'))" aria-label="Refresh data">
          ${Icons.clock} Refresh Data
        </button>
        <button class="btn btn-outline btn-sm" onclick="AscendApp.navigate('faculty-goals-feedback');setTimeout(()=>FacultyViews.openGlobalFeedbackModal?.(),200)" aria-label="Send guidance feedback">
          ${Icons.messageSquare} Send Guidance
        </button>
        <button class="btn btn-primary btn-sm" onclick="AscendApp.navigate('faculty-evaluations')" aria-label="Open rubric evaluations">
          ${Icons.fileText} Semester Evaluations
        </button>
      </div>
    </div>

    <!-- ── 2. Scope & Cohort Filter Strip ─────────────────────────── -->
    <div class="card" style="margin-bottom:var(--sp-5);padding:var(--sp-3) var(--sp-4);background:var(--c-surface);border:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);">
      <div style="display:flex;align-items:center;gap:var(--sp-3);">
        <div style="font-size:var(--text-xs);font-weight:600;color:var(--c-text-2);text-transform:uppercase;letter-spacing:0.04em;">
          Selected Cohort:
        </div>
        <select class="form-input form-select" id="dash-class-select" style="width:auto;min-width:260px;font-weight:600;font-size:var(--text-xs);" onchange="FacultyViews.onDashboardClassChange(this.value)" aria-label="Select cohort scope">
          ${classes.map(c => `
            <option value="${c.id}" ${c.id === selectedClassId ? 'selected' : ''}>
              ${c.name}
            </option>`).join('')}
        </select>
      </div>

      <div style="display:flex;align-items:center;gap:var(--sp-2);">
        <span class="badge badge-normal" style="font-size:var(--text-xs);font-weight:600;padding:4px 10px;">
          ${classStudents.length} enrolled student${classStudents.length !== 1 ? 's' : ''}
        </span>
        <button class="btn btn-ghost btn-sm" onclick="AscendApp.navigate('faculty-students')" style="font-size:var(--text-xs);">
          Student Directory ${Icons.chevronRight}
        </button>
      </div>
    </div>

    <!-- ── 3. Top Metrics Row ───────────────────────────────────────── -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--sp-4);margin-bottom:var(--sp-5);">
      <div class="card" style="padding:16px;border-left:4px solid var(--c-primary);">
        <div style="font-size:var(--text-2xl);font-weight:800;color:var(--c-primary);line-height:1;">${classStudents.length}</div>
        <div style="font-size:12px;font-weight:600;color:var(--c-text);margin-top:4px;">Enrolled Students</div>
        <div style="font-size:11px;color:var(--c-text-3);margin-top:2px;">In selected cohort scope</div>
      </div>
      <div class="card" style="padding:16px;border-left:4px solid #D97706;">
        <div style="font-size:var(--text-2xl);font-weight:800;color:#D97706;line-height:1;">${inactiveStudents.length}</div>
        <div style="font-size:12px;font-weight:600;color:var(--c-text);margin-top:4px;">Inactive (30+ Days)</div>
        <div style="font-size:11px;color:var(--c-text-3);margin-top:2px;">No updates logged in 30 days</div>
      </div>
      <div class="card" style="padding:16px;border-left:4px solid #92400E;">
        <div style="font-size:var(--text-2xl);font-weight:800;color:#92400E;line-height:1;">${unreviewedMonthlyStudents.length}</div>
        <div style="font-size:12px;font-weight:600;color:var(--c-text);margin-top:4px;">Unreviewed Summaries</div>
        <div style="font-size:11px;color:var(--c-text-3);margin-top:2px;">Monthly summary not reviewed</div>
      </div>
      <div class="card" style="padding:16px;border-left:4px solid var(--c-verified);">
        <div style="font-size:var(--text-2xl);font-weight:800;color:var(--c-verified);line-height:1;">${publishedCount} / ${classStudents.length}</div>
        <div style="font-size:12px;font-weight:600;color:var(--c-text);margin-top:4px;">Semester 5 Evals</div>
        <div style="font-size:11px;color:var(--c-text-3);margin-top:2px;">${pendingCount} pending &bull; ${draftCount} in draft</div>
      </div>
    </div>

    <!-- ── 4. Main 2-Column Responsive Workspace ───────────────────── -->
    <div class="admin-layout-grid">

      <!-- ── Left Column: Recent Updates & Semester Evaluations Due ── -->
      <div style="display:flex;flex-direction:column;gap:var(--sp-5);">

        <!-- Live Student Submissions & Recent Updates -->
        <div class="card" style="padding:0;overflow:hidden;">
          <div style="padding:var(--sp-4) var(--sp-5);border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);">
            <div>
              <div style="display:flex;align-items:center;gap:var(--sp-2);">
                <h2 style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin:0;">
                  Recent Student Updates
                </h2>
                <span class="badge badge-normal" style="font-size:11px;">${recentUpdatesToShow.length} items</span>
              </div>
              <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">
                Real-time portfolio achievements, practical projects, and certifications
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="AscendApp.navigate('faculty-students')" style="font-size:var(--text-xs);">
              View Directory ${Icons.chevronRight}
            </button>
          </div>

          ${recentUpdatesToShow.length === 0 ? `
            <div style="padding:var(--sp-8) var(--sp-4);text-align:center;color:var(--c-text-2);">
              <div style="width:44px;height:44px;border-radius:50%;background:var(--c-bg);border:1px solid var(--c-border);display:inline-flex;align-items:center;justify-content:center;color:var(--c-text-3);margin-bottom:var(--sp-2);">
                ${Icons.clock}
              </div>
              <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);margin-bottom:4px;">
                No Student Activity Recorded Yet
              </div>
              <div style="font-size:var(--text-xs);color:var(--c-text-2);max-width:360px;margin:0 auto;line-height:1.5;">
                As enrolled students submit new achievements and projects, their activity feed will appear here for faculty review.
              </div>
            </div>` :
            `<div style="display:flex;flex-direction:column;">
              ${recentUpdatesToShow.map(u => `
                <div style="padding:var(--sp-3) var(--sp-5);border-bottom:1px solid var(--c-border);display:flex;align-items:center;gap:var(--sp-3);transition:background var(--dur-fast);" class="feed-item-row">
                  <div class="avatar avatar-sm" style="flex-shrink:0;font-weight:700;font-size:12px;background:var(--c-primary-light);color:var(--c-primary);">${u.studentInitials || 'ST'}</div>
                  <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;margin-bottom:2px;">
                      <span style="font-size:var(--text-sm);font-weight:700;color:var(--c-text);">${u.studentName}</span>
                      ${u.rollNo ? `<span style="font-size:var(--text-xs);color:var(--c-text-2);font-weight:500;">${u.rollNo}</span>` : ''}
                      <span style="color:var(--c-border);font-size:10px;">&bull;</span>
                      <span style="font-size:var(--text-xs);color:var(--c-text-2);">${u.actionType === 'added' ? 'added' : 'updated'}</span>
                      ${getTypeBadge(u.itemType)}
                    </div>
                    <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                      ${u.title}
                    </div>
                    <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
                      ${u.subtitle ? `<span>${u.subtitle}</span><span style="color:var(--c-border);font-size:10px;">&bull;</span>` : ''}
                      <span style="display:inline-flex;align-items:center;gap:4px;color:var(--c-text-2);font-weight:500;">
                        ${Icons.clock} ${u.timestamp || 'Recently'}
                      </span>
                    </div>
                  </div>
                  <div style="flex-shrink:0;">
                    <button class="btn btn-outline btn-sm" onclick="FacultyViews.openStudentDetail('${u.studentId}')" style="font-size:var(--text-xs);white-space:nowrap;">
                      View Profile
                    </button>
                  </div>
                </div>`).join('')}
            </div>`}
        </div>

        <!-- Semester Evaluations Due (Semester 5 · July–November 2026) -->
        <div class="card" style="padding:0;overflow:hidden;">
          <div style="padding:var(--sp-4) var(--sp-5);border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);">
            <div>
              <div style="display:flex;align-items:center;gap:var(--sp-2);">
                <h2 style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin:0;">
                  Semester Evaluations Due
                </h2>
                <span class="badge badge-normal" style="font-size:11px;">Semester 5 &bull; Jul–Nov 2026</span>
              </div>
              <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">
                Faculty-led formal rubric evaluations across 5 developmental criteria
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="AscendApp.navigate('faculty-evaluations')" style="font-size:var(--text-xs);">
              All Evaluations ${Icons.chevronRight}
            </button>
          </div>

          <div style="display:flex;flex-direction:column;">
            ${semesterEvalsDue.map(item => {
              const s = item.student;
              const statusBadge = item.status === 'published'
                ? `<span class="badge" style="background:#E8F0FE;color:#1A73E8;border:1px solid #C2D8FF;font-size:10.5px;font-weight:600;">Published</span>`
                : (item.status === 'draft'
                  ? `<span class="badge" style="background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;font-size:10.5px;font-weight:600;">Draft</span>`
                  : `<span class="badge" style="background:var(--c-bg);color:var(--c-text-2);border:1px solid var(--c-border);font-size:10.5px;font-weight:600;">To Evaluate</span>`);

              const actionBtn = item.status === 'published'
                ? `<button class="btn btn-outline btn-sm" style="font-size:11px;padding:3px 10px;" onclick="FacultyViews.openEditEvalModal('${item.evaluation.id}')">View / Edit</button>`
                : (item.status === 'draft'
                  ? `<button class="btn btn-primary btn-sm" style="font-size:11px;padding:3px 10px;" onclick="FacultyViews.openEditEvalModal('${item.evaluation.id}')">Continue Draft</button>`
                  : `<button class="btn btn-primary btn-sm" style="font-size:11px;padding:3px 10px;" onclick="FacultyViews.openCreateEvalModal('${s.id}')">Start Evaluation</button>`);

              return `
                <div style="padding:14px 20px;border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;">
                  <div style="display:flex;align-items:center;gap:12px;min-width:200px;">
                    <div class="avatar avatar-sm" style="background:var(--c-primary-light);color:var(--c-primary);font-weight:700;font-size:11px;">
                      ${s.initials || 'ST'}
                    </div>
                    <div>
                      <div style="display:flex;align-items:center;gap:6px;">
                        <span style="font-size:var(--text-sm);font-weight:700;color:var(--c-text);">${s.name}</span>
                        ${statusBadge}
                      </div>
                      <div style="font-size:11px;color:var(--c-text-3);margin-top:2px;">
                        ${s.rollNo ? `${s.rollNo} &bull; ` : ''}${s.program || 'B.Tech CSE'}
                      </div>
                    </div>
                  </div>

                  <div style="flex:1;min-width:220px;font-size:11.5px;color:var(--c-text-2);background:var(--c-bg);padding:6px 10px;border-radius:var(--r-sm);border:1px solid var(--c-border);">
                    <div style="font-weight:600;color:var(--c-text);margin-bottom:1px;">Latest activity record:</div>
                    ${item.latestSummary}
                  </div>

                  <div style="display:flex;align-items:center;gap:8px;">
                    ${actionBtn}
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>

      </div>

      <!-- ── Right Column: Inactive Students & Unreviewed Summaries ── -->
      <div style="display:flex;flex-direction:column;gap:var(--sp-5);">

        <!-- 1. Students with No Activity in Last 30 Days -->
        <div class="card" style="padding:var(--sp-4);border-top:3px solid #D97706;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--sp-2);margin-bottom:var(--sp-3);">
            <div>
              <div style="display:flex;align-items:center;gap:var(--sp-2);">
                <h2 style="font-size:var(--text-sm);font-weight:700;color:var(--c-text);margin:0;">
                  No Activity in Past 30 Days
                </h2>
                <span class="badge" style="background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;font-size:10px;font-weight:700;">
                  ${inactiveStudents.length}
                </span>
              </div>
              <div style="font-size:11px;color:var(--c-text-2);margin-top:2px;">
                Students who have not logged any portfolio updates in 30+ days
              </div>
            </div>
          </div>

          ${inactiveStudents.length === 0 ? `
            <div style="text-align:center;padding:var(--sp-4) var(--sp-3);background:var(--c-bg);border:1px dashed var(--c-border);border-radius:var(--r-md);">
              <div style="display:inline-flex;color:var(--c-verified);margin-bottom:4px;">${Icons.check}</div>
              <div style="font-size:var(--text-xs);font-weight:600;color:var(--c-text);">All Students Active</div>
              <div style="font-size:11px;color:var(--c-text-3);margin-top:2px;">All enrolled students have logged activity within the past 30 days.</div>
            </div>` :
            `<div style="display:flex;flex-direction:column;gap:var(--sp-2);">
              ${inactiveStudents.map(s => `
                <div style="padding:10px 12px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);display:flex;align-items:center;justify-content:space-between;gap:10px;">
                  <div style="display:flex;align-items:center;gap:8px;min-width:0;">
                    <div class="avatar avatar-sm" style="width:28px;height:28px;font-size:10px;background:#FEF3C7;color:#92400E;">${s.initials || 'ST'}</div>
                    <div style="min-width:0;">
                      <div style="font-size:var(--text-xs);font-weight:700;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${s.name}
                      </div>
                      <div style="font-size:11px;color:#D97706;font-weight:600;margin-top:1px;">
                        ${s.daysInactive ? `${s.daysInactive} days inactive` : '30+ days inactive'}
                      </div>
                    </div>
                  </div>
                  <div style="display:flex;gap:6px;flex-shrink:0;">
                    <button class="btn btn-outline btn-sm" style="padding:3px 8px;font-size:11px;"
                      onclick="FacultyViews.openGuidanceModalForStudent('${s.id}', '${s.name}')">
                      Send Guidance
                    </button>
                  </div>
                </div>`).join('')}
            </div>`}
        </div>

        <!-- 2. Students Who Have Not Reviewed Monthly Summary -->
        <div class="card" style="padding:var(--sp-4);border-top:3px solid #1A73E8;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--sp-2);margin-bottom:var(--sp-3);">
            <div>
              <div style="display:flex;align-items:center;gap:var(--sp-2);">
                <h2 style="font-size:var(--text-sm);font-weight:700;color:var(--c-text);margin:0;">
                  Unreviewed Monthly Summary
                </h2>
                <span class="badge" style="background:#E8F0FE;color:#1A73E8;border:1px solid #C2D8FF;font-size:10px;font-weight:700;">
                  ${unreviewedMonthlyStudents.length}
                </span>
              </div>
              <div style="font-size:11px;color:var(--c-text-2);margin-top:2px;">
                September activity summaries awaiting student confirmation
              </div>
            </div>
          </div>

          ${unreviewedMonthlyStudents.length === 0 ? `
            <div style="text-align:center;padding:var(--sp-4) var(--sp-3);background:var(--c-bg);border:1px dashed var(--c-border);border-radius:var(--r-md);">
              <div style="display:inline-flex;color:var(--c-verified);margin-bottom:4px;">${Icons.check}</div>
              <div style="font-size:var(--text-xs);font-weight:600;color:var(--c-text);">All Summaries Reviewed</div>
              <div style="font-size:11px;color:var(--c-text-3);margin-top:2px;">All students have confirmed their September portfolio activity summary.</div>
            </div>` :
            `<div style="display:flex;flex-direction:column;gap:var(--sp-2);">
              ${unreviewedMonthlyStudents.map(s => `
                <div style="padding:10px 12px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);display:flex;align-items:center;justify-content:space-between;gap:10px;">
                  <div style="display:flex;align-items:center;gap:8px;min-width:0;">
                    <div class="avatar avatar-sm" style="width:28px;height:28px;font-size:10px;background:var(--c-primary-light);color:var(--c-primary);">${s.initials || 'ST'}</div>
                    <div style="min-width:0;">
                      <div style="font-size:var(--text-xs);font-weight:700;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${s.name}
                      </div>
                      <div style="font-size:11px;color:var(--c-text-3);margin-top:1px;">
                        September summary pending review
                      </div>
                    </div>
                  </div>
                  <div style="display:flex;gap:6px;flex-shrink:0;">
                    <button class="btn btn-ghost btn-sm" style="padding:3px 8px;font-size:11px;border:1px solid var(--c-border);"
                      onclick="FacultyViews.sendReviewReminder('${s.id}', '${s.name}')">
                      Send Reminder
                    </button>
                  </div>
                </div>`).join('')}
            </div>`}
        </div>

      </div>

    </div>`;
}

/* ── Class selection handler ─────────────────────────────────── */
function onDashboardClassChange(classId) {
  window.AscendFacultyData.setSelectedClass(classId);
  AscendApp.navigate('faculty-dashboard');
}

/* ── Helper: Send Reminder to Student ────────────────────────── */
function sendReviewReminder(studentId, studentName) {
  if (window.AscendFacultyData && window.AscendFacultyData.sendFeedback) {
    window.AscendFacultyData.sendFeedback({
      toStudentId: studentId,
      toStudentName: studentName,
      category: 'Monthly Review Reminder',
      subject: 'Please review your September activity summary',
      message: 'Your September portfolio activity summary is ready. Please review your logged achievements and confirm your monthly progress record.',
      recommendedNextStep: 'Log into student portal and mark September summary as reviewed.',
    });
  }
  if (window.AscendUI && window.AscendUI.showToast) {
    window.AscendUI.showToast(`Reminder sent to ${studentName}.`, 'success');
  }
}

function openGuidanceModalForStudent(studentId, studentName) {
  AscendApp.navigate('faculty-goals-feedback');
  setTimeout(() => {
    if (typeof FacultyViews.openGlobalFeedbackModal === 'function') {
      FacultyViews.openGlobalFeedbackModal(studentId);
    }
  }, 200);
}

window.FacultyViews = window.FacultyViews || {};
Object.assign(window.FacultyViews, {
  dashboard: renderFacultyDashboard,
  onDashboardClassChange,
  sendReviewReminder,
  openGuidanceModalForStudent,
});
