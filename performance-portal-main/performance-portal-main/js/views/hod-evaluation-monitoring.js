/**
 * ASCEND – HOD Evaluation Monitoring View
 * Shows evaluation completion across classes: Not Started, Draft, Published.
 * Filters by class, programme, semester, faculty mentor, and evaluation period.
 * HOD can monitor progress but cannot alter individual faculty evaluations.
 */

(function () {
  window.HODViews = window.HODViews || {};

  let filterClass = 'all';
  let filterSem = 'all';
  let filterMentor = 'all';
  let filterPeriod = '2026-27-mid';

  window.HODViews.onEvalFilterChange = function () {
    filterClass = document.getElementById('eval-filter-class')?.value || 'all';
    filterSem = document.getElementById('eval-filter-sem')?.value || 'all';
    filterMentor = document.getElementById('eval-filter-mentor')?.value || 'all';
    filterPeriod = document.getElementById('eval-filter-period')?.value || '2026-27-mid';

    const content = document.getElementById('app-content-area');
    if (content && window.AscendApp?.getCurrentView() === 'hod-evaluation-monitoring') {
      content.innerHTML = window.HODViews.evaluationMonitoring();
    }
  };

  window.HODViews.evaluationMonitoring = function () {
    const { Icons } = window.AscendUI;
    const { classes, facultyMentors } = window.AscendHODData;

    // Filter classes based on active controls
    const filteredClasses = classes.filter(c => {
      const matchCls = filterClass === 'all' || c.id === filterClass;
      const matchSem = filterSem === 'all' || String(c.semester) === String(filterSem);
      const matchMen = filterMentor === 'all' || c.assignedFacultyId === filterMentor;
      return matchCls && matchSem && matchMen;
    });

    // Compute totals
    let totalPublished = 0;
    let totalDraft = 0;
    let totalNotStarted = 0;
    let totalEnrolled = 0;

    filteredClasses.forEach(c => {
      totalPublished += c.evaluationStats.published;
      totalDraft += c.evaluationStats.draft;
      totalNotStarted += c.evaluationStats.notStarted;
      totalEnrolled += c.studentCount;
    });

    const grandTotal = totalPublished + totalDraft + totalNotStarted || 1;
    const overallPubPct = Math.round((totalPublished / grandTotal) * 100);
    const overallDraftPct = Math.round((totalDraft / grandTotal) * 100);
    const overallNotPct = 100 - overallPubPct - overallDraftPct;

    return `
      <!-- ── Page Header ────────────────────────────────────────────── -->
      <div style="margin-bottom:var(--sp-5);">
        <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;color:var(--c-text);margin:0 0 4px;">
          Evaluation Monitoring
        </h1>
        <div style="font-size:var(--text-sm);color:var(--c-text-2);">
          Department-wide tracking of rubric evaluations, draft progress, and completion deadlines across classes.
        </div>
      </div>

      <!-- ── Read-Only Monitoring Notice ────────────────────────────── -->
      <div style="margin-bottom:var(--sp-5);padding:14px 18px;background:#F8FAFD;border:1px solid #C2E7FF;border-radius:var(--r-lg);display:flex;align-items:center;gap:12px;">
        <div style="width:32px;height:32px;border-radius:50%;background:#E8F0FE;color:#1A73E8;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          ${Icons.info}
        </div>
        <div style="font-size:var(--text-xs);color:var(--c-text-2);line-height:1.5;">
          <strong>Department Oversight Mode (Read-Only):</strong> The HOD monitors progress, deadline adherence, and cohort completion rates. Individual student rubric evaluations, criteria scores, and qualitative remarks are authored and submitted independently by assigned faculty mentors.
        </div>
      </div>

      <!-- ── Summary Progress Metric Cards ──────────────────────────── -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:var(--sp-4);margin-bottom:var(--sp-5);">
        <div class="card" style="padding:var(--sp-4);">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--c-text-3);">Published &amp; Complete</span>
            <span style="color:#166534;">${Icons.checkCircle}</span>
          </div>
          <div style="font-size:26px;font-weight:700;color:#166534;margin-top:2px;">${totalPublished} Students</div>
          <div style="font-size:11px;color:var(--c-text-2);margin-top:2px;">${overallPubPct}% of departmental evaluations</div>
        </div>

        <div class="card" style="padding:var(--sp-4);">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--c-text-3);">Drafts in Progress</span>
            <span style="color:#1A73E8;">${Icons.edit || Icons.fileText}</span>
          </div>
          <div style="font-size:26px;font-weight:700;color:#1A73E8;margin-top:2px;">${totalDraft} Students</div>
          <div style="font-size:11px;color:var(--c-text-2);margin-top:2px;">${overallDraftPct}% currently being drafted by mentors</div>
        </div>

        <div class="card" style="padding:var(--sp-4);">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--c-text-3);">Not Started / Pending</span>
            <span style="color:#B06000;">${Icons.clock}</span>
          </div>
          <div style="font-size:26px;font-weight:700;color:#B06000;margin-top:2px;">${totalNotStarted} Students</div>
          <div style="font-size:11px;color:var(--c-text-2);margin-top:2px;">Awaiting rubric initialisation</div>
        </div>

        <div class="card" style="padding:var(--sp-4);">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--c-text-3);">Evaluation Cycle Deadline</span>
            <span style="color:var(--c-primary);">${Icons.calendar}</span>
          </div>
          <div style="font-size:22px;font-weight:700;color:var(--c-text);margin-top:2px;">15 Oct 2026</div>
          <div style="font-size:11px;color:#B06000;margin-top:2px;font-weight:600;">25 days remaining in cycle</div>
        </div>
      </div>

      <!-- ── Cumulative Department Progress Bar ─────────────────────── -->
      <div class="card" style="padding:var(--sp-4);margin-bottom:var(--sp-5);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;font-size:var(--text-xs);">
          <span style="font-weight:700;color:var(--c-text);">Overall Department Evaluation Status Breakdown</span>
          <span>
            <strong style="color:#166534;">${overallPubPct}% Published</strong> &bull; 
            <strong style="color:#1A73E8;">${overallDraftPct}% Draft</strong> &bull; 
            <strong style="color:#B06000;">${overallNotPct}% Pending</strong>
          </span>
        </div>
        <div style="height:12px;background:var(--c-border-subtle);border-radius:6px;overflow:hidden;display:flex;">
          <div style="width:${overallPubPct}%;height:100%;background:#166534;transition:width 0.4s ease;" title="Published: ${totalPublished}"></div>
          <div style="width:${overallDraftPct}%;height:100%;background:#1A73E8;transition:width 0.4s ease;" title="Drafts: ${totalDraft}"></div>
          <div style="width:${overallNotPct}%;height:100%;background:#FEEFC3;transition:width 0.4s ease;" title="Not Started: ${totalNotStarted}"></div>
        </div>
      </div>

      <!-- ── Multi-Filter Toolbar ───────────────────────────────────── -->
      <div class="card" style="padding:var(--sp-3) var(--sp-4);margin-bottom:var(--sp-5);display:flex;align-items:center;gap:var(--sp-3);flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:11px;font-weight:700;color:var(--c-text-3);text-transform:uppercase;">Class:</span>
          <select id="eval-filter-class" class="form-input form-select" style="width:auto;font-size:var(--text-xs);padding:3px 20px 3px 6px;"
            onchange="HODViews.onEvalFilterChange()">
            <option value="all" ${filterClass === 'all' ? 'selected' : ''}>All Classes</option>
            ${classes.map(c => `
              <option value="${c.id}" ${c.id === filterClass ? 'selected' : ''}>${c.shortName}</option>`).join('')}
          </select>
        </div>

        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:11px;font-weight:700;color:var(--c-text-3);text-transform:uppercase;">Semester:</span>
          <select id="eval-filter-sem" class="form-input form-select" style="width:auto;font-size:var(--text-xs);padding:3px 20px 3px 6px;"
            onchange="HODViews.onEvalFilterChange()">
            <option value="all" ${filterSem === 'all' ? 'selected' : ''}>All Semesters</option>
            <option value="3" ${filterSem === '3' ? 'selected' : ''}>Semester 3</option>
            <option value="5" ${filterSem === '5' ? 'selected' : ''}>Semester 5</option>
            <option value="7" ${filterSem === '7' ? 'selected' : ''}>Semester 7</option>
          </select>
        </div>

        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:11px;font-weight:700;color:var(--c-text-3);text-transform:uppercase;">Mentor:</span>
          <select id="eval-filter-mentor" class="form-input form-select" style="width:auto;font-size:var(--text-xs);padding:3px 20px 3px 6px;"
            onchange="HODViews.onEvalFilterChange()">
            <option value="all" ${filterMentor === 'all' ? 'selected' : ''}>All Mentors</option>
            ${facultyMentors.map(f => `
              <option value="${f.id}" ${f.id === filterMentor ? 'selected' : ''}>${f.name}</option>`).join('')}
          </select>
        </div>

        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:11px;font-weight:700;color:var(--c-text-3);text-transform:uppercase;">Cycle:</span>
          <select id="eval-filter-period" class="form-input form-select" style="width:auto;font-size:var(--text-xs);padding:3px 20px 3px 6px;"
            onchange="HODViews.onEvalFilterChange()">
            <option value="2026-27-mid" selected>Mid-Term Review 2026</option>
            <option value="2026-27-final">End-Semester 2026</option>
          </select>
        </div>
      </div>

      <!-- ── Class Breakdown Table ──────────────────────────────────── -->
      <div class="card" style="padding:0;overflow:hidden;">
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;text-align:left;font-size:var(--text-xs);">
            <thead>
              <tr style="background:#F8FAFD;border-bottom:1px solid var(--c-border);color:var(--c-text-2);font-weight:600;">
                <th style="padding:12px 18px;">Class / Section</th>
                <th style="padding:12px 14px;">Assigned Mentor</th>
                <th style="padding:12px 12px;text-align:center;">Total Students</th>
                <th style="padding:12px 12px;text-align:center;color:#166534;">Published</th>
                <th style="padding:12px 12px;text-align:center;color:#1A73E8;">Draft</th>
                <th style="padding:12px 12px;text-align:center;color:#B06000;">Not Started</th>
                <th style="padding:12px 16px;">Completion Progress</th>
                <th style="padding:12px 18px;text-align:right;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredClasses.map(c => {
                const total = c.evaluationStats.published + c.evaluationStats.draft + c.evaluationStats.notStarted;
                const pubPct = total > 0 ? Math.round((c.evaluationStats.published / total) * 100) : 0;
                const draftPct = total > 0 ? Math.round((c.evaluationStats.draft / total) * 100) : 0;
                const notPct = 100 - pubPct - draftPct;

                let statusBadge = `<span class="badge badge-verified" style="font-size:10px;">On Track</span>`;
                if (c.evaluationStats.notStarted > 20) {
                  statusBadge = `<span class="badge badge-risk" style="font-size:10px;">Pending Attention</span>`;
                } else if (c.evaluationStats.draft > 5) {
                  statusBadge = `<span class="badge badge-primary" style="font-size:10px;">In Progress</span>`;
                }

                return `
                  <tr style="border-bottom:1px solid var(--c-border-subtle);transition:background var(--dur-fast);" class="table-hover-row">
                    <td style="padding:14px 18px;font-weight:700;color:var(--c-text);">
                      ${c.name}
                    </td>
                    <td style="padding:14px 14px;color:var(--c-text-2);">
                      ${c.assignedFacultyName === 'Unassigned' 
                        ? '<span class="badge badge-risk" style="font-size:10px;">Unassigned</span>' 
                        : c.assignedFacultyName}
                    </td>
                    <td style="padding:14px 12px;text-align:center;font-weight:700;">${c.studentCount}</td>
                    <td style="padding:14px 12px;text-align:center;font-weight:700;color:#166534;">${c.evaluationStats.published}</td>
                    <td style="padding:14px 12px;text-align:center;font-weight:600;color:#1A73E8;">${c.evaluationStats.draft}</td>
                    <td style="padding:14px 12px;text-align:center;font-weight:600;color:#B06000;">${c.evaluationStats.notStarted}</td>
                    <td style="padding:14px 16px;">
                      <div style="display:flex;align-items:center;gap:8px;">
                        <div style="width:90px;height:8px;background:var(--c-border-subtle);border-radius:4px;overflow:hidden;display:flex;">
                          <div style="width:${pubPct}%;height:100%;background:#166534;"></div>
                          <div style="width:${draftPct}%;height:100%;background:#1A73E8;"></div>
                          <div style="width:${notPct}%;height:100%;background:#FEEFC3;"></div>
                        </div>
                        <span style="font-weight:600;min-width:32px;">${pubPct}%</span>
                      </div>
                    </td>
                    <td style="padding:14px 18px;text-align:right;">
                      ${statusBadge}
                    </td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  };
})();
