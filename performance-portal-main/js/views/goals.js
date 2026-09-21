/**
 * ASCEND – Student Portfolio Overview View
 * Concise, factual record of self-submitted achievements, projects, and active categories.
 * Supports unlimited completed achievements and practical project builds.
 * Primary achievement categories: Certifications, Hackathons, Internships, Workshops.
 * Optional additional: Leadership & Volunteering, Research & Publications, Awards.
 * Projects are tracked distinctly as practical builds & code repositories.
 * No category is compulsory; zero arbitrary targets or caps.
 */

function renderGoals() {
  const { achievements, projects, portfolioInsights, student, publicPortfolio } = window.AscendData;
  const { Icons, formatDate } = window.AscendUI;

  const safeStudent = student || window.AscendData.student || {};
  const safePortfolio = publicPortfolio || window.AscendData.publicPortfolio || {};
  const isPublished = safePortfolio.isPublished !== false;
  const slug = safePortfolio.slug ||
    (window.AscendViews && window.AscendViews.getStudentSlug ? window.AscendViews.getStudentSlug(safeStudent) :
    (safeStudent.name ? safeStudent.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'student-portfolio'));
  const demoUrlDisplay = `ascend.app/p/${slug}`;

  const safeAchievements = Array.isArray(achievements) ? achievements : [];
  const safeProjects = Array.isArray(projects || window.AscendData.projects) ? (projects || window.AscendData.projects) : [];
  const totalCount = safeAchievements.length;
  const totalProjects = safeProjects.length;

  // Primary and Additional Categories (Achievements)
  const primaryCats = (portfolioInsights && portfolioInsights.primaryCategories) || [
    { key: 'Certification', name: 'Certification', label: 'Certifications', iconKey: 'award', description: 'Industry-recognized credentials and certifications' },
    { key: 'Hackathon', name: 'Hackathon', label: 'Hackathons', iconKey: 'lightbulb', description: 'Development sprints, hackathons, and design challenges' },
    { key: 'Internship', name: 'Internship', label: 'Internships', iconKey: 'briefcase', description: 'Industry internships and professional work experience' },
    { key: 'Workshop', name: 'Workshop', label: 'Workshops', iconKey: 'graduationCap', description: 'Technical workshops, seminars, and intensive training' },
  ];

  const additionalCats = ((portfolioInsights && portfolioInsights.additionalCategories) || [
    { key: 'Research', name: 'Research', label: 'Research & Publications', iconKey: 'fileText', description: 'Academic papers, lab research, and publications' },
    { key: 'Award', name: 'Award', label: 'Awards', iconKey: 'trophy', description: 'Merit recognitions, honors, and competitive awards' },
  ]).filter(c => c.key !== 'Leadership' && c.name !== 'Leadership');

  function matchCategory(achievementCategory, cat) {
    if (!achievementCategory) return false;
    const ac = achievementCategory.toLowerCase().trim();
    const cn = (cat.name || '').toLowerCase().trim();
    const cl = (cat.label || '').toLowerCase().trim();
    const ck = (cat.key || '').toLowerCase().trim();
    return ac === cn || ac === cl || ac === ck ||
      (cn && ac.startsWith(cn.slice(0, 4))) ||
      (cl && cl.includes(ac)) ||
      (ac.includes('research') && (cn.includes('research') || cl.includes('research'))) ||
      (ac.includes('publicat') && (cn.includes('publicat') || cl.includes('publicat'))) ||
      (ac.includes('award') && (cn.includes('award') || cl.includes('award')));
  }

  // Count badge helper — neutral portfolio counts
  function getFactualCountBadge(count) {
    if (count === 1) {
      return `<span class="badge badge-primary" style="font-size:var(--text-xs);font-weight:600;">1 achievement</span>`;
    }
    if (count > 1) {
      return `<span class="badge badge-primary" style="font-size:var(--text-xs);font-weight:600;">${count} achievements</span>`;
    }
    return `<span class="badge badge-draft" style="font-size:var(--text-xs);color:var(--c-text-3);">None yet</span>`;
  }

  // Helper to render a compact category pill/card
  function renderCategoryMiniCard(cat) {
    const matchedItems = safeAchievements.filter(a => matchCategory(a.category, cat));
    const count = matchedItems.length;
    return `
      <div class="portfolio-cat-card" style="padding:var(--sp-3) var(--sp-4);background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);display:flex;align-items:center;justify-content:space-between;gap:var(--sp-3);min-width:0;">
        <div style="display:flex;align-items:center;gap:var(--sp-3);min-width:0;">
          <div style="width:32px;height:32px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;background:${count > 0 ? 'var(--c-primary-light)' : 'var(--c-bg)'};color:${count > 0 ? 'var(--c-primary)' : 'var(--c-text-3)'};flex-shrink:0;">
            ${Icons[cat.iconKey] || Icons.award}
          </div>
          <div style="min-width:0;">
            <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${cat.label}</div>
            <div style="font-size:11px;color:var(--c-text-3);line-height:1.2;">${cat.description || ''}</div>
          </div>
        </div>
        <div style="flex-shrink:0;">
          ${getFactualCountBadge(count)}
        </div>
      </div>`;
  }

  // Recent achievements (up to 3, sorted by date)
  const sortedRecent = [...safeAchievements].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentThree = sortedRecent.slice(0, 3);
  const remainingAch = sortedRecent.slice(3);

  const recentThreeHTML = recentThree.length === 0 ? `
    <div style="padding:var(--sp-6);text-align:center;color:var(--c-text-3);font-size:var(--text-sm);background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-md);">
      No achievements yet. Click "Add achievement" to start building your portfolio.
    </div>` : `
    <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
      ${recentThree.map(item => `
        <div class="card card-sm" style="display:flex;align-items:center;gap:var(--sp-4);padding:var(--sp-3) var(--sp-4);">
          <div style="width:36px;height:36px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;background:var(--c-primary-light);color:var(--c-primary);flex-shrink:0;">
            ${Icons[item.iconKey] || Icons.award}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.title}</div>
            <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
              ${item.organization} · ${item.category} · ${formatDate(item.date)}
            </div>
          </div>
        </div>
      `).join('')}
    </div>`;

  // Collapsible remaining achievements (if more than 3)
  const remainingCollapsibleHTML = remainingAch.length > 0 ? `
    <details style="margin-top:var(--sp-3);">
      <summary style="cursor:pointer;font-size:var(--text-xs);font-weight:600;color:var(--c-primary);padding:var(--sp-2) 0;user-select:none;display:flex;align-items:center;gap:4px;">
        <span>View ${remainingAch.length} more achievement${remainingAch.length !== 1 ? 's' : ''}</span>
        <span style="display:inline-flex;">${Icons.chevronDown}</span>
      </summary>
      <div style="display:flex;flex-direction:column;gap:var(--sp-2);margin-top:var(--sp-2);">
        ${remainingAch.map(item => `
          <div class="card card-sm" style="display:flex;align-items:center;gap:var(--sp-3);padding:var(--sp-2) var(--sp-3);background:var(--c-bg);">
            <span style="color:var(--c-primary);display:inline-flex;">${Icons[item.iconKey] || Icons.award}</span>
            <div style="flex:1;min-width:0;">
              <span style="font-size:var(--text-xs);font-weight:600;color:var(--c-text);">${item.title}</span>
              <span style="font-size:11px;color:var(--c-text-3);margin-left:6px;">${item.category} · ${formatDate(item.date)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </details>` : '';

  // Collapsible category breakdown with list of all achievements
  const allCategoriesCollapsibleHTML = `
    <details style="margin-top:var(--sp-3);">
      <summary style="cursor:pointer;font-size:var(--text-xs);font-weight:600;color:var(--c-primary);padding:var(--sp-2) 0;user-select:none;display:flex;align-items:center;gap:4px;">
        <span>View achievements by category</span>
        <span style="display:inline-flex;">${Icons.chevronDown}</span>
      </summary>
      <div style="display:flex;flex-direction:column;gap:var(--sp-3);margin-top:var(--sp-3);">
        ${[...primaryCats, ...additionalCats].map(cat => {
          const items = safeAchievements.filter(a => matchCategory(a.category, cat));
          if (items.length === 0) return '';
          return `
            <div style="padding:var(--sp-3);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-2);">
                <span style="font-size:var(--text-xs);font-weight:600;color:var(--c-text);display:inline-flex;align-items:center;gap:6px;">
                  <span style="color:var(--c-primary);display:inline-flex;">${Icons[cat.iconKey] || Icons.award}</span>
                  ${cat.label}
                </span>
                ${getFactualCountBadge(items.length)}
              </div>
              <div style="display:flex;flex-direction:column;gap:4px;">
                ${items.map(it => `
                  <div style="font-size:var(--text-xs);color:var(--c-text-2);display:flex;align-items:center;gap:6px;">
                    <span style="color:var(--c-primary);display:inline-flex;">${Icons[it.iconKey] || Icons.award}</span>
                    <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${it.title} (${it.organization})</span>
                  </div>
                `).join('')}
              </div>
            </div>`;
        }).filter(Boolean).join('')}
      </div>
    </details>`;

  const categoriesCovered = [...primaryCats, ...additionalCats].filter(cat => safeAchievements.some(a => matchCategory(a.category, cat))).length;

  return `
    <!-- Portfolio Header with Add & View All Actions -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--sp-4);flex-wrap:wrap;margin-bottom:var(--sp-6);">
      <div>
        <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;color:var(--c-text);margin:0;">Portfolio Overview</h1>
        <div style="font-size:var(--text-sm);color:var(--c-text-2);margin-top:4px;">
          Your self-submitted portfolio records — distinct achievements, practical projects, and public portfolio.
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm" onclick="AscendViews.openPublicPortfolioModal ? AscendViews.openPublicPortfolioModal() : AscendApp.navigate('public-portfolio')" title="Preview your public portfolio as seen by external recruiters">
          ${Icons.globe} View Public Portfolio
        </button>
        <button class="btn btn-outline btn-sm" onclick="AscendViews.downloadPortfolio ? AscendViews.downloadPortfolio() : null" title="Download created portfolio">
          ${Icons.download} Download Portfolio
        </button>
        <button class="btn btn-outline btn-sm" onclick="AscendApp.navigate('achievements')">
          ${Icons.award} All Achievements
        </button>
        <button class="btn btn-primary btn-sm" onclick="AscendApp.navigate('achievements');setTimeout(()=>AscendUI.openModal('add-achievement-modal'),200)">
          ${Icons.plus} Add Achievement
        </button>
      </div>
    </div>

    <!-- Public Portfolio Link Card -->
    <div class="card public-portfolio-card" id="portfolio-overview-link-card" style="margin-bottom:var(--sp-6);">
      <div class="portfolio-card-header">
        <div class="portfolio-card-title-group">
          <span class="portfolio-card-title">
            <span style="color:var(--c-primary);display:inline-flex;">${Icons.globe}</span>
            Public Portfolio Link
          </span>
          <span class="badge ${isPublished ? 'badge-verified' : 'badge-review'}" id="goals-portfolio-status-badge">
            <span class="badge-dot" style="background:${isPublished ? '#1A73E8' : '#D97706'}"></span>
            ${isPublished ? 'Published & Shareable' : 'Draft (Unpublished)'}
          </span>
        </div>
        <div class="portfolio-card-actions">
          <button class="btn btn-ghost btn-sm" onclick="AscendViews.openProfileTab ? AscendViews.openProfileTab('overview') : AscendApp.navigate('profile')" title="Manage in My Profile">
            ${Icons.sliders || Icons.settings} Manage in Profile
          </button>
        </div>
      </div>

      <div class="portfolio-card-main">
        <div class="portfolio-link-chip" title="Click to copy your live public portfolio link" onclick="AscendViews.copyPortfolioLink()" style="cursor:pointer;" id="goals-portfolio-link-chip">
          <span style="color:var(--c-primary);display:inline-flex;flex-shrink:0;">${Icons.link}</span>
          <span style="user-select:all;">${demoUrlDisplay}</span>
        </div>
        <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" id="goals-copy-link-btn" onclick="AscendViews.copyPortfolioLink()">
            ${Icons.copy} Copy link
          </button>
          <button class="btn btn-primary btn-sm" onclick="AscendViews.openPublicPortfolioModal ? AscendViews.openPublicPortfolioModal() : AscendApp.navigate('public-portfolio')">
            ${Icons.eye} Preview
          </button>
          <button class="btn btn-outline btn-sm" id="goals-download-portfolio-btn" onclick="AscendViews.downloadPortfolio ? AscendViews.downloadPortfolio() : null" title="Download created portfolio">
            ${Icons.download} Download
          </button>
        </div>
      </div>

      <div class="portfolio-card-footer">
        <div style="display:flex;align-items:center;gap:var(--sp-3);flex-wrap:wrap;">
          <span><strong>${safeAchievements.length}</strong> achievement${safeAchievements.length !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span><strong>${safeProjects.length}</strong> project${safeProjects.length !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>Shareable URL for recruiters and applications</span>
        </div>
        <div class="portfolio-privacy-note">
          <span style="color:var(--c-slate);display:inline-flex;">${Icons.lock}</span>
          <span>Confidential evidence documents private by default</span>
        </div>
      </div>
    </div>

    <!-- Status Strip: Achievements -->
    <div class="portfolio-status-strip" style="display:flex;gap:var(--sp-3);margin-bottom:var(--sp-6);">
      <div class="card" style="padding:var(--sp-3) var(--sp-4);display:flex;align-items:center;gap:var(--sp-3);min-width:220px;">
        <div style="width:34px;height:34px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;background:var(--c-primary-light);color:var(--c-primary);flex-shrink:0;">
          ${Icons.award}
        </div>
        <div style="min-width:0;">
          <div style="font-size:var(--text-xl);font-weight:700;color:var(--c-primary);line-height:1;">${totalCount}</div>
          <div style="font-size:var(--text-xs);color:var(--c-text-2);font-weight:500;margin-top:2px;">Achievements</div>
        </div>
      </div>
    </div>

    <!-- Practical Projects Showcase (Distinct from achievements) -->
    <div class="card" style="padding:var(--sp-5);margin-bottom:var(--sp-6);">
      <div class="section-header" style="margin-bottom:var(--sp-4);">
        <div>
          <div class="section-title" style="font-size:var(--text-base);display:flex;align-items:center;gap:8px;">
            <span>Practical Projects (${totalProjects})</span>
            <span class="badge badge-normal" style="font-size:11px;">${totalProjects} projects</span>
          </div>
          <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
            Technical builds, open source repositories, and deployment prototypes
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="AscendViews.openProfileTab('projects-profile')">
          Manage Projects ${Icons.chevronRight}
        </button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(min(100%, 280px), 1fr));gap:var(--sp-3);">
        ${safeProjects.map(p => `
          <div style="padding:var(--sp-3) var(--sp-4);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);display:flex;flex-direction:column;justify-content:space-between;gap:var(--sp-2);">
            <div>
              <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--sp-2);margin-bottom:4px;">
                <span class="badge" style="background:var(--c-primary-light);color:var(--c-primary);font-size:10px;font-weight:600;">
                  ${p.category || 'Project'}
                </span>
                <span style="font-size:10px;color:var(--c-text-3);">${p.date || ''}</span>
              </div>
              <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);">${p.title}</div>
              <div style="font-size:var(--text-xs);color:var(--c-text-2);line-height:1.5;margin-top:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                ${p.description}
              </div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding-top:var(--sp-2);border-top:1px solid var(--c-border);font-size:11px;">
              <span style="color:var(--c-text-3);">${(p.skills || p.techStack || []).slice(0, 3).join(', ')}</span>
              ${p.repoUrl ? `<a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--c-primary);font-weight:500;display:inline-flex;align-items:center;gap:3px;">Repo ${Icons.externalLink}</a>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Recent Achievements (Up to 3) -->
    <div class="card" style="padding:var(--sp-5);margin-bottom:var(--sp-6);">
      <div class="section-header" style="margin-bottom:var(--sp-4);">
        <div>
          <div class="section-title" style="font-size:var(--text-base);">Recent Achievements</div>
          <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
            Most recently added portfolio items (${totalCount} total)
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="AscendApp.navigate('achievements')">
          View all ${Icons.chevronRight}
        </button>
      </div>
      ${recentThreeHTML}
      ${remainingCollapsibleHTML}
    </div>

    <!-- Category Overview -->
    <div class="card" style="padding:var(--sp-5);margin-bottom:var(--sp-6);">
      <div class="section-header" style="margin-bottom:var(--sp-4);">
        <div>
          <div class="section-title" style="font-size:var(--text-base);">Achievement Categories</div>
          <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
            No category is compulsory. Factual record of self-submitted portfolio achievements.
          </div>
        </div>
        <button class="btn btn-outline btn-sm" onclick="AscendApp.navigate('achievements');setTimeout(()=>AscendUI.openModal('add-achievement-modal'),200)">
          ${Icons.plus} Add achievement
        </button>
      </div>

      <!-- Primary Categories -->
      <div style="margin-bottom:var(--sp-3);">
        <div style="font-size:var(--text-xs);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--c-text-2);margin-bottom:var(--sp-2);">
          Primary Categories
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(min(100%, 240px), 1fr));gap:var(--sp-3);">
          ${primaryCats.map(renderCategoryMiniCard).join('')}
        </div>
      </div>

      ${additionalCats.length > 0 ? `
      <div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(min(100%, 240px), 1fr));gap:var(--sp-3);">
          ${additionalCats.map(renderCategoryMiniCard).join('')}
        </div>
      </div>` : ''}

      ${allCategoriesCollapsibleHTML}
    </div>

    <style>
      @media (max-width: 480px) {
        .portfolio-status-strip .card {
          width: 100% !important;
        }
      }
    </style>`;
}

/* Expose to router — routes 'goals' and 'portfolio' both call renderGoals */
window.AscendViews = window.AscendViews || {};
Object.assign(window.AscendViews, {
  goals: renderGoals,
  portfolio: renderGoals,
  initGoals: () => {},
});
