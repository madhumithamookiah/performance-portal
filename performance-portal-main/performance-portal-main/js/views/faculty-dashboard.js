/**
 * ASCEND – Faculty & Mentor Dashboard View
 * Clean, modern interface adhering to Google design principles.
 * Focuses on class oversight, student guidance feedback, and semester evaluations.
 */

function renderFacultyDashboard() {
  const { facultyUser, getClasses, getStudents, getRecentUpdates, getEvaluations, facultyFeedback } = window.AscendFacultyData;
  const { Icons, formatDate, daysUntil } = window.AscendUI;

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
  let selectedClassId = window.AscendFacultyData.selectedClassId;
  if (!selectedClassId) {
    selectedClassId = 'all';
  }
  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0] || {
    id: 'all',
    name: 'All Registered Students',
    shortName: 'All Students',
    academicYear: '2026–27',
  };

  // Scoped records from dynamic store
  const classStudents = getStudents(selectedClassId);
  const classUpdates = getRecentUpdates(selectedClassId);
  const classEvals = getEvaluations(selectedClassId);
  const classFeedback = (facultyFeedback || []).filter(f => !selectedClassId || selectedClassId === 'all' || f.classId === selectedClassId);

  // Computed metrics
  const totalStudentsCount = classStudents.length;
  const totalSubmissionsCount = classStudents.reduce((acc, s) => acc + (Array.isArray(s.achievements) ? s.achievements.length : (s.totalAchievements || 0)), 0);
  const publishedEvalsCount = (classEvals || []).filter(e => e.status === 'published').length;
  const guidanceCount = classFeedback.length;

  // Recent activity items (max 8)
  const recentUpdatesToShow = (classUpdates || []).slice(0, 8);

  // Category badge styling helper
  function getTypeBadge(type) {
    const map = {
      'Hackathon':     { bg: '#EEF2FF', text: '#3730A3', border: '#C7D2FE' },
      'Certification': { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' },
      'Project':       { bg: '#F3E8FF', text: '#6D28D9', border: '#E9D5FF' },
      'Portfolio':     { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
      'Research':      { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
      'Internship':    { bg: '#FCE7F3', text: '#9D174D', border: '#FBCFE8' },
      'Workshop':      { bg: '#FFEDD5', text: '#9A3412', border: '#FED7AA' },
    };
    const c = map[type] || { bg: 'var(--c-bg)', text: 'var(--c-text-2)', border: 'var(--c-border)' };
    return `<span class="badge" style="background:${c.bg};color:${c.text};border:1px solid ${c.border};font-size:11px;font-weight:600;padding:2px 8px;border-radius:var(--r-sm);">${type}</span>`;
  }

  // Real, non-mocked attention items
  function getAttentionItems() {
    const list = [];
    classStudents.forEach(student => {
      const studentEvals = (classEvals || []).filter(e => e.studentId === student.id);
      const draftEval = studentEvals.find(e => e.status === 'draft');
      const pendingFollowUp = classFeedback.find(fb => fb.toStudentId === student.id && fb.followUpState === 'due');

      let isInactive = false;
      if (student.lastActivity) {
        const daysDiff = Math.floor((new Date() - new Date(student.lastActivity)) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 30) isInactive = true;
      }

      const isIncomplete = student.profileSetupStatus === 'incomplete' ||
        (Array.isArray(student.missingProfileFields) && student.missingProfileFields.length > 0);

      if (draftEval) {
        list.push({
          student,
          badgeLabel: 'Evaluation Draft',
          badgeClass: 'badge-draft',
          reason: `${draftEval.evaluationPeriod || 'Rubric evaluation'} awaiting publication`,
        });
      } else if (pendingFollowUp) {
        list.push({
          student,
          badgeLabel: 'Follow-up Due',
          badgeClass: 'badge-feedback',
          reason: 'Scheduled mentorship follow-up date reached',
        });
      } else if (isInactive) {
        list.push({
          student,
          badgeLabel: 'Needs Check-in',
          badgeClass: 'badge-attention',
          reason: 'No portfolio updates logged in the past 30 days',
        });
      } else if (isIncomplete) {
        list.push({
          student,
          badgeLabel: 'Profile Incomplete',
          badgeClass: 'badge-draft',
          reason: `Missing setup: ${(student.missingProfileFields || ['Basic details']).join(', ')}`,
        });
      }
    });
    return list.slice(0, 5);
  }

  const attentionItems = getAttentionItems();

  return `
    <style>
      .admin-stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--sp-4);
        margin-bottom: var(--sp-5);
      }
      .admin-stat-card {
        background: var(--c-surface);
        border: 1px solid var(--c-border);
        border-radius: var(--r-lg);
        padding: var(--sp-4);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: box-shadow var(--dur-fast), border-color var(--dur-fast);
      }
      .admin-stat-card:hover {
        box-shadow: var(--shadow-sm);
        border-color: var(--c-primary-light);
      }
      .admin-stat-icon {
        width: 36px;
        height: 36px;
        border-radius: var(--r-md);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: var(--sp-2);
      }
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
        .admin-stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .admin-layout-grid {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 640px) {
        .admin-stats-grid {
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
          Class oversight &bull; Student performance tracking &bull; Guidance &amp; evaluations
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm" onclick="AscendFacultyData.loadFacultyData().then(()=>AscendApp.navigate('faculty-dashboard'))" aria-label="Refresh data">
          ${Icons.refreshCw || Icons.clock} Refresh Data
        </button>
        <button class="btn btn-outline btn-sm" onclick="AscendApp.navigate('faculty-goals-feedback');setTimeout(()=>FacultyViews.openGlobalFeedbackModal?.(),200)" aria-label="Send guidance feedback">
          ${Icons.messageSquare} Send Guidance
        </button>
        <button class="btn btn-primary btn-sm" onclick="AscendApp.navigate('faculty-evaluations')" aria-label="Open rubric evaluations">
          ${Icons.fileText} Evaluations
        </button>
      </div>
    </div>

    <!-- ── 3. Scope & Cohort Filter Strip ─────────────────────────── -->
    <div class="card" style="margin-bottom:var(--sp-5);padding:var(--sp-3) var(--sp-4);background:var(--c-surface);border:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);">
      <div style="display:flex;align-items:center;gap:var(--sp-3);">
        <div style="font-size:var(--text-xs);font-weight:600;color:var(--c-text-2);text-transform:uppercase;letter-spacing:0.04em;">
          Active Cohort Scope:
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
          ${classStudents.length} student${classStudents.length !== 1 ? 's' : ''} in view
        </span>
        <button class="btn btn-ghost btn-sm" onclick="AscendApp.navigate('faculty-students')" style="font-size:var(--text-xs);">
          Full Directory ${Icons.chevronRight}
        </button>
      </div>
    </div>

    <!-- ── 4. Main 2-Column Responsive Workspace ───────────────────── -->
    <div class="admin-layout-grid">

      <!-- ── Left Column: Live Student Submissions & Activity ──────── -->
      <div class="card" style="padding:0;overflow:hidden;">
        <div style="padding:var(--sp-4) var(--sp-5);border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);">
          <div>
            <div style="display:flex;align-items:center;gap:var(--sp-2);">
              <h2 style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin:0;">
                Live Student Submissions
              </h2>
              <span class="badge badge-normal" style="font-size:11px;">${recentUpdatesToShow.length} items</span>
            </div>
            <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">
              Real-time portfolio achievements, hackathons, and certifications
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="AscendApp.navigate('faculty-students')" style="font-size:var(--text-xs);">
            View Roster ${Icons.chevronRight}
          </button>
        </div>

        ${recentUpdatesToShow.length === 0 ? `
          <div style="padding:var(--sp-8) var(--sp-4);text-align:center;color:var(--c-text-2);">
            <div style="width:48px;height:48px;border-radius:50%;background:var(--c-bg);border:1px solid var(--c-border);display:inline-flex;align-items:center;justify-content:center;color:var(--c-text-3);margin-bottom:var(--sp-3);">
              ${Icons.clock}
            </div>
            <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);margin-bottom:4px;">
              No Student Activity Recorded Yet
            </div>
            <div style="font-size:var(--text-xs);color:var(--c-text-2);max-width:380px;margin:0 auto;line-height:1.5;">
              As enrolled students submit new achievements, certifications, and portfolio projects, their live activity feed will appear here for faculty mentoring and guidance.
            </div>
            <button class="btn btn-outline btn-sm" style="margin-top:var(--sp-4);" onclick="AscendApp.navigate('faculty-students')">
              Open Student Directory
            </button>
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

      <!-- ── Right Column: Action Items & Evaluations ──────────────── -->
      <div style="display:flex;flex-direction:column;gap:var(--sp-5);">

        <!-- Action Items / Attention -->
        <div class="card" style="padding:var(--sp-4);">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--sp-2);margin-bottom:var(--sp-3);">
            <div>
              <div style="display:flex;align-items:center;gap:var(--sp-2);">
                <h2 style="font-size:var(--text-sm);font-weight:700;color:var(--c-text);margin:0;">Action Required</h2>
                ${attentionItems.length > 0 ? `<span class="badge badge-attention" style="font-size:10px;font-weight:700;">${attentionItems.length}</span>` : ''}
              </div>
              <div style="font-size:11px;color:var(--c-text-2);margin-top:2px;">
                Factual items requiring advisor or mentor attention
              </div>
            </div>
            <span class="badge ${attentionItems.length > 0 ? 'badge-attention' : 'badge-normal'}" style="font-size:11px;">
              ${attentionItems.length > 0 ? `${attentionItems.length} pending` : 'All clear'}
            </span>
          </div>

          ${attentionItems.length === 0 ? `
            <div style="text-align:center;padding:var(--sp-5) var(--sp-3);background:var(--c-bg);border:1px dashed var(--c-border);border-radius:var(--r-md);">
              <div style="display:inline-flex;color:var(--c-verified);margin-bottom:6px;">${Icons.checkCircle}</div>
              <div style="font-size:var(--text-xs);font-weight:600;color:var(--c-text);">All Students On Track</div>
              <div style="font-size:11px;color:var(--c-text-2);margin-top:2px;">No overdue reviews, incomplete profiles, or pending follow-ups in this cohort.</div>
            </div>` :
            `<div style="display:flex;flex-direction:column;gap:var(--sp-2);">
              ${attentionItems.map(item => `
                <div style="padding:var(--sp-3);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);display:flex;align-items:center;justify-content:space-between;gap:var(--sp-3);cursor:pointer;"
                     onclick="FacultyViews.openStudentDetail('${item.student.id}')"
                     role="button"
                     tabindex="0"
                     onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();FacultyViews.openStudentDetail('${item.student.id}');}"
                     aria-label="View attention record for ${item.student.name}">
                  <div style="display:flex;align-items:center;gap:var(--sp-2);min-width:0;">
                    <div class="avatar avatar-sm" style="flex-shrink:0;width:30px;height:30px;font-size:11px;">${item.student.initials || 'ST'}</div>
                    <div style="min-width:0;">
                      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                        <span style="font-size:var(--text-xs);font-weight:700;color:var(--c-text);">${item.student.name}</span>
                        ${item.student.rollNo ? `<span style="font-size:10px;color:var(--c-text-2);">${item.student.rollNo}</span>` : ''}
                      </div>
                      <div style="margin-top:2px;">
                        <span class="badge ${item.badgeClass}" style="font-size:10px;padding:1px 6px;">${item.badgeLabel}</span>
                      </div>
                      <div style="font-size:11px;color:var(--c-text-2);margin-top:3px;line-height:1.3;">
                        ${item.reason}
                      </div>
                    </div>
                  </div>
                  <button class="btn btn-ghost btn-sm" style="flex-shrink:0;padding:4px 8px;font-size:11px;" onclick="event.stopPropagation();FacultyViews.openStudentDetail('${item.student.id}')">
                    Review
                  </button>
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

window.FacultyViews = window.FacultyViews || {};
Object.assign(window.FacultyViews, {
  dashboard: renderFacultyDashboard,
  onDashboardClassChange,
});
