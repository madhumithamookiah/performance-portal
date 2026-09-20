/**
 * ASCEND – HOD Cohort Insights View
 * Department-level patterns only:
 * 1. Portfolio activity by class
 * 2. Achievement/project participation by category
 * 3. Students with no activity in the selected period
 * 4. Basic profile setup completion by class
 * 5. Evaluation completion rate by class
 * Strictly no individual student rankings or competitive scores.
 */

(function () {
  window.HODViews = window.HODViews || {};

  let filterProgramme = 'all';
  let filterSemester = 'all';
  let filterSection = 'all';
  let filterDateRange = '30d';

  window.HODViews.setInsightFilter = function (key, value) {
    if (key === 'programme') filterProgramme = value;
    if (key === 'semester') filterSemester = value;
    if (key === 'section') filterSection = value;
    if (key === 'dateRange') filterDateRange = value;

    const content = document.getElementById('app-content-area');
    if (content && window.AscendApp?.getCurrentView() === 'hod-cohort-insights') {
      content.innerHTML = window.HODViews.cohortInsights();
    }
  };

  window.HODViews.cohortInsights = function () {
    const { Icons } = window.AscendUI;
    const { classes, categoryStats, inactiveStudents } = window.AscendHODData;

    // Filter classes based on active dropdowns
    const filteredClasses = classes.filter(c => {
      const matchProg = filterProgramme === 'all' || c.programme.toLowerCase().includes(filterProgramme.toLowerCase());
      const matchSem = filterSemester === 'all' || String(c.semester) === String(filterSemester);
      const matchSec = filterSection === 'all' || c.section.toLowerCase().includes(filterSection.toLowerCase());
      return matchProg && matchSem && matchSec;
    });

    const maxActivity = Math.max(...classes.map(c => c.recentUpdatesCount), 50);

    return `
      <style>
        .filter-toolbar {
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          border-radius: var(--r-lg);
          padding: var(--sp-3) var(--sp-4);
          display: flex;
          align-items: center;
          gap: var(--sp-3);
          flex-wrap: wrap;
          margin-bottom: var(--sp-6);
        }
        .filter-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: var(--text-xs);
          color: var(--c-text-2);
        }
        .insights-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--sp-6);
          margin-bottom: var(--sp-6);
        }
        @media (max-width: 992px) {
          .insights-grid-2 {
            grid-template-columns: 1fr;
          }
        }
      </style>

      <!-- ── Page Header ────────────────────────────────────────────── -->
      <div style="margin-bottom:var(--sp-5);">
        <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;color:var(--c-text);margin:0 0 4px;">
          Cohort Insights
        </h1>
        <div style="font-size:var(--text-sm);color:var(--c-text-2);">
          Department-wide developmental patterns, participation distributions, and cohort progress metrics.
        </div>
      </div>

      <!-- ── Multi-Dimensional Filter Toolbar ───────────────────────── -->
      <div class="filter-toolbar">
        <div class="filter-pill">
          <span style="font-weight:700;text-transform:uppercase;font-size:10px;color:var(--c-text-3);">Programme:</span>
          <select class="form-input form-select" style="width:auto;padding:3px 20px 3px 6px;font-size:var(--text-xs);font-weight:600;"
            onchange="HODViews.setInsightFilter('programme', this.value)" aria-label="Filter by programme">
            <option value="all" ${filterProgramme === 'all' ? 'selected' : ''}>All Programmes</option>
            <option value="B.Tech CSE" ${filterProgramme === 'B.Tech CSE' ? 'selected' : ''}>B.Tech CSE</option>
          </select>
        </div>

        <div class="filter-pill">
          <span style="font-weight:700;text-transform:uppercase;font-size:10px;color:var(--c-text-3);">Semester:</span>
          <select class="form-input form-select" style="width:auto;padding:3px 20px 3px 6px;font-size:var(--text-xs);font-weight:600;"
            onchange="HODViews.setInsightFilter('semester', this.value)" aria-label="Filter by semester">
            <option value="all" ${filterSemester === 'all' ? 'selected' : ''}>All Semesters</option>
            <option value="3" ${filterSemester === '3' ? 'selected' : ''}>Semester 3</option>
            <option value="5" ${filterSemester === '5' ? 'selected' : ''}>Semester 5</option>
            <option value="7" ${filterSemester === '7' ? 'selected' : ''}>Semester 7</option>
          </select>
        </div>

        <div class="filter-pill">
          <span style="font-weight:700;text-transform:uppercase;font-size:10px;color:var(--c-text-3);">Section:</span>
          <select class="form-input form-select" style="width:auto;padding:3px 20px 3px 6px;font-size:var(--text-xs);font-weight:600;"
            onchange="HODViews.setInsightFilter('section', this.value)" aria-label="Filter by section">
            <option value="all" ${filterSection === 'all' ? 'selected' : ''}>All Sections</option>
            <option value="Section A" ${filterSection === 'Section A' ? 'selected' : ''}>Section A</option>
            <option value="Section B" ${filterSection === 'Section B' ? 'selected' : ''}>Section B</option>
          </select>
        </div>

        <div class="filter-pill">
          <span style="font-weight:700;text-transform:uppercase;font-size:10px;color:var(--c-text-3);">Timeframe:</span>
          <select class="form-input form-select" style="width:auto;padding:3px 20px 3px 6px;font-size:var(--text-xs);font-weight:600;"
            onchange="HODViews.setInsightFilter('dateRange', this.value)" aria-label="Filter by date range">
            <option value="30d" ${filterDateRange === '30d' ? 'selected' : ''}>Past 30 Days</option>
            <option value="90d" ${filterDateRange === '90d' ? 'selected' : ''}>Past 90 Days</option>
            <option value="term" ${filterDateRange === 'term' ? 'selected' : ''}>Current Term (2026–27)</option>
          </select>
        </div>

        <div style="margin-left:auto;font-size:var(--text-xs);color:var(--c-text-3);">
          Showing <strong>${filteredClasses.length}</strong> cohorts
        </div>
      </div>

      <!-- ── Grid Row 1: Activity Volume by Class & Category Participation -->
      <div class="insights-grid-2">

        <!-- 1. Portfolio Activity by Class (Horizontal Distribution) -->
        <div class="card" style="padding:var(--sp-5);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-4);">
            <div>
              <h2 style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin:0;">
                Portfolio Activity by Class
              </h2>
              <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">
                Total portfolio submissions logged in selected timeframe
              </div>
            </div>
            <span style="color:var(--c-primary);">${Icons.barChart}</span>
          </div>

          <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
            ${filteredClasses.map(c => {
              const widthPct = Math.round((c.recentUpdatesCount / maxActivity) * 100);
              const isLow = c.recentUpdatesCount < 15;
              return `
                <div>
                  <div style="display:flex;align-items:center;justify-content:space-between;font-size:var(--text-xs);margin-bottom:4px;">
                    <span style="font-weight:600;color:var(--c-text);">${c.name}</span>
                    <span style="font-weight:700;color:${isLow ? '#B06000' : 'var(--c-text)'};">
                      ${c.recentUpdatesCount} entries ${isLow ? '<span class="badge badge-attention" style="font-size:10px;padding:1px 5px;margin-left:4px;">Low Activity</span>' : ''}
                    </span>
                  </div>
                  <div style="height:10px;background:var(--c-border-subtle);border-radius:5px;overflow:hidden;">
                    <div style="width:${widthPct}%;height:100%;background:${isLow ? '#B06000' : 'var(--c-primary)'};border-radius:5px;transition:width 0.4s ease;"></div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>

        <!-- 2. Achievement / Project Participation by Category -->
        <div class="card" style="padding:var(--sp-5);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-4);">
            <div>
              <h2 style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin:0;">
                Participation by Category
              </h2>
              <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">
                Department-wide distribution of practical accomplishments
              </div>
            </div>
            <span style="color:#6D28D9;">${Icons.layers}</span>
          </div>

          <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
            ${categoryStats.map(cat => `
              <div>
                <div style="display:flex;align-items:center;justify-content:space-between;font-size:var(--text-xs);margin-bottom:4px;">
                  <span style="font-weight:600;color:var(--c-text);">${cat.label}</span>
                  <span style="color:var(--c-text-2);font-weight:600;">
                    ${cat.count} (${cat.pct}%)
                  </span>
                </div>
                <div style="height:8px;background:var(--c-border-subtle);border-radius:4px;overflow:hidden;">
                  <div style="width:${cat.pct}%;height:100%;background:${cat.color};border-radius:4px;"></div>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <!-- ── Grid Row 2: Profile Setup & Evaluation Progress by Class -->
      <div class="insights-grid-2">

        <!-- 3. Basic Profile Setup Completion by Class -->
        <div class="card" style="padding:var(--sp-5);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-4);">
            <div>
              <h2 style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin:0;">
                Profile Setup Completion
              </h2>
              <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">
                Proportion of students with complete bio, skills, and links
              </div>
            </div>
            <span style="color:#166534;">${Icons.userCheck || Icons.user}</span>
          </div>

          <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
            ${filteredClasses.map(c => {
              const rate = c.profileSetupRate;
              const isAttention = rate < 88;
              return `
                <div>
                  <div style="display:flex;align-items:center;justify-content:space-between;font-size:var(--text-xs);margin-bottom:4px;">
                    <span style="font-weight:600;color:var(--c-text);">${c.shortName}</span>
                    <span style="font-weight:700;color:${isAttention ? '#B06000' : '#166534'};">
                      ${rate}% complete ${isAttention ? `<span style="font-size:10px;color:#B06000;font-weight:normal;">(${100 - rate}% pending)</span>` : ''}
                    </span>
                  </div>
                  <div style="height:8px;background:var(--c-border-subtle);border-radius:4px;overflow:hidden;">
                    <div style="width:${rate}%;height:100%;background:${rate > 90 ? '#166534' : (rate > 85 ? '#1A73E8' : '#B06000')};border-radius:4px;"></div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>

        <!-- 4. Evaluation Completion Rate by Class -->
        <div class="card" style="padding:var(--sp-5);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-4);">
            <div>
              <h2 style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin:0;">
                Evaluation Completion Rate
              </h2>
              <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">
                Rubric status breakdown across cohorts (Published / Draft / Not Started)
              </div>
            </div>
            <span style="color:#1A73E8;">${Icons.fileText}</span>
          </div>

          <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
            ${filteredClasses.map(c => {
              const total = c.evaluationStats.published + c.evaluationStats.draft + c.evaluationStats.notStarted;
              const pubPct = total > 0 ? Math.round((c.evaluationStats.published / total) * 100) : 0;
              const dftPct = total > 0 ? Math.round((c.evaluationStats.draft / total) * 100) : 0;
              const notPct = 100 - pubPct - dftPct;
              return `
                <div>
                  <div style="display:flex;align-items:center;justify-content:space-between;font-size:var(--text-xs);margin-bottom:4px;">
                    <span style="font-weight:600;color:var(--c-text);">${c.shortName}</span>
                    <span style="font-size:11px;color:var(--c-text-2);">
                      <strong style="color:#166534;">${pubPct}% Published</strong> &bull; 
                      <strong style="color:#0369A1;">${c.evaluationStats.draft} Draft</strong> &bull; 
                      <strong style="color:${c.evaluationStats.notStarted > 0 ? '#B06000' : 'var(--c-text-3)'};">${c.evaluationStats.notStarted} Pending</strong>
                    </span>
                  </div>
                  <div style="height:8px;background:var(--c-border-subtle);border-radius:4px;overflow:hidden;display:flex;">
                    <div style="width:${pubPct}%;height:100%;background:#166534;"></div>
                    <div style="width:${dftPct}%;height:100%;background:#1A73E8;"></div>
                    <div style="width:${notPct}%;height:100%;background:#E8EAED;"></div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- ── Section 5: Inactive Students Directory (Support Follow-up) ── -->
      <div class="card" style="padding:0;overflow:hidden;">
        <div style="padding:var(--sp-4) var(--sp-5);border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-2);">
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <h2 style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin:0;">
                Students with No Activity in Selected Period
              </h2>
              <span class="badge badge-attention" style="font-size:11px;">${inactiveStudents.length} Students</span>
            </div>
            <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">
              Factual inactivity indicator to assist faculty advisors in proactive student mentorship outreach (no ranks or penalty scoring)
            </div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="AscendUI.showToast('Cohort outreach reminder list downloaded.','info')">
            ${Icons.download} Export List
          </button>
        </div>

        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;text-align:left;font-size:var(--text-xs);">
            <thead>
              <tr style="background:#F8FAFD;border-bottom:1px solid var(--c-border);color:var(--c-text-2);font-weight:600;">
                <th style="padding:10px 16px;">Student Name</th>
                <th style="padding:10px 12px;">Roll Number</th>
                <th style="padding:10px 12px;">Class</th>
                <th style="padding:10px 12px;">Last Recorded Activity</th>
                <th style="padding:10px 12px;text-align:center;">Days Inactive</th>
                <th style="padding:10px 16px;text-align:right;">Profile Status</th>
              </tr>
            </thead>
            <tbody>
              ${inactiveStudents.map(s => `
                <tr style="border-bottom:1px solid var(--c-border-subtle);transition:background var(--dur-fast);" class="table-hover-row">
                  <td style="padding:12px 16px;font-weight:600;color:var(--c-text);">
                    ${s.name}
                  </td>
                  <td style="padding:12px 12px;color:var(--c-text-2);font-weight:500;">${s.rollNo}</td>
                  <td style="padding:12px 12px;">
                    <span class="badge badge-draft" style="font-size:10px;padding:2px 6px;">${s.className}</span>
                  </td>
                  <td style="padding:12px 12px;color:var(--c-text-2);">${s.lastActive}</td>
                  <td style="padding:12px 12px;text-align:center;font-weight:700;color:#B06000;">
                    ${s.daysInactive} days
                  </td>
                  <td style="padding:12px 16px;text-align:right;">
                    <span class="badge ${s.profileSetup === 'Complete' ? 'badge-verified' : 'badge-draft'}" style="font-size:10px;">
                      ${s.profileSetup}
                    </span>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  };
})();
