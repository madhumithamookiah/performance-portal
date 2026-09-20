/**
 * ASCEND – HOD Classes View
 * Lists classes/sections with programme, semester, student count, assigned faculty mentor,
 * recent activity, and evaluation progress. Selecting a class opens class overview drill-down.
 */

(function () {
  window.HODViews = window.HODViews || {};

  let searchQuery = '';
  let filterSem = 'all';
  let filterMentorStatus = 'all';
  let sortBy = 'name';

  window.HODViews.onClassesFilterChange = function () {
    const q = document.getElementById('class-search-input')?.value || '';
    const sem = document.getElementById('class-sem-filter')?.value || 'all';
    const status = document.getElementById('class-mentor-status')?.value || 'all';
    const sort = document.getElementById('class-sort-by')?.value || 'name';

    searchQuery = q.toLowerCase().trim();
    filterSem = sem;
    filterMentorStatus = status;
    sortBy = sort;

    const content = document.getElementById('app-content-area');
    if (content && window.AscendApp?.getCurrentView() === 'hod-classes') {
      content.innerHTML = window.HODViews.classes();
    }
  };

  window.HODViews.openClassOverview = function (classId) {
    const { classes, getStudentsForClass, recentActivity } = window.AscendHODData;
    const { Icons } = window.AscendUI;

    const cls = classes.find(c => c.id === classId);
    if (!cls) return;

    const students = getStudentsForClass(classId);
    const classActivities = recentActivity.filter(a => a.classId === classId);

    // Remove existing modal if any
    document.getElementById('class-overview-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'class-overview-modal';
    modal.className = 'modal-backdrop active';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(32,33,36,0.6);z-index:600;display:flex;align-items:center;justify-content:center;padding:16px;';

    const total = cls.evaluationStats.published + cls.evaluationStats.draft + cls.evaluationStats.notStarted;
    const pubPct = total > 0 ? Math.round((cls.evaluationStats.published / total) * 100) : 0;

    modal.innerHTML = `
      <div class="modal-card" style="background:var(--c-surface);border-radius:var(--r-xl);max-width:760px;width:100%;max-height:90vh;overflow-y:auto;border:1px solid var(--c-border);box-shadow:var(--shadow-lg);animation:welcomeIn 0.2s ease forwards;">
        <!-- Modal Header -->
        <div style="padding:var(--sp-4) var(--sp-6);border-bottom:1px solid var(--c-border);display:flex;align-items:flex-start;justify-content:space-between;gap:var(--sp-3);">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span class="badge badge-primary" style="font-size:11px;">${cls.programme}</span>
              <span class="badge badge-draft" style="font-size:11px;">Semester ${cls.semester} &bull; ${cls.section}</span>
            </div>
            <h2 style="font-size:var(--text-xl);font-weight:700;color:var(--c-text);margin:0;">
              ${cls.name}
            </h2>
            <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:4px;">
              Assigned Mentor: <strong>${cls.assignedFacultyName}</strong> &bull; ${cls.academicYear}
            </div>
          </div>
          <button type="button" class="icon-btn" onclick="document.getElementById('class-overview-modal')?.remove();" aria-label="Close modal">
            ${Icons.x}
          </button>
        </div>

        <!-- Metrics Strip -->
        <div style="padding:var(--sp-3) var(--sp-6);background:#F8FAFD;border-bottom:1px solid var(--c-border);display:grid;grid-template-columns:repeat(4, 1fr);gap:var(--sp-3);text-align:center;">
          <div>
            <div style="font-size:10px;text-transform:uppercase;color:var(--c-text-3);font-weight:700;">Students</div>
            <div style="font-size:18px;font-weight:700;color:var(--c-text);">${cls.studentCount}</div>
          </div>
          <div>
            <div style="font-size:10px;text-transform:uppercase;color:var(--c-text-3);font-weight:700;">Updates (Mo)</div>
            <div style="font-size:18px;font-weight:700;color:#0369A1;">${cls.recentUpdatesCount}</div>
          </div>
          <div>
            <div style="font-size:10px;text-transform:uppercase;color:var(--c-text-3);font-weight:700;">Profile Setup</div>
            <div style="font-size:18px;font-weight:700;color:#166534;">${cls.profileSetupRate}%</div>
          </div>
          <div>
            <div style="font-size:10px;text-transform:uppercase;color:var(--c-text-3);font-weight:700;">Evaluation Progress</div>
            <div style="font-size:18px;font-weight:700;color:#1A73E8;">${pubPct}%</div>
          </div>
        </div>

        <div style="padding:var(--sp-6);">
          <!-- Recent Activity in this Class -->
          <div style="margin-bottom:var(--sp-6);">
            <h3 style="font-size:var(--text-sm);font-weight:700;color:var(--c-text);margin:0 0 var(--sp-3);">
              Recent Class Portfolio Additions
            </h3>
            ${classActivities.length === 0 ? `
              <div style="padding:var(--sp-4);background:var(--c-bg);border:1px dashed var(--c-border);border-radius:var(--r-md);text-align:center;color:var(--c-text-3);font-size:var(--text-xs);">
                No recent portfolio additions recorded in this specific cohort during the past 14 days.
              </div>` : `
              <div style="display:flex;flex-direction:column;gap:8px;">
                ${classActivities.map(act => `
                  <div style="padding:10px 14px;background:#FAFAFA;border:1px solid var(--c-border-subtle);border-radius:var(--r-md);display:flex;align-items:center;justify-content:space-between;gap:12px;">
                    <div>
                      <div style="font-size:var(--text-xs);font-weight:700;color:var(--c-text);">${act.title}</div>
                      <div style="font-size:11px;color:var(--c-text-2);">${act.studentName} (${act.rollNo}) &bull; ${act.category}</div>
                    </div>
                    <span style="font-size:10px;color:var(--c-text-3);white-space:nowrap;">${act.relativeTime}</span>
                  </div>`).join('')}
              </div>`}
          </div>

          <!-- Student Roster Table -->
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-3);">
              <h3 style="font-size:var(--text-sm);font-weight:700;color:var(--c-text);margin:0;">
                Cohort Student Roster
              </h3>
              <span style="font-size:var(--text-xs);color:var(--c-text-3);">${students.length} recorded advisees</span>
            </div>
            <div style="overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;text-align:left;font-size:var(--text-xs);">
                <thead>
                  <tr style="background:#F8FAFD;border-bottom:1px solid var(--c-border);color:var(--c-text-2);font-weight:600;">
                    <th style="padding:8px 12px;">Student Name</th>
                    <th style="padding:8px 10px;">Roll No</th>
                    <th style="padding:8px 10px;text-align:center;">Portfolio Entries</th>
                    <th style="padding:8px 10px;">Last Active</th>
                    <th style="padding:8px 10px;">Profile</th>
                    <th style="padding:8px 12px;text-align:right;">Evaluation</th>
                  </tr>
                </thead>
                <tbody>
                  ${students.map(s => `
                    <tr style="border-bottom:1px solid var(--c-border-subtle);">
                      <td style="padding:10px 12px;font-weight:600;color:var(--c-text);">${s.name}</td>
                      <td style="padding:10px 10px;color:var(--c-text-2);">${s.rollNo}</td>
                      <td style="padding:10px 10px;text-align:center;font-weight:700;">
                        ${s.achievementsCount + (s.projectsCount || 0)}
                      </td>
                      <td style="padding:10px 10px;color:var(--c-text-2);">${s.lastActive}</td>
                      <td style="padding:10px 10px;">
                        <span class="badge ${s.profileStatus === 'Complete' ? 'badge-verified' : 'badge-draft'}" style="font-size:10px;">
                          ${s.profileStatus}
                        </span>
                      </td>
                      <td style="padding:10px 12px;text-align:right;">
                        <span class="badge ${s.evalStatus === 'Published' ? 'badge-verified' : (s.evalStatus === 'Draft' ? 'badge-primary' : 'badge-draft')}" style="font-size:10px;">
                          ${s.evalStatus}
                        </span>
                      </td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div style="padding:var(--sp-3) var(--sp-6);border-top:1px solid var(--c-border);background:#FAFBFD;display:flex;align-items:center;justify-content:space-between;">
          <div style="font-size:11px;color:var(--c-text-3);">
            Department Monitoring View &bull; Read-Only Oversight
          </div>
          <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('class-overview-modal')?.remove();">
            Close Overview
          </button>
        </div>
      </div>`;

    document.body.appendChild(modal);
  };

  window.HODViews.classes = function () {
    const { Icons } = window.AscendUI;
    const { classes } = window.AscendHODData;

    // Apply filtering
    let list = classes.filter(c => {
      const matchSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery) || (c.assignedFacultyName && c.assignedFacultyName.toLowerCase().includes(searchQuery));
      const matchSem = filterSem === 'all' || String(c.semester) === String(filterSem);
      const matchStatus = filterMentorStatus === 'all' || 
        (filterMentorStatus === 'assigned' && c.assignedFacultyId) ||
        (filterMentorStatus === 'unassigned' && !c.assignedFacultyId);
      return matchSearch && matchSem && matchStatus;
    });

    // Apply sorting
    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'students') return b.studentCount - a.studentCount;
      if (sortBy === 'activity') return b.recentUpdatesCount - a.recentUpdatesCount;
      if (sortBy === 'evals') {
        const pctA = (a.evaluationStats.published / (a.evaluationStats.published + a.evaluationStats.draft + a.evaluationStats.notStarted || 1));
        const pctB = (b.evaluationStats.published / (b.evaluationStats.published + b.evaluationStats.draft + b.evaluationStats.notStarted || 1));
        return pctB - pctA;
      }
      return 0;
    });

    return `
      <!-- ── Page Header ────────────────────────────────────────────── -->
      <div style="margin-bottom:var(--sp-5);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);">
        <div>
          <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;color:var(--c-text);margin:0 0 4px;">
            Classes &amp; Sections Directory
          </h1>
          <div style="font-size:var(--text-sm);color:var(--c-text-2);">
            Overview of departmental cohorts, assigned mentors, student counts, and evaluation progress.
          </div>
        </div>
        <button class="btn btn-outline btn-sm" onclick="AscendApp.navigate('hod-faculty-assignments')">
          ${Icons.users} Manage Mentor Assignments
        </button>
      </div>

      <!-- ── Search & Filter Controls ───────────────────────────────── -->
      <div class="card" style="padding:var(--sp-3) var(--sp-4);margin-bottom:var(--sp-5);display:flex;align-items:center;gap:var(--sp-3);flex-wrap:wrap;">
        <div style="flex:1;min-width:240px;position:relative;">
          <input type="search" id="class-search-input" class="form-input" placeholder="Search class or mentor name…"
            value="${searchQuery}" oninput="HODViews.onClassesFilterChange()" style="padding-left:34px;font-size:var(--text-xs);">
          <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--c-text-3);pointer-events:none;">
            ${Icons.search}
          </span>
        </div>

        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:11px;font-weight:700;color:var(--c-text-3);text-transform:uppercase;">Semester:</span>
          <select id="class-sem-filter" class="form-input form-select" style="width:auto;font-size:var(--text-xs);padding:3px 20px 3px 6px;"
            onchange="HODViews.onClassesFilterChange()">
            <option value="all" ${filterSem === 'all' ? 'selected' : ''}>All Semesters</option>
            <option value="3" ${filterSem === '3' ? 'selected' : ''}>Sem 3</option>
            <option value="5" ${filterSem === '5' ? 'selected' : ''}>Sem 5</option>
            <option value="7" ${filterSem === '7' ? 'selected' : ''}>Sem 7</option>
          </select>
        </div>

        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:11px;font-weight:700;color:var(--c-text-3);text-transform:uppercase;">Mentor:</span>
          <select id="class-mentor-status" class="form-input form-select" style="width:auto;font-size:var(--text-xs);padding:3px 20px 3px 6px;"
            onchange="HODViews.onClassesFilterChange()">
            <option value="all" ${filterMentorStatus === 'all' ? 'selected' : ''}>All Status</option>
            <option value="assigned" ${filterMentorStatus === 'assigned' ? 'selected' : ''}>Assigned Only</option>
            <option value="unassigned" ${filterMentorStatus === 'unassigned' ? 'selected' : ''}>Unassigned</option>
          </select>
        </div>

        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:11px;font-weight:700;color:var(--c-text-3);text-transform:uppercase;">Sort by:</span>
          <select id="class-sort-by" class="form-input form-select" style="width:auto;font-size:var(--text-xs);padding:3px 20px 3px 6px;"
            onchange="HODViews.onClassesFilterChange()">
            <option value="name" ${sortBy === 'name' ? 'selected' : ''}>Class Name</option>
            <option value="students" ${sortBy === 'students' ? 'selected' : ''}>Student Count</option>
            <option value="activity" ${sortBy === 'activity' ? 'selected' : ''}>Recent Activity</option>
            <option value="evals" ${sortBy === 'evals' ? 'selected' : ''}>Evaluation Progress</option>
          </select>
        </div>
      </div>

      <!-- ── Classes Directory Table ────────────────────────────────── -->
      <div class="card" style="padding:0;overflow:hidden;">
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;text-align:left;font-size:var(--text-xs);">
            <thead>
              <tr style="background:#F8FAFD;border-bottom:1px solid var(--c-border);color:var(--c-text-2);font-weight:600;">
                <th style="padding:12px 18px;">Class / Section</th>
                <th style="padding:12px 14px;">Programme</th>
                <th style="padding:12px 12px;text-align:center;">Semester</th>
                <th style="padding:12px 12px;text-align:center;">Students</th>
                <th style="padding:12px 14px;">Assigned Mentor</th>
                <th style="padding:12px 14px;">Recent Activity</th>
                <th style="padding:12px 16px;">Evaluation Progress</th>
                <th style="padding:12px 18px;text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${list.length === 0 ? `
                <tr>
                  <td colspan="8" style="padding:32px 16px;text-align:center;color:var(--c-text-3);">
                    No classes match the active search and filter criteria.
                  </td>
                </tr>` : 
                list.map(c => {
                  const total = c.evaluationStats.published + c.evaluationStats.draft + c.evaluationStats.notStarted;
                  const pct = total > 0 ? Math.round((c.evaluationStats.published / total) * 100) : 0;
                  const isUnassigned = !c.assignedFacultyId;
                  return `
                    <tr style="border-bottom:1px solid var(--c-border-subtle);transition:background var(--dur-fast);" class="table-hover-row">
                      <td style="padding:14px 18px;">
                        <button type="button" class="btn btn-ghost" style="padding:0;font-weight:700;color:var(--c-text);text-align:left;font-size:var(--text-xs);"
                          onclick="HODViews.openClassOverview('${c.id}')">
                          ${c.name}
                        </button>
                      </td>
                      <td style="padding:14px 14px;color:var(--c-text-2);">${c.programme}</td>
                      <td style="padding:14px 12px;text-align:center;font-weight:600;">Sem ${c.semester}</td>
                      <td style="padding:14px 12px;text-align:center;font-weight:700;">${c.studentCount}</td>
                      <td style="padding:14px 14px;">
                        ${isUnassigned ? `
                          <span class="badge badge-risk" style="font-size:10px;">Unassigned</span>` : `
                          <div style="font-weight:600;color:var(--c-text);">${c.assignedFacultyName}</div>`}
                      </td>
                      <td style="padding:14px 14px;">
                        <div style="font-weight:600;color:#0369A1;">${c.recentUpdatesCount} updates this mo</div>
                        <div style="font-size:10px;color:var(--c-text-3);">Last: ${c.lastActivityDate}</div>
                      </td>
                      <td style="padding:14px 16px;">
                        <div style="display:flex;align-items:center;gap:8px;">
                          <div style="width:70px;height:6px;background:var(--c-border-subtle);border-radius:3px;overflow:hidden;">
                            <div style="width:${pct}%;height:100%;background:${pct > 75 ? '#166534' : (pct > 40 ? '#1A73E8' : '#B06000')};border-radius:3px;"></div>
                          </div>
                          <span style="font-weight:600;">${pct}%</span>
                        </div>
                        <div style="font-size:10px;color:var(--c-text-3);margin-top:2px;">
                          ${c.evaluationStats.published} pub &bull; ${c.evaluationStats.draft} draft &bull; ${c.evaluationStats.notStarted} not started
                        </div>
                      </td>
                      <td style="padding:14px 18px;text-align:right;">
                        <button type="button" class="btn btn-outline btn-sm" onclick="HODViews.openClassOverview('${c.id}')">
                          Overview
                        </button>
                      </td>
                    </tr>`;
                }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  };
})();
