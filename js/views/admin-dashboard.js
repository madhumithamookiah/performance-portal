/**
 * ASCEND – Institution Admin Console & Oversight Views
 * Dedicated views for:
 * 1. Academic Overview (dashboard)
 * 2. Student Projects Directory (projects)
 * 3. Student Achievements & Credentials (achievements)
 * 4. Faculty Responsiveness & Monitoring (faculty)
 * 5. Student Directory & Portfolios (students)
 * 6. User Accounts & Role Management (users)
 * 7. Admin Settings (settings)
 */

(function () {
  let adminData = {
    overview: {
      totalStudents: 0,
      totalFaculty: 0,
      totalProjects: 0,
      totalAchievements: 0,
      totalEvaluations: 0,
      totalFeedback: 0,
      studentsEvaluated: 0,
      studentsPendingEvaluation: 0,
      studentsWithFeedback: 0,
      studentsWithoutFeedback: 0,
    },
    students: [],
    faculty: [],
    allProjects: [],
    allAchievements: [],
  };

  let adminUsers = [];
  let systemInfo = null;

  // Active filters for dedicated views
  let studentSearch = '';
  let studentStatusFilter = 'all';
  let projectSearch = '';
  let projectTechFilter = 'all';
  let achievementSearch = '';
  let achievementCategoryFilter = 'all';
  let facultySearch = '';
  let facultyStatusFilter = 'all';
  let userSearch = '';
  let userRoleFilter = 'all';

  async function loadAdminData() {
    try {
      const [dataRes, usersRes, sysRes] = await Promise.all([
        fetch('/api/admin/data').then(r => r.json()).catch(() => null),
        fetch('/api/admin/users').then(r => r.json()).catch(() => null),
        fetch('/api/admin/system').then(r => r.json()).catch(() => null),
      ]);

      if (dataRes && !dataRes.error) {
        adminData = {
          overview: dataRes.overview || adminData.overview,
          students: Array.isArray(dataRes.students) ? dataRes.students : [],
          faculty: Array.isArray(dataRes.faculty) ? dataRes.faculty : [],
          allProjects: Array.isArray(dataRes.allProjects) ? dataRes.allProjects : [],
          allAchievements: Array.isArray(dataRes.allAchievements) ? dataRes.allAchievements : [],
        };
      }

      if (usersRes && Array.isArray(usersRes.users)) {
        adminUsers = usersRes.users;
      }
      if (sysRes) {
        systemInfo = sysRes;
      }
    } catch (err) {
      console.warn('Error loading admin oversight data:', err);
    }
  }

  /* ── Helper: Modal Display ────────────────────────────────── */
  function showModal(title, bodyHtml) {
    let container = document.getElementById('admin-modal-overlay');
    if (!container) {
      container = document.createElement('div');
      container.id = 'admin-modal-overlay';
      container.className = 'modal-backdrop';
      container.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
      document.body.appendChild(container);
    }

    container.innerHTML = `
      <div class="card" style="max-width:760px;width:100%;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 40px rgba(0,0,0,0.25);border:1px solid var(--c-border);background:var(--c-surface);border-radius:16px;overflow:hidden;">
        <div style="padding:18px 24px;border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;background:var(--c-surface-2);">
          <div style="font-size:17px;font-weight:700;color:var(--c-text);display:flex;align-items:center;gap:10px;">
            ${title}
          </div>
          <button type="button" class="icon-btn" onclick="AdminViews.closeModal()" aria-label="Close modal" style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style="padding:24px;overflow-y:auto;flex:1;line-height:1.6;">
          ${bodyHtml}
        </div>
        <div style="padding:14px 24px;border-top:1px solid var(--c-border);display:flex;justify-content:flex-end;background:var(--c-surface-2);gap:10px;">
          <button type="button" class="btn btn-outline" onclick="AdminViews.closeModal()">Close</button>
        </div>
      </div>
    `;
    container.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    container.onclick = (e) => {
      if (e.target === container) closeModal();
    };
  }

  function closeModal() {
    const container = document.getElementById('admin-modal-overlay');
    if (container) {
      container.style.display = 'none';
      container.remove();
    }
    document.body.style.overflow = '';
  }

  /* ── Inspection Modals ────────────────────────────────────── */
  function inspectProject(projectId) {
    const project = adminData.allProjects.find(p => p.id === projectId);
    if (!project) {
      window.AscendUI && window.AscendUI.showToast('Project details not found', 'error');
      return;
    }

    const tagsHtml = (project.tags || []).map(t =>
      `<span class="badge badge-primary" style="font-size:12px;padding:3px 8px;">${escapeHtml(t)}</span>`
    ).join(' ') || '<span style="color:var(--c-text-3);">None specified</span>';

    const modalBody = `
      <div style="margin-bottom:20px;">
        <div style="font-size:22px;font-weight:700;color:var(--c-text);margin-bottom:6px;">
          ${escapeHtml(project.title || 'Untitled Project')}
        </div>
        <div style="font-size:13px;color:var(--c-text-2);display:flex;flex-wrap:wrap;gap:12px;align-items:center;">
          <span>Student Author: <strong style="color:var(--c-primary);">${escapeHtml(project.studentName || 'Student')}</strong></span>
          <span>&bull;</span>
          <span>Email: ${escapeHtml(project.studentEmail || 'N/A')}</span>
          <span>&bull;</span>
          <span>Roll No: ${escapeHtml(project.studentRoll || 'N/A')}</span>
          ${project.date ? `<span>&bull;</span><span>Date: ${escapeHtml(project.date)}</span>` : ''}
        </div>
      </div>

      <div class="card" style="padding:16px;background:var(--c-bg);border:1px solid var(--c-border);margin-bottom:20px;">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--c-text-3);margin-bottom:8px;">
          Tech Stack & Skills
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${tagsHtml}
        </div>
      </div>

      <div style="margin-bottom:24px;">
        <div style="font-size:14px;font-weight:700;color:var(--c-text);margin-bottom:8px;">
          Project Abstract & Scope
        </div>
        <div style="background:var(--c-surface);padding:16px;border-radius:8px;border:1px solid var(--c-border);color:var(--c-text);white-space:pre-wrap;font-size:14px;">
          ${escapeHtml(project.description || 'No detailed description provided for this project.')}
        </div>
      </div>

      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        ${project.liveUrl ? `
          <a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Open Live Demo
          </a>
        ` : ''}
        ${project.repoUrl ? `
          <a href="${escapeHtml(project.repoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="display:inline-flex;align-items:center;gap:6px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>
            View Code Repository
          </a>
        ` : ''}
      </div>
    `;

    showModal(`Project: ${escapeHtml(project.title || 'Details')}`, modalBody);
  }

  function inspectAchievement(achievementId) {
    const ach = adminData.allAchievements.find(a => a.id === achievementId);
    if (!ach) {
      window.AscendUI && window.AscendUI.showToast('Achievement details not found', 'error');
      return;
    }

    const skillsHtml = (ach.skills || []).map(s =>
      `<span class="badge" style="background:#E8F0FE;color:#1A73E8;font-size:12px;padding:3px 8px;">${escapeHtml(s)}</span>`
    ).join(' ') || '<span style="color:var(--c-text-3);">None specified</span>';

    const modalBody = `
      <div style="margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <span class="badge badge-primary" style="font-size:11px;text-transform:uppercase;">${escapeHtml(ach.category || 'Achievement')}</span>
          <span style="font-size:13px;color:var(--c-text-3);">Issued by ${escapeHtml(ach.organization || 'Verified Authority')}</span>
        </div>
        <div style="font-size:22px;font-weight:700;color:var(--c-text);margin-bottom:6px;">
          ${escapeHtml(ach.title || 'Untitled Achievement')}
        </div>
        <div style="font-size:13px;color:var(--c-text-2);display:flex;flex-wrap:gap:12px;align-items:center;">
          <span>Student Recipient: <strong style="color:var(--c-primary);">${escapeHtml(ach.studentName || 'Student')}</strong></span>
          <span>&bull;</span>
          <span>Email: ${escapeHtml(ach.studentEmail || 'N/A')}</span>
          <span>&bull;</span>
          <span>Date: ${escapeHtml(ach.date || 'N/A')}</span>
        </div>
      </div>

      <div class="card" style="padding:16px;background:var(--c-bg);border:1px solid var(--c-border);margin-bottom:20px;">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--c-text-3);margin-bottom:8px;">
          Demonstrated Competencies
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${skillsHtml}
        </div>
      </div>

      ${ach.description ? `
        <div style="margin-bottom:20px;">
          <div style="font-size:14px;font-weight:700;color:var(--c-text);margin-bottom:6px;">
            Achievement Summary
          </div>
          <div style="background:var(--c-surface);padding:14px;border-radius:8px;border:1px solid var(--c-border);color:var(--c-text);font-size:14px;">
            ${escapeHtml(ach.description)}
          </div>
        </div>
      ` : ''}

      <div style="margin-top:20px;padding:16px;background:var(--c-surface-2);border-radius:8px;border:1px solid var(--c-border);">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px;">Certificate & Evidence Verification</div>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div style="font-size:13px;color:var(--c-text-2);">
            ${ach.proofFileName ? `File: <strong>${escapeHtml(ach.proofFileName)}</strong>` : (ach.proofLink || 'Digitally Recorded Record')}
          </div>
          ${ach.proofData ? `
            <a href="${ach.proofData}" download="${ach.proofFileName || 'Certificate.pdf'}" class="btn btn-primary btn-sm" style="display:inline-flex;align-items:center;gap:6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Evidence Document
            </a>
          ` : (ach.proofLink && ach.proofLink.startsWith('http') ? `
            <a href="${escapeHtml(ach.proofLink)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
              Open External Proof
            </a>
          ` : '<span class="badge badge-success" style="font-size:12px;">Verified In System</span>')}
        </div>
      </div>
    `;

    showModal(`Achievement: ${escapeHtml(ach.title || 'Credential')}`, modalBody);
  }

  function inspectStudent(studentId) {
    const student = adminData.students.find(s => s.id === studentId);
    if (!student) {
      window.AscendUI && window.AscendUI.showToast('Student profile not found', 'error');
      return;
    }

    const projectsList = student.projects || [];
    const achievementsList = student.achievements || [];
    const feedbackList = student.feedback || [];
    const evalList = student.evaluations || [];

    const modalBody = `
      <div style="display:flex;gap:16px;align-items:center;padding-bottom:16px;border-bottom:1px solid var(--c-border);margin-bottom:20px;">
        <div style="width:52px;height:52px;border-radius:50%;background:#E8F0FE;color:#1A73E8;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;">
          ${escapeHtml(student.name.slice(0, 2).toUpperCase())}
        </div>
        <div>
          <div style="font-size:20px;font-weight:700;color:var(--c-text);">${escapeHtml(student.name)}</div>
          <div style="font-size:13px;color:var(--c-text-2);">
            ${escapeHtml(student.email)} &bull; ${escapeHtml(student.rollNumber)} &bull; ${escapeHtml(student.department)}
          </div>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px;">
        <div class="card" style="padding:10px;text-align:center;background:var(--c-bg);">
          <div style="font-size:11px;color:var(--c-text-3);text-transform:uppercase;">Projects</div>
          <div style="font-size:20px;font-weight:700;color:var(--c-primary);">${projectsList.length}</div>
        </div>
        <div class="card" style="padding:10px;text-align:center;background:var(--c-bg);">
          <div style="font-size:11px;color:var(--c-text-3);text-transform:uppercase;">Achievements</div>
          <div style="font-size:20px;font-weight:700;color:#137333;">${achievementsList.length}</div>
        </div>
        <div class="card" style="padding:10px;text-align:center;background:var(--c-bg);">
          <div style="font-size:11px;color:var(--c-text-3);text-transform:uppercase;">Feedback Notes</div>
          <div style="font-size:20px;font-weight:700;color:#6D28D9;">${feedbackList.length}</div>
        </div>
        <div class="card" style="padding:10px;text-align:center;background:var(--c-bg);">
          <div style="font-size:11px;color:var(--c-text-3);text-transform:uppercase;">Evaluations</div>
          <div style="font-size:20px;font-weight:700;color:#B06000;">${evalList.length}</div>
        </div>
      </div>

      <!-- Projects Section -->
      <div style="margin-bottom:24px;">
        <div style="font-size:15px;font-weight:700;color:var(--c-text);margin-bottom:12px;">
          <span>Student Projects (${projectsList.length})</span>
        </div>
        ${projectsList.length === 0 ? `
          <div style="padding:16px;text-align:center;color:var(--c-text-3);background:var(--c-bg);border-radius:8px;">No projects submitted yet.</div>
        ` : `
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${projectsList.map(p => `
              <div class="card" style="padding:14px;border:1px solid var(--c-border);display:flex;justify-content:space-between;align-items:center;gap:12px;">
                <div>
                  <div style="font-weight:600;font-size:14px;color:var(--c-text);">${escapeHtml(p.title || 'Untitled')}</div>
                  <div style="font-size:12px;color:var(--c-text-2);margin-top:2px;">${escapeHtml((p.description || '').slice(0, 100))}${(p.description || '').length > 100 ? '...' : ''}</div>
                </div>
                <button type="button" class="btn btn-outline btn-sm" onclick="AdminViews.inspectProject('${p.id}')">
                  Read
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Achievements Section -->
      <div style="margin-bottom:24px;">
        <div style="font-size:15px;font-weight:700;color:var(--c-text);margin-bottom:12px;">
          <span>Student Achievements &amp; Credentials (${achievementsList.length})</span>
        </div>
        ${achievementsList.length === 0 ? `
          <div style="padding:16px;text-align:center;color:var(--c-text-3);background:var(--c-bg);border-radius:8px;">No achievements uploaded yet.</div>
        ` : `
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${achievementsList.map(a => `
              <div class="card" style="padding:14px;border:1px solid var(--c-border);display:flex;justify-content:space-between;align-items:center;gap:12px;">
                <div>
                  <div style="font-weight:600;font-size:14px;color:var(--c-text);">${escapeHtml(a.title || 'Untitled')}</div>
                  <div style="font-size:12px;color:var(--c-text-2);margin-top:2px;">${escapeHtml(a.category || 'General')} &bull; ${escapeHtml(a.organization || 'Authority')}</div>
                </div>
                <button type="button" class="btn btn-outline btn-sm" onclick="AdminViews.inspectAchievement('${a.id}')">
                  Verify
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Faculty Progress Evaluation & Feedback History -->
      <div>
        <div style="font-size:15px;font-weight:700;color:var(--c-text);margin-bottom:12px;">
          <span>Faculty Reviews &amp; Evaluation Records</span>
        </div>
        ${(feedbackList.length === 0 && evalList.length === 0) ? `
          <div style="padding:16px;text-align:center;color:var(--c-text-3);background:var(--c-bg);border-radius:8px;">
            No faculty evaluations or feedback recorded for this student yet.
          </div>
        ` : `
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${evalList.map(ev => `
              <div class="card" style="padding:14px;background:#F0FDF4;border:1px solid #BBF7D0;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                  <span style="font-weight:700;color:#166534;font-size:13px;">Rubric Evaluation by ${escapeHtml(ev.evaluatorName || 'Faculty')}</span>
                  <span class="badge" style="background:#DCFCE7;color:#15803D;font-weight:700;">Score: ${ev.overallScore || 'N/A'}/100</span>
                </div>
                <div style="font-size:13px;color:#14532D;margin-top:4px;">${escapeHtml(ev.qualitativeFeedback || 'Evaluation completed.')}</div>
              </div>
            `).join('')}

            ${feedbackList.map(f => `
              <div class="card" style="padding:14px;background:#F8FAFC;border:1px solid var(--c-border);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                  <span style="font-weight:700;color:var(--c-text);font-size:13px;">Guidance Note from ${escapeHtml(f.fromName || f.mentorName || 'Faculty')}</span>
                  <span style="font-size:11px;color:var(--c-text-3);">${escapeHtml(f.date || '')}</span>
                </div>
                <div style="font-size:13px;color:var(--c-text-2);">${escapeHtml(f.message || f.content || '')}</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    showModal(`Student Portfolio: ${escapeHtml(student.name)}`, modalBody);
  }

  function inspectFaculty(facultyId) {
    const fac = adminData.faculty.find(f => f.id === facultyId);
    if (!fac) {
      window.AscendUI && window.AscendUI.showToast('Faculty details not found', 'error');
      return;
    }

    const modalBody = `
      <div style="display:flex;gap:16px;align-items:center;padding-bottom:16px;border-bottom:1px solid var(--c-border);margin-bottom:20px;">
        <div style="width:52px;height:52px;border-radius:50%;background:#F3E8FF;color:#7C3AED;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;">
          ${escapeHtml(fac.name.slice(0, 2).toUpperCase())}
        </div>
        <div>
          <div style="font-size:20px;font-weight:700;color:var(--c-text);">${escapeHtml(fac.name)}</div>
          <div style="font-size:13px;color:var(--c-text-2);">
            ${escapeHtml(fac.email)} &bull; ${escapeHtml(fac.designation)} &bull; ${escapeHtml(fac.department)}
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px;">
        <div class="card" style="padding:12px;text-align:center;background:var(--c-bg);">
          <div style="font-size:11px;color:var(--c-text-3);text-transform:uppercase;">Responsiveness</div>
          <div style="margin-top:6px;">${getResponsivenessBadge(fac.responsivenessStatus)}</div>
        </div>
        <div class="card" style="padding:12px;text-align:center;background:var(--c-bg);">
          <div style="font-size:11px;color:var(--c-text-3);text-transform:uppercase;">Feedback Notes</div>
          <div style="font-size:20px;font-weight:700;color:var(--c-primary);margin-top:4px;">${fac.feedbackGivenCount}</div>
        </div>
        <div class="card" style="padding:12px;text-align:center;background:var(--c-bg);">
          <div style="font-size:11px;color:var(--c-text-3);text-transform:uppercase;">Evaluations Done</div>
          <div style="font-size:20px;font-weight:700;color:#137333;margin-top:4px;">${fac.evaluationsCount}</div>
        </div>
      </div>

      <!-- Recent Evaluations -->
      <div style="margin-bottom:24px;">
        <div style="font-size:14px;font-weight:700;color:var(--c-text);margin-bottom:10px;">
          Student Rubric Evaluations Conducted (${fac.recentEvaluations?.length || 0})
        </div>
        ${(!fac.recentEvaluations || fac.recentEvaluations.length === 0) ? `
          <div style="padding:16px;text-align:center;color:var(--c-text-3);background:var(--c-bg);border-radius:8px;">
            No student rubric evaluations recorded by this faculty member yet.
          </div>
        ` : `
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${fac.recentEvaluations.map(e => `
              <div class="card" style="padding:12px;background:var(--c-surface);border:1px solid var(--c-border);">
                <div style="display:flex;justify-content:space-between;font-weight:600;font-size:13px;">
                  <span>Student: ${escapeHtml(e.studentName || 'Student')}</span>
                  <span class="badge badge-primary">Score: ${e.overallScore || 'N/A'}/100</span>
                </div>
                <div style="font-size:12px;color:var(--c-text-2);margin-top:4px;">${escapeHtml(e.qualitativeFeedback || 'Evaluation complete.')}</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Recent Feedback -->
      <div style="margin-bottom:20px;">
        <div style="font-size:14px;font-weight:700;color:var(--c-text);margin-bottom:10px;">
          Mentorship &amp; Feedback Notes Given (${fac.recentFeedback?.length || 0})
        </div>
        ${(!fac.recentFeedback || fac.recentFeedback.length === 0) ? `
          <div style="padding:16px;text-align:center;color:var(--c-text-3);background:var(--c-bg);border-radius:8px;">
            No feedback communication sent to students yet.
          </div>
        ` : `
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${fac.recentFeedback.map(f => `
              <div class="card" style="padding:12px;background:var(--c-surface);border:1px solid var(--c-border);">
                <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--c-text-3);margin-bottom:4px;">
                  <span>To: ${escapeHtml(f.toStudentName || f.studentName || 'Student')}</span>
                  <span>${escapeHtml(f.date || '')}</span>
                </div>
                <div style="font-size:13px;color:var(--c-text);">${escapeHtml(f.message || f.content || '')}</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <div style="display:flex;justify-content:flex-end;">
        <button type="button" class="btn btn-primary" onclick="AdminViews.sendFacultyReminder('${fac.id}', '${escapeHtml(fac.name)}', '${escapeHtml(fac.email)}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          Send Timeliness Reminder Alert
        </button>
      </div>
    `;

    showModal(`Faculty Review Log: ${escapeHtml(fac.name)}`, modalBody);
  }

  /* ── Status Badges ────────────────────────────────────────── */
  function getResponsivenessBadge(status) {
    switch (status) {
      case 'Active & Responsive':
        return `<span class="badge" style="background:#DCFCE7;color:#15803D;font-weight:600;border:1px solid #BBF7D0;">Active &amp; Responsive</span>`;
      case 'Feedback Active':
        return `<span class="badge" style="background:#E0F2FE;color:#0369A1;font-weight:600;border:1px solid #BAE6FD;">Feedback Active</span>`;
      case 'Evaluated':
        return `<span class="badge" style="background:#F3E8FF;color:#7E22CE;font-weight:600;border:1px solid #E9D5FF;">Evaluated</span>`;
      case 'Needs Engagement':
      default:
        return `<span class="badge" style="background:#FEF3C7;color:#B45309;font-weight:600;border:1px solid #FDE68A;">Needs Engagement</span>`;
    }
  }

  function getStudentStatusBadge(status) {
    switch (status) {
      case 'Evaluated':
        return `<span class="badge" style="background:#DCFCE7;color:#15803D;font-weight:600;">Evaluated</span>`;
      case 'Work Submitted':
        return `<span class="badge" style="background:#E0F2FE;color:#0369A1;font-weight:600;">Work Submitted</span>`;
      case 'Enrolled':
      default:
        return `<span class="badge" style="background:var(--c-bg);color:var(--c-text-3);border:1px solid var(--c-border);">Enrolled</span>`;
    }
  }

  /* ══════════════════════════════════════════════════════════════
     VIEW 1: ACADEMIC OVERVIEW (dashboard)
     ══════════════════════════════════════════════════════════════ */
  function renderDashboard() {
    const o = adminData.overview;
    const recentProjects = adminData.allProjects.slice(0, 4);
    const recentAchievements = adminData.allAchievements.slice(0, 4);

    return `
      <!-- View Header -->
      <div class="view-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;margin-bottom:24px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span class="badge badge-primary" style="font-size:11px;padding:3px 10px;text-transform:uppercase;letter-spacing:0.05em;">Admin Console</span>
            <span style="font-size:13px;color:var(--c-text-3);">Delhi Institute of Technology</span>
          </div>
          <h1 style="margin:0;font-size:26px;font-weight:700;letter-spacing:-0.025em;color:var(--c-text);">Academic Oversight Overview</h1>
          <p style="margin:4px 0 0;font-size:14px;color:var(--c-text-2);">
            Centralized monitoring of student technical portfolios, verified credentials, and faculty rubric evaluation timelines.
          </p>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <button type="button" class="btn btn-outline" onclick="AdminViews.refreshData()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            Refresh
          </button>
          <button type="button" class="btn btn-primary" onclick="AscendApp.navigate('admin-projects')">
            Browse Projects &rarr;
          </button>
        </div>
      </div>

      <!-- Top KPI Stats Grid -->
      <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:16px;margin-bottom:28px;">
        <div class="stat-card" style="cursor:pointer;" onclick="AscendApp.navigate('admin-students')">
          <div class="stat-label" style="display:flex;justify-content:space-between;align-items:center;">
            <span>Enrolled Students</span>
            <div style="width:32px;height:32px;border-radius:50%;background:#E8F0FE;color:#1A73E8;display:flex;align-items:center;justify-content:center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
          </div>
          <div class="stat-value" style="font-size:32px;margin:8px 0 4px;color:#1A73E8;">${o.totalStudents}</div>
          <div class="stat-sub" style="font-size:12px;color:var(--c-text-3);">
            ${o.studentsEvaluated} evaluated &bull; ${o.studentsPendingEvaluation} pending
          </div>
        </div>

        <div class="stat-card" style="cursor:pointer;" onclick="AscendApp.navigate('admin-projects')">
          <div class="stat-label" style="display:flex;justify-content:space-between;align-items:center;">
            <span>Student Projects</span>
            <div style="width:32px;height:32px;border-radius:50%;background:#E6F4EA;color:#137333;display:flex;align-items:center;justify-content:center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
            </div>
          </div>
          <div class="stat-value" style="font-size:32px;margin:8px 0 4px;color:#137333;">${o.totalProjects}</div>
          <div class="stat-sub" style="font-size:12px;color:var(--c-text-3);">
            Technical builds &amp; repos
          </div>
        </div>

        <div class="stat-card" style="cursor:pointer;" onclick="AscendApp.navigate('admin-achievements')">
          <div class="stat-label" style="display:flex;justify-content:space-between;align-items:center;">
            <span>Verified Credentials</span>
            <div style="width:32px;height:32px;border-radius:50%;background:#FEF7E0;color:#B06000;display:flex;align-items:center;justify-content:center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
            </div>
          </div>
          <div class="stat-value" style="font-size:32px;margin:8px 0 4px;color:#B06000;">${o.totalAchievements}</div>
          <div class="stat-sub" style="font-size:12px;color:var(--c-text-3);">
            Certifications &amp; hackathons
          </div>
        </div>

        <div class="stat-card" style="cursor:pointer;" onclick="AscendApp.navigate('admin-faculty')">
          <div class="stat-label" style="display:flex;justify-content:space-between;align-items:center;">
            <span>Faculty Mentors</span>
            <div style="width:32px;height:32px;border-radius:50%;background:#F3E8FF;color:#7C3AED;display:flex;align-items:center;justify-content:center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
          </div>
          <div class="stat-value" style="font-size:32px;margin:8px 0 4px;color:#7C3AED;">${o.totalFaculty}</div>
          <div class="stat-sub" style="font-size:12px;color:var(--c-text-3);">
            ${o.totalEvaluations} evals &bull; ${o.totalFeedback} notes
          </div>
        </div>
      </div>

      <!-- Quick Navigation Jump Cards -->
      <div style="margin-bottom:28px;">
        <div style="font-size:14px;font-weight:700;color:var(--c-text);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:12px;">
          Administrative Sections
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;">
          <div class="card" style="padding:16px;cursor:pointer;display:flex;align-items:center;gap:14px;transition:all 0.15s ease;"
               onclick="AscendApp.navigate('admin-projects')" onmouseover="this.style.borderColor='var(--c-primary)'" onmouseout="this.style.borderColor='var(--c-border)'">
            <div style="width:40px;height:40px;border-radius:10px;background:#E8F0FE;color:#1A73E8;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
            </div>
            <div>
              <div style="font-weight:700;font-size:14px;color:var(--c-text);">Student Projects</div>
              <div style="font-size:12px;color:var(--c-text-3);">Read ${adminData.allProjects.length} submitted builds</div>
            </div>
          </div>

          <div class="card" style="padding:16px;cursor:pointer;display:flex;align-items:center;gap:14px;transition:all 0.15s ease;"
               onclick="AscendApp.navigate('admin-achievements')" onmouseover="this.style.borderColor='var(--c-primary)'" onmouseout="this.style.borderColor='var(--c-border)'">
            <div style="width:40px;height:40px;border-radius:10px;background:#FEF7E0;color:#B06000;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
            </div>
            <div>
              <div style="font-weight:700;font-size:14px;color:var(--c-text);">Achievements &amp; Certs</div>
              <div style="font-size:12px;color:var(--c-text-3);">Verify ${adminData.allAchievements.length} credentials</div>
            </div>
          </div>

          <div class="card" style="padding:16px;cursor:pointer;display:flex;align-items:center;gap:14px;transition:all 0.15s ease;"
               onclick="AscendApp.navigate('admin-faculty')" onmouseover="this.style.borderColor='var(--c-primary)'" onmouseout="this.style.borderColor='var(--c-border)'">
            <div style="width:40px;height:40px;border-radius:10px;background:#F3E8FF;color:#7C3AED;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <div>
              <div style="font-weight:700;font-size:14px;color:var(--c-text);">Faculty Oversight</div>
              <div style="font-size:12px;color:var(--c-text-3);">Monitor grading responsiveness</div>
            </div>
          </div>

          <div class="card" style="padding:16px;cursor:pointer;display:flex;align-items:center;gap:14px;transition:all 0.15s ease;"
               onclick="AscendApp.navigate('admin-students')" onmouseover="this.style.borderColor='var(--c-primary)'" onmouseout="this.style.borderColor='var(--c-border)'">
            <div style="width:40px;height:40px;border-radius:10px;background:#DCFCE7;color:#15803D;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <div>
              <div style="font-weight:700;font-size:14px;color:var(--c-text);">Student Directory</div>
              <div style="font-size:12px;color:var(--c-text-3);">${adminData.students.length} student portfolios</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Inspection Split Columns -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px;">
        <!-- Recent Projects Column -->
        <div class="card" style="padding:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div style="font-size:16px;font-weight:700;color:var(--c-text);">Latest Student Projects</div>
            <button type="button" class="btn btn-ghost btn-sm" onclick="AscendApp.navigate('admin-projects')">All Projects &rarr;</button>
          </div>
          ${recentProjects.length === 0 ? `
            <div style="padding:24px;text-align:center;color:var(--c-text-3);">No student projects submitted yet.</div>
          ` : `
            <div style="display:flex;flex-direction:column;gap:12px;">
              ${recentProjects.map(p => `
                <div style="padding:12px;border:1px solid var(--c-border);border-radius:10px;display:flex;justify-content:space-between;align-items:center;gap:12px;background:var(--c-surface);">
                  <div>
                    <div style="font-weight:600;font-size:14px;color:var(--c-text);">${escapeHtml(p.title)}</div>
                    <div style="font-size:12px;color:var(--c-text-2);margin-top:2px;">By ${escapeHtml(p.studentName)} &bull; ${escapeHtml(p.studentRoll || 'N/A')}</div>
                  </div>
                  <button type="button" class="btn btn-outline btn-sm" onclick="AdminViews.inspectProject('${p.id}')">Read</button>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Recent Achievements Column -->
        <div class="card" style="padding:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div style="font-size:16px;font-weight:700;color:var(--c-text);">Recent Achievements</div>
            <button type="button" class="btn btn-ghost btn-sm" onclick="AscendApp.navigate('admin-achievements')">All Certs &rarr;</button>
          </div>
          ${recentAchievements.length === 0 ? `
            <div style="padding:24px;text-align:center;color:var(--c-text-3);">No student achievements uploaded yet.</div>
          ` : `
            <div style="display:flex;flex-direction:column;gap:12px;">
              ${recentAchievements.map(a => `
                <div style="padding:12px;border:1px solid var(--c-border);border-radius:10px;display:flex;justify-content:space-between;align-items:center;gap:12px;background:var(--c-surface);">
                  <div>
                    <div style="font-weight:600;font-size:14px;color:var(--c-text);">${escapeHtml(a.title)}</div>
                    <div style="font-size:12px;color:var(--c-text-2);margin-top:2px;">${escapeHtml(a.category || 'General')} &bull; ${escapeHtml(a.studentName)}</div>
                  </div>
                  <button type="button" class="btn btn-outline btn-sm" onclick="AdminViews.inspectAchievement('${a.id}')">Verify</button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>

      <!-- Faculty Responsiveness Monitor Snapshot -->
      <div class="card" style="padding:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div>
            <div style="font-size:16px;font-weight:700;color:var(--c-text);">Faculty Responsiveness &amp; Evaluation Monitor</div>
            <div style="font-size:13px;color:var(--c-text-2);margin-top:2px;">Track whether faculty advisors are actively providing guidance and rubric evaluations.</div>
          </div>
          <button type="button" class="btn btn-outline btn-sm" onclick="AscendApp.navigate('admin-faculty')">Full Faculty Center &rarr;</button>
        </div>

        <div style="overflow-x:auto;">
          <table class="table" style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid var(--c-border);font-size:12px;color:var(--c-text-3);text-transform:uppercase;text-align:left;">
                <th style="padding:10px 12px;">Faculty Advisor</th>
                <th style="padding:10px 12px;">Department</th>
                <th style="padding:10px 12px;">Feedback Sent</th>
                <th style="padding:10px 12px;">Evaluations Done</th>
                <th style="padding:10px 12px;">Status</th>
                <th style="padding:10px 12px;text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${adminData.faculty.length === 0 ? `
                <tr><td colspan="6" style="padding:24px;text-align:center;color:var(--c-text-3);">No faculty accounts registered yet.</td></tr>
              ` : adminData.faculty.map(f => `
                <tr style="border-bottom:1px solid var(--c-border);font-size:13px;">
                  <td style="padding:12px;">
                    <div style="font-weight:600;color:var(--c-text);">${escapeHtml(f.name)}</div>
                    <div style="font-size:11px;color:var(--c-text-3);">${escapeHtml(f.email)}</div>
                  </td>
                  <td style="padding:12px;color:var(--c-text-2);">${escapeHtml(f.department)}</td>
                  <td style="padding:12px;"><strong style="color:var(--c-primary);">${f.feedbackGivenCount}</strong> notes</td>
                  <td style="padding:12px;"><strong style="color:#137333;">${f.evaluationsCount}</strong> completed</td>
                  <td style="padding:12px;">${getResponsivenessBadge(f.responsivenessStatus)}</td>
                  <td style="padding:12px;text-align:right;">
                    <button type="button" class="btn btn-outline btn-sm" onclick="AdminViews.inspectFaculty('${f.id}')">Review Log</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* ══════════════════════════════════════════════════════════════
     VIEW 2: STUDENT PROJECTS DIRECTORY (projects)
     ══════════════════════════════════════════════════════════════ */
  function renderProjects() {
    const q = projectSearch.trim().toLowerCase();
    const tagFilter = projectTechFilter.trim().toLowerCase();

    const filtered = adminData.allProjects.filter(p => {
      const matchQ = !q ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.studentName && p.studentName.toLowerCase().includes(q)) ||
        (p.studentRoll && p.studentRoll.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)));

      const matchTag = (tagFilter === 'all') ||
        (p.tags && p.tags.some(t => t.toLowerCase() === tagFilter));

      return matchQ && matchTag;
    });

    const techChips = ['all', 'react', 'python', 'node.js', 'ai/ml', 'javascript', 'tailwind', 'sql'];

    return `
      <div class="view-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;margin-bottom:24px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span class="badge badge-primary" style="font-size:11px;padding:3px 10px;text-transform:uppercase;">Institutional Directory</span>
            <span style="font-size:13px;color:var(--c-text-3);">${adminData.allProjects.length} submissions</span>
          </div>
          <h1 style="margin:0;font-size:26px;font-weight:700;color:var(--c-text);">Student Projects Directory</h1>
          <p style="margin:4px 0 0;font-size:14px;color:var(--c-text-2);">
            Read, review, and evaluate student technical projects, architecture abstracts, and live software deployments.
          </p>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="card" style="padding:16px 20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">
          <div style="flex:1;max-width:480px;position:relative;">
            <input type="search" class="form-input" id="admin-project-search" placeholder="Search project title, author, tech stack..."
              value="${escapeHtml(projectSearch)}" oninput="AdminViews.onProjectSearch(this.value)" style="width:100%;">
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
            <span style="font-size:12px;color:var(--c-text-3);margin-right:4px;">Tech:</span>
            ${techChips.map(c => `
              <button type="button" class="btn btn-sm ${projectTechFilter === c ? 'btn-primary' : 'btn-outline'}"
                onclick="AdminViews.onProjectTechFilter('${c}')" style="text-transform:capitalize;font-size:12px;padding:4px 10px;">
                ${c}
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Projects Grid -->
      ${filtered.length === 0 ? `
        <div class="card" style="padding:48px;text-align:center;color:var(--c-text-3);">
          <div style="font-size:18px;font-weight:600;color:var(--c-text-2);margin-bottom:6px;">No Projects Found</div>
          <p style="margin:0;">No student projects match your search query or none have been submitted yet.</p>
        </div>
      ` : `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px;">
          ${filtered.map(p => {
            const tags = (p.tags || []).slice(0, 4);
            return `
              <div class="card" style="display:flex;flex-direction:column;justify-content:space-between;padding:20px;border-radius:14px;border:1px solid var(--c-border);box-shadow:0 2px 8px rgba(0,0,0,0.04);background:var(--c-surface);">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
                    <div style="font-size:11px;color:var(--c-text-3);text-transform:uppercase;letter-spacing:0.04em;">Student Project</div>
                    ${p.date ? `<span style="font-size:12px;color:var(--c-text-3);">${escapeHtml(p.date)}</span>` : ''}
                  </div>
                  <h3 style="margin:0 0 8px;font-size:18px;font-weight:700;color:var(--c-text);line-height:1.3;">
                    ${escapeHtml(p.title || 'Untitled Project')}
                  </h3>
                  <div style="font-size:13px;color:var(--c-primary);font-weight:600;margin-bottom:10px;">
                    ${escapeHtml(p.studentName)} <span style="color:var(--c-text-3);font-weight:normal;">(${escapeHtml(p.studentRoll || 'N/A')})</span>
                  </div>
                  <p style="margin:0 0 16px;font-size:13px;color:var(--c-text-2);line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">
                    ${escapeHtml(p.description || 'No detailed abstract provided for this student project.')}
                  </p>
                  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">
                    ${tags.map(t => `<span class="badge" style="background:#E8F0FE;color:#1A73E8;font-size:11px;padding:2px 6px;">${escapeHtml(t)}</span>`).join('')}
                    ${(p.tags || []).length > 4 ? `<span class="badge" style="font-size:11px;color:var(--c-text-3);">+${(p.tags || []).length - 4} more</span>` : ''}
                  </div>
                </div>

                <div style="display:flex;align-items:center;justify-content:space-between;padding-top:14px;border-top:1px solid var(--c-border);margin-top:auto;">
                  <button type="button" class="btn btn-primary btn-sm" onclick="AdminViews.inspectProject('${p.id}')">
                    Read Details
                  </button>
                  <div style="display:flex;gap:8px;">
                    ${p.repoUrl ? `
                      <a href="${escapeHtml(p.repoUrl)}" target="_blank" rel="noopener noreferrer" class="icon-btn" title="GitHub Repository" style="width:30px;height:30px;">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>
                      </a>
                    ` : ''}
                    ${p.liveUrl ? `
                      <a href="${escapeHtml(p.liveUrl)}" target="_blank" rel="noopener noreferrer" class="icon-btn" title="Live Preview" style="width:30px;height:30px;">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;
  }

  /* ══════════════════════════════════════════════════════════════
     VIEW 3: ACHIEVEMENTS & CREDENTIALS (achievements)
     ══════════════════════════════════════════════════════════════ */
  function renderAchievements() {
    const q = achievementSearch.trim().toLowerCase();
    const filtered = adminData.allAchievements.filter(a => {
      const matchQ = !q ||
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.studentName && a.studentName.toLowerCase().includes(q)) ||
        (a.organization && a.organization.toLowerCase().includes(q));
      const matchCat = (achievementCategoryFilter === 'all') ||
        (a.category && a.category.toLowerCase() === achievementCategoryFilter.toLowerCase());
      return matchQ && matchCat;
    });

    return `
      <div class="view-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;margin-bottom:24px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span class="badge badge-primary" style="font-size:11px;padding:3px 10px;text-transform:uppercase;">Institutional Verification</span>
            <span style="font-size:13px;color:var(--c-text-3);">${adminData.allAchievements.length} credentials</span>
          </div>
          <h1 style="margin:0;font-size:26px;font-weight:700;color:var(--c-text);">Student Achievements &amp; Credentials</h1>
          <p style="margin:4px 0 0;font-size:14px;color:var(--c-text-2);">
            Inspect and verify student certifications, awards, hackathon victories, and official credential proofs.
          </p>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="card" style="padding:16px 20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div style="flex:1;max-width:480px;">
            <input type="search" class="form-input" placeholder="Search credential title, recipient student, issuer..."
              value="${escapeHtml(achievementSearch)}" oninput="AdminViews.onAchievementSearch(this.value)" style="width:100%;">
          </div>
          <div style="display:flex;gap:10px;align-items:center;">
            <select class="form-input" style="width:auto;" onchange="AdminViews.onAchievementFilter(this.value)">
              <option value="all" ${achievementCategoryFilter === 'all' ? 'selected' : ''}>All Categories</option>
              <option value="Certification" ${achievementCategoryFilter === 'Certification' ? 'selected' : ''}>Certifications</option>
              <option value="Hackathon" ${achievementCategoryFilter === 'Hackathon' ? 'selected' : ''}>Hackathons</option>
              <option value="Internship" ${achievementCategoryFilter === 'Internship' ? 'selected' : ''}>Internships</option>
              <option value="Research" ${achievementCategoryFilter === 'Research' ? 'selected' : ''}>Research</option>
              <option value="Workshop" ${achievementCategoryFilter === 'Workshop' ? 'selected' : ''}>Workshops</option>
              <option value="Leadership" ${achievementCategoryFilter === 'Leadership' ? 'selected' : ''}>Leadership</option>
            </select>
          </div>
        </div>
      </div>

      ${filtered.length === 0 ? `
        <div class="card" style="padding:48px;text-align:center;color:var(--c-text-3);">
          <div style="font-size:18px;font-weight:600;color:var(--c-text-2);margin-bottom:6px;">No Achievements Found</div>
          <p style="margin:0;">No student achievements match your filter or search criteria.</p>
        </div>
      ` : `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px;">
          ${filtered.map(a => `
            <div class="card" style="padding:20px;border-radius:14px;display:flex;flex-direction:column;justify-content:space-between;border:1px solid var(--c-border);background:var(--c-surface);">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
                  <span class="badge badge-primary" style="font-size:11px;text-transform:uppercase;">${escapeHtml(a.category || 'Achievement')}</span>
                  ${a.date ? `<span style="font-size:12px;color:var(--c-text-3);">${escapeHtml(a.date)}</span>` : ''}
                </div>
                <h3 style="margin:0 0 6px;font-size:17px;font-weight:700;color:var(--c-text);line-height:1.3;">
                  ${escapeHtml(a.title)}
                </h3>
                <div style="font-size:13px;color:var(--c-text-2);margin-bottom:12px;">
                  Issued by: <strong>${escapeHtml(a.organization || 'Verified Authority')}</strong>
                </div>
                <div style="font-size:13px;color:var(--c-primary);font-weight:600;margin-bottom:14px;padding:8px 12px;background:var(--c-bg);border-radius:8px;">
                  Recipient: ${escapeHtml(a.studentName)}
                </div>
              </div>

              <div style="display:flex;align-items:center;justify-content:space-between;padding-top:14px;border-top:1px solid var(--c-border);margin-top:auto;">
                <button type="button" class="btn btn-outline btn-sm" onclick="AdminViews.inspectAchievement('${a.id}')">
                  Inspect &amp; Verify
                </button>
                ${a.proofData ? `
                  <a href="${a.proofData}" download="${a.proofFileName || 'Certificate.pdf'}" class="btn btn-primary btn-sm" style="font-size:12px;">
                    Download Proof
                  </a>
                ` : '<span class="badge badge-success" style="font-size:11px;">Verified</span>'}
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;
  }

  /* ══════════════════════════════════════════════════════════════
     VIEW 4: FACULTY MENTORING & OVERSIGHT (faculty)
     ══════════════════════════════════════════════════════════════ */
  function renderFaculty() {
    const q = facultySearch.trim().toLowerCase();
    const filtered = adminData.faculty.filter(f => {
      const matchQ = !q ||
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.email && f.email.toLowerCase().includes(q)) ||
        (f.department && f.department.toLowerCase().includes(q));
      const matchStatus = (facultyStatusFilter === 'all') ||
        (f.responsivenessStatus && f.responsivenessStatus.toLowerCase() === facultyStatusFilter.toLowerCase());
      return matchQ && matchStatus;
    });

    return `
      <div class="view-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;margin-bottom:24px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span class="badge badge-primary" style="font-size:11px;padding:3px 10px;text-transform:uppercase;">Institutional Monitoring</span>
            <span style="font-size:13px;color:var(--c-text-3);">${adminData.faculty.length} advisors</span>
          </div>
          <h1 style="margin:0;font-size:26px;font-weight:700;color:var(--c-text);">Faculty Responsiveness &amp; Oversight</h1>
          <p style="margin:4px 0 0;font-size:14px;color:var(--c-text-2);">
            Monitor faculty advisory response rates, qualitative guidance messages, and student rubric evaluation timeliness.
          </p>
        </div>
      </div>

      <!-- Controls & Quick Metrics -->
      <div class="card" style="padding:16px 20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div style="flex:1;max-width:480px;">
            <input type="search" class="form-input" placeholder="Search faculty name, department, designation..."
              value="${escapeHtml(facultySearch)}" oninput="AdminViews.onFacultySearch(this.value)" style="width:100%;">
          </div>
          <div style="display:flex;gap:10px;align-items:center;">
            <select class="form-input" style="width:auto;" onchange="AdminViews.onFacultyFilter(this.value)">
              <option value="all" ${facultyStatusFilter === 'all' ? 'selected' : ''}>All Responsiveness States</option>
              <option value="Active & Responsive" ${facultyStatusFilter === 'Active & Responsive' ? 'selected' : ''}>Active &amp; Responsive</option>
              <option value="Feedback Active" ${facultyStatusFilter === 'Feedback Active' ? 'selected' : ''}>Feedback Active</option>
              <option value="Evaluated" ${facultyStatusFilter === 'Evaluated' ? 'selected' : ''}>Evaluated</option>
              <option value="Needs Engagement" ${facultyStatusFilter === 'Needs Engagement' ? 'selected' : ''}>Needs Engagement</option>
            </select>
          </div>
        </div>
      </div>

      <div class="card" style="padding:0;overflow:hidden;">
        <div style="overflow-x:auto;">
          <table class="table" style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid var(--c-border);background:var(--c-surface-2);font-size:12px;color:var(--c-text-3);text-transform:uppercase;text-align:left;">
                <th style="padding:14px 16px;">Faculty Advisor</th>
                <th style="padding:14px 16px;">Department / Designation</th>
                <th style="padding:14px 16px;">Feedback Notes</th>
                <th style="padding:14px 16px;">Evaluations Done</th>
                <th style="padding:14px 16px;">Engagement State</th>
                <th style="padding:14px 16px;text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr><td colspan="6" style="padding:32px;text-align:center;color:var(--c-text-3);">No faculty records match your criteria.</td></tr>
              ` : filtered.map(f => `
                <tr style="border-bottom:1px solid var(--c-border);font-size:13px;">
                  <td style="padding:14px 16px;">
                    <div style="font-weight:600;color:var(--c-text);">${escapeHtml(f.name)}</div>
                    <div style="font-size:12px;color:var(--c-text-2);">${escapeHtml(f.email)}</div>
                  </td>
                  <td style="padding:14px 16px;">
                    <div style="color:var(--c-text);">${escapeHtml(f.designation)}</div>
                    <div style="font-size:12px;color:var(--c-text-3);">${escapeHtml(f.department)}</div>
                  </td>
                  <td style="padding:14px 16px;">
                    <strong style="color:var(--c-primary);font-size:14px;">${f.feedbackGivenCount}</strong> messages
                  </td>
                  <td style="padding:14px 16px;">
                    <strong style="color:#137333;font-size:14px;">${f.evaluationsCount}</strong> rubric evals
                  </td>
                  <td style="padding:14px 16px;">
                    ${getResponsivenessBadge(f.responsivenessStatus)}
                  </td>
                  <td style="padding:14px 16px;text-align:right;">
                    <div style="display:flex;gap:6px;justify-content:flex-end;">
                      <button type="button" class="btn btn-outline btn-sm" onclick="AdminViews.inspectFaculty('${f.id}')">
                        Review Log
                      </button>
                      <button type="button" class="btn btn-primary btn-sm" onclick="AdminViews.sendFacultyReminder('${f.id}', '${escapeHtml(f.name)}', '${escapeHtml(f.email)}')">
                        Remind
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* ══════════════════════════════════════════════════════════════
     VIEW 5: STUDENT DIRECTORY & PORTFOLIOS (students)
     ══════════════════════════════════════════════════════════════ */
  function renderStudents() {
    const q = studentSearch.trim().toLowerCase();
    const filtered = adminData.students.filter(s => {
      const matchQ = !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
        (s.department && s.department.toLowerCase().includes(q));
      const matchStatus = (studentStatusFilter === 'all') ||
        (s.status && s.status.toLowerCase() === studentStatusFilter.toLowerCase());
      return matchQ && matchStatus;
    });

    return `
      <div class="view-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;margin-bottom:24px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span class="badge badge-primary" style="font-size:11px;padding:3px 10px;text-transform:uppercase;">Institutional Directory</span>
            <span style="font-size:13px;color:var(--c-text-3);">${adminData.students.length} students</span>
          </div>
          <h1 style="margin:0;font-size:26px;font-weight:700;color:var(--c-text);">Student Directory &amp; Portfolios</h1>
          <p style="margin:4px 0 0;font-size:14px;color:var(--c-text-2);">
            Browse complete student portfolios, track submission standing, and review mentor guidance notes.
          </p>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="card" style="padding:16px 20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div style="flex:1;max-width:480px;">
            <input type="search" class="form-input" placeholder="Search student name, email, roll number, department..."
              value="${escapeHtml(studentSearch)}" oninput="AdminViews.onStudentSearch(this.value)" style="width:100%;">
          </div>
          <div style="display:flex;gap:10px;align-items:center;">
            <select class="form-input" style="width:auto;" onchange="AdminViews.onStudentFilter(this.value)">
              <option value="all" ${studentStatusFilter === 'all' ? 'selected' : ''}>All Academic Standing</option>
              <option value="Evaluated" ${studentStatusFilter === 'Evaluated' ? 'selected' : ''}>Evaluated</option>
              <option value="Work Submitted" ${studentStatusFilter === 'Work Submitted' ? 'selected' : ''}>Work Submitted</option>
              <option value="Enrolled" ${studentStatusFilter === 'Enrolled' ? 'selected' : ''}>Enrolled</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Student Directory Table -->
      <div class="card" style="padding:0;overflow:hidden;">
        <div style="overflow-x:auto;">
          <table class="table" style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid var(--c-border);background:var(--c-surface-2);font-size:12px;color:var(--c-text-3);text-transform:uppercase;text-align:left;">
                <th style="padding:14px 16px;">Student Name</th>
                <th style="padding:14px 16px;">Program &amp; Department</th>
                <th style="padding:14px 16px;">Projects</th>
                <th style="padding:14px 16px;">Achievements</th>
                <th style="padding:14px 16px;">Standing</th>
                <th style="padding:14px 16px;text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr><td colspan="6" style="padding:32px;text-align:center;color:var(--c-text-3);">No student records match your query.</td></tr>
              ` : filtered.map(s => `
                <tr style="border-bottom:1px solid var(--c-border);font-size:13px;">
                  <td style="padding:14px 16px;">
                    <div style="font-weight:600;color:var(--c-text);">${escapeHtml(s.name)}</div>
                    <div style="font-size:12px;color:var(--c-text-2);">${escapeHtml(s.email)} &bull; ${escapeHtml(s.rollNumber)}</div>
                  </td>
                  <td style="padding:14px 16px;">
                    <div style="color:var(--c-text);">${escapeHtml(s.degree || 'B.Tech in CS')}</div>
                    <div style="font-size:12px;color:var(--c-text-3);">${escapeHtml(s.department || 'Computer Science')}</div>
                  </td>
                  <td style="padding:14px 16px;">
                    <span class="badge" style="background:#E8F0FE;color:#1A73E8;font-weight:600;">${s.projectsCount} projects</span>
                  </td>
                  <td style="padding:14px 16px;">
                    <span class="badge" style="background:#FEF7E0;color:#B06000;font-weight:600;">${s.achievementsCount} certs</span>
                  </td>
                  <td style="padding:14px 16px;">
                    ${getStudentStatusBadge(s.status)}
                  </td>
                  <td style="padding:14px 16px;text-align:right;">
                    <button type="button" class="btn btn-outline btn-sm" onclick="AdminViews.inspectStudent('${s.id}')">
                      Inspect Portfolio
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* ══════════════════════════════════════════════════════════════
     VIEW 6: USER ACCOUNTS & MANAGEMENT (users)
     ══════════════════════════════════════════════════════════════ */
  function renderUsers() {
    const q = userSearch.trim().toLowerCase();
    const filtered = adminUsers.filter(u => {
      const matchQ = !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q));
      const matchRole = (userRoleFilter === 'all') ||
        (u.role && u.role.toLowerCase() === userRoleFilter.toLowerCase());
      return matchQ && matchRole;
    });

    return `
      <div class="view-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;margin-bottom:24px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span class="badge badge-primary" style="font-size:11px;padding:3px 10px;text-transform:uppercase;">Access Control</span>
            <span style="font-size:13px;color:var(--c-text-3);">${adminUsers.length} accounts</span>
          </div>
          <h1 style="margin:0;font-size:26px;font-weight:700;color:var(--c-text);">User Accounts &amp; Permissions</h1>
          <p style="margin:4px 0 0;font-size:14px;color:var(--c-text-2);">
            Manage institutional user accounts, credentials, email verification states, and administrative roles.
          </p>
        </div>
        <div>
          <button type="button" class="btn btn-primary" onclick="AdminViews.openCreateUserModal()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Provision User Account
          </button>
        </div>
      </div>

      <!-- Controls -->
      <div class="card" style="padding:16px 20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div style="flex:1;max-width:480px;">
            <input type="search" class="form-input" placeholder="Search account name, email..."
              value="${escapeHtml(userSearch)}" oninput="AdminViews.onUserSearch(this.value)" style="width:100%;">
          </div>
          <div style="display:flex;gap:10px;align-items:center;">
            <select class="form-input" style="width:auto;" onchange="AdminViews.onUserRoleFilter(this.value)">
              <option value="all" ${userRoleFilter === 'all' ? 'selected' : ''}>All Roles</option>
              <option value="student" ${userRoleFilter === 'student' ? 'selected' : ''}>Students</option>
              <option value="faculty" ${userRoleFilter === 'faculty' ? 'selected' : ''}>Faculty</option>
              <option value="admin" ${userRoleFilter === 'admin' ? 'selected' : ''}>Administrators</option>
            </select>
          </div>
        </div>
      </div>

      <div class="card" style="padding:0;overflow:hidden;">
        <div style="overflow-x:auto;">
          <table class="table" style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid var(--c-border);background:var(--c-surface-2);font-size:12px;color:var(--c-text-3);text-transform:uppercase;text-align:left;">
                <th style="padding:14px 16px;">Account User</th>
                <th style="padding:14px 16px;">Role</th>
                <th style="padding:14px 16px;">Email Verification</th>
                <th style="padding:14px 16px;">Registration Date</th>
                <th style="padding:14px 16px;text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr><td colspan="5" style="padding:32px;text-align:center;color:var(--c-text-3);">No registered user accounts found.</td></tr>
              ` : filtered.map(u => `
                <tr style="border-bottom:1px solid var(--c-border);font-size:13px;">
                  <td style="padding:14px 16px;">
                    <div style="font-weight:600;color:var(--c-text);">${escapeHtml(u.name || 'User')}</div>
                    <div style="font-size:12px;color:var(--c-text-2);">${escapeHtml(u.email || '')}</div>
                  </td>
                  <td style="padding:14px 16px;">
                    <span class="badge" style="text-transform:uppercase;font-size:11px;font-weight:600;background:#F1F5F9;color:#334155;">${escapeHtml(u.role || 'student')}</span>
                  </td>
                  <td style="padding:14px 16px;">
                    ${u.isVerified ? `
                      <span class="badge badge-success" style="font-size:11px;">Verified</span>
                    ` : `
                      <span class="badge badge-warning" style="font-size:11px;">Pending</span>
                    `}
                  </td>
                  <td style="padding:14px 16px;color:var(--c-text-3);">
                    ${u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                  </td>
                  <td style="padding:14px 16px;text-align:right;">
                    <div style="display:flex;gap:6px;justify-content:flex-end;">
                      ${!u.isVerified ? `
                        <button type="button" class="btn btn-outline btn-sm" onclick="AdminViews.verifyUser('${u.id}', '${escapeHtml(u.email)}')">
                          Verify Email
                        </button>
                      ` : ''}
                      ${u.email !== 'admin@ascend.com' ? `
                        <button type="button" class="btn btn-outline btn-sm" style="color:#DC2626;border-color:#FCA5A5;" onclick="AdminViews.deleteUser('${u.id}', '${escapeHtml(u.name)}')">
                          Delete
                        </button>
                      ` : '<span style="font-size:11px;color:var(--c-text-3);padding:6px;">Protected</span>'}
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /* ══════════════════════════════════════════════════════════════
     VIEW 7: ADMIN SETTINGS (settings)
     ══════════════════════════════════════════════════════════════ */
  function renderSettings() {
    return `
      <div class="view-header" style="margin-bottom:24px;">
        <h1 style="font-size:24px;font-weight:700;color:var(--c-text);margin:0 0 4px;">Admin Portal Settings</h1>
        <p style="font-size:14px;color:var(--c-text-2);margin:0;">Manage administrative preferences and institution parameters.</p>
      </div>
      <div class="card" style="padding:28px;max-width:680px;">
        <div style="display:flex;align-items:center;gap:16px;padding-bottom:20px;border-bottom:1px solid var(--c-border);margin-bottom:20px;">
          <div style="width:52px;height:52px;border-radius:50%;background:#6D28D9;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;">
            AD
          </div>
          <div>
            <div style="font-size:18px;font-weight:700;color:var(--c-text);">System Administrator</div>
            <div style="font-size:14px;color:var(--c-text-2);">admin@ascend.com &bull; Master Administrator</div>
          </div>
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label">Institution Name</label>
          <input class="form-input" type="text" value="Delhi Institute of Technology" readonly style="background:var(--c-bg);">
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label">Admin Email</label>
          <input class="form-input" type="email" value="admin@ascend.com" readonly style="background:var(--c-bg);">
        </div>
        <div class="form-group" style="margin-bottom:24px;">
          <label class="form-label">SMTP Delivery Mode</label>
          <input class="form-input" type="text" value="Real-time Gmail SMTP (smtp.gmail.com:587)" readonly style="background:var(--c-bg);">
        </div>
        <button type="button" class="btn btn-primary" onclick="AscendUI.showToast('Admin preferences confirmed and secure.', 'success')">
          Save Preferences
        </button>
      </div>
    `;
  }

  /* ── User & Faculty Administrative Actions ───────────────── */
  async function verifyUser(userId, email) {
    try {
      const res = await fetch('/api/admin/verify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.AscendUI && window.AscendUI.showToast(`User ${email} verified successfully.`, 'success');
        await loadAdminData();
        const content = document.getElementById('app-content-area');
        if (content && window.AscendApp && window.AscendApp.getCurrentView() === 'admin-users') {
          content.innerHTML = renderUsers();
        }
      } else {
        window.AscendUI && window.AscendUI.showToast(data.error || 'Failed to verify user', 'error');
      }
    } catch (e) {
      window.AscendUI && window.AscendUI.showToast('Network error during verification.', 'error');
    }
  }

  function deleteUser(userId, name) {
    if (!window.AscendUI || !window.AscendUI.confirmModal) {
      if (!confirm(`Are you sure you want to delete user ${name}? This action cannot be undone.`)) return;
      doDelete();
      return;
    }

    window.AscendUI.confirmModal({
      title: 'Delete User Account',
      message: `Are you sure you want to delete account <strong>${escapeHtml(name)}</strong>? All student/faculty data associated with this account will be removed.`,
      confirmText: 'Delete Account',
      danger: true,
      onConfirm: doDelete,
    });

    async function doDelete() {
      try {
        const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok && data.success) {
          window.AscendUI && window.AscendUI.showToast('Account deleted successfully.', 'success');
          await loadAdminData();
          const content = document.getElementById('app-content-area');
          if (content && window.AscendApp && window.AscendApp.getCurrentView() === 'admin-users') {
            content.innerHTML = renderUsers();
          }
        } else {
          window.AscendUI && window.AscendUI.showToast(data.error || 'Failed to delete user', 'error');
        }
      } catch (e) {
        window.AscendUI && window.AscendUI.showToast('Network error deleting user.', 'error');
      }
    }
  }

  function openCreateUserModal() {
    const modalBody = `
      <form id="form-create-user" onsubmit="AdminViews.handleCreateUser(event)" style="display:flex;flex-direction:column;gap:16px;">
        <div class="form-group">
          <label class="form-label">Full Name *</label>
          <input type="text" class="form-input" id="new-user-name" required placeholder="e.g. Dr. Priya Sundaram">
        </div>
        <div class="form-group">
          <label class="form-label">Email Address *</label>
          <input type="email" class="form-input" id="new-user-email" required placeholder="priya.sundaram@university.edu">
        </div>
        <div class="form-group">
          <label class="form-label">Temporary Password *</label>
          <input type="password" class="form-input" id="new-user-password" required value="ascend@123" placeholder="Enter temporary password">
        </div>
        <div class="form-group">
          <label class="form-label">Account Role *</label>
          <select class="form-input" id="new-user-role" onchange="AdminViews.onNewUserRoleChange(this.value)">
            <option value="student">Student</option>
            <option value="faculty" selected>Faculty / Mentor</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        <div class="form-group" id="group-new-dept">
          <label class="form-label">Department *</label>
          <input type="text" class="form-input" id="new-user-dept" value="Computer Science & Engineering" required>
        </div>
        <div class="form-group" id="group-new-desig">
          <label class="form-label">Designation / Degree</label>
          <input type="text" class="form-input" id="new-user-desig" value="Associate Professor & Faculty Advisor">
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:10px;">
          <button type="button" class="btn btn-outline" onclick="AdminViews.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" id="btn-submit-new-user">
            Provision &amp; Verify Account
          </button>
        </div>
      </form>
    `;
    showModal('Provision New Institutional Account', modalBody);
  }

  function onNewUserRoleChange(role) {
    const desigInput = document.getElementById('new-user-desig');
    if (!desigInput) return;
    if (role === 'student') {
      desigInput.value = 'B.Tech in Computer Science';
    } else if (role === 'faculty') {
      desigInput.value = 'Associate Professor & Faculty Advisor';
    } else {
      desigInput.value = 'Institutional Administrator';
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-new-user');
    if (btn) btn.disabled = true;

    const name = document.getElementById('new-user-name').value.trim();
    const email = document.getElementById('new-user-email').value.trim();
    const password = document.getElementById('new-user-password').value;
    const role = document.getElementById('new-user-role').value;
    const department = document.getElementById('new-user-dept').value.trim();
    const extra = document.getElementById('new-user-desig').value.trim();

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          department,
          designation: role === 'faculty' ? extra : undefined,
          degree: role === 'student' ? extra : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.AscendUI && window.AscendUI.showToast(data.message || 'User provisioned successfully.', 'success');
        closeModal();
        await loadAdminData();
        const content = document.getElementById('app-content-area');
        if (content && window.AscendApp && window.AscendApp.getCurrentView() === 'admin-users') {
          content.innerHTML = renderUsers();
        }
      } else {
        window.AscendUI && window.AscendUI.showToast(data.error || 'Failed to create user', 'error');
      }
    } catch (err) {
      window.AscendUI && window.AscendUI.showToast('Network error creating user.', 'error');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function sendFacultyReminder(facultyId, facultyName, email) {
    try {
      window.AscendUI && window.AscendUI.showToast(`Dispatching evaluation reminder to ${facultyName}...`, 'info');
      const res = await fetch('/api/admin/remind-faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facultyId, facultyName, email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.AscendUI && window.AscendUI.showToast(`Reminder sent to ${facultyName}! (${data.delivery || 'Sent'})`, 'success');
      } else {
        window.AscendUI && window.AscendUI.showToast(data.error || 'Failed to dispatch reminder.', 'error');
      }
    } catch (e) {
      window.AscendUI && window.AscendUI.showToast('Network error dispatching reminder.', 'error');
    }
  }

  /* ── Filter Event Handlers ────────────────────────────────── */
  function onProjectSearch(q) {
    projectSearch = q;
    const content = document.getElementById('app-content-area');
    if (content && window.AscendApp && window.AscendApp.getCurrentView() === 'admin-projects') {
      content.innerHTML = renderProjects();
      const input = document.getElementById('admin-project-search');
      if (input) {
        input.value = q;
        input.focus();
      }
    }
  }

  function onProjectTechFilter(tag) {
    projectTechFilter = tag;
    const content = document.getElementById('app-content-area');
    if (content && window.AscendApp && window.AscendApp.getCurrentView() === 'admin-projects') {
      content.innerHTML = renderProjects();
    }
  }

  function onAchievementSearch(q) {
    achievementSearch = q;
    const content = document.getElementById('app-content-area');
    if (content && window.AscendApp && window.AscendApp.getCurrentView() === 'admin-achievements') {
      content.innerHTML = renderAchievements();
    }
  }

  function onAchievementFilter(f) {
    achievementCategoryFilter = f;
    const content = document.getElementById('app-content-area');
    if (content && window.AscendApp && window.AscendApp.getCurrentView() === 'admin-achievements') {
      content.innerHTML = renderAchievements();
    }
  }

  function onFacultySearch(q) {
    facultySearch = q;
    const content = document.getElementById('app-content-area');
    if (content && window.AscendApp && window.AscendApp.getCurrentView() === 'admin-faculty') {
      content.innerHTML = renderFaculty();
    }
  }

  function onFacultyFilter(f) {
    facultyStatusFilter = f;
    const content = document.getElementById('app-content-area');
    if (content && window.AscendApp && window.AscendApp.getCurrentView() === 'admin-faculty') {
      content.innerHTML = renderFaculty();
    }
  }

  function onStudentSearch(q) {
    studentSearch = q;
    const content = document.getElementById('app-content-area');
    if (content && window.AscendApp && window.AscendApp.getCurrentView() === 'admin-students') {
      content.innerHTML = renderStudents();
    }
  }

  function onStudentFilter(f) {
    studentStatusFilter = f;
    const content = document.getElementById('app-content-area');
    if (content && window.AscendApp && window.AscendApp.getCurrentView() === 'admin-students') {
      content.innerHTML = renderStudents();
    }
  }

  function onUserSearch(q) {
    userSearch = q;
    const content = document.getElementById('app-content-area');
    if (content && window.AscendApp && window.AscendApp.getCurrentView() === 'admin-users') {
      content.innerHTML = renderUsers();
    }
  }

  function onUserRoleFilter(f) {
    userRoleFilter = f;
    const content = document.getElementById('app-content-area');
    if (content && window.AscendApp && window.AscendApp.getCurrentView() === 'admin-users') {
      content.innerHTML = renderUsers();
    }
  }

  function onGlobalSearch(q) {
    projectSearch = q;
    achievementSearch = q;
    facultySearch = q;
    studentSearch = q;
    userSearch = q;
    const content = document.getElementById('app-content-area');
    const cur = window.AscendApp ? window.AscendApp.getCurrentView() : 'admin-dashboard';
    if (content) {
      if (cur === 'admin-projects') content.innerHTML = renderProjects();
      else if (cur === 'admin-achievements') content.innerHTML = renderAchievements();
      else if (cur === 'admin-faculty') content.innerHTML = renderFaculty();
      else if (cur === 'admin-students') content.innerHTML = renderStudents();
      else if (cur === 'admin-users') content.innerHTML = renderUsers();
      else content.innerHTML = renderDashboard();
    }
  }

  async function refreshData() {
    window.AscendUI && window.AscendUI.showToast('Refreshing administrative oversight data...', 'info');
    await loadAdminData();
    const content = document.getElementById('app-content-area');
    const cur = window.AscendApp ? window.AscendApp.getCurrentView() : 'admin-dashboard';
    if (content) {
      if (cur === 'admin-projects') content.innerHTML = renderProjects();
      else if (cur === 'admin-achievements') content.innerHTML = renderAchievements();
      else if (cur === 'admin-faculty') content.innerHTML = renderFaculty();
      else if (cur === 'admin-students') content.innerHTML = renderStudents();
      else if (cur === 'admin-users') content.innerHTML = renderUsers();
      else content.innerHTML = renderDashboard();
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ── Export to Global ─────────────────────────────────────── */
  window.AdminViews = {
    loadAdminData,
    dashboard: renderDashboard,
    projects: renderProjects,
    achievements: renderAchievements,
    faculty: renderFaculty,
    students: renderStudents,
    users: renderUsers,
    settings: renderSettings,
    closeModal,
    inspectProject,
    inspectAchievement,
    inspectStudent,
    inspectFaculty,
    verifyUser,
    deleteUser,
    openCreateUserModal,
    onNewUserRoleChange,
    handleCreateUser,
    sendFacultyReminder,
    onStudentSearch,
    onStudentFilter,
    onProjectSearch,
    onProjectTechFilter,
    onAchievementSearch,
    onAchievementFilter,
    onFacultySearch,
    onFacultyFilter,
    onUserSearch,
    onUserRoleFilter,
    onGlobalSearch,
    refreshData,
  };
})();
