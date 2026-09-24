/**
 * ASCEND – Faculty Cohort Insights View
 * Class-specific developmental patterns and analytics.
 * Visualizes:
 *   1. Activity over time (monthly submissions/updates)
 *   2. Participation by achievement category
 *   3. Students with no recent updates (factual inactive list)
 *   4. Evaluation completion rate
 *   5. Incomplete profile details
 *
 * Strictly avoids arbitrary profile-strength scores and student rankings.
 * Zero emojis and professional SVG icons throughout.
 */

/* ── Main Render ─────────────────────────────────────────────── */
function renderFacultyAnalytics() {
  const { getClasses, getSelectedClass, getClassInsights } = window.AscendFacultyData;
  const { Icons, formatDateShort } = window.AscendUI;

  const classes = getClasses();
  const selectedClass = getSelectedClass();
  const insights = getClassInsights(selectedClass.id);

  const maxActivity = Math.max(...insights.activityOverTime.map(d => d.count), 1);
  const maxCategory = Math.max(...insights.categoryParticipation.map(c => c.count), 1);

  return `
    <!-- Header -->
    <div class="section-header" style="margin-bottom:var(--sp-5);">
      <div>
        <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;color:var(--c-text);">Cohort Insights</h1>
        <div style="font-size:var(--text-sm);color:var(--c-text-2);margin-top:4px;">
          Factual developmental patterns, portfolio submissions, and evaluation milestones for ${selectedClass.shortName}
        </div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="AscendUI.showToast('Exporting Cohort Report…','info')">
        ${Icons.download} Export Report
      </button>
    </div>

    <!-- Prominent Class / Cohort Selector Card -->
    <div class="card" style="margin-bottom:var(--sp-5);border-left:4px solid var(--c-primary);padding:var(--sp-4) var(--sp-5);">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);">
        <div style="display:flex;align-items:center;gap:var(--sp-3);">
          <div style="width:38px;height:38px;border-radius:var(--r-md);background:var(--c-primary-light);color:var(--c-primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${Icons.barChart}
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;color:var(--c-primary);text-transform:uppercase;letter-spacing:0.05em;">Selected Cohort Insights</div>
            <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">${selectedClass.name}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:var(--sp-3);">
          <label for="insights-class-select" style="font-size:var(--text-xs);font-weight:600;color:var(--c-text-2);">Switch Cohort:</label>
          <select class="form-input form-select" id="insights-class-select" style="min-width:240px;font-weight:600;" onchange="FacultyViews.onInsightsClassChange(this.value)">
            ${classes.map(c => `<option value="${c.id}" ${c.id === selectedClass.id ? 'selected' : ''}>${c.name}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>

    <!-- 4 High-Level Factual Signals -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--sp-4);margin-bottom:var(--sp-6);" class="faculty-grid-4">
      <div class="metric-card" style="--metric-accent:var(--c-primary);">
        <div class="metric-number">${insights.evaluationStats.total}</div>
        <div class="metric-label">Enrolled Students</div>
        <div class="metric-change">${selectedClass.shortName}</div>
      </div>
      <div class="metric-card" style="--metric-accent:var(--c-verified);">
        <div class="metric-number" style="color:var(--c-verified);">${insights.evaluationStats.rate}%</div>
        <div class="metric-label">Evaluation Completion</div>
        <div class="metric-change up">${insights.evaluationStats.evaluated} of ${insights.evaluationStats.total} published</div>
      </div>
      <div class="metric-card" style="--metric-accent:${insights.inactiveStudents.length > 0 ? 'var(--c-review)' : 'var(--c-verified)'};">
        <div class="metric-number" style="color:${insights.inactiveStudents.length > 0 ? 'var(--c-review)' : 'var(--c-verified)'};">
          ${insights.inactiveStudents.length}
        </div>
        <div class="metric-label">No Updates (30+ Days)</div>
        <div class="metric-change">${insights.inactiveStudents.length > 0 ? 'Need outreach' : 'All active'}</div>
      </div>
      <div class="metric-card" style="--metric-accent:${insights.incompleteProfileStudents.length > 0 ? 'var(--c-rejected)' : 'var(--c-verified)'};">
        <div class="metric-number" style="color:${insights.incompleteProfileStudents.length > 0 ? 'var(--c-rejected)' : 'var(--c-verified)'};">
          ${insights.incompleteProfileStudents.length}
        </div>
        <div class="metric-label">Incomplete Setup Details</div>
        <div class="metric-change">${insights.incompleteProfileStudents.length > 0 ? 'Missing fields' : 'Fully set up'}</div>
      </div>
    </div>

    <!-- Row 1 Charts: Activity Over Time & Participation by Category -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-5);margin-bottom:var(--sp-5);" class="faculty-grid-2">

      <!-- Pattern 1: Activity Over Time -->
      <div class="card">
        <div class="section-header" style="margin-bottom:var(--sp-4);">
          <div>
            <div class="section-title" style="font-size:var(--text-base);">Activity Over Time</div>
            <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
              Portfolio submissions, certifications, and project updates across the last 6 months
            </div>
          </div>
        </div>

        <div style="display:flex;align-items:flex-end;gap:var(--sp-3);height:170px;padding-bottom:28px;position:relative;border-bottom:1px solid var(--c-border);margin-top:var(--sp-2);">
          ${insights.activityOverTime.map(item => {
            const h = Math.max(10, Math.round((item.count / maxActivity) * 125));
            return `
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end;">
                <div style="font-size:10px;font-weight:700;color:var(--c-primary);">${item.count}</div>
                <div style="width:100%;max-width:38px;height:${h}px;background:linear-gradient(180deg, var(--c-primary), #1D4ED8);border-radius:4px 4px 0 0;" title="${item.month}: ${item.count} updates"></div>
                <div style="font-size:11px;font-weight:600;color:var(--c-text);margin-top:4px;">${item.month}</div>
              </div>`;
          }).join('')}
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:var(--sp-3);font-size:var(--text-xs);color:var(--c-text-2);">
          <span>Cohort submission trend</span>
          <span style="font-weight:600;color:var(--c-primary);">Recent peak: August–September</span>
        </div>
      </div>

      <!-- Pattern 2: Participation by Achievement Category -->
      <div class="card">
        <div class="section-header" style="margin-bottom:var(--sp-4);">
          <div>
            <div class="section-title" style="font-size:var(--text-base);">Participation by Achievement Category</div>
            <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
              Distribution of student-submitted records across practical domains
            </div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:var(--sp-3);margin-top:var(--sp-2);">
          ${insights.categoryParticipation.map(cat => {
            const pct = Math.max(4, Math.round((cat.count / maxCategory) * 100));
            return `
              <div>
                <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);margin-bottom:4px;">
                  <span style="font-weight:600;color:var(--c-text);">${cat.category}</span>
                  <span style="font-weight:700;color:var(--c-primary);">${cat.count} record${cat.count !== 1 ? 's' : ''}</span>
                </div>
                <div class="progress-bar-track" style="height:8px;">
                  <div class="progress-bar-fill" style="width:${pct}%;background:var(--c-primary);"></div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Row 2: Factual Signal Lists (Students with No Recent Updates, Incomplete Profiles, & Evaluation Stats) -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-5);margin-bottom:var(--sp-5);" class="faculty-grid-2">

      <!-- Pattern 3: Students With No Recent Updates (30+ Days) -->
      <div class="card">
        <div class="section-header" style="margin-bottom:var(--sp-3);">
          <div>
            <div class="section-title" style="font-size:var(--text-base);">Students With No Recent Updates</div>
            <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
              Factual list of students inactive for 30+ days in this cohort
            </div>
          </div>
          <span class="badge ${insights.inactiveStudents.length > 0 ? 'badge-review' : 'badge-verified'}" style="font-size:10px;">
            ${insights.inactiveStudents.length} inactive
          </span>
        </div>

        ${insights.inactiveStudents.length === 0 ? `
          <div style="padding:var(--sp-6);text-align:center;color:var(--c-text-3);">
            <div style="color:var(--c-verified);margin-bottom:6px;">${Icons.checkCircle}</div>
            <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);">All students actively updating</div>
            <div style="font-size:var(--text-xs);margin-top:2px;">Every student in ${selectedClass.shortName} has added or edited records within 30 days.</div>
          </div>` :
          `<div style="display:flex;flex-direction:column;gap:var(--sp-2);">
            ${insights.inactiveStudents.map(s => `
              <div style="padding:var(--sp-3);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);display:flex;align-items:center;justify-content:space-between;gap:var(--sp-3);">
                <div>
                  <div style="font-size:var(--text-sm);font-weight:700;color:var(--c-text);">${s.name}</div>
                  <div style="font-size:11px;color:var(--c-text-3);margin-top:1px;">
                    Roll: ${s.rollNo} · Last active: ${formatDateShort(s.lastActivity)}
                  </div>
                </div>
                <button class="btn btn-outline btn-sm" onclick="FacultyViews.openStudentDetail('${s.id}')">
                  View Student
                </button>
              </div>`).join('')}
          </div>`}
      </div>

      <!-- Pattern 4 & 5: Evaluation Completion Rate & Incomplete Profile Details -->
      <div style="display:flex;flex-direction:column;gap:var(--sp-5);">

        <!-- Pattern 4: Evaluation Completion Rate -->
        <div class="card">
          <div class="section-header" style="margin-bottom:var(--sp-3);">
            <div>
              <div class="section-title" style="font-size:var(--text-base);">Evaluation Completion Rate</div>
              <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
                Faculty rubric evaluation progress for current semester
              </div>
            </div>
            <span class="badge badge-normal" style="font-size:10px;">${insights.evaluationStats.rate}% completed</span>
          </div>

          <div style="margin-bottom:var(--sp-3);">
            <div class="progress-bar-track" style="height:10px;border-radius:5px;">
              <div class="progress-bar-fill" style="width:${insights.evaluationStats.rate}%;background:var(--c-verified);border-radius:5px;"></div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--sp-2);text-align:center;">
            <div style="padding:var(--sp-2);background:var(--c-bg);border-radius:var(--r-sm);">
              <div style="font-size:var(--text-base);font-weight:700;color:var(--c-verified);">${insights.evaluationStats.evaluated}</div>
              <div style="font-size:10px;color:var(--c-text-3);">Published</div>
            </div>
            <div style="padding:var(--sp-2);background:var(--c-bg);border-radius:var(--r-sm);">
              <div style="font-size:var(--text-base);font-weight:700;color:#2563EB;">${insights.evaluationStats.draft}</div>
              <div style="font-size:10px;color:var(--c-text-3);">Drafts</div>
            </div>
            <div style="padding:var(--sp-2);background:var(--c-bg);border-radius:var(--r-sm);">
              <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text-3);">${insights.evaluationStats.pending}</div>
              <div style="font-size:10px;color:var(--c-text-3);">Pending</div>
            </div>
          </div>
        </div>

        <!-- Pattern 5: Incomplete Profile Details -->
        <div class="card">
          <div class="section-header" style="margin-bottom:var(--sp-3);">
            <div>
              <div class="section-title" style="font-size:var(--text-base);">Incomplete Profile Details</div>
              <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
                Students requiring profile information completion
              </div>
            </div>
            <span class="badge ${insights.incompleteProfileStudents.length > 0 ? 'badge-review' : 'badge-verified'}" style="font-size:10px;">
              ${insights.incompleteProfileStudents.length} incomplete
            </span>
          </div>

          ${insights.incompleteProfileStudents.length === 0 ? `
            <div style="padding:var(--sp-4);text-align:center;color:var(--c-text-3);">
              <div style="font-size:var(--text-xs);">All students in this class have completed their profiles.</div>
            </div>` :
            `<div style="display:flex;flex-direction:column;gap:var(--sp-2);">
              ${insights.incompleteProfileStudents.map(s => `
                <div style="padding:var(--sp-2) var(--sp-3);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);display:flex;align-items:center;justify-content:space-between;gap:var(--sp-2);">
                  <div>
                    <div style="font-size:var(--text-xs);font-weight:700;color:var(--c-text);">${s.name} (${s.rollNo})</div>
                    <div style="font-size:10px;color:var(--c-review);margin-top:1px;">
                      Missing: ${s.missingProfileFields && s.missingProfileFields.length > 0 ? s.missingProfileFields.join(', ') : 'Bio / External Links'}
                    </div>
                  </div>
                  <button class="btn btn-ghost btn-sm" style="font-size:11px;" onclick="FacultyViews.openStudentDetail('${s.id}')">
                    Review
                  </button>
                </div>`).join('')}
            </div>`}
        </div>

      </div>
    </div>`;
}

function onInsightsClassChange(classId) {
  window.AscendFacultyData.setSelectedClass(classId);
  AscendApp.navigate('faculty-analytics');
}

window.FacultyViews = window.FacultyViews || {};
Object.assign(window.FacultyViews, {
  analytics: renderFacultyAnalytics,
  onInsightsClassChange,
});
