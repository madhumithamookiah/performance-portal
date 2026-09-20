/**
 * ASCEND – Faculty Student Detail View (7 Tabs)
 * 1. Overview
 * 2. Achievements (Student-submitted, private evidence documents, zero verification badges)
 * 3. Projects (Student-submitted projects with tech stack, repo, and demo links)
 * 4. Skills (Domain competency matrix)
 * 5. Feedback (Mentor guidance history with recommended next steps and follow-ups)
 * 6. Evaluations (Rubric criteria assessments, qualitative levels, faculty summary)
 * 7. Activity (Portfolio additions, edits, feedback, and evaluations only)
 *
 * Professional UI with zero emojis and clean SVG icons.
 */

/* ── Tab Switcher ────────────────────────────────────────────── */
function switchStudentDetailTab(tabId) {
  window._facultySelectedStudentTab = tabId;
  document.querySelectorAll('.fsd-tab-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.fsd-tab-content').forEach(el => el.classList.remove('active'));
  const tab = document.querySelector(`.fsd-tab-item[data-sdtab="${tabId}"]`);
  const content = document.getElementById(`fsd-tab-${tabId}`);
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

/* ── Main Render ─────────────────────────────────────────────── */
function renderFacultyStudentDetail(paramId, paramTab) {
  const { students, facultyFeedback, evaluations } = window.AscendFacultyData;
  const { Icons, skillTag, formatDate } = window.AscendUI;
  const currentRole = window.AscendApp?.getCurrentRole?.() || sessionStorage.getItem('ascend_role');

  const studentId = paramId || window._facultySelectedStudentId || (students && students[0] ? students[0].id : 'stu-000');
  let rawTab = paramTab || window._facultySelectedStudentTab || 'overview';
  if (currentRole === 'admin' && rawTab === 'evaluations') rawTab = 'overview';
  // Remap old tab IDs that were merged into Portfolio
  const tabRemap = { achievements: 'portfolio', projects: 'portfolio', skills: 'portfolio' };
  const activeTab = tabRemap[rawTab] || rawTab;
  const s = (students && students.find(st => st.id === studentId)) || (students && students[0]) || {};

  // Retrieve student-submitted achievements, projects, and activities
  let achievements = (s.achievements && s.achievements.length > 0) ? s.achievements : [];
  let projects = (s.projects && s.projects.length > 0) ? s.projects : [];

  // For Aarav Sharma (stu-001), sync dynamically with AscendData
  if (s.id === 'stu-001' && window.AscendData) {
    if (Array.isArray(window.AscendData.achievements) && window.AscendData.achievements.length > 0) {
      achievements = window.AscendData.achievements;
    }
    if (Array.isArray(window.AscendData.projects) && window.AscendData.projects.length > 0) {
      projects = window.AscendData.projects;
    }
  }

  if (achievements.length === 0) {
    achievements = [{
      id: `ach-${s.id}-1`,
      title: s.latestUpdate ? s.latestUpdate.title : 'Technical Milestone',
      category: s.latestUpdate ? s.latestUpdate.type : 'Certification',
      organization: s.department,
      date: s.lastActivity || '2026-08-15',
      description: 'Student-submitted portfolio achievement with supporting documentation.',
      skills: ['Problem Solving', 'Technical Implementation'],
      evidenceDoc: `${s.name.replace(/\s+/g, '_')}_Evidence_Document.pdf`,
      proofLink: null,
      isStudentSubmitted: true,
    }];
  }

  if (projects.length === 0) {
    projects = [{
      id: `proj-${s.id}-1`,
      title: `${s.program} Capstone Prototype`,
      description: 'Comprehensive software engineering project addressing department domain challenges.',
      techStack: ['Python', 'PostgreSQL', 'Docker', 'React'],
      githubLink: s.github || 'https://github.com',
      liveDemoLink: s.portfolioUrl || null,
      date: '2026-08-15',
    }];
  }

  const stuFeedback = facultyFeedback.filter(f => f.toStudentId === s.id);
  const stuEvaluations = evaluations.filter(e => e.studentId === s.id);
  const latestEval = stuEvaluations.find(e => e.status === 'published') || stuEvaluations[0];

  const activities = (s.activity && s.activity.length > 0) ? s.activity : [
    {
      id: `act-${s.id}-1`,
      type: 'portfolio-add',
      title: `Added record: "${achievements[0]?.title || 'Achievement'}"`,
      timestamp: s.latestUpdate?.formattedDate || 'Recently',
      date: '2026-09-01T10:00:00Z',
      detail: 'Submitted portfolio milestone with private evidence document.',
    },
  ];

  // Skills domain structure
  const skillsData = s.skills ? {
    Technical: [
      { name: 'Core Technical Competency', level: s.skills.Technical || 80 },
      { name: 'Systems Architecture', level: Math.round((s.skills.Technical || 80) * 0.9) },
      { name: 'Algorithmic Problem Solving', level: Math.round((s.skills.Technical || 80) * 0.85) },
    ],
    Communication: [
      { name: 'Technical Documentation', level: s.skills.Communication || 75 },
      { name: 'Presentation & Demonstration', level: Math.round((s.skills.Communication || 75) * 0.9) },
    ],
    Leadership: [
      { name: 'Team Collaboration', level: s.skills.Leadership || 70 },
      { name: 'Mentorship & Initiative', level: Math.round((s.skills.Leadership || 70) * 0.85) },
    ],
    Innovation: [
      { name: 'Creative Problem Solving', level: s.skills.Innovation || 85 },
      { name: 'Research & Novel Approaches', level: Math.round((s.skills.Innovation || 85) * 0.9) },
    ],
    'Career Readiness': [
      { name: 'Industry Practices & Workflow', level: s.skills.CareerReadiness || 80 },
      { name: 'Portfolio & Public Artifacts', level: Math.round((s.skills.CareerReadiness || 80) * 0.95) },
    ],
  } : {};

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

    <!-- Student Header Card -->
    <div class="card" style="margin-bottom:var(--sp-5);padding:var(--sp-5);">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-4);">
        <!-- Student Identity -->
        <div style="display:flex;align-items:flex-start;gap:var(--sp-4);">
          <div class="avatar avatar-lg" style="background:var(--c-primary-light);color:var(--c-primary);font-size:1.5rem;font-weight:700;flex-shrink:0;">
            ${s.initials}
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:var(--sp-3);flex-wrap:wrap;">
              <h1 style="font-size:var(--text-2xl);font-weight:700;margin:0;letter-spacing:-0.025em;color:var(--c-text);">
                ${s.name}
              </h1>
              <span class="badge badge-normal" style="font-family:monospace;font-size:var(--text-xs);font-weight:600;">
                ${s.rollNo}
              </span>
            </div>
            <div style="font-size:var(--text-base);font-weight:500;color:var(--c-text-2);margin-top:2px;">
              ${s.degree || s.program || ''} · ${s.section || ''}
            </div>
            <div style="display:flex;align-items:center;gap:var(--sp-4);margin-top:var(--sp-2);flex-wrap:wrap;font-size:var(--text-xs);color:var(--c-text-2);">
              ${s.email ? `<span style="display:flex;align-items:center;gap:4px;">${Icons.mail} ${s.email}</span>` : ''}
              ${(s.graduationYear || s.year) ? `<span style="display:flex;align-items:center;gap:4px;">${Icons.calendar} ${s.graduationYear ? 'Class of ' + s.graduationYear : ''}${s.year ? ' (Year ' + s.year + ')' : ''}</span>` : ''}
              ${s.mentorName ? `<span style="display:flex;align-items:center;gap:4px;">${Icons.user} Advisor: ${s.mentorName}</span>` : ''}
            </div>

            <!-- Factual Attention Signal Banner -->
            ${s.attentionStatus && s.attentionStatus !== 'none' && s.attentionReason ? `
              <div style="margin-top:var(--sp-3);display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:var(--c-review-bg);border:1px solid var(--c-review-border);border-radius:var(--r-sm);font-size:var(--text-xs);color:var(--c-review);font-weight:600;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                ${s.attentionReason}
              </div>` : ''}
          </div>
        </div>

        <!-- Header Actions: View Public Portfolio, Send Feedback, Start Evaluation -->
        <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);align-items:center;">
          <button class="btn btn-outline btn-sm" onclick="FacultyViews.openStudentPublicPortfolio('${s.id}')" title="Preview public portfolio visible to external recruiters">
            ${Icons.externalLink} View Public Portfolio
          </button>
          <button class="btn btn-outline btn-sm" onclick="FacultyViews.openDetailFeedbackModal('${s.id}')">
            ${Icons.messageSquare} Send Feedback
          </button>
          ${currentRole !== 'admin' ? (latestEval ? `
            <button class="btn btn-primary btn-sm" onclick="FacultyViews.switchStudentDetailTab('evaluations')">
              ${Icons.fileText} View Evaluation
            </button>` : `
            <button class="btn btn-primary btn-sm" onclick="FacultyViews.openDetailNewEvalModal('${s.id}')">
              ${Icons.plus} Start Evaluation
            </button>`) : ''}
        </div>
      </div>
    </div>

    <!-- 5 Navigation Tabs: Overview · Portfolio · Feedback · Evaluations · Activity -->
    <div class="tabs fsd-tabs" id="fsd-tab-bar" style="margin-bottom:var(--sp-5);">
      <button class="tab-item fsd-tab-item ${activeTab === 'overview' ? 'active' : ''}" data-sdtab="overview" onclick="FacultyViews.switchStudentDetailTab('overview')">Overview</button>
      <button class="tab-item fsd-tab-item ${activeTab === 'portfolio' ? 'active' : ''}" data-sdtab="portfolio" onclick="FacultyViews.switchStudentDetailTab('portfolio')">Portfolio</button>
      <button class="tab-item fsd-tab-item ${activeTab === 'feedback' ? 'active' : ''}" data-sdtab="feedback" onclick="FacultyViews.switchStudentDetailTab('feedback')">Feedback (${stuFeedback.length})</button>
      ${currentRole !== 'admin' ? `<button class="tab-item fsd-tab-item ${activeTab === 'evaluations' ? 'active' : ''}" data-sdtab="evaluations" onclick="FacultyViews.switchStudentDetailTab('evaluations')">Evaluations (${stuEvaluations.length})</button>` : ''}
      <button class="tab-item fsd-tab-item ${activeTab === 'activity' ? 'active' : ''}" data-sdtab="activity" onclick="FacultyViews.switchStudentDetailTab('activity')">Activity</button>
    </div>

    <!-- ═══════════ Tab 1: Overview ═══════════ -->
    <div id="fsd-tab-overview" class="fsd-tab-content ${activeTab === 'overview' ? 'active' : ''}">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-5);" class="faculty-grid-2">
        <!-- Bio & Interests -->
        <div class="card">
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin-bottom:var(--sp-3);">
            Professional Bio
          </div>
          <div style="font-size:var(--text-sm);color:var(--c-text-2);line-height:1.7;margin-bottom:var(--sp-4);">
            ${s.bio || '<span style="color:var(--c-text-3);font-style:italic;">No bio provided by student yet.</span>'}
          </div>

          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin-bottom:var(--sp-2);">
            Career Interests
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);margin-bottom:var(--sp-4);">
            ${(s.careerInterests && s.careerInterests.length > 0)
              ? s.careerInterests.map(c => skillTag(c)).join('')
              : '<span style="color:var(--c-text-3);font-size:var(--text-xs);">No career interests listed.</span>'}
          </div>

          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin-bottom:var(--sp-2);">
            External Profiles
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--sp-2);">
            <div style="font-size:var(--text-xs);color:var(--c-text-2);display:flex;align-items:center;gap:8px;">
              <span style="font-weight:600;width:70px;">GitHub:</span>
              ${s.github ? `<a href="${s.github}" target="_blank" style="color:var(--c-primary);">${s.github}</a>` : '<span style="color:var(--c-text-3);">Not linked</span>'}
            </div>
            <div style="font-size:var(--text-xs);color:var(--c-text-2);display:flex;align-items:center;gap:8px;">
              <span style="font-weight:600;width:70px;">LinkedIn:</span>
              ${s.linkedIn ? `<a href="${s.linkedIn}" target="_blank" style="color:var(--c-primary);">${s.linkedIn}</a>` : '<span style="color:var(--c-text-3);">Not linked</span>'}
            </div>
            <div style="font-size:var(--text-xs);color:var(--c-text-2);display:flex;align-items:center;gap:8px;">
              <span style="font-weight:600;width:70px;">Portfolio:</span>
              ${s.portfolioUrl ? `<a href="${s.portfolioUrl}" target="_blank" style="color:var(--c-primary);">${s.portfolioUrl}</a>` : '<span style="color:var(--c-text-3);">Not published</span>'}
            </div>
          </div>
        </div>

        <!-- Academic Oversight Summary -->
        <div class="card">
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin-bottom:var(--sp-3);">
            Development Summary
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
            <div style="display:flex;justify-content:space-between;padding-bottom:var(--sp-2);border-bottom:1px solid var(--c-border);font-size:var(--text-sm);">
              <span style="color:var(--c-text-3);">Portfolio Submissions:</span>
              <span style="font-weight:700;color:var(--c-text);">${achievements.length} records</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding-bottom:var(--sp-2);border-bottom:1px solid var(--c-border);font-size:var(--text-sm);">
              <span style="color:var(--c-text-3);">Featured Projects:</span>
              <span style="font-weight:700;color:var(--c-text);">${projects.length} projects</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding-bottom:var(--sp-2);border-bottom:1px solid var(--c-border);font-size:var(--text-sm);">
              <span style="color:var(--c-text-3);">Profile Setup Status:</span>
              <span style="font-weight:600;color:${s.profileSetupStatus === 'complete' ? 'var(--c-verified)' : 'var(--c-rejected)'};">
                ${s.profileSetupStatus === 'complete' ? 'Complete' : 'Incomplete'}
              </span>
            </div>
            ${s.profileSetupStatus === 'incomplete' && s.missingProfileFields && s.missingProfileFields.length > 0 ? `
              <div style="padding:var(--sp-3);background:var(--c-review-bg);border-radius:var(--r-md);font-size:var(--text-xs);color:var(--c-review);">
                <div style="font-weight:600;margin-bottom:2px;">Missing profile information:</div>
                ${s.missingProfileFields.join(', ')}
              </div>` : ''}
            <div style="display:flex;justify-content:space-between;padding-bottom:var(--sp-2);border-bottom:1px solid var(--c-border);font-size:var(--text-sm);">
              <span style="color:var(--c-text-3);">Latest Activity:</span>
              <span style="font-weight:500;color:var(--c-text);">${s.latestUpdate?.formattedDate || 'None recorded'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-sm);">
              <span style="color:var(--c-text-3);">Evaluation State:</span>
              <span style="font-weight:600;">${latestEval ? (latestEval.status === 'published' ? 'Evaluated (Published)' : 'Draft in progress') : 'Pending evaluation'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════ Tab 2: Portfolio (Achievements + Projects + Skills) ═══════════ -->
    <div id="fsd-tab-portfolio" class="fsd-tab-content ${activeTab === 'portfolio' ? 'active' : ''}">
      <div style="margin-bottom:var(--sp-4);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);">
        <div>
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Student-Submitted Records</div>
          <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
            Self-submitted portfolio achievements. Supporting evidence documents remain strictly private between student and faculty.
          </div>
        </div>
        <span class="badge badge-normal" style="font-size:var(--text-xs);">
          ${achievements.length} self-submitted record${achievements.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style="display:flex;flex-direction:column;gap:var(--sp-4);">
        ${achievements.map(a => `
          <div class="card" style="padding:var(--sp-4);">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--sp-3);flex-wrap:wrap;margin-bottom:var(--sp-2);">
              <div>
                <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
                  <span style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">${a.title}</span>
                  <span class="badge badge-normal" style="font-size:11px;">${a.category}</span>
                  <span class="badge" style="background:var(--c-surface);border:1px solid var(--c-border);color:var(--c-text-3);font-size:10px;">Self-Submitted</span>
                </div>
                <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:4px;">
                  ${a.organization} · Recorded ${formatDate(a.date)}
                </div>
              </div>
            </div>

            <div style="font-size:var(--text-sm);color:var(--c-text-2);line-height:1.6;margin-bottom:var(--sp-3);">
              ${a.description}
            </div>

            ${a.skills && a.skills.length > 0 ? `
              <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);margin-bottom:var(--sp-3);">
                ${a.skills.map(sk => skillTag(sk)).join('')}
              </div>` : ''}

            <!-- Private Evidence Section (Private to Faculty & Student only) -->
            ${a.evidenceDoc || a.proofLink ? `
              <div style="padding:var(--sp-3);background:var(--c-bg);border:1px dashed var(--c-border);border-radius:var(--r-md);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);">
                <div style="display:flex;align-items:center;gap:8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--c-primary);flex-shrink:0;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <div>
                    <div style="font-size:var(--text-xs);font-weight:600;color:var(--c-text);">
                      ${a.evidenceDoc || 'Supporting Evidence Document'}
                    </div>
                    <div style="font-size:10px;color:var(--c-text-3);">
                      Private to faculty/student context · Never displayed on public portfolio
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
                    } else if (proof || a.proofData || a.proofFileName || a.evidenceDoc) {
                      const achDataJson = JSON.stringify({
                        id: a.id || 'ach-fac-doc',
                        title: a.title,
                        category: a.category || 'Certification',
                        organization: a.organization || 'Institutional Verification',
                        date: a.date || new Date().toISOString().split('T')[0],
                        skills: a.skills || [],
                        description: a.description || '',
                        proofLink: a.proofLink || 'Certificate Attached',
                        proofFileName: a.proofFileName || a.evidenceDoc || 'Supporting_Evidence.pdf',
                        proofData: a.proofData || null,
                        color: '#1A73E8',
                        iconKey: 'award'
                      }).replace(/"/g, '&quot;');
                      return `<button type="button" class="btn btn-ghost btn-sm" style="font-size:11px;" onclick="if(window.AscendViews&&window.AscendViews.openProofViewerModal){AscendViews.openProofViewerModal(${achDataJson})}else{AscendUI.showToast('Evidence document preview opened in secure viewer.','info')}">${Icons.fileText || Icons.file} View Proof</button>`;
                    } else {
                      return `<button type="button" class="btn btn-ghost btn-sm" style="font-size:11px;" onclick="AscendUI.showToast('Evidence document preview opened in secure viewer.','info')">${Icons.download} Download</button>`;
                    }
                  })()}
                </div>
              </div>` : ''}
          </div>`).join('')}
      </div>
    </div>

      <!-- ── Projects sub-section ─────────────────────────────── -->
      <div style="margin-top:var(--sp-6);margin-bottom:var(--sp-4);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);">
        <div>
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Projects</div>
          <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">Technical projects, architectures, repositories, and demonstration deployments.</div>
        </div>
        <span class="badge badge-normal" style="font-size:var(--text-xs);">${projects.length} project${projects.length !== 1 ? 's' : ''}</span>
      </div>

      <div style="display:flex;flex-direction:column;gap:var(--sp-4);">
        ${projects.map(p => `
          <div class="card" style="padding:var(--sp-4);">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--sp-3);flex-wrap:wrap;margin-bottom:var(--sp-2);">
              <div>
                <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">${p.title}</div>
                <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">${p.date ? 'Recorded ' + formatDate(p.date) : ''}</div>
              </div>
              <div style="display:flex;gap:var(--sp-2);">
                ${(p.githubLink || p.repoUrl) ? `<a href="${p.githubLink || p.repoUrl}" target="_blank" class="btn btn-outline btn-sm">${Icons.github || Icons.code} Repository</a>` : ''}
                ${(p.liveDemoLink || p.liveUrl) ? `<a href="${p.liveDemoLink || p.liveUrl}" target="_blank" class="btn btn-primary btn-sm">${Icons.externalLink} Live Demo</a>` : ''}
              </div>
            </div>
            <div style="font-size:var(--text-sm);color:var(--c-text-2);line-height:1.6;margin-bottom:var(--sp-3);">${p.description}</div>
            ${(p.techStack || p.skills) && (p.techStack || p.skills).length > 0 ? `
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <span style="font-size:11px;font-weight:600;color:var(--c-text-2);text-transform:uppercase;">Stack:</span>
                ${(p.techStack || p.skills).map(t => `<span class="badge badge-normal" style="font-size:11px;">${t}</span>`).join('')}
              </div>` : ''}
          </div>`).join('')}
      </div>

      <!-- ── Skills sub-section ─────────────────────────────────── -->
      <div style="margin-top:var(--sp-6);margin-bottom:var(--sp-3);">
        <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin-bottom:var(--sp-4);">Skills &amp; Competencies</div>
        ${Object.keys(skillsData).length > 0 ? `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-5);" class="faculty-grid-2">
            ${Object.entries(skillsData).map(([domain, skills]) => `
              <div class="card">
                <div style="font-size:var(--text-sm);font-weight:700;color:var(--c-text);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:var(--sp-3);">${domain}</div>
                <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
                  ${skills.map(sk => `
                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);margin-bottom:4px;">
                        <span style="font-weight:500;">${sk.name}</span>
                        <span style="color:var(--c-primary);font-weight:700;">${sk.level}%</span>
                      </div>
                      <div class="progress-bar-track" style="height:6px;">
                        <div class="progress-bar-fill" style="width:${sk.level}%;background:var(--c-primary);"></div>
                      </div>
                    </div>`).join('')}
                </div>
              </div>`).join('')}
          </div>` : `<div style="color:var(--c-text-2);font-size:var(--text-xs);">No skills data recorded for this student.</div>`}
      </div>
    </div>


    <!-- ═══════════ Tab 5: Feedback (Feedback Hub for this student) ═══════════ -->
    <div id="fsd-tab-feedback" class="fsd-tab-content ${activeTab === 'feedback' ? 'active' : ''}">
      <div style="margin-bottom:var(--sp-4);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);">
        <div>
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Mentor Guidance History</div>
          <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
            Direct actionable guidance, recommended next steps, and follow-up milestones sent to ${s.name}.
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
          <div class="empty-state-desc">Send structured mentor guidance to assist ${s.name}'s progress.</div>
          <button class="btn btn-primary btn-sm" onclick="FacultyViews.openDetailFeedbackModal('${s.id}')">Send First Feedback</button>
        </div>` :
        `<div style="display:flex;flex-direction:column;gap:var(--sp-4);">
          ${stuFeedback.map(fb => `
            <div class="card" style="padding:var(--sp-4);">
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);margin-bottom:var(--sp-3);">
                <div style="display:flex;align-items:center;gap:var(--sp-2);">
                  <span class="badge badge-primary" style="font-size:11px;font-weight:600;">${fb.category}</span>
                  <span style="font-size:var(--text-xs);color:var(--c-text-3);">${formatDate(fb.date)}</span>
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

              <div style="font-size:var(--text-sm);color:var(--c-text);line-height:1.6;margin-bottom:var(--sp-3);">
                ${fb.message}
              </div>

              ${fb.recommendedNextStep ? `
                <div style="padding:var(--sp-3);background:var(--c-bg);border-left:3px solid var(--c-primary);border-radius:0 var(--r-md) var(--r-md) 0;">
                  <div style="font-size:11px;font-weight:700;color:var(--c-primary);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:2px;">Recommended Next Step</div>
                  <div style="font-size:var(--text-xs);color:var(--c-text);font-weight:500;">${fb.recommendedNextStep}</div>
                </div>` : ''}
            </div>`).join('')}
        </div>`}
    </div>

    <!-- ═══════════ Tab 6: Evaluations (Faculty Rubric & Summary) ═══════════ -->
    <div id="fsd-tab-evaluations" class="fsd-tab-content ${activeTab === 'evaluations' ? 'active' : ''}">
      <div style="margin-bottom:var(--sp-4);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);">
        <div>
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Faculty Competency Evaluations</div>
          <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
            Qualitative assessments across the 5 core development criteria. No arbitrary quality scores.
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
          <div class="empty-state-desc">Evaluate this student against the department development rubric.</div>
          <button class="btn btn-primary btn-sm" onclick="FacultyViews.openDetailNewEvalModal('${s.id}')">Start Evaluation</button>
        </div>` :
        `<div style="display:flex;flex-direction:column;gap:var(--sp-4);">
          ${stuEvaluations.map(ev => {
            const criteriaList = [
              { key: 'technical', label: 'Technical Competency' },
              { key: 'projectAbility', label: 'Project / Application Ability' },
              { key: 'communication', label: 'Communication' },
              { key: 'leadership', label: 'Collaboration & Leadership' },
              { key: 'careerPreparedness', label: 'Career Preparedness' },
            ];
            return `
              <div class="card" style="padding:var(--sp-5);">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--sp-3);flex-wrap:wrap;margin-bottom:var(--sp-4);padding-bottom:var(--sp-3);border-bottom:1px solid var(--c-border);">
                  <div>
                    <div style="font-size:var(--text-lg);font-weight:700;color:var(--c-text);">${ev.evaluationPeriod}</div>
                    <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
                      Evaluator: ${ev.evaluatorName} · ${ev.status === 'published' ? `Published on ${formatDate(ev.publishedAt)}` : `Saved as draft on ${formatDate(ev.lastUpdated)}`}
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:var(--sp-2);">
                    <span class="badge ${ev.status === 'published' ? 'badge-verified' : 'badge-draft'}" style="font-size:11px;">
                      ${ev.status === 'published' ? 'Published to Student' : 'Draft in Progress'}
                    </span>
                    <button class="btn btn-outline btn-sm" onclick="FacultyViews.openEditEvalModal('${ev.id}')">
                      Edit
                    </button>
                  </div>
                </div>

                <!-- 5 Criteria Ratings Grid -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:var(--sp-3);margin-bottom:var(--sp-4);">
                  ${criteriaList.map(c => {
                    const item = ev.scores ? ev.scores[c.key] : null;
                    const level = (item && item.level) || 'Developing';
                    const comm = (item && item.comment) || '';
                    return `
                      <div style="padding:var(--sp-3);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);display:flex;flex-direction:column;gap:6px;">
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                          <div style="font-size:11px;font-weight:700;color:var(--c-text);text-transform:uppercase;letter-spacing:0.04em;">${c.label}</div>
                          ${rubricLevelBadge(level)}
                        </div>
                        ${comm ? `<div style="font-size:var(--text-xs);color:var(--c-text-2);line-height:1.4;margin-top:2px;">"${comm}"</div>` : ''}
                      </div>`;
                  }).join('')}
                </div>

                <!-- Overall Faculty Summary & Recommendations -->
                <div style="padding:var(--sp-4);background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);">
                  <div style="font-size:11px;font-weight:700;color:var(--c-text-3);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:var(--sp-2);">
                    Overall Faculty Summary &amp; Recommendations
                  </div>
                  <div style="font-size:var(--text-sm);color:var(--c-text);line-height:1.7;">
                    ${ev.overallSummary || 'No summary provided.'}
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>`}
    </div>

    <!-- ═══════════ Tab 7: Activity (Portfolio additions, edits, feedback, and evaluations only) ═══════════ -->
    <div id="fsd-tab-activity" class="fsd-tab-content ${activeTab === 'activity' ? 'active' : ''}">
      <div style="margin-bottom:var(--sp-4);">
        <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Activity History</div>
        <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
          Chronological timeline of portfolio additions, edits, mentor feedback, and evaluations only.
        </div>
      </div>

      <div class="card" style="padding:var(--sp-5);">
        <div style="display:flex;flex-direction:column;gap:var(--sp-4);position:relative;">
          ${activities.map(act => {
            const iconMap = {
              'portfolio-add': Icons.plusCircle || Icons.award,
              'portfolio-edit': Icons.code || Icons.tool,
              'feedback': Icons.messageSquare,
              'evaluation': Icons.fileText,
            };
            const iconColor = act.type === 'portfolio-add' ? 'var(--c-verified)' : act.type === 'feedback' ? 'var(--c-primary)' : act.type === 'evaluation' ? 'var(--c-feedback)' : 'var(--c-review)';
            return `
              <div style="display:flex;align-items:flex-start;gap:var(--sp-3);">
                <div style="width:36px;height:36px;border-radius:50%;background:var(--c-bg);border:1px solid var(--c-border);display:flex;align-items:center;justify-content:center;color:${iconColor};flex-shrink:0;">
                  ${iconMap[act.type] || Icons.fileText}
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--sp-2);flex-wrap:wrap;">
                    <div style="font-size:var(--text-sm);font-weight:700;color:var(--c-text);">${act.title}</div>
                    <div style="font-size:11px;color:var(--c-text-3);">${act.timestamp}</div>
                  </div>
                  ${act.detail ? `<div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;line-height:1.5;">${act.detail}</div>` : ''}
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Student Detail Feedback Modal (Pre-selected for this student) -->
    <div id="fsd-detail-feedback-modal" class="modal-overlay">
      <div class="modal" style="max-width:560px;">
        <div class="modal-header">
          <span class="modal-title">Send Feedback to ${s.name}</span>
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
          <button class="btn btn-primary" onclick="FacultyViews.submitDetailFeedback('${s.id}', '${s.name}', '${s.classId}')">Send Feedback</button>
        </div>
      </div>
    </div>`;
}

/* ── Modal & Action Handlers ─────────────────────────────────── */
function openStudentPublicPortfolio(studentId) {
  // Navigate to public-portfolio view for previewing public view
  AscendApp.navigate('public-portfolio');
}

function openDetailFeedbackModal(studentId) {
  AscendUI.openModal('fsd-detail-feedback-modal');
}

function submitDetailFeedback(studentId, studentName, classId) {
  const category  = document.getElementById('fsd-fb-category')?.value || 'General';
  const message   = document.getElementById('fsd-fb-message')?.value.trim();
  const nextStep  = document.getElementById('fsd-fb-next-step')?.value.trim();
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
    classId: classId || window.AscendFacultyData.selectedClassId,
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

window.FacultyViews = window.FacultyViews || {};
Object.assign(window.FacultyViews, {
  studentDetail: renderFacultyStudentDetail,
  switchStudentDetailTab,
  openStudentPublicPortfolio,
  openDetailFeedbackModal,
  submitDetailFeedback,
  openDetailNewEvalModal,
  updateDetailNextStepLabel() {
    const catEl = document.getElementById('fsd-fb-category');
    if (!catEl) return;
    const isGeneral = catEl.value === 'General';
    const reqEl = document.getElementById('fsd-fb-next-step-req');
    const optEl = document.getElementById('fsd-fb-next-step-opt');
    if (reqEl) reqEl.style.display = isGeneral ? 'none' : 'inline';
    if (optEl) optEl.style.display = isGeneral ? 'inline' : 'none';
  },
});
