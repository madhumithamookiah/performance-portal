/**
 * ASCEND – Faculty Student Detail View (4 Tabs)
 * 1. Overview   – Overall student's profile details (Bio, career interests, academic details, links, portfolio summary, skills)
 * 2. Activity   – Student's recent achievements uploaded in their student portal with proof documents and verification details
 * 3. Feedback   – Faculty's mentorship guidance and feedback history for this student
 * 4. Evaluation – Personalised rubric evaluations, criteria ratings, and qualitative assessment history
 *
 * Clean, modern, accessible UI with zero emojis and responsive design.
 */

/* ── Tab Switcher ────────────────────────────────────────────── */
function switchStudentDetailTab(tabId) {
  const normId = (tabId === 'evaluations') ? 'evaluation' : ((tabId === 'portfolio' || tabId === 'achievements') ? 'activity' : tabId);
  window._facultySelectedStudentTab = normId;
  document.querySelectorAll('.fsd-tab-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.fsd-tab-content').forEach(el => el.classList.remove('active'));
  const tab = document.querySelector(`.fsd-tab-item[data-sdtab="${normId}"]`);
  const content = document.getElementById(`fsd-tab-${normId}`);
  if (tab) tab.classList.add('active');
  if (content) content.classList.add('active');
}

/* ── Qualitative Badge Helper ────────────────────────────────── */
function rubricLevelBadge(level) {
  const map = {
    'Outstanding':        { bg: 'rgba(26, 115, 232, 0.12)', text: '#1A73E8', border: 'rgba(26, 115, 232, 0.3)' },
    'Strong':             { bg: 'rgba(21, 87, 208, 0.12)',  text: '#1557D0', border: 'rgba(21, 87, 208, 0.3)' },
    'Meets Expectations': { bg: 'rgba(66, 133, 244, 0.12)',  text: '#1A73E8', border: 'rgba(66, 133, 244, 0.3)' },
    'Developing':         { bg: 'rgba(217, 119, 6, 0.12)',  text: '#D97706', border: 'rgba(217, 119, 6, 0.3)' },
  };
  const c = map[level] || { bg: 'var(--c-bg)', text: 'var(--c-text-2)', border: 'var(--c-border)' };
  return `<span class="badge" style="background:${c.bg};color:${c.text};border:1px solid ${c.border};font-weight:600;font-size:11px;">${level}</span>`;
}

/* ── Category Icon Color ─────────────────────────────────────── */
function achievementCategoryColor(cat) {
  const map = {
    'Certification': '#1A73E8',
    'Hackathon':     '#7C3AED',
    'Project':       '#059669',
    'Internship':    '#D97706',
    'Research':      '#DC2626',
    'Workshop':      '#0891B2',
    'Leadership':    '#EA580C',
    'Extracurricular': '#6B7280',
  };
  return map[cat] || 'var(--c-primary)';
}

/* ── Main Render ─────────────────────────────────────────────── */
function renderFacultyStudentDetail(paramId, paramTab) {
  const { students, facultyFeedback, evaluations } = window.AscendFacultyData;
  const { Icons, skillTag, formatDate } = window.AscendUI;
  const currentRole = window.AscendApp?.getCurrentRole?.() || sessionStorage.getItem('ascend_role');

  const studentId = paramId || window._facultySelectedStudentId || (students && students[0] ? students[0].id : 'stu-000');
  let rawTab = paramTab || window._facultySelectedStudentTab || 'overview';
  if (currentRole === 'admin' && (rawTab === 'evaluation' || rawTab === 'evaluations')) rawTab = 'overview';

  // Normalize tab ID to one of: overview, activity, feedback, evaluation
  const tabRemap = {
    achievements: 'activity',
    projects: 'activity',
    portfolio: 'activity',
    skills: 'overview',
    evaluations: 'evaluation'
  };
  const activeTab = tabRemap[rawTab] || rawTab;
  const s = (students && students.find(st => st.id === studentId)) || (students && students[0]) || {};

  // Retrieve student-submitted achievements
  let achievements = (s.achievements && s.achievements.length > 0) ? s.achievements : [];
  let projects = (s.projects && s.projects.length > 0) ? s.projects : [];

  // For currently active student, sync dynamically with live AscendData
  if (window.AscendData && window.AscendData.student && s.id === window.AscendData.student.id) {
    if (Array.isArray(window.AscendData.achievements) && window.AscendData.achievements.length > 0) {
      achievements = window.AscendData.achievements;
    }
    if (Array.isArray(window.AscendData.projects) && window.AscendData.projects.length > 0) {
      projects = window.AscendData.projects;
    }
  }

  // Sort student achievements by date descending (most recent first)
  const sortedAchievements = [...achievements].sort((a, b) => {
    const da = a.date || a.createdAt || '';
    const db = b.date || b.createdAt || '';
    return new Date(db || 0) - new Date(da || 0);
  });

  // Scoped feedback and evaluations
  const stuFeedback = (facultyFeedback || []).filter(f => f.toStudentId === s.id || f.studentId === s.id);
  const stuEvaluations = (evaluations || []).filter(e => e.studentId === s.id);
  const latestEval = stuEvaluations.find(e => e.status === 'published') || stuEvaluations[0];

  const initials = s.initials || (s.name ? s.name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'ST');

  // Academic Details entries
  const academicDetails = [
    { label: 'Programme', value: s.degree || s.program || '—' },
    { label: 'Department', value: s.department || '—' },
    { label: 'Institution', value: s.institution || '—' },
    { label: 'Semester / Year', value: s.semester ? `Semester ${s.semester}` : (s.year ? `Year ${s.year}` : '—') },
    { label: 'Section / Cohort', value: s.section || '—' },
    { label: 'Roll Number', value: s.rollNo || '—' },
    { label: 'Official Email', value: s.email || '—' },
  ];

  return `
    <!-- Back Navigation -->
    <div style="margin-bottom:var(--sp-4);display:flex;align-items:center;justify-content:space-between;">
      <button class="btn btn-ghost btn-sm" onclick="AscendApp.navigate('faculty-students')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Students Directory
      </button>
      <div style="font-size:var(--text-xs);color:var(--c-text-3);">
        Student Development Oversight · ${s.className || 'Assigned Class'}
      </div>
    </div>

    <!-- Student Profile Header Card -->
    <div class="card" style="margin-bottom:var(--sp-5);padding:var(--sp-5);">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-4);">
        <!-- Identity -->
        <div style="display:flex;align-items:flex-start;gap:var(--sp-4);">
          <div class="avatar avatar-lg" style="background:var(--c-primary-light);color:var(--c-primary);font-size:1.5rem;font-weight:700;flex-shrink:0;">
            ${initials}
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:var(--sp-3);flex-wrap:wrap;">
              <h1 style="font-size:var(--text-2xl);font-weight:700;margin:0;letter-spacing:-0.025em;color:var(--c-text);">
                ${s.name || 'Student'}
              </h1>
              <span class="badge badge-normal" style="font-family:monospace;font-size:var(--text-xs);font-weight:600;">
                ${s.rollNo || ''}
              </span>
            </div>
            <div style="font-size:var(--text-base);font-weight:500;color:var(--c-text-2);margin-top:2px;">
              ${s.degree || s.program || ''} ${s.section ? '· ' + s.section : ''}
            </div>
            <div style="display:flex;align-items:center;gap:var(--sp-4);margin-top:var(--sp-2);flex-wrap:wrap;font-size:var(--text-xs);color:var(--c-text-2);">
              ${s.email ? `<span style="display:flex;align-items:center;gap:4px;">${Icons.mail} ${s.email}</span>` : ''}
              ${s.department ? `<span style="display:flex;align-items:center;gap:4px;">${Icons.user} ${s.department}</span>` : ''}
              ${(s.graduationYear || s.year) ? `<span style="display:flex;align-items:center;gap:4px;">${Icons.calendar} Class of ${s.graduationYear || 2027}</span>` : ''}
            </div>

            ${s.attentionStatus && s.attentionStatus !== 'none' && s.attentionReason ? `
              <div style="margin-top:var(--sp-3);display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:var(--c-review-bg);border:1px solid var(--c-review-border);border-radius:var(--r-sm);font-size:var(--text-xs);color:var(--c-review);font-weight:600;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                ${s.attentionReason}
              </div>` : ''}
          </div>
        </div>

        <!-- Actions -->
        <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);align-items:center;">
          <button class="btn btn-outline btn-sm" onclick="FacultyViews.openStudentPublicPortfolio('${s.id}')" title="Preview student's public portfolio">
            ${Icons.externalLink} View Public Portfolio
          </button>
          <button class="btn btn-outline btn-sm" onclick="FacultyViews.openDetailFeedbackModal('${s.id}')">
            ${Icons.messageSquare} Send Feedback
          </button>
          ${currentRole !== 'admin' ? (latestEval ? `
            <button class="btn btn-primary btn-sm" onclick="FacultyViews.switchStudentDetailTab('evaluation')">
              ${Icons.fileText} View Evaluation
            </button>` : `
            <button class="btn btn-primary btn-sm" onclick="FacultyViews.openDetailNewEvalModal('${s.id}')">
              ${Icons.plus} Start Evaluation
            </button>`) : ''}
        </div>
      </div>
    </div>

    <!-- 4 Navigation Tabs: Overview · Activity · Feedback · Evaluation -->
    <div class="tabs fsd-tabs" id="fsd-tab-bar" style="margin-bottom:var(--sp-5);">
      <button class="tab-item fsd-tab-item ${activeTab === 'overview' ? 'active' : ''}" data-sdtab="overview" onclick="FacultyViews.switchStudentDetailTab('overview')">Overview</button>
      <button class="tab-item fsd-tab-item ${activeTab === 'activity' ? 'active' : ''}" data-sdtab="activity" onclick="FacultyViews.switchStudentDetailTab('activity')">Activity (${sortedAchievements.length})</button>
      <button class="tab-item fsd-tab-item ${activeTab === 'feedback' ? 'active' : ''}" data-sdtab="feedback" onclick="FacultyViews.switchStudentDetailTab('feedback')">Feedback (${stuFeedback.length})</button>
      ${currentRole !== 'admin' ? `<button class="tab-item fsd-tab-item ${activeTab === 'evaluation' ? 'active' : ''}" data-sdtab="evaluation" onclick="FacultyViews.switchStudentDetailTab('evaluation')">Evaluation (${stuEvaluations.length})</button>` : ''}
    </div>

    <!-- ═══════════ Tab 1: Overview (Overall Student Profile Details) ═══════════ -->
    <div id="fsd-tab-overview" class="fsd-tab-content ${activeTab === 'overview' ? 'active' : ''}">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-5);margin-bottom:var(--sp-5);" class="faculty-grid-2">
        <!-- Professional Bio & Career Profile -->
        <div class="card" style="padding:var(--sp-5);">
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin-bottom:var(--sp-3);">
            Professional Bio
          </div>
          <div style="font-size:var(--text-sm);color:var(--c-text-2);line-height:1.75;margin-bottom:var(--sp-5);">
            ${s.bio || '<span style="color:var(--c-text-3);font-style:italic;">No bio provided by student yet.</span>'}
          </div>

          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin-bottom:var(--sp-3);">
            Career Interests
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);margin-bottom:var(--sp-5);">
            ${(s.careerInterests && s.careerInterests.length > 0)
              ? s.careerInterests.map(c => skillTag(c)).join('')
              : '<span style="color:var(--c-text-3);font-size:var(--text-xs);">No career interests specified.</span>'}
          </div>

          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin-bottom:var(--sp-3);">
            External Profiles & Links
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--sp-2);">
            <div style="font-size:var(--text-xs);color:var(--c-text-2);display:flex;align-items:center;gap:8px;">
              <span style="font-weight:600;min-width:75px;color:var(--c-text);">GitHub:</span>
              ${s.github ? `<a href="${s.github}" target="_blank" rel="noopener noreferrer" style="color:var(--c-primary);word-break:break-all;">${s.github}</a>` : '<span style="color:var(--c-text-3);">Not linked</span>'}
            </div>
            <div style="font-size:var(--text-xs);color:var(--c-text-2);display:flex;align-items:center;gap:8px;">
              <span style="font-weight:600;min-width:75px;color:var(--c-text);">LinkedIn:</span>
              ${s.linkedIn ? `<a href="${s.linkedIn}" target="_blank" rel="noopener noreferrer" style="color:var(--c-primary);word-break:break-all;">${s.linkedIn}</a>` : '<span style="color:var(--c-text-3);">Not linked</span>'}
            </div>
            <div style="font-size:var(--text-xs);color:var(--c-text-2);display:flex;align-items:center;gap:8px;">
              <span style="font-weight:600;min-width:75px;color:var(--c-text);">Portfolio:</span>
              ${s.portfolioUrl ? `<a href="${s.portfolioUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--c-primary);word-break:break-all;">${s.portfolioUrl}</a>` : '<span style="color:var(--c-text-3);">Not published</span>'}
            </div>
          </div>
        </div>

        <!-- Academic Information & Portfolio Summary -->
        <div style="display:flex;flex-direction:column;gap:var(--sp-4);">
          <!-- Academic Info Card -->
          <div class="card" style="padding:var(--sp-5);">
            <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin-bottom:var(--sp-4);">
              Academic Profile Details
            </div>
            <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
              ${academicDetails.map(item => `
                <div style="display:flex;justify-content:space-between;align-items:flex-start;font-size:var(--text-sm);padding-bottom:var(--sp-2);border-bottom:1px solid var(--c-border);">
                  <span style="color:var(--c-text-3);font-weight:500;">${item.label}</span>
                  <span style="font-weight:600;color:var(--c-text);text-align:right;max-width:60%;">${item.value}</span>
                </div>`).join('')}
            </div>
          </div>

          <!-- Portfolio at a Glance Card -->
          <div class="card" style="padding:var(--sp-5);">
            <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin-bottom:var(--sp-4);">
              Development Oversight at a Glance
            </div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--sp-3);margin-bottom:var(--sp-4);">
              <div style="padding:var(--sp-3);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);text-align:center;">
                <div style="font-size:1.75rem;font-weight:800;color:var(--c-primary);line-height:1;">${sortedAchievements.length}</div>
                <div style="font-size:11px;color:var(--c-text-3);margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Achievements</div>
              </div>
              <div style="padding:var(--sp-3);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);text-align:center;">
                <div style="font-size:1.75rem;font-weight:800;color:#059669;line-height:1;">${projects.length}</div>
                <div style="font-size:11px;color:var(--c-text-3);margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Projects</div>
              </div>
              <div style="padding:var(--sp-3);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);text-align:center;">
                <div style="font-size:1.75rem;font-weight:800;color:var(--c-feedback);line-height:1;">${stuFeedback.length}</div>
                <div style="font-size:11px;color:var(--c-text-3);margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Feedback Given</div>
              </div>
              <div style="padding:var(--sp-3);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);text-align:center;">
                <div style="font-size:1.75rem;font-weight:800;color:${latestEval && latestEval.status === 'published' ? 'var(--c-verified)' : 'var(--c-review)'};line-height:1;">${stuEvaluations.length}</div>
                <div style="font-size:11px;color:var(--c-text-3);margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">Evaluations</div>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:var(--sp-2);">
              <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);">
                <span style="color:var(--c-text-3);">Profile Setup Status</span>
                <span style="font-weight:700;color:${s.profileSetupStatus === 'complete' ? 'var(--c-verified)' : 'var(--c-rejected)'};">
                  ${s.profileSetupStatus === 'complete' ? 'Complete' : 'Incomplete'}
                </span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);">
                <span style="color:var(--c-text-3);">Evaluation State</span>
                <span style="font-weight:700;">
                  ${latestEval ? (latestEval.status === 'published' ? 'Evaluated (Published)' : 'Draft in Progress') : 'Pending Evaluation'}
                </span>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);">
                <span style="color:var(--c-text-3);">Latest Portal Activity</span>
                <span style="font-weight:600;color:var(--c-text);">${s.latestUpdate?.formattedDate || s.lastActivity || 'Recently active'}</span>
              </div>
            </div>

            ${s.profileSetupStatus === 'incomplete' && s.missingProfileFields && s.missingProfileFields.length > 0 ? `
              <div style="margin-top:var(--sp-3);padding:var(--sp-3);background:var(--c-review-bg);border-radius:var(--r-md);font-size:var(--text-xs);color:var(--c-review);">
                <div style="font-weight:600;margin-bottom:2px;">Incomplete profile areas:</div>
                ${s.missingProfileFields.join(', ')}
              </div>` : ''}
          </div>
        </div>
      </div>

      <!-- ── Monthly Activity Section (Month Selector + Factual Timeline) ── -->
      ${renderStudentDetailMonthlyActivitySection(s)}

      <!-- Skills Acquired Factual Inventory -->
      ${s.skills && Object.keys(s.skills).length > 0 ? `
        <div class="card" style="padding:var(--sp-5);margin-top:var(--sp-4);">
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin-bottom:var(--sp-2);">
            Demonstrated Skills &amp; Competency Inventory
          </div>
          <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-bottom:var(--sp-4);">
            Self-submitted and demonstrated through coursework, projects, and recorded certifications
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);">
            ${Object.values(s.skills).flat().map(sk => {
              const name = typeof sk === 'string' ? sk : (sk.name || 'Skill');
              return skillTag(name);
            }).join('')}
          </div>
        </div>` : ''}
    </div>


    <!-- ═══════════ Tab 2: Activity (Student's Recent Achievements Uploaded in Student Portal) ═══════════ -->
    <div id="fsd-tab-activity" class="fsd-tab-content ${activeTab === 'activity' ? 'active' : ''}">
      <div style="margin-bottom:var(--sp-5);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);">
        <div>
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Recent Achievements Uploaded by Student</div>
          <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
            Achievements and milestones uploaded directly by ${s.name || 'this student'} in their student portal, sorted by recency.
          </div>
        </div>
        <span class="badge badge-normal" style="font-size:var(--text-xs);">
          ${sortedAchievements.length} achievement${sortedAchievements.length !== 1 ? 's' : ''} uploaded
        </span>
      </div>

      ${sortedAchievements.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">${Icons.award || Icons.fileText}</div>
          <div class="empty-state-title">No achievements uploaded yet</div>
          <div class="empty-state-desc">${s.name || 'This student'} has not uploaded any achievements in their student portal yet.</div>
        </div>` :
        `<div style="display:flex;flex-direction:column;gap:var(--sp-4);">
          ${sortedAchievements.map(a => {
            const color = achievementCategoryColor(a.category);
            const skillsList = a.skills || [];
            return `
              <div class="card" style="padding:var(--sp-4);border-left:4px solid ${color};">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--sp-3);flex-wrap:wrap;margin-bottom:var(--sp-2);">
                  <div style="display:flex;align-items:flex-start;gap:var(--sp-3);">
                    <div style="width:38px;height:38px;border-radius:var(--r-md);background:${color}18;color:${color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                      ${Icons.award || Icons.fileText}
                    </div>
                    <div>
                      <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
                        <span style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">${a.title}</span>
                        <span class="badge" style="background:${color}18;color:${color};border:1px solid ${color}40;font-size:11px;font-weight:600;">${a.category || 'Achievement'}</span>
                        <span class="badge badge-normal" style="font-size:10px;">Student Uploaded</span>
                      </div>
                      <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:4px;">
                        ${a.organization ? a.organization + ' · ' : ''}${a.date ? 'Uploaded ' + formatDate(a.date) : 'Recently uploaded'}
                      </div>
                    </div>
                  </div>
                </div>

                ${a.description ? `
                  <div style="font-size:var(--text-sm);color:var(--c-text-2);line-height:1.65;margin-bottom:${skillsList.length > 0 ? 'var(--sp-3)' : 'var(--sp-2)'};">
                    ${a.description}
                  </div>` : ''}

                ${skillsList.length > 0 ? `
                  <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);margin-bottom:var(--sp-3);">
                    ${skillsList.map(sk => `<span class="badge badge-normal" style="font-size:11px;">${sk}</span>`).join('')}
                  </div>` : ''}

                <!-- Evidence / Proof Section -->
                ${a.evidenceDoc || a.proofLink || a.proofData || a.proofFileName ? `
                  <div style="padding:var(--sp-3);background:var(--c-bg);border:1px dashed var(--c-border);border-radius:var(--r-md);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--c-primary);flex-shrink:0;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <div>
                        <div style="font-size:var(--text-xs);font-weight:600;color:var(--c-text);">
                          ${a.proofFileName || a.evidenceDoc || 'Supporting Evidence Document'}
                        </div>
                        <div style="font-size:10px;color:var(--c-text-3);">
                          Private to student & faculty · Uploaded from student portal
                        </div>
                      </div>
                    </div>
                    <div>
                      ${(() => {
                        const proof = (a.proofLink || '').trim();
                        const isWebUrl = /^https?:\/\//i.test(proof) || (/^www\./i.test(proof) && !proof.includes(' '));
                        if (isWebUrl) {
                          const url = /^https?:\/\//i.test(proof) ? proof : 'https://' + proof;
                          return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm" style="font-size:11px;">${Icons.externalLink} View Link</a>`;
                        } else {
                          const achJson = JSON.stringify({
                            id: a.id || 'ach-doc',
                            title: a.title,
                            category: a.category || 'Certification',
                            organization: a.organization || 'Institutional Verification',
                            date: a.date || '',
                            skills: a.skills || [],
                            description: a.description || '',
                            proofLink: a.proofLink || 'Certificate Attached',
                            proofFileName: a.proofFileName || a.evidenceDoc || 'Supporting_Evidence.pdf',
                            proofData: a.proofData || null,
                            color: '#1A73E8',
                            iconKey: 'award'
                          }).replace(/"/g, '&quot;');
                          return `<button type="button" class="btn btn-ghost btn-sm" style="font-size:11px;" onclick="if(window.AscendViews&&window.AscendViews.openProofViewerModal){AscendViews.openProofViewerModal(${achJson})}else{AscendUI.showToast('Evidence document preview opened.','info')}">${Icons.fileText || Icons.file} View Proof</button>`;
                        }
                      })()}
                    </div>
                  </div>` : ''}
              </div>`;
          }).join('')}
        </div>`}
    </div>

    <!-- ═══════════ Tab 3: Feedback (Faculty Mentorship Feedback History) ═══════════ -->
    <div id="fsd-tab-feedback" class="fsd-tab-content ${activeTab === 'feedback' ? 'active' : ''}">
      <div style="margin-bottom:var(--sp-5);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);">
        <div>
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Faculty Feedback History</div>
          <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
            Direct actionable guidance, recommended next steps, and follow-up milestones sent to ${s.name || 'this student'}.
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="FacultyViews.openDetailFeedbackModal('${s.id}')">
          ${Icons.messageSquare} Send New Feedback
        </button>
      </div>

      ${stuFeedback.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">${Icons.messageSquare}</div>
          <div class="empty-state-title">No feedback recorded yet</div>
          <div class="empty-state-desc">Send structured mentor guidance to assist ${s.name || 'this student'}'s development.</div>
          <button class="btn btn-primary btn-sm" onclick="FacultyViews.openDetailFeedbackModal('${s.id}')">Send First Feedback</button>
        </div>` :
        `<div style="display:flex;flex-direction:column;gap:var(--sp-4);">
          ${stuFeedback.map(fb => `
            <div class="card" style="padding:var(--sp-5);">
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);margin-bottom:var(--sp-3);">
                <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
                  <span class="badge badge-primary" style="font-size:11px;font-weight:600;">${fb.category || 'General'}</span>
                  <span style="font-size:var(--text-xs);color:var(--c-text-3);">
                    ${fb.fromName ? 'By ' + fb.fromName + ' · ' : ''}${formatDate(fb.date)}
                  </span>
                </div>
                <div style="display:flex;align-items:center;gap:var(--sp-2);">
                  <span class="badge ${fb.isRead ? 'badge-normal' : 'badge-feedback'}" style="font-size:10px;">
                    ${fb.isRead ? 'Read by student' : 'Unread'}
                  </span>
                  ${fb.followUpDate ? `
                    <span class="badge badge-review" style="font-size:10px;">
                      Follow-up: ${formatDate(fb.followUpDate)}
                    </span>` : ''}
                </div>
              </div>

              <div style="font-size:var(--text-sm);color:var(--c-text);line-height:1.7;margin-bottom:${fb.recommendedNextStep ? 'var(--sp-3)' : '0'};">
                ${fb.message || fb.feedbackText || ''}
              </div>

              ${fb.recommendedNextStep ? `
                <div style="padding:var(--sp-3);background:var(--c-bg);border-left:3px solid var(--c-primary);border-radius:0 var(--r-md) var(--r-md) 0;">
                  <div style="font-size:11px;font-weight:700;color:var(--c-primary);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:3px;">Recommended Next Step</div>
                  <div style="font-size:var(--text-xs);color:var(--c-text);font-weight:500;line-height:1.5;">${fb.recommendedNextStep}</div>
                </div>` : ''}

              <div style="display:flex;justify-content:flex-end;margin-top:var(--sp-3);">
                <button class="btn btn-ghost btn-sm" style="color:var(--c-rejected);border:1px solid var(--c-border);" onclick="FacultyViews.deleteFeedback('${fb.id}', '${s.id}')" title="Delete Feedback">
                  ${Icons.trash} Delete
                </button>
              </div>
            </div>`).join('')}
        </div>`}
    </div>

    <!-- ═══════════ Tab 4: Evaluation (Personalised Feedback & Evaluation History) ═══════════ -->
    <div id="fsd-tab-evaluation" class="fsd-tab-content ${activeTab === 'evaluation' ? 'active' : ''}">
      <div style="margin-bottom:var(--sp-5);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);">
        <div>
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Personalised Evaluation History</div>
          <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
            Rubric competency assessments across core criteria and overall faculty recommendations for ${s.name || 'this student'}.
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="FacultyViews.openDetailNewEvalModal('${s.id}')">
          ${Icons.plus} Start Evaluation
        </button>
      </div>

      ${stuEvaluations.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">${Icons.fileText}</div>
          <div class="empty-state-title">No evaluations on file</div>
          <div class="empty-state-desc">Evaluate ${s.name || 'this student'} against the department development rubric to record personalized assessments.</div>
          <button class="btn btn-primary btn-sm" onclick="FacultyViews.openDetailNewEvalModal('${s.id}')">Start First Evaluation</button>
        </div>` :
        `<div style="display:flex;flex-direction:column;gap:var(--sp-5);">
          ${stuEvaluations.map(ev => {
            const criteriaList = [
              { key: 'technical',          label: 'Technical Competency' },
              { key: 'projectAbility',     label: 'Project / Application Ability' },
              { key: 'communication',      label: 'Communication' },
              { key: 'leadership',         label: 'Collaboration & Leadership' },
              { key: 'careerPreparedness', label: 'Career Preparedness' },
            ];
            return `
              <div class="card" style="padding:var(--sp-5);">
                <!-- Header -->
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--sp-3);flex-wrap:wrap;margin-bottom:var(--sp-5);padding-bottom:var(--sp-4);border-bottom:1px solid var(--c-border);">
                  <div>
                    <div style="font-size:var(--text-lg);font-weight:700;color:var(--c-text);">${ev.evaluationPeriod}</div>
                    <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:4px;">
                      Evaluated by ${ev.evaluatorName || 'Faculty Advisor'} · ${ev.status === 'published' ? 'Published on ' + formatDate(ev.publishedAt) : 'Draft saved ' + formatDate(ev.lastUpdated)}
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:var(--sp-2);">
                    <span class="badge ${ev.status === 'published' ? 'badge-verified' : 'badge-draft'}" style="font-size:11px;">
                      ${ev.status === 'published' ? 'Published to Student' : 'Draft in Progress'}
                    </span>
                    <button class="btn btn-outline btn-sm" onclick="FacultyViews.openEditEvalModal('${ev.id}')">
                      Edit
                    </button>
                    <button class="btn btn-ghost btn-sm" style="color:var(--c-rejected);border:1px solid var(--c-border);" onclick="FacultyViews.deleteEvaluation('${ev.id}', '${s.id}')" title="Delete Evaluation">
                      ${Icons.trash} Delete
                    </button>
                  </div>
                </div>

                <!-- 5 Criteria Ratings -->
                <div style="font-size:11px;font-weight:700;color:var(--c-text-3);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:var(--sp-3);">
                  Rubric Assessment Criteria
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:var(--sp-3);margin-bottom:var(--sp-5);">
                  ${criteriaList.map(c => {
                    const item = ev.scores ? ev.scores[c.key] : null;
                    const level = (item && item.level) || 'Developing';
                    const comm = (item && item.comment) || '';
                    return `
                      <div style="padding:var(--sp-3);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:${comm ? '8px' : '0'};">
                          <div style="font-size:11px;font-weight:700;color:var(--c-text);text-transform:uppercase;letter-spacing:0.04em;">${c.label}</div>
                          ${rubricLevelBadge(level)}
                        </div>
                        ${comm ? `<div style="font-size:var(--text-xs);color:var(--c-text-2);line-height:1.5;font-style:italic;">"${comm}"</div>` : ''}
                      </div>`;
                  }).join('')}
                </div>

                <!-- Overall Faculty Summary -->
                <div style="padding:var(--sp-4);background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);">
                  <div style="font-size:11px;font-weight:700;color:var(--c-text-3);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:var(--sp-2);">
                    Overall Faculty Summary & Recommendations
                  </div>
                  <div style="font-size:var(--text-sm);color:var(--c-text);line-height:1.75;">
                    ${ev.overallSummary || '<span style="color:var(--c-text-3);font-style:italic;">No summary provided yet.</span>'}
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>`}
    </div>

    <!-- Student Detail Feedback Modal -->
    <div id="fsd-detail-feedback-modal" class="modal-overlay">
      <div class="modal" style="max-width:560px;">
        <div class="modal-header">
          <span class="modal-title">Send Feedback to ${s.name || 'Student'}</span>
          <button class="modal-close" onclick="AscendUI.closeModal('fsd-detail-feedback-modal')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:var(--sp-4);">
          <div>
            <label class="form-label">Category <span class="required">*</span></label>
            <select class="form-input form-select" id="fsd-fb-category" onchange="FacultyViews.updateDetailNextStepLabel()">
              <option value="Portfolio">Portfolio</option>
              <option value="Career Direction">Career Direction</option>
              <option value="Project">Project</option>
              <option value="Skill Development">Skill Development</option>
              <option value="General">General</option>
            </select>
          </div>
          <div>
            <label class="form-label" for="fsd-fb-message">Feedback Message <span class="required">*</span></label>
            <textarea class="form-input form-textarea" id="fsd-fb-message" rows="4" placeholder="Provide constructive mentorship guidance…"></textarea>
          </div>
          <div>
            <label class="form-label" for="fsd-fb-next-step">
              <span id="fsd-fb-next-step-label">Recommended Next Step</span>
              <span class="required" id="fsd-fb-next-step-req">*</span>
              <span id="fsd-fb-next-step-opt" style="display:none;color:var(--c-text-2);font-weight:400;"> (optional)</span>
            </label>
            <input class="form-input" id="fsd-fb-next-step" placeholder="e.g. Publish project repository with architecture diagram">
          </div>
          <div>
            <label class="form-label">Optional Follow-up Date</label>
            <input class="form-input" type="date" id="fsd-fb-followup-date">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="AscendUI.closeModal('fsd-detail-feedback-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="FacultyViews.submitDetailFeedback('${s.id}', '${s.name}', '${s.classId || ''}')">Send Feedback</button>
        </div>
      </div>
    </div>`;
}

/* ── Modal & Action Handlers ─────────────────────────────────── */
function openStudentPublicPortfolio(studentId) {
  AscendApp.navigate('public-portfolio');
}

function openDetailFeedbackModal(studentId) {
  AscendUI.openModal('fsd-detail-feedback-modal');
}

function submitDetailFeedback(studentId, studentName, classId) {
  const category    = document.getElementById('fsd-fb-category')?.value || 'General';
  const message     = document.getElementById('fsd-fb-message')?.value.trim();
  const nextStep    = document.getElementById('fsd-fb-next-step')?.value.trim();
  const followUpDate = document.getElementById('fsd-fb-followup-date')?.value || null;

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
    classId: classId || window.AscendFacultyData.selectedClassId || 'class-cse-5a',
    category,
    message,
    recommendedNextStep: nextStep,
    followUpDate,
  });

  AscendUI.closeModal('fsd-detail-feedback-modal');
  AscendUI.showToast(`Feedback sent to ${studentName}!`, 'success');
  AscendApp.navigate('faculty-student-detail');
}

function openDetailNewEvalModal(studentId) {
  window._newEvalStudentId = studentId;
  AscendApp.navigate('faculty-evaluations');
}

function openStudentDetail(studentId) {
  window._facultySelectedStudentId = studentId;
  window._facultySelectedStudentTab = 'overview';
  AscendApp.navigate('faculty-student-detail');
}

/* ── Monthly Activity Section Renderer (Overview & Activity) ─── */
function renderStudentDetailMonthlyActivitySection(s) {

  const { Icons, formatDate } = window.AscendUI;
  const summaries = Array.isArray(s.monthlySummaries) && s.monthlySummaries.length > 0
    ? s.monthlySummaries
    : [
        {
          month: 'September 2026',
          monthKey: '2026-09',
          achievementsAdded: (s.achievements || []).length,
          achievementTitles: (s.achievements || []).map(a => a.title),
          projectsUpdated: (s.projects || []).length,
          projectTitles: (s.projects || []).map(p => p.title),
          feedbackReceived: 1,
          lastActivityFormatted: '4 days ago',
          reviewedByStudent: !!s.monthlyReviewed,
          summaryText: s.latestMonthlySummary || 'September summary: Activity recorded.',
        },
        {
          month: 'August 2026',
          monthKey: '2026-08',
          achievementsAdded: 1,
          achievementTitles: ['Full-Stack Engineering Workshop'],
          projectsUpdated: 0,
          projectTitles: [],
          feedbackReceived: 1,
          lastActivityFormatted: 'August 20, 2026',
          reviewedByStudent: true,
          summaryText: 'August summary: 1 achievement added, 0 projects updated, 1 faculty feedback note received. Last portfolio activity: August 20, 2026.',
        },
        {
          month: 'July 2026',
          monthKey: '2026-07',
          achievementsAdded: 0,
          achievementTitles: [],
          projectsUpdated: 0,
          projectTitles: [],
          feedbackReceived: 0,
          lastActivityFormatted: 'July 15, 2026',
          reviewedByStudent: true,
          summaryText: 'July summary: 0 achievements added, 0 projects updated, 0 faculty feedback notes received. Profile details initialized.',
        }
      ];

  const selectedKey = window._fsdSelectedMonthKey || (summaries[0] ? summaries[0].monthKey : '2026-09');
  const currentSummary = summaries.find(m => m.monthKey === selectedKey) || summaries[0];
  const isReviewed = !!currentSummary.reviewedByStudent;

  // Filter achievements, projects, feedback for this month
  const monthAchs = (s.achievements || []).filter(a => {
    if (!a.date) return false;
    return a.date.startsWith(selectedKey);
  });
  const monthProjs = (s.projects || []).filter(p => {
    if (!p.date) return false;
    return p.date.startsWith(selectedKey);
  });

  return `
    <div class="card" id="fsd-monthly-activity-section" style="padding:var(--sp-5);margin-top:var(--sp-4);border-left:4px solid var(--c-primary);">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:var(--sp-4);">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:var(--r-md);background:var(--c-primary-light);color:var(--c-primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${Icons.clock}
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Monthly Activity Record</span>
              <select class="form-input form-select" id="fsd-month-select"
                style="padding:3px 26px 3px 10px;font-size:12px;font-weight:600;width:auto;border-radius:var(--r-sm);height:auto;"
                onchange="FacultyViews.onSelectStudentDetailMonth(this.value)">
                ${summaries.map(m => `
                  <option value="${m.monthKey}" ${m.monthKey === selectedKey ? 'selected' : ''}>
                    ${m.month}
                  </option>`).join('')}
              </select>
            </div>
            <div style="font-size:11px;color:var(--c-text-3);margin-top:2px;">
              Factual student development timeline &bull; Monthly activity summary
            </div>
          </div>
        </div>

        <div>
          ${isReviewed ? `
            <span class="badge" style="background:#E8F0FE;color:#1A73E8;border:1px solid #C2D8FF;font-weight:600;font-size:11.5px;padding:4px 10px;display:inline-flex;align-items:center;gap:5px;">
              ${Icons.check} Reviewed by Student
            </span>` : `
            <span class="badge" style="background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;font-weight:600;font-size:11.5px;padding:4px 10px;display:inline-flex;align-items:center;gap:5px;">
              ${Icons.clock} Pending Student Review
            </span>`}
        </div>
      </div>

      <!-- Factual Summary Box -->
      <div style="padding:14px 16px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);margin-bottom:var(--sp-4);">
        <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);line-height:1.5;">
          ${currentSummary.summaryText}
        </div>
        <div style="font-size:11px;color:var(--c-text-3);margin-top:6px;">
          Record type: Factual activity digest &bull; Not a grade or performance score
        </div>
      </div>

      <!-- Factual Timeline of Events in Selected Month -->
      <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
        <div style="font-size:var(--text-xs);font-weight:700;color:var(--c-text-2);text-transform:uppercase;letter-spacing:0.04em;">
          Activity Log for ${currentSummary.month}
        </div>

        ${(currentSummary.achievementTitles && currentSummary.achievementTitles.length > 0) || (currentSummary.projectTitles && currentSummary.projectTitles.length > 0) ? `
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${(currentSummary.achievementTitles || []).map(title => `
              <div style="padding:10px 14px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-sm);display:flex;align-items:center;gap:10px;">
                <span style="color:var(--c-primary);">${Icons.award}</span>
                <div style="flex:1;min-width:0;">
                  <span style="font-size:var(--text-xs);font-weight:600;color:var(--c-text);">${title}</span>
                  <span class="badge badge-normal" style="font-size:10px;margin-left:6px;">Achievement</span>
                </div>
              </div>`).join('')}

            ${(currentSummary.projectTitles || []).map(title => `
              <div style="padding:10px 14px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-sm);display:flex;align-items:center;gap:10px;">
                <span style="color:#059669;">${Icons.folder}</span>
                <div style="flex:1;min-width:0;">
                  <span style="font-size:var(--text-xs);font-weight:600;color:var(--c-text);">${title}</span>
                  <span class="badge badge-normal" style="font-size:10px;margin-left:6px;">Project</span>
                </div>
              </div>`).join('')}
          </div>` : `
          <div style="padding:14px;background:var(--c-bg);border:1px dashed var(--c-border);border-radius:var(--r-sm);font-size:var(--text-xs);color:var(--c-text-3);text-align:center;">
            No portfolio additions or project updates were recorded in ${currentSummary.month}.
          </div>`}
      </div>
    </div>`;
}

function onSelectStudentDetailMonth(monthKey) {
  window._fsdSelectedMonthKey = monthKey;
  const section = document.getElementById('fsd-monthly-activity-section');
  if (section && window._facultySelectedStudentId) {
    const student = (window.AscendFacultyData.students || []).find(st => st.id === window._facultySelectedStudentId);
    if (student) {
      section.outerHTML = renderStudentDetailMonthlyActivitySection(student);
    }
  }
}

window.FacultyViews = window.FacultyViews || {};
Object.assign(window.FacultyViews, {
  studentDetail: renderFacultyStudentDetail,
  switchStudentDetailTab,
  openStudentPublicPortfolio,
  openDetailFeedbackModal,
  submitDetailFeedback,
  openDetailNewEvalModal,
  openStudentDetail,
  onSelectStudentDetailMonth,
  updateDetailNextStepLabel() {
    const catEl = document.getElementById('fsd-fb-category');
    if (!catEl) return;
    const isGeneral = catEl.value === 'General';
    const reqEl = document.getElementById('fsd-fb-next-step-req');
    const optEl = document.getElementById('fsd-fb-next-step-opt');
  },
});

