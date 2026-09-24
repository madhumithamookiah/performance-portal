/**
 * ASCEND – Student Dashboard View
 * Renders the main dashboard screen.
 * Factual, accurate overview of achievements and submissions without arbitrary scoring.
 * Called by app.js router; receives fresh data on each render.
 */
function renderDashboard() {
  const { student, achievements, projects, activity, portfolioInsights, feedback } = window.AscendData;
  const { Icons, statusBadge, formatDate } = window.AscendUI;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Factual achievement & project metrics
  const safeAchievements = Array.isArray(achievements) ? achievements : [];
  const safeProjects = Array.isArray(projects || window.AscendData.projects) ? (projects || window.AscendData.projects) : [];
  const totalCount = safeAchievements.length;
  const projectsCount = safeProjects.length;

  // Calculate unique skills total correctly from demo achievements and projects
  const uniqueSkills = new Set();
  safeAchievements.forEach(a => {
    if (Array.isArray(a.skills)) {
      a.skills.forEach(s => s && uniqueSkills.add(typeof s === 'string' ? s.trim() : s.name));
    }
  });
  safeProjects.forEach(p => {
    const pSkills = Array.isArray(p.skills) ? p.skills : Array.isArray(p.techStack) ? p.techStack : [];
    pSkills.forEach(s => s && uniqueSkills.add(typeof s === 'string' ? s.trim() : s.name));
  });
  const skillsCount = uniqueSkills.size;

  // Most recently added achievement
  const recentAchievement = safeAchievements.slice().sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  // Categories represented (categories with at least 1 achievement)
  const defaultDashboardCategories = [
    { name: 'Certification', label: 'Certifications', iconKey: 'award', max: 5 },
    { name: 'Hackathon', label: 'Hackathons', iconKey: 'lightbulb', max: 4 },
    { name: 'Internship', label: 'Internships', iconKey: 'briefcase', max: 3 },
    { name: 'Research', label: 'Research', iconKey: 'microscope', max: 3 },
    { name: 'Academic', label: 'Academic', iconKey: 'graduationCap', max: 4 },
    { name: 'Leadership', label: 'Leadership', iconKey: 'star', max: 3 },
    { name: 'Award', label: 'Honors & Awards', iconKey: 'trophy', max: 4 },
  ];
  const categoriesDef = (portfolioInsights && Array.isArray(portfolioInsights.categories) && portfolioInsights.categories.length > 0)
    ? portfolioInsights.categories
    : defaultDashboardCategories;
  const catMap = {};
  safeAchievements.forEach(a => {
    const catMatch = categoriesDef.find(c =>
      c.name === a.category || c.label === a.category || c.key === a.category ||
      (a.category && c.name && a.category.toLowerCase().startsWith(c.name.toLowerCase().slice(0, 4)))
    );
    const catKey = catMatch ? catMatch.name : (a.category || 'General');
    catMap[catKey] = (catMap[catKey] || 0) + 1;
  });
  const categoriesRepresentedCount = Object.keys(catMap).length;

  // Timeline items
  const activityList = Array.isArray(activity) ? activity : [];
  const activityHTML = activityList.length > 0 ? activityList.map(a => {
    const dotColor = a.status === 'new-feedback' ? '#1A73E8' : '#1557D0';
    const sub = a.subtitle || a.desc || '';
    const dateVal = a.date || a.timestamp || null;
    const stat = a.status || (a.type === 'profile_updated' ? 'completed' : 'added');
    return `
      <div class="timeline-item">
        <div class="timeline-marker">
          <div class="timeline-dot" style="border-color:${dotColor};background:${dotColor}20"></div>
          <div class="timeline-line"></div>
        </div>
        <div class="timeline-content">
          <div class="timeline-title">
            <span style="display:inline-flex;align-items:center;color:${dotColor};margin-right:6px;">${Icons[a.iconKey] || Icons.award}</span>
            ${a.title || 'Portfolio Update'}
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap;">
            ${sub ? `<span style="font-size:var(--text-xs);color:var(--c-text-3)">${sub}</span>` : ''}
            ${statusBadge(stat)}
          </div>
          <div class="timeline-meta">${formatDate(dateVal)}</div>
        </div>
      </div>`;
  }).join('') : `
    <div style="font-size:var(--text-sm);color:var(--c-text-3);padding:var(--sp-2) 0;">
      No activity yet. Complete achievements or projects to build your timeline.
    </div>`;

  // Factual category distribution list
  const categoryDistributionHTML = `
    <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
      ${categoriesDef.map(c => {
        const cCount = catMap[c.name] || 0;
        return `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--sp-2) 0;border-bottom:1px solid var(--c-border);">
            <div style="display:flex;align-items:center;gap:var(--sp-3);">
              <span style="display:inline-flex;align-items:center;color:${cCount > 0 ? 'var(--c-primary)' : 'var(--c-text-3)'};">${Icons[c.iconKey] || Icons.award}</span>
              <span style="font-size:var(--text-sm);font-weight:500;">${c.label}</span>
            </div>
            ${cCount > 0
              ? `<span class="badge badge-primary" style="font-size:var(--text-xs);">${cCount} recorded</span>`
              : `<span style="font-size:var(--text-xs);color:var(--c-text-3);">0 recorded</span>`}
          </div>`;
      }).join('')}
    </div>`;

  return `
    <!-- Page Header -->
    <div style="margin-bottom:var(--sp-6);">
      <div style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;color:var(--c-text);">
        ${greeting}, ${student ? student.firstName : 'Student'}
      </div>
      <div style="margin-top:4px;font-size:var(--text-base);color:var(--c-text-2);">
        Keep building your comprehensive professional portfolio with completed achievements and projects.
      </div>
    </div>

    <!-- ── Compact Monthly Activity Update Card ────────────────────────── -->
    ${renderStudentMonthlyUpdateCard()}

    <!-- Top Row: Factual Portfolio Overview + Add Achievement CTA -->
    <div class="dash-top-row" style="display:grid;grid-template-columns:1.2fr 1fr;gap:var(--sp-5);margin-bottom:var(--sp-6);">


      <!-- Factual Portfolio Overview Card -->
      <div class="card" style="display:flex;flex-direction:column;justify-content:space-between;gap:var(--sp-4);">
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-3);">
            <div>
              <div style="font-size:var(--text-lg);font-weight:600;color:var(--c-text);">Portfolio Overview</div>
              <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">Factual record of portfolio achievements and projects</div>
            </div>
            <span class="badge badge-primary" style="font-size:var(--text-xs);">Active Portfolio</span>
          </div>

          <!-- Key Metrics Grid: Achievements (5), Projects (3), Skills (unique count) -->
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:var(--sp-2);padding:var(--sp-3);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);margin-bottom:var(--sp-4);">
            <div>
              <div style="font-size:var(--text-xl);font-weight:700;color:var(--c-primary);line-height:1.2;">${totalCount}</div>
              <div style="font-size:11px;color:var(--c-text-2);font-weight:500;">Achievements</div>
            </div>
            <div>
              <div style="font-size:var(--text-xl);font-weight:700;color:var(--c-primary);line-height:1.2;">${projectsCount}</div>
              <div style="font-size:11px;color:var(--c-text-2);font-weight:500;">Projects</div>
            </div>
            <div>
              <div style="font-size:var(--text-xl);font-weight:700;color:var(--c-primary);line-height:1.2;">${skillsCount > 0 ? skillsCount : '0'}</div>
              <div style="font-size:11px;color:var(--c-text-2);font-weight:500;">Skills</div>
            </div>
          </div>

          <!-- Most Recently Added Achievement -->
          ${recentAchievement ? `
            <div style="padding:var(--sp-3);background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);display:flex;align-items:center;gap:var(--sp-3);">
              <div style="width:36px;height:36px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;background:var(--c-primary-xlight);color:var(--c-primary);flex-shrink:0;">
                ${Icons[recentAchievement.iconKey] || Icons.award}
              </div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--c-primary);">Most recently added</div>
                <div style="font-size:var(--text-sm);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--c-text);">${recentAchievement.title}</div>
                <div style="font-size:var(--text-xs);color:var(--c-text-3);">${recentAchievement.organization || 'Self-Directed'} · ${formatDate(recentAchievement.date)}</div>
              </div>
            </div>` : `
            <div style="font-size:var(--text-sm);color:var(--c-text-3);padding:var(--sp-2) 0;">No achievements added yet.</div>`}
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:var(--sp-2);border-top:1px solid var(--c-border);">
          <span style="font-size:var(--text-xs);color:var(--c-text-3);">${totalCount} achievements · ${projectsCount} projects recorded</span>
          <button class="btn btn-outline btn-sm" onclick="AscendApp.navigate('goals')">
            View portfolio ${Icons.chevronRight}
          </button>
        </div>
      </div>

      <!-- Add Achievement CTA Card -->
      <div class="card" style="display:flex;flex-direction:column;justify-content:space-between;gap:var(--sp-4);background:var(--c-primary);border-color:var(--c-primary);color:#fff;">
        <div style="display:flex;align-items:flex-start;gap:var(--sp-4);">
          <div style="width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${Icons.award.replace('stroke="currentColor"', 'stroke="white"')}
          </div>
          <div>
            <div style="font-size:var(--text-lg);font-weight:600;">Add Achievement</div>
            <div style="font-size:var(--text-sm);opacity:0.9;margin-top:4px;line-height:1.5;">
              Add completed certifications, awards, projects, hackathons, or internships to your portfolio.
            </div>
          </div>
        </div>
        <div>
          <div style="font-size:var(--text-xs);opacity:0.8;margin-bottom:var(--sp-3);">
            No caps on completed achievements — record every credential you earn.
          </div>
          <button class="btn" style="background:rgba(255,255,255,0.2);color:#fff;border:1.5px solid rgba(255,255,255,0.3);width:100%;"
            onclick="AscendApp.navigate('achievements');setTimeout(()=>AscendUI.openModal('add-achievement-modal'),200)">
            ${Icons.plus} Add achievement
          </button>
        </div>
      </div>
    </div>


    <!-- Lower Row: Activity + Categories + Mentor Guidance -->
    <div class="dash-lower-row" style="display:grid;grid-template-columns:1.2fr 1fr;gap:var(--sp-5);margin-bottom:var(--sp-8);">

      <!-- Recent Activity -->
      <div class="card" style="display:flex;flex-direction:column;gap:var(--sp-5);">
        <div class="section-header" style="margin-bottom:0">
          <div class="section-title" style="font-size:var(--text-base)">Recent activity</div>
          <button class="btn btn-ghost btn-sm" onclick="AscendApp.navigate('achievements')">View all</button>
        </div>
        <div class="timeline">${activityHTML}</div>
      </div>

      <!-- Right Column: Categories Breakdown + Mentor Guidance -->
      <div style="display:flex;flex-direction:column;gap:var(--sp-5);">

        <!-- Category Breakdown (No caps) -->
        <div class="card">
          <div class="section-header" style="margin-bottom:var(--sp-3)">
            <div>
              <div class="section-title" style="font-size:var(--text-base)">Achievements by category</div>
              <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">Breakdown across portfolio categories</div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="AscendApp.navigate('goals')">Portfolio <span style="display:inline-flex;margin-left:4px;">${Icons.chevronRight}</span></button>
          </div>
          ${categoryDistributionHTML}
        </div>
      </div>
    </div>

    <style>
      /* Dashboard responsive rules */
      @media (max-width: 900px) {
        .dash-top-row { grid-template-columns: 1fr !important; }
        .dash-lower-row { grid-template-columns: 1fr !important; }
        .monthly-card-actions { flex-direction: column; align-items: stretch !important; gap: 8px !important; }
      }
    </style>`;
}

/* ── Compact Monthly Activity Update Card Sub-Renderer ───────── */
function renderStudentMonthlyUpdateCard() {
  const { Icons, formatDate } = window.AscendUI;
  const summaries = (window.AscendData && Array.isArray(window.AscendData.monthlySummaries))
    ? window.AscendData.monthlySummaries
    : [];

  const selectedKey = window._studentSelectedMonthKey || (summaries[0] ? summaries[0].monthKey : '2026-09');
  const summary = summaries.find(m => m.monthKey === selectedKey) || summaries[0] || {
    month: 'September 2026',
    monthKey: '2026-09',
    achievementsAdded: 2,
    projectsUpdated: 1,
    feedbackReceived: 1,
    lastActivityFormatted: '4 days ago',
    reviewedByStudent: false,
    summaryText: 'September summary: 2 achievements added, 1 project updated, 1 faculty feedback note received. Last portfolio activity: 4 days ago.',
  };

  const isReviewed = !!summary.reviewedByStudent;
  const reviewedText = summary.reviewedAt ? `Reviewed on ${formatDate(summary.reviewedAt)}` : 'Marked as reviewed';

  return `
    <div class="card" id="student-monthly-update-card" style="padding:18px 20px;margin-bottom:var(--sp-6);background:var(--c-surface);border:1.5px solid var(--c-border);border-left:4px solid var(--c-primary);border-radius:var(--r-md);box-shadow:0 1px 3px rgba(0,0,0,0.04);">
      <!-- Top Row: Icon + Title + Month Selector + Status Badge -->
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:var(--r-md);background:var(--c-primary-light);color:var(--c-primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${Icons.clock}
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Monthly Activity Summary</span>
              <select class="form-input form-select" id="student-month-select"
                style="padding:3px 26px 3px 10px;font-size:12px;font-weight:600;width:auto;border-radius:var(--r-sm);height:auto;"
                onchange="AscendViews.onStudentChangeMonth(this.value)">
                ${summaries.map(m => `
                  <option value="${m.monthKey}" ${m.monthKey === selectedKey ? 'selected' : ''}>
                    ${m.month}
                  </option>`).join('')}
              </select>
            </div>
            <div style="font-size:11px;color:var(--c-text-3);margin-top:2px;">
              Factual record of portfolio additions and mentorship notes &bull; Not an automated score
            </div>
          </div>
        </div>

        <div>
          ${isReviewed ? `
            <span class="badge" style="background:#E8F0FE;color:#1A73E8;border:1px solid #C2D8FF;font-weight:600;font-size:11.5px;padding:4px 10px;display:inline-flex;align-items:center;gap:5px;">
              ${Icons.check} Reviewed
            </span>` : `
            <span class="badge" style="background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;font-weight:600;font-size:11.5px;padding:4px 10px;display:inline-flex;align-items:center;gap:5px;">
              ${Icons.clock} Review Needed
            </span>`}
        </div>
      </div>

      <!-- Factual Summary Callout -->
      <div style="padding:12px 14px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);margin-bottom:12px;">
        <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);line-height:1.5;">
          ${summary.summaryText}
        </div>
        <!-- Factual breakdown pills -->
        <div style="display:flex;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap;">
          <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:var(--r-sm);background:var(--c-surface);border:1px solid var(--c-border);color:var(--c-text-2);">
            ${summary.achievementsAdded} achievement${summary.achievementsAdded !== 1 ? 's' : ''} added
          </span>
          <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:var(--r-sm);background:var(--c-surface);border:1px solid var(--c-border);color:var(--c-text-2);">
            ${summary.projectsUpdated} project${summary.projectsUpdated !== 1 ? 's' : ''} updated
          </span>
          <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:var(--r-sm);background:var(--c-surface);border:1px solid var(--c-border);color:var(--c-text-2);">
            ${summary.feedbackReceived} feedback note${summary.feedbackReceived !== 1 ? 's' : ''}
          </span>
          <span style="font-size:11px;color:var(--c-text-3);">
            &bull; Last activity: ${summary.lastActivityFormatted || 'Recently'}
          </span>
        </div>
      </div>

      <!-- Actions Bar -->
      <div class="monthly-card-actions" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding-top:4px;">
        <div style="font-size:11.5px;color:var(--c-text-3);">
          ${isReviewed ? `${Icons.check} ${reviewedText}` : 'Please review and confirm your monthly portfolio records before month-end.'}
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="btn btn-outline btn-sm" onclick="AscendApp.navigate('goals')">
            Review your progress ${Icons.chevronRight}
          </button>
          ${!isReviewed ? `
            <button class="btn btn-primary btn-sm" onclick="AscendViews.onStudentReviewMonth('${summary.monthKey}')">
              ${Icons.check} Mark as reviewed
            </button>` : `
            <button class="btn btn-ghost btn-sm" disabled style="opacity:0.8;cursor:default;border:1px solid var(--c-border);">
              ${Icons.check} Confirmed
            </button>`}
        </div>
      </div>
    </div>`;
}

/* ── Month Selector & Review Action Handlers ─────────────────── */
function onStudentChangeMonth(monthKey) {
  window._studentSelectedMonthKey = monthKey;
  const card = document.getElementById('student-monthly-update-card');
  if (card) {
    card.outerHTML = renderStudentMonthlyUpdateCard();
  }
}

async function onStudentReviewMonth(monthKey) {
  if (window.AscendData && window.AscendData.markMonthReviewed) {
    await window.AscendData.markMonthReviewed(monthKey);
    if (window.AscendUI && window.AscendUI.showToast) {
      window.AscendUI.showToast('Monthly activity summary marked as reviewed.', 'success');
    }
  }
  const card = document.getElementById('student-monthly-update-card');
  if (card) {
    card.outerHTML = renderStudentMonthlyUpdateCard();
  }
}

window.AscendViews = window.AscendViews || {};
Object.assign(window.AscendViews, {
  dashboard: renderDashboard,
  onStudentChangeMonth,
  onStudentReviewMonth,
});

