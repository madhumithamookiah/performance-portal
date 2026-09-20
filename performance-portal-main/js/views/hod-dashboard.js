/**
 * ASCEND – HOD / Department Coordinator Dashboard View
 * Department-level oversight across classes, faculty mentors, portfolio activity,
 * and evaluation completion. Factual signals only (zero rankings or quality scores).
 */

(function () {
  window.HODViews = window.HODViews || {};

  let selectedPeriodId = '2026-27-odd';

  window.HODViews.onPeriodChange = function (periodId) {
    selectedPeriodId = periodId;
    const content = document.getElementById('app-content-area');
    if (content && window.AscendApp?.getCurrentView() === 'hod-dashboard') {
      content.innerHTML = window.HODViews.dashboard();
    }
  };

  window.HODViews.dashboard = function () {
    const { Icons, formatDate } = window.AscendUI;
    const { hodUser, academicPeriods, classes, facultyMentors, recentActivity } = window.AscendHODData;

    // Time-based greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    // Department-level computed metrics
    const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);
    const activeClassesCount = classes.length;
    const facultyMentorsCount = facultyMentors.length;
    const monthlyUpdatesCount = 142; // Factual department total this month
    const totalPendingEvals = classes.reduce((sum, c) => sum + (c.evaluationStats.draft + c.evaluationStats.notStarted), 0);

    // Classes needing support based solely on factual signals
    const supportClasses = [
      {
        id: 'class-cse-7b',
        name: 'B.Tech CSE · Semester 7 · Section B',
        shortName: 'CSE 7B',
        mentor: 'Unassigned',
        signalType: 'danger',
        signalBadge: 'Mentor Unassigned',
        factualReason: 'No faculty mentor assigned; semester evaluations not started (44 students pending).',
        actionLabel: 'Assign Mentor',
        actionView: 'hod-faculty-assignments',
      },
      {
        id: 'class-cse-3b',
        name: 'B.Tech CSE · Semester 3 · Section B',
        shortName: 'CSE 3B',
        mentor: 'Dr. Priya Nambiar',
        signalType: 'warning',
        signalBadge: 'Low Recent Activity',
        factualReason: 'Only 8 portfolio updates logged in the past 30 days (14 students inactive).',
        actionLabel: 'View Cohort',
        actionView: 'hod-classes',
      },
      {
        id: 'class-cse-5b',
        name: 'B.Tech CSE · Semester 5 · Section B',
        shortName: 'CSE 5B',
        mentor: 'Dr. Ananya Sen',
        signalType: 'info',
        signalBadge: 'Setup Incomplete',
        factualReason: '14% of students have missing portfolio bio or GitHub technical links.',
        actionLabel: 'View Class',
        actionView: 'hod-classes',
      },
    ];

    const currentPeriod = academicPeriods.find(p => p.id === selectedPeriodId) || academicPeriods[0];

    return `
      <style>
        .hod-stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: var(--sp-4);
          margin-bottom: var(--sp-6);
        }
        .hod-stat-card {
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: var(--r-lg);
          padding: var(--sp-4);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: box-shadow var(--dur-fast), border-color var(--dur-fast);
        }
        .hod-stat-card:hover {
          box-shadow: var(--shadow-sm);
          border-color: var(--c-primary-light);
        }
        .hod-layout-split {
          display: grid;
          grid-template-columns: 7fr 5fr;
          gap: var(--sp-6);
          align-items: start;
        }
        @media (max-width: 1200px) {
          .hod-stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .hod-layout-split {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .hod-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .hod-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>

      <!-- ── Top Header & Department Selector ───────────────────────── -->
      <div style="margin-bottom:var(--sp-5);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);">
        <div>
          <div style="display:flex;align-items:center;gap:var(--sp-2);margin-bottom:4px;">
            <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;color:var(--c-text);margin:0;">
              ${greeting}, ${hodUser.title} ${hodUser.firstName}
            </h1>
            <span class="badge badge-normal" style="font-size:11px;font-weight:600;background:#EEF2FF;color:#3730A3;border:1px solid #C7D2FE;">
              Department Coordinator
            </span>
          </div>
          <div style="font-size:var(--text-sm);color:var(--c-text-2);">
            Department of ${hodUser.department} &bull; ${hodUser.institution}
          </div>
        </div>

        <!-- Department & Academic Period Dropdowns -->
        <div style="display:flex;align-items:center;gap:var(--sp-3);flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:6px;background:var(--c-surface);border:1px solid var(--c-border);padding:4px 10px;border-radius:var(--r-md);">
            <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--c-text-3);">Period:</span>
            <select class="form-input form-select" style="border:none;background:transparent;padding:2px 20px 2px 4px;font-size:var(--text-xs);font-weight:600;width:auto;"
              onchange="HODViews.onPeriodChange(this.value)" aria-label="Select academic period">
              ${academicPeriods.map(p => `
                <option value="${p.id}" ${p.id === selectedPeriodId ? 'selected' : ''}>${p.name}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-outline btn-sm" onclick="AscendApp.navigate('hod-faculty-assignments')">
            ${Icons.users} Mentor Workload
          </button>
          <button class="btn btn-primary btn-sm" onclick="AscendApp.navigate('hod-evaluation-monitoring')">
            ${Icons.fileText} Evaluation Progress
          </button>
        </div>
      </div>

      <!-- ── 5 Factual Summary Metric Cards ────────────────────────── -->
      <div class="hod-stats-grid">
        <div class="hod-stat-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-2);">
            <span style="font-size:var(--text-xs);font-weight:600;color:var(--c-text-2);text-transform:uppercase;letter-spacing:0.04em;">Total Students</span>
            <span style="color:#1A73E8;">${Icons.users}</span>
          </div>
          <div style="font-size:28px;font-weight:700;color:var(--c-text);letter-spacing:-0.02em;">${totalStudents}</div>
          <div style="font-size:11px;color:var(--c-text-3);margin-top:4px;">Across 6 departmental sections</div>
        </div>

        <div class="hod-stat-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-2);">
            <span style="font-size:var(--text-xs);font-weight:600;color:var(--c-text-2);text-transform:uppercase;letter-spacing:0.04em;">Active Classes</span>
            <span style="color:#6D28D9;">${Icons.layers}</span>
          </div>
          <div style="font-size:28px;font-weight:700;color:var(--c-text);letter-spacing:-0.02em;">${activeClassesCount}</div>
          <div style="font-size:11px;color:var(--c-text-3);margin-top:4px;">Semesters 3, 5, and 7</div>
        </div>

        <div class="hod-stat-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-2);">
            <span style="font-size:var(--text-xs);font-weight:600;color:var(--c-text-2);text-transform:uppercase;letter-spacing:0.04em;">Faculty Mentors</span>
            <span style="color:#166534;">${Icons.userCog || Icons.users}</span>
          </div>
          <div style="font-size:28px;font-weight:700;color:var(--c-text);letter-spacing:-0.02em;">${facultyMentorsCount}</div>
          <div style="font-size:11px;color:var(--c-text-3);margin-top:4px;">5 assigned &bull; 3 unassigned</div>
        </div>

        <div class="hod-stat-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-2);">
            <span style="font-size:var(--text-xs);font-weight:600;color:var(--c-text-2);text-transform:uppercase;letter-spacing:0.04em;">New Updates</span>
            <span style="color:#0369A1;">${Icons.sparkle}</span>
          </div>
          <div style="font-size:28px;font-weight:700;color:var(--c-text);letter-spacing:-0.02em;">${monthlyUpdatesCount}</div>
          <div style="font-size:11px;color:var(--c-text-3);margin-top:4px;">Portfolio additions this month</div>
        </div>

        <div class="hod-stat-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-2);">
            <span style="font-size:var(--text-xs);font-weight:600;color:var(--c-text-2);text-transform:uppercase;letter-spacing:0.04em;">Evals Pending</span>
            <span style="color:#B06000;">${Icons.clock}</span>
          </div>
          <div style="font-size:28px;font-weight:700;color:var(--c-text);letter-spacing:-0.02em;">${totalPendingEvals}</div>
          <div style="font-size:11px;color:var(--c-text-3);margin-top:4px;">38 drafts &bull; 54 not started</div>
        </div>
      </div>

      <!-- ── 2-Column Responsive Workspace ───────────────────────────── -->
      <div class="hod-layout-split">

        <!-- Left Column: Classes Needing Support & Quick Signals -->
        <div style="display:flex;flex-direction:column;gap:var(--sp-5);">

          <!-- Classes Needing Support (Factual Signals Only) -->
          <div class="card" style="padding:0;overflow:hidden;">
            <div style="padding:var(--sp-4) var(--sp-5);border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;">
              <div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <h2 style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin:0;">
                    Classes Needing Support
                  </h2>
                  <span class="badge badge-draft" style="font-size:11px;">Factual Signals</span>
                </div>
                <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">
                  Objective indicators requiring departmental attention (unassigned cohorts, inactive periods, incomplete profile setups)
                </div>
              </div>
              <button class="btn btn-ghost btn-sm" onclick="AscendApp.navigate('hod-classes')" style="font-size:var(--text-xs);">
                All Classes ${Icons.chevronRight}
              </button>
            </div>

            <div style="display:flex;flex-direction:column;">
              ${supportClasses.map(item => `
                <div style="padding:var(--sp-4) var(--sp-5);border-bottom:1px solid var(--c-border-subtle);display:flex;align-items:flex-start;justify-content:space-between;gap:var(--sp-3);background:${item.signalType === 'danger' ? '#FFFBFB' : (item.signalType === 'warning' ? '#FFFCF5' : '#FAFDFE')};">
                  <div style="flex:1;min-width:0;">
                    <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;margin-bottom:4px;">
                      <span style="font-size:var(--text-sm);font-weight:700;color:var(--c-text);">${item.name}</span>
                      <span class="badge ${item.signalType === 'danger' ? 'badge-risk' : (item.signalType === 'warning' ? 'badge-attention' : 'badge-primary')}" style="font-size:11px;font-weight:600;">
                        ${item.signalBadge}
                      </span>
                      <span style="font-size:11px;color:var(--c-text-3);">Mentor: <strong>${item.mentor}</strong></span>
                    </div>
                    <div style="font-size:var(--text-xs);color:var(--c-text-2);line-height:1.5;">
                      ${item.factualReason}
                    </div>
                  </div>
                  <button class="btn btn-outline btn-sm" style="font-size:var(--text-xs);flex-shrink:0;background:#fff;" onclick="AscendApp.navigate('${item.actionView}')">
                    ${item.actionLabel}
                  </button>
                </div>`).join('')}
            </div>
          </div>

          <!-- Class Overview Snapshot Table -->
          <div class="card" style="padding:0;overflow:hidden;">
            <div style="padding:var(--sp-4) var(--sp-5);border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;">
              <h2 style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin:0;">
                Cohort Performance Snapshot
              </h2>
              <button class="btn btn-ghost btn-sm" onclick="AscendApp.navigate('hod-cohort-insights')" style="font-size:var(--text-xs);">
                Detailed Insights ${Icons.chevronRight}
              </button>
            </div>
            <div style="overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;text-align:left;font-size:var(--text-xs);">
                <thead>
                  <tr style="background:#F8FAFD;border-bottom:1px solid var(--c-border);color:var(--c-text-2);font-weight:600;">
                    <th style="padding:10px 16px;">Class / Section</th>
                    <th style="padding:10px 12px;">Assigned Mentor</th>
                    <th style="padding:10px 12px;text-align:center;">Students</th>
                    <th style="padding:10px 12px;text-align:center;">Updates (Mo)</th>
                    <th style="padding:10px 16px;text-align:right;">Evaluation Progress</th>
                  </tr>
                </thead>
                <tbody>
                  ${classes.map(c => {
                    const total = c.evaluationStats.published + c.evaluationStats.draft + c.evaluationStats.notStarted;
                    const pct = total > 0 ? Math.round((c.evaluationStats.published / total) * 100) : 0;
                    return `
                      <tr style="border-bottom:1px solid var(--c-border-subtle);transition:background var(--dur-fast);" class="table-hover-row">
                        <td style="padding:12px 16px;font-weight:600;color:var(--c-text);">
                          ${c.name}
                        </td>
                        <td style="padding:12px 12px;color:var(--c-text-2);">
                          ${c.assignedFacultyName === 'Unassigned' 
                            ? '<span class="badge badge-risk" style="font-size:10px;">Unassigned</span>' 
                            : c.assignedFacultyName}
                        </td>
                        <td style="padding:12px 12px;text-align:center;font-weight:600;">${c.studentCount}</td>
                        <td style="padding:12px 12px;text-align:center;color:#0369A1;font-weight:600;">${c.recentUpdatesCount}</td>
                        <td style="padding:12px 16px;text-align:right;">
                          <div style="display:inline-flex;align-items:center;gap:8px;justify-content:flex-end;">
                            <div style="width:60px;height:6px;background:var(--c-border-subtle);border-radius:3px;overflow:hidden;">
                              <div style="width:${pct}%;height:100%;background:${pct > 75 ? '#166534' : (pct > 40 ? '#1A73E8' : '#B06000')};border-radius:3px;"></div>
                            </div>
                            <span style="font-weight:600;min-width:32px;">${pct}%</span>
                          </div>
                        </td>
                      </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Column: Recent Department Activity Feed -->
        <div class="card" style="padding:0;overflow:hidden;">
          <div style="padding:var(--sp-4) var(--sp-5);border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;">
            <div>
              <h2 style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin:0;">
                Recent Department Activity
              </h2>
              <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">
                Student portfolio additions across department classes
              </div>
            </div>
            <span class="badge badge-normal" style="font-size:11px;">Live Stream</span>
          </div>

          <div style="display:flex;flex-direction:column;">
            ${recentActivity.map(act => `
              <div style="padding:var(--sp-3) var(--sp-5);border-bottom:1px solid var(--c-border-subtle);display:flex;align-items:flex-start;gap:var(--sp-3);">
                <div style="width:32px;height:32px;border-radius:var(--r-md);background:${act.badgeColor};color:${act.badgeText};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">
                  ${act.category.slice(0, 2).toUpperCase()}
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:2px;">
                    <span style="font-size:var(--text-xs);font-weight:700;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                      ${act.studentName}
                    </span>
                    <span style="font-size:10px;color:var(--c-text-3);white-space:nowrap;">${act.relativeTime}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
                    <span class="badge badge-draft" style="font-size:10px;padding:1px 6px;">${act.className}</span>
                    <span style="font-size:11px;font-weight:600;color:var(--c-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${act.title}</span>
                  </div>
                  <div style="font-size:11px;color:var(--c-text-2);line-height:1.4;">
                    ${act.detail}
                  </div>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  };
})();
