/**
 * ASCEND – Student Profile View & Public Portfolio Experience
 * Includes:
 * - Student Profile header with achievements and projects overview
 * - Compact, flat Public Portfolio card with public link (ascend.app/p/portfolio)
 * - Copy link, preview, and publish/unpublish actions
 * - Interactive Public Portfolio preview modal with device toggles (Desktop/Tablet/Mobile)
 * - Standalone public portfolio route support (#public-portfolio)
 * - Strict certificate & evidence privacy safeguards (no proof documents or faculty comments exposed)
 * - Student-selected public achievements & projects selector
 * - Fully functional Projects tab with add project capabilities
 * - Zero emojis — uses 100% outline SVGs from window.AscendUI.Icons
 */

/* ── Helper: generate clean URL slug from student name ─────── */
function getStudentSlug(student) {
  const base = (student && student.name) ? student.name : 'student';
  return base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/* ── Helper: Aggregate skills by category based on user's input ─ */
function getAggregatedUserSkills() {
  const defaultCategories = ['Technical', 'Communication', 'Leadership', 'Innovation', 'Career Readiness'];
  const storedSkillsSources = [
    window.AscendData.skills,
    window.AscendData.student && window.AscendData.student.skills
  ].filter(Boolean);

  const ignored = [];
  storedSkillsSources.forEach(src => {
    if (Array.isArray(src._ignored)) {
      src._ignored.forEach(s => ignored.push(s.toLowerCase().trim()));
    }
  });

  const result = {};
  defaultCategories.forEach(c => { result[c] = []; });

  const normalizeCat = (c) => {
    if (!c) return 'Technical';
    const lower = c.toLowerCase().trim();
    if (lower.startsWith('tech')) return 'Technical';
    if (lower.startsWith('comm')) return 'Communication';
    if (lower.startsWith('lead')) return 'Leadership';
    if (lower.startsWith('innov')) return 'Innovation';
    if (lower.startsWith('career')) return 'Career Readiness';
    return c;
  };

  const addedSet = new Set();

  // 1. Explicit user skills added directly
  storedSkillsSources.forEach(storedSkills => {
    Object.entries(storedSkills).forEach(([rawCat, list]) => {
      if (rawCat === '_ignored' || !Array.isArray(list)) return;
      const cat = normalizeCat(rawCat);
      if (!result[cat]) result[cat] = [];
      list.forEach(item => {
        const sName = (typeof item === 'string' ? item : (item && item.name ? item.name : '')).trim();
        if (!sName) return;
        const key = `${cat}::${sName.toLowerCase()}`;
        if (!addedSet.has(key) && !ignored.includes(sName.toLowerCase())) {
          addedSet.add(key);
          result[cat].push({ name: sName, source: 'user' });
        }
      });
    });
  });

  // 2. Classify skills from achievements & projects
  const taxonomy = {
    'Communication': ['communication', 'presentation', 'public speaking', 'pitching', 'writing', 'technical writing', 'mentorship', 'storytelling', 'cross-team', 'collaboration'],
    'Leadership': ['leadership', 'team collaboration', 'team lead', 'event management', 'community building', 'agile / scrum', 'scrum', 'delegation', 'conflict resolution', 'strategic planning', 'project tracking', 'budgeting'],
    'Innovation': ['innovation', 'critical thinking', 'research methodology', 'rapid prototyping', 'ui/ux', 'design thinking', 'problem solving', 'algorithm design', 'experimental design', 'analytical thinking', 'creativity'],
    'Career Readiness': ['career readiness', 'resume', 'cv', 'code review', 'jira', 'production codebase', 'ci/cd', 'testing & debugging', 'qa', 'technical documentation', 'version control', 'interview'],
  };

  function classify(name) {
    const lower = name.toLowerCase();
    for (const [cat, kws] of Object.entries(taxonomy)) {
      if (kws.some(kw => lower.includes(kw))) return cat;
    }
    return 'Technical';
  }

  // Aggregate from achievements
  const achs = Array.isArray(window.AscendData.achievements) ? window.AscendData.achievements : [];
  achs.forEach(a => {
    const sList = Array.isArray(a.skills) ? a.skills : [];
    sList.forEach(s => {
      const sName = (typeof s === 'string' ? s : (s && s.name ? s.name : '')).trim();
      if (!sName || ignored.includes(sName.toLowerCase())) return;
      const cat = classify(sName);
      const key = `${cat}::${sName.toLowerCase()}`;
      if (!addedSet.has(key)) {
        addedSet.add(key);
        if (!result[cat]) result[cat] = [];
        result[cat].push({ name: sName, source: 'achievement' });
      }
    });
  });

  // Aggregate from projects
  const projs = Array.isArray(window.AscendData.projects) ? window.AscendData.projects : [];
  projs.forEach(p => {
    const sList = Array.isArray(p.skills) ? p.skills : [];
    sList.forEach(s => {
      const sName = (typeof s === 'string' ? s : (s && s.name ? s.name : '')).trim();
      if (!sName || ignored.includes(sName.toLowerCase())) return;
      const cat = classify(sName);
      const key = `${cat}::${sName.toLowerCase()}`;
      if (!addedSet.has(key)) {
        addedSet.add(key);
        if (!result[cat]) result[cat] = [];
        result[cat].push({ name: sName, source: 'project' });
      }
    });
  });

  return result;
}

/* ── Main Student Profile Render ───────────────────────────── */
function renderProfile() {
  const { student, skills, profileChecklist, achievements } = window.AscendData;
  const { Icons, statusBadge, skillTag } = window.AscendUI;

  // Initialize public portfolio config if missing
  if (!window.AscendData.publicPortfolio) {
    window.AscendData.publicPortfolio = {
      isPublished: true,
      slug: getStudentSlug(student),
      showBio: true,
      showCareerInterests: true,
      showLinks: true,
      showSkills: true,
      showProjects: true,
      showAchievements: true,
      publicAchievementIds: achievements.map(a => a.id),
      keepEvidencePrivate: true,
    };
  }

  // Ensure projects array exists
  if (!window.AscendData.projects) {
    window.AscendData.projects = [];
  }

  const publicPortfolio = window.AscendData.publicPortfolio;
  const slug = publicPortfolio.slug || getStudentSlug(student);
  const demoUrlDisplay = `ascend.app/p/${slug}`;

  // Factual achievement metrics
  const totalCount = achievements.length;

  // Selected public items
  const publicAchievementIds = publicPortfolio.publicAchievementIds || [];
  const publicAchievements = achievements.filter(a => publicAchievementIds.includes(a.id));
  const publicProjects = (window.AscendData.projects || []).filter(p => p.isPublic !== false);

  const isPublished = publicPortfolio.isPublished !== false;

  // Resume status check
  const resume = student && student.resume;
  const hasResume = !!(resume && (resume.name || resume.dataUrl));

  // Dynamically compute profile checklist against live user data
  const isBioDone = !!(student.bio && student.bio.trim().length > 0);
  const isResumeDone = hasResume;
  const isLinkedInDone = !!(student.linkedIn && student.linkedIn.trim().length > 0);
  const isPortfolioDone = !!((student.portfolio && student.portfolio.trim().length > 0) || (student.github && student.github.trim().length > 0));
  const isInterestsDone = Array.isArray(student.careerInterests) && student.careerInterests.length > 0;

  const profileChecklistComputed = [
    { id: 'bio', label: 'Add professional bio', detail: 'Introduce your academic background and focus', done: isBioDone },
    { id: 'resume', label: 'Upload current résumé', detail: 'Attach an up-to-date PDF résumé', done: isResumeDone },
    { id: 'linkedin', label: 'Connect LinkedIn profile', detail: 'Link your public professional network', done: isLinkedInDone },
    { id: 'portfolio', label: 'Add GitHub or portfolio website link', detail: 'Showcase code repositories and live work', done: isPortfolioDone },
    { id: 'interests', label: 'Select career interests', detail: 'Highlight target roles and industries', done: isInterestsDone },
  ];
  window.AscendData.profileChecklist = profileChecklistComputed;
  const doneCount = profileChecklistComputed.filter(c => c.done).length;

  /* ── Overview Tab ─────────────────────────────────────────── */
  const overviewTab = `
    <div class="profile-overview-grid">

      <!-- Left column: Bio + Career Interests + External Profiles -->
      <div style="display:flex;flex-direction:column;gap:var(--sp-5);">
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-3);">
            <div style="font-size:var(--text-sm);font-weight:600;">About</div>
            <button class="btn btn-ghost btn-sm" onclick="AscendViews.openEditProfileModal()" aria-label="Edit bio and career interests">
              ${Icons.edit} Edit
            </button>
          </div>
          <p id="profile-bio-text" style="font-size:var(--text-sm);color:${(student.bio && student.bio.trim()) ? 'var(--c-text-2)' : 'var(--c-text-3)'};line-height:1.8;margin-bottom:var(--sp-3);${(student.bio && student.bio.trim()) ? '' : 'font-style:italic;'}">${(student.bio && student.bio.trim()) ? student.bio : 'No professional bio added yet. Click Edit to add your bio.'}</p>
          <div style="font-size:var(--text-xs);font-weight:600;color:var(--c-text-3);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:var(--sp-2);">Career interests</div>
          <div id="profile-career-tags" style="display:flex;flex-wrap:wrap;gap:var(--sp-2);">
            ${(student.careerInterests && student.careerInterests.length > 0)
              ? student.careerInterests.map(i => `<span class="skill-tag">${i}</span>`).join('')
              : '<span style="color:var(--c-text-3);font-size:var(--text-xs);font-style:italic;">No career interests added yet. Click Edit to select your focus areas.</span>'}
          </div>
        </div>

        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-3);">
            <div style="font-size:var(--text-sm);font-weight:600;display:flex;align-items:center;gap:6px;">
              <span style="color:var(--c-primary);display:inline-flex;">${Icons.link}</span>
              Portfolio &amp; External Profiles
            </div>
            <button class="btn btn-ghost btn-sm" onclick="AscendViews.openEditProfileModal()" aria-label="Edit links">
              ${Icons.edit} Edit links
            </button>
          </div>

          <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
            <!-- Ascend Public Portfolio Link -->
            <div style="background:var(--c-primary-light);border:1px solid var(--c-border);border-radius:var(--r-md);padding:var(--sp-3);display:flex;flex-direction:column;gap:var(--sp-2);">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--sp-2);flex-wrap:wrap;">
                <div style="display:flex;align-items:center;gap:6px;font-size:var(--text-xs);font-weight:600;color:var(--c-primary-dark);">
                  <span style="display:inline-flex;color:var(--c-primary);">${Icons.globe}</span>
                  Public Portfolio Link
                </div>
                <div style="display:flex;align-items:center;gap:var(--sp-2);">
                  <span class="badge ${isPublished ? 'badge-verified' : 'badge-review'}" id="portfolio-status-badge" style="font-size:10px;padding:2px 8px;">
                    <span class="badge-dot" style="background:${isPublished ? '#1A73E8' : '#D97706'}"></span>
                    <span id="portfolio-status-text">${isPublished ? 'Live' : 'Draft'}</span>
                  </span>
                  <button class="btn btn-ghost btn-sm" style="font-size:11px;padding:2px 6px;height:auto;" id="portfolio-publish-toggle-btn" onclick="AscendViews.togglePortfolioPublish()" title="Toggle publish status">
                    ${isPublished ? Icons.eyeOff : Icons.globe} <span id="portfolio-publish-label">${isPublished ? 'Unpublish' : 'Publish'}</span>
                  </button>
                  <button class="btn btn-ghost btn-sm" style="font-size:11px;padding:2px 6px;height:auto;" onclick="AscendViews.openManagePublicItemsModal()" title="Manage public items">
                    ${Icons.sliders} Manage items
                  </button>
                </div>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--sp-2);background:var(--c-surface);padding:6px 10px;border-radius:var(--r-sm);border:1px solid var(--c-border);">
                <span style="font-family:ui-monospace,monospace;font-size:var(--text-xs);color:var(--c-text);user-select:all;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="Public Portfolio URL">
                  ${demoUrlDisplay}
                </span>
                <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
                  <button class="btn btn-ghost btn-sm" id="overview-copy-portfolio-btn" style="padding:2px 6px;font-size:11px;" onclick="AscendViews.copyPortfolioLink()" title="Copy portfolio link">
                    ${Icons.copy} Copy
                  </button>
                  <button class="btn btn-ghost btn-sm" style="padding:2px 6px;font-size:11px;" onclick="AscendViews.openPublicPortfolioModal()" title="Preview portfolio">
                    ${Icons.eye} Preview
                  </button>
                  <button class="btn btn-ghost btn-sm" id="overview-download-portfolio-btn" style="padding:2px 6px;font-size:11px;" onclick="AscendViews.downloadPortfolio()" title="Download created portfolio">
                    ${Icons.download} Download
                  </button>
                </div>
              </div>
            </div>

            <!-- External Profiles List -->
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--c-text-3);">
              External Profiles
            </div>

            <div style="display:flex;flex-direction:column;gap:var(--sp-2);">
              ${student.linkedIn ? `
                <div style="display:flex;align-items:center;gap:6px;">
                  <a href="${student.linkedIn}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="flex:1;justify-content:space-between;padding:8px 12px;">
                    <span style="display:inline-flex;align-items:center;gap:8px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                      <span style="color:#0A66C2;display:inline-flex;">${Icons.linkedin}</span>
                      <span style="font-weight:500;">LinkedIn</span>
                      <span style="font-size:11px;color:var(--c-text-3);overflow:hidden;text-overflow:ellipsis;">${student.linkedIn.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '')}</span>
                    </span>
                    <span style="display:inline-flex;color:var(--c-text-3);flex-shrink:0;">${Icons.externalLink}</span>
                  </a>
                  <button class="btn btn-ghost btn-sm" onclick="AscendViews.openLinkedInModal()" title="Edit LinkedIn link" aria-label="Edit LinkedIn link" style="padding:6px 8px;color:var(--c-text-3);">
                    ${Icons.edit}
                  </button>
                </div>` : `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 12px;border:1px dashed var(--c-border);border-radius:var(--r-md);font-size:var(--text-xs);color:var(--c-text-3);">
                  <span style="display:inline-flex;align-items:center;gap:6px;">${Icons.linkedin} LinkedIn not set</span>
                  <button class="btn btn-ghost btn-sm" onclick="AscendViews.openLinkedInModal()" style="font-size:11px;padding:2px 8px;">+ Add</button>
                </div>`}

              ${student.github ? `
                <div style="display:flex;align-items:center;gap:6px;">
                  <a href="${student.github}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="flex:1;justify-content:space-between;padding:8px 12px;">
                    <span style="display:inline-flex;align-items:center;gap:8px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                      <span style="color:var(--c-text);display:inline-flex;">${Icons.github}</span>
                      <span style="font-weight:500;">GitHub</span>
                      <span style="font-size:11px;color:var(--c-text-3);overflow:hidden;text-overflow:ellipsis;">${student.github.replace(/^https?:\/\/(www\.)?github\.com\//i, '')}</span>
                    </span>
                    <span style="display:inline-flex;color:var(--c-text-3);flex-shrink:0;">${Icons.externalLink}</span>
                  </a>
                  <button class="btn btn-ghost btn-sm" onclick="AscendViews.openGitHubModal()" title="Edit GitHub link" aria-label="Edit GitHub link" style="padding:6px 8px;color:var(--c-text-3);">
                    ${Icons.edit}
                  </button>
                </div>` : `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 12px;border:1px dashed var(--c-border);border-radius:var(--r-md);font-size:var(--text-xs);color:var(--c-text-3);">
                  <span style="display:inline-flex;align-items:center;gap:6px;">${Icons.github} GitHub not set</span>
                  <button class="btn btn-ghost btn-sm" onclick="AscendViews.openGitHubModal()" style="font-size:11px;padding:2px 8px;">+ Add</button>
                </div>`}

              ${student.portfolio ? `
                <a href="${student.portfolio}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="justify-content:space-between;padding:8px 12px;">
                  <span style="display:inline-flex;align-items:center;gap:8px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                    <span style="color:var(--c-primary);display:inline-flex;">${Icons.globe}</span>
                    <span style="font-weight:500;">Personal Website</span>
                    <span style="font-size:11px;color:var(--c-text-3);overflow:hidden;text-overflow:ellipsis;">${student.portfolio.replace(/^https?:\/\//i, '')}</span>
                  </span>
                  <span style="display:inline-flex;color:var(--c-text-3);flex-shrink:0;">${Icons.externalLink}</span>
                </a>` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- Right column: Résumé + Profile Checklist -->
      <div style="display:flex;flex-direction:column;gap:var(--sp-5);">
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-3);">
            <div style="font-size:var(--text-sm);font-weight:600;">Résumé (Private)</div>
            ${hasResume ? `<span class="badge badge-verified" style="font-size:11px;">${Icons.check} Uploaded</span>` : ''}
          </div>
          <div id="resume-upload-zone"
            style="display:${hasResume ? 'none' : 'flex'};flex-direction:column;align-items:center;gap:var(--sp-3);padding:var(--sp-6) 0;border:1.5px dashed var(--c-border);border-radius:var(--r-md);text-align:center;cursor:pointer;transition:background 0.15s;"
            onclick="document.getElementById('profile-resume-input').click()"
            ondragover="event.preventDefault();this.style.background='var(--c-primary-xlight)'"
            ondragleave="this.style.background=''"
            ondrop="AscendViews.handleResumeFileDrop(event)">
            <div style="color:var(--c-text-3);">${Icons.file}</div>
            <div style="font-size:var(--text-sm);color:var(--c-text-2);">No résumé uploaded yet</div>
            <div style="font-size:var(--text-xs);color:var(--c-text-3);">Click or drag &amp; drop PDF (max 10 MB)</div>
            <button type="button" class="btn btn-primary btn-sm" onclick="event.stopPropagation();document.getElementById('profile-resume-input').click()">
              ${Icons.upload} Upload Résumé
            </button>
          </div>
          <div id="resume-file-preview" style="display:${hasResume ? 'flex' : 'none'};align-items:center;gap:var(--sp-3);padding:var(--sp-3);border:1px solid var(--c-verified-border);border-radius:var(--r-md);background:var(--c-verified-bg);">
            <span style="color:var(--c-verified);display:inline-flex;">${Icons.file}</span>
            <div style="flex:1;min-width:0;">
              <div id="resume-file-name" style="font-size:var(--text-sm);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${hasResume ? student.resume.name : ''}</div>
              <div id="resume-file-size" style="font-size:var(--text-xs);color:var(--c-text-3);">${hasResume && student.resume.size ? (student.resume.size / 1024).toFixed(0) + ' KB' : (hasResume ? 'PDF Document' : '')}</div>
            </div>
            <div style="display:flex;align-items:center;gap:4px;">
              <a id="resume-download-btn" href="${hasResume && student.resume.dataUrl ? student.resume.dataUrl : '#'}" download="${hasResume ? student.resume.name : 'resume.pdf'}" target="_blank" class="btn btn-ghost btn-sm" title="Download / view résumé" style="color:var(--c-primary);padding:4px 8px;">
                ${Icons.download}
              </a>
              <button type="button" class="btn btn-ghost btn-sm" onclick="AscendViews.clearResumeFile()" aria-label="Remove résumé" title="Remove résumé" style="color:var(--c-rejected);padding:4px 8px;">
                ${Icons.trash || Icons.x}
              </button>
            </div>
          </div>
          <input type="file" id="profile-resume-input" accept=".pdf,application/pdf" style="display:none"
            onchange="AscendViews.handleResumeFileSelect(this)">
          <div style="font-size:11px;color:var(--c-text-3);margin-top:var(--sp-2);display:flex;align-items:center;gap:4px;">
            ${Icons.lock} Never shared on public portfolio without your explicit consent.
          </div>
        </div>

        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-4);">
            <div>
              <div style="font-size:var(--text-sm);font-weight:600;">Profile Checklist</div>
              <div style="font-size:var(--text-xs);color:var(--c-text-3);">Click any item to complete it</div>
            </div>
            <span class="badge ${doneCount === profileChecklistComputed.length ? 'badge-verified' : 'badge-normal'}" style="font-size:var(--text-xs);font-weight:600;">
              ${doneCount}/${profileChecklistComputed.length} done
            </span>
          </div>
          <div class="checklist">
            ${profileChecklistComputed.map(item => `
              <div class="checklist-item" onclick="AscendViews.handleChecklistClick('${item.id}')" role="button" tabindex="0"
                style="cursor:pointer;display:flex;align-items:center;gap:var(--sp-3);padding:var(--sp-2) var(--sp-3);border-radius:var(--r-md);transition:background 0.15s;"
                onmouseover="this.style.background='var(--c-surface-hover)'" onmouseout="this.style.background=''"
                title="${item.detail || item.label}">
                <div class="checklist-icon ${item.done ? 'done' : 'todo'}">
                  ${item.done ? Icons.check : ''}
                </div>
                <div style="flex:1;">
                  <div style="font-size:var(--text-sm);font-weight:${item.done ? '400' : '500'};${item.done ? 'color:var(--c-text-3);text-decoration:line-through;' : 'color:var(--c-text);'}">
                    ${item.label}
                  </div>
                  <div style="font-size:11px;color:var(--c-text-3);">${item.detail}</div>
                </div>
                <span style="font-size:var(--text-xs);color:var(--c-primary);font-weight:500;">
                  ${item.done ? 'Edit' : 'Add &rarr;'}
                </span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;

  /* ── Achievements Summary Tab ─────────────────────────────── */
  const achievementsTab = `
    <div style="padding-top:var(--sp-6);">
      <div class="profile-ach-stats">
        <div class="stat-card"><div class="stat-number">${totalCount}</div><div class="stat-label">Total achievements</div></div>
        <div class="stat-card"><div class="stat-number" style="color:var(--c-primary)">${publicAchievementIds.length}</div><div class="stat-label">Public on portfolio</div></div>
        <div class="stat-card"><div class="stat-number" style="color:var(--c-text-2)">${totalCount - publicAchievementIds.length}</div><div class="stat-label">Private records</div></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:var(--sp-3);margin-top:var(--sp-5);">
        ${achievements.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">${Icons.award}</div>
            <div class="empty-state-title">No achievements yet</div>
            <div class="empty-state-desc">Submit your first achievement to start building your profile.</div>
            <button class="btn btn-primary btn-sm" onclick="AscendApp.navigate('achievements');setTimeout(()=>AscendUI.openModal('add-achievement-modal'),200)">
              ${Icons.plus} Add achievement
            </button>
          </div>` : achievements.map(a => {
            const isPublicOnPortfolio = publicAchievementIds.includes(a.id);
            return `
            <div class="card card-sm" style="display:flex;align-items:center;gap:var(--sp-4);flex-wrap:wrap;">
              <div style="width:40px;height:40px;border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0;background:var(--c-primary-light);color:var(--c-primary);">
                ${Icons[a.iconKey] || Icons.award}
              </div>
              <div style="flex:1;min-width:180px;">
                <div style="font-size:var(--text-sm);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a.title}</div>
                <div style="font-size:var(--text-xs);color:var(--c-text-3);">${a.organization} · ${window.AscendUI.formatDate(a.date)}</div>
              </div>
              <div style="display:flex;align-items:center;gap:var(--sp-2);">
                ${isPublicOnPortfolio ? `
                  <span class="badge" style="background:var(--c-bg);border:1px solid var(--c-border);color:var(--c-text-2);font-size:11px;" title="Shown on public portfolio">
                    ${Icons.globe} Public
                  </span>` : `
                  <span class="badge" style="background:var(--c-bg);border:1px solid var(--c-border);color:var(--c-text-3);font-size:11px;" title="Hidden from public portfolio">
                    ${Icons.eyeOff} Private
                  </span>`}
                <span class="badge badge-primary" style="font-size:11px;">${a.category}</span>
              </div>
            </div>`;
          }).join('')}
      </div>
      <div style="margin-top:var(--sp-4);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);">
        <button class="btn btn-outline btn-sm" onclick="AscendApp.navigate('achievements')">
          View all achievements ${Icons.chevronRight}
        </button>
        <button class="btn btn-ghost btn-sm" onclick="AscendViews.openManagePublicItemsModal()">
          ${Icons.sliders} Manage public visibility
        </button>
      </div>
    </div>`;

  /* ── Skills Tab ───────────────────────────────────────────── */
  const skillGroupColors = {
    'Technical':        { bg: 'var(--c-primary-light)', text: 'var(--c-primary)' },
    'Communication':    { bg: '#EEF2FF', text: '#4338CA' },
    'Leadership':       { bg: '#FEF9C3', text: '#92400E' },
    'Innovation':       { bg: '#EFF6FF', text: '#1D4ED8' },
    'Career Readiness': { bg: '#FDF4FF', text: '#7E22CE' },
  };

  const userSkillsByCategory = getAggregatedUserSkills();
  const totalUserSkills = Object.values(userSkillsByCategory).flat().length;

  const skillsTab = `
    <div style="display:flex;flex-direction:column;gap:var(--sp-5);padding-top:var(--sp-6);">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);padding:var(--sp-4);background:var(--c-bg);border-radius:var(--r-md);border:1px solid var(--c-border);">
        <div>
          <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);">Demonstrated Skills &amp; Competencies</div>
          <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
            Skills dynamically compiled from your achievements, practical projects, and personal additions.
          </div>
        </div>
        <button type="button" class="btn btn-primary btn-sm" onclick="AscendViews.openAddSkillModal()">
          ${Icons.plus} Add Skill
        </button>
      </div>
      ${Object.entries(userSkillsByCategory).map(([cat, catSkills]) => {
        const palette = skillGroupColors[cat] || { bg: 'var(--c-bg)', text: 'var(--c-text-2)' };
        return `
          <div class="card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-4);">
              <div style="display:flex;align-items:center;gap:var(--sp-3);">
                <div style="width:8px;height:8px;border-radius:50%;background:${palette.text};flex-shrink:0;"></div>
                <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);">${cat}</div>
                <span style="font-size:var(--text-xs);color:var(--c-text-3);">${catSkills.length} skill${catSkills.length !== 1 ? 's' : ''}</span>
              </div>
              <button type="button" class="btn btn-ghost btn-sm" style="font-size:11px;padding:2px 8px;" onclick="AscendViews.openAddSkillModal('${cat}')">
                + Add to ${cat}
              </button>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);">
              ${catSkills.length === 0 ? `
                <span style="color:var(--c-text-3);font-size:var(--text-xs);font-style:italic;">No skills recorded in this category yet. Click "+ Add to ${cat}" or enter skills in achievements/projects.</span>
              ` : catSkills.map(s => {
                const sName = typeof s === 'string' ? s : (s.name || '');
                const escapedName = sName.replace(/'/g, "\\'");
                return `
                <span style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:var(--r-full);font-size:var(--text-xs);font-weight:500;background:${palette.bg};color:${palette.text};border:1px solid ${palette.text}33;">
                  <span>${sName}</span>
                  <button type="button" onclick="AscendViews.removeSkill('${cat}', '${escapedName}')" title="Remove skill ${sName}" aria-label="Remove skill ${sName}" style="background:none;border:none;padding:0;cursor:pointer;display:inline-flex;align-items:center;color:${palette.text};opacity:0.6;font-size:14px;line-height:1;margin-left:2px;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">
                    &times;
                  </button>
                </span>`;
              }).join('')}
            </div>
          </div>`;
      }).join('')}
    </div>`;

  /* ── Projects Tab (Fully functional) ───────────────────────── */
  const projectsList = window.AscendData.projects || [];
  const projectsTab = `
    <div style="padding-top:var(--sp-6);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-5);flex-wrap:wrap;gap:var(--sp-3);">
        <div>
          <div style="font-size:var(--text-base);font-weight:600;color:var(--c-text);">Practical Projects &amp; Work Samples</div>
          <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
            Showcase technical builds, applications, research, and open source work.
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="AscendViews.openAddProjectModal()">
          ${Icons.plus} Add project
        </button>
      </div>

      ${projectsList.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">${Icons.bookOpen}</div>
          <div class="empty-state-title">No projects yet</div>
          <div class="empty-state-desc">Add personal, academic, or open-source projects to showcase your practical experience.</div>
          <button class="btn btn-primary btn-sm" onclick="AscendViews.openAddProjectModal()">
            ${Icons.plus} Add first project
          </button>
        </div>` : `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%, 280px),1fr));gap:var(--sp-4);">
          ${projectsList.map(p => `
            <div class="project-card" id="project-card-${p.id}">
              <div class="project-meta-strip">
                <span class="badge" style="background:var(--c-primary-light);color:var(--c-primary);font-size:11px;font-weight:600;">
                  ${p.category || 'Project'}
                </span>
                <div style="display:flex;align-items:center;gap:var(--sp-2);">
                  <button class="btn btn-ghost btn-sm" style="padding:2px 6px;font-size:11px;" onclick="AscendViews.toggleProjectPublic('${p.id}')" title="Toggle public portfolio display">
                    ${p.isPublic !== false ? `${Icons.globe} Public` : `${Icons.eyeOff} Private`}
                  </button>
                  <button class="btn btn-ghost btn-sm" style="padding:2px 6px;color:var(--c-rejected);" onclick="AscendViews.deleteProject('${p.id}')" aria-label="Delete project">
                    ${Icons.trash}
                  </button>
                </div>
              </div>

              <div style="font-size:var(--text-base);font-weight:600;color:var(--c-text);">${p.title}</div>
              <p style="font-size:var(--text-sm);color:var(--c-text-2);line-height:1.6;margin:0;">${p.description}</p>

              ${p.skills && p.skills.length ? `
                <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:var(--sp-2);">
                  ${p.skills.map(s => `<span class="skill-tag" style="font-size:11px;padding:3px 8px;">${s}</span>`).join('')}
                </div>` : ''}

              <div class="project-links">
                ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="font-size:11px;padding:4px 8px;">${Icons.externalLink} Live demo</a>` : ''}
                ${p.repoUrl ? `<a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm" style="font-size:11px;padding:4px 8px;">${Icons.github} Repository</a>` : ''}
                <span style="font-size:11px;color:var(--c-text-3);margin-left:auto;">${p.date || ''}</span>
              </div>
            </div>`).join('')}
        </div>`}
    </div>`;

  return `
    <!-- Profile Header -->
    <div class="card" style="margin-bottom:var(--sp-5);">
      <div style="display:flex;align-items:flex-start;gap:var(--sp-5);flex-wrap:wrap;">
        <div class="avatar avatar-xxl" style="flex-shrink:0;">${student.initials}</div>
        <div style="flex:1;min-width:220px;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);">
            <div>
              <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
                <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.02em;">${student.name}</h1>
              </div>
              <div style="font-size:var(--text-base);color:var(--c-text-2);margin-top:4px;">${student.degree}</div>
              <div style="font-size:var(--text-sm);color:var(--c-text-3);margin-top:2px;">
                ${student.department} · ${student.institution}
              </div>
              <div style="font-size:var(--text-sm);color:var(--c-text-3);">
                Year ${student.year} · Expected graduation ${student.graduationYear}${student.rollNumber ? ` · Roll No: ${student.rollNumber}` : ''}
              </div>
            </div>
            <div style="display:flex;gap:var(--sp-2);flex-wrap:wrap;">
              <button class="btn btn-outline btn-sm" onclick="AscendViews.openEditProfileModal()">
                ${Icons.edit} Edit profile
              </button>
            </div>
          </div>
          <!-- Factual badges: Achievements (5) and Projects (3) -->
          <div style="margin-top:var(--sp-3);display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
            <span class="badge badge-primary" style="font-size:var(--text-xs);font-weight:600;">
              ${totalCount} achievement${totalCount !== 1 ? 's' : ''}
            </span>
            <span class="badge badge-normal" style="font-size:var(--text-xs);font-weight:600;">
              ${publicProjects.length} project${publicProjects.length !== 1 ? 's' : ''}
            </span>
            <span style="font-size:var(--text-xs);color:var(--c-text-3);">·</span>
            <span style="font-size:var(--text-xs);color:var(--c-text-2);">${student.institution}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs with consistent counts -->
    <div class="tabs" id="profile-tabs" role="tablist" style="margin-bottom:0;">
      <button type="button" class="tab-item active" role="tab" aria-selected="true" data-tab="overview" aria-controls="tab-overview">Overview</button>
      <button type="button" class="tab-item" role="tab" aria-selected="false" data-tab="achievements-profile" aria-controls="tab-achievements-profile">Achievements (${totalCount})</button>
      <button type="button" class="tab-item" role="tab" aria-selected="false" data-tab="skills-profile" aria-controls="tab-skills-profile">Skills (${totalUserSkills})</button>
      <button type="button" class="tab-item" role="tab" aria-selected="false" data-tab="projects-profile" aria-controls="tab-projects-profile">Projects (${publicProjects.length})</button>
    </div>

    <!-- Tab Contents -->
    <div id="tab-overview" class="tab-content active">${overviewTab}</div>
    <div id="tab-achievements-profile" class="tab-content">${achievementsTab}</div>
    <div id="tab-skills-profile" class="tab-content">${skillsTab}</div>
    <div id="tab-projects-profile" class="tab-content">${projectsTab}</div>

    <!-- Edit Profile Modal -->
    <div class="modal-overlay" id="edit-profile-modal">
      <div class="modal" style="max-width:620px;max-height:88vh;display:flex;flex-direction:column;">
        <div class="modal-header" style="flex-shrink:0;">
          <div>
            <div class="modal-title">Edit Profile &amp; Academic Details</div>
            <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">Update your degree, department, academic standing, bio, and links</div>
          </div>
          <button class="modal-close" onclick="AscendUI.closeModal('edit-profile-modal')" aria-label="Close">${Icons.x}</button>
        </div>
        <div class="modal-body" style="overflow-y:auto;padding:var(--sp-5);display:flex;flex-direction:column;gap:var(--sp-4);">
          
          <!-- Section 1: Academic Details -->
          <div style="padding:var(--sp-4);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-lg);display:flex;flex-direction:column;gap:var(--sp-3);">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="color:var(--c-primary);display:inline-flex;">${Icons.graduationCap}</span>
              <span style="font-size:var(--text-xs);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--c-primary);">Academic Information</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-degree">Course / Degree Program <span class="required">*</span></label>
              <input class="form-input" id="edit-degree" type="text" list="edit-degree-presets" value="${student.degree || ''}" placeholder="e.g. B.Tech in Computer Science">
              <datalist id="edit-degree-presets">
                <option value="B.Tech in Computer Science">
                <option value="B.Tech in Information Technology">
                <option value="B.Tech in Artificial Intelligence & Data Science">
                <option value="B.Tech in Electronics & Communication">
                <option value="B.Tech in Mechanical Engineering">
                <option value="B.Tech in Civil Engineering">
                <option value="BCA (Bachelor of Computer Applications)">
                <option value="MCA (Master of Computer Applications)">
                <option value="M.Tech in Computer Science">
                <option value="B.Sc in Computer Science">
              </datalist>
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-department">Department Name <span class="required">*</span></label>
              <input class="form-input" id="edit-department" type="text" list="edit-dept-presets" value="${student.department || ''}" placeholder="e.g. Computer Science & Engineering">
              <datalist id="edit-dept-presets">
                <option value="Computer Science & Engineering">
                <option value="Information Technology">
                <option value="Electronics & Communication Engineering">
                <option value="Artificial Intelligence & Machine Learning">
                <option value="Data Science & Engineering">
                <option value="Electrical & Electronics Engineering">
                <option value="Mechanical Engineering">
                <option value="Civil Engineering">
                <option value="Department of Computer Applications">
              </datalist>
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-institution">Institution / College</label>
              <input class="form-input" id="edit-institution" type="text" value="${student.institution || 'Delhi Institute of Technology'}" placeholder="College or university name">
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="edit-year">Current Year of Study</label>
                <select class="form-input form-select" id="edit-year">
                  <option value="1" ${student.year == 1 ? 'selected' : ''}>Year 1 (1st Year)</option>
                  <option value="2" ${student.year == 2 ? 'selected' : ''}>Year 2 (2nd Year)</option>
                  <option value="3" ${student.year == 3 ? 'selected' : ''}>Year 3 (3rd Year)</option>
                  <option value="4" ${student.year == 4 ? 'selected' : ''}>Year 4 (4th Year)</option>
                  <option value="5" ${student.year == 5 ? 'selected' : ''}>Year 5 (5th Year)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="edit-gradyear">Graduation Year</label>
                <input class="form-input" id="edit-gradyear" type="number" min="2024" max="2035" value="${student.graduationYear || 2028}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-rollno">Roll Number / Student ID</label>
              <input class="form-input" id="edit-rollno" type="text" value="${student.rollNumber || student.rollNo || ''}" placeholder="e.g. 2026CSE1042">
            </div>
          </div>

          <!-- Section 2: Personal & Bio -->
          <div style="padding:var(--sp-4);background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-lg);display:flex;flex-direction:column;gap:var(--sp-3);">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="color:var(--c-primary);display:inline-flex;">${Icons.user}</span>
              <span style="font-size:var(--text-xs);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--c-primary);">Personal &amp; Career</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-name">Full Name <span class="required">*</span></label>
              <input class="form-input" id="edit-name" type="text" value="${student.name || ''}" placeholder="Full Name">
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-bio">Professional Bio</label>
              <textarea class="form-input form-textarea" id="edit-bio" rows="3" placeholder="Tell mentors and viewers about your academic journey, technical focus, and achievements…">${student.bio || ''}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-interests">Career Interests</label>
              <input class="form-input" id="edit-interests" type="text" value="${(student.careerInterests || []).join(', ')}"
                placeholder="e.g. Cloud Engineering, Machine Learning, Web Development">
              <div class="form-hint">Separate multiple interests with commas.</div>
            </div>
          </div>

          <!-- Section 3: Online Profiles & Links -->
          <div style="padding:var(--sp-4);background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-lg);display:flex;flex-direction:column;gap:var(--sp-3);">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="color:var(--c-primary);display:inline-flex;">${Icons.globe}</span>
              <span style="font-size:var(--text-xs);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--c-primary);">Profiles &amp; Portfolio Links</span>
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-linkedin">LinkedIn Profile URL</label>
              <input class="form-input" id="edit-linkedin" type="url" value="${student.linkedIn || ''}" placeholder="https://linkedin.com/in/…">
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-github">GitHub Profile URL</label>
              <input class="form-input" id="edit-github" type="url" value="${student.github || ''}" placeholder="https://github.com/…">
            </div>

            <div class="form-group">
              <label class="form-label" for="edit-portfolio">Personal Website / Portfolio URL</label>
              <input class="form-input" id="edit-portfolio" type="url" value="${student.portfolio || ''}" placeholder="https://…">
            </div>
          </div>

        </div>
        <div class="modal-footer" style="flex-shrink:0;">
          <button class="btn btn-ghost" onclick="AscendUI.closeModal('edit-profile-modal')">Cancel</button>
          <button class="btn btn-primary" id="save-profile-btn" onclick="AscendViews.saveProfileEdit()">Save changes</button>
        </div>
      </div>
    </div>

    <!-- Add Project Modal -->
    <div class="modal-overlay" id="add-project-modal">
      <div class="modal" style="max-width:560px;">
        <div class="modal-header">
          <span class="modal-title">Add Project</span>
          <button class="modal-close" onclick="AscendUI.closeModal('add-project-modal')" aria-label="Close">${Icons.x}</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="proj-title">Project Title *</label>
            <input class="form-input" id="proj-title" type="text" placeholder="e.g. Cloud Resource Sentinel">
          </div>
          <div class="form-group">
            <label class="form-label" for="proj-category">Category</label>
            <input class="form-input" id="proj-category" type="text" placeholder="e.g. Cloud Infrastructure, AI / ML, Web Build">
          </div>
          <div class="form-group">
            <label class="form-label" for="proj-desc">Description *</label>
            <textarea class="form-input form-textarea" id="proj-desc" rows="3" placeholder="Briefly describe what you built, problem solved, and outcomes…"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="proj-skills">Technologies &amp; Skills</label>
            <input class="form-input" id="proj-skills" type="text" placeholder="e.g. Python, AWS Lambda, Docker, React">
            <div class="form-hint">Comma-separated tags</div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="proj-live">Demo URL</label>
              <input class="form-input" id="proj-live" type="url" placeholder="https://…">
            </div>
            <div class="form-group">
              <label class="form-label" for="proj-repo">GitHub Repository</label>
              <input class="form-input" id="proj-repo" type="url" placeholder="https://github.com/…">
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;padding:var(--sp-3);background:var(--c-bg);border-radius:var(--r-md);border:1px solid var(--c-border);margin-top:var(--sp-2);">
            <input type="checkbox" id="proj-public" checked style="width:16px;height:16px;">
            <label for="proj-public" style="font-size:var(--text-sm);color:var(--c-text);cursor:pointer;user-select:none;">
              Include in Public Portfolio
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="AscendUI.closeModal('add-project-modal')">Cancel</button>
          <button class="btn btn-primary" onclick="AscendViews.saveNewProject()">Save project</button>
        </div>
      </div>
    </div>


    <!-- Manage Public Items Modal -->
    <div class="modal-overlay" id="manage-public-modal" onclick="if(event.target===this)AscendUI.closeModal('manage-public-modal')">
      <div class="modal" style="max-width:600px;width:100%;border-radius:20px;overflow:hidden;" role="dialog" aria-modal="true" aria-labelledby="manage-public-title">

        <!-- Header -->
        <div class="modal-header" style="background:linear-gradient(135deg,#1A73E8 0%,#1557B0 100%);padding:22px 24px;border-bottom:none;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0;backdrop-filter:blur(4px);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <div>
              <div id="manage-public-title" style="font-size:17px;font-weight:700;color:#fff;letter-spacing:-0.01em;">Public Portfolio Visibility</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:2px;">Choose what appears on your public profile link</div>
            </div>
          </div>
          <button class="modal-close" onclick="AscendUI.closeModal('manage-public-modal')" aria-label="Close" style="color:rgba(255,255,255,0.8);background:rgba(255,255,255,0.1);border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;transition:background 0.15s;">
            ${Icons.x}
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body" style="padding:20px 24px;background:var(--c-bg);max-height:72vh;overflow-y:auto;">

          <!-- Privacy Notice -->
          <div style="display:flex;align-items:flex-start;gap:10px;padding:12px 14px;background:linear-gradient(135deg,#E8F0FE,#EEF4FF);border:1px solid #C2D8FF;border-radius:12px;margin-bottom:20px;">
            <span style="color:#1A73E8;display:inline-flex;align-items:center;flex-shrink:0;margin-top:1px;">${Icons.lock}</span>
            <div>
              <div style="font-size:12px;font-weight:600;color:#1557B0;margin-bottom:2px;">Your documents are always private</div>
              <div style="font-size:11.5px;color:#3367D6;line-height:1.5;">Certificates, original documents, and private evidence are <strong>permanently private</strong> and will never be shown to external viewers.</div>
            </div>
          </div>

          <!-- Achievements Section -->
          <div style="margin-bottom:20px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <div style="width:28px;height:28px;border-radius:8px;background:#E8F0FE;display:flex;align-items:center;justify-content:center;color:#1A73E8;">
                  ${Icons.award}
                </div>
                <div>
                  <div style="font-size:13px;font-weight:700;color:var(--c-text);">Achievements</div>
                  <div style="font-size:11px;color:var(--c-text-3);">${achievements.length} total · shown on your public link</div>
                </div>
              </div>
              <div style="display:flex;gap:6px;">
                <button type="button" onclick="document.querySelectorAll('.public-ach-cb').forEach(c=>c.checked=true)" style="font-size:11px;color:#1A73E8;background:none;border:1px solid #C2D8FF;border-radius:20px;padding:3px 10px;cursor:pointer;font-weight:500;transition:all 0.15s;" onmouseover="this.style.background='#E8F0FE'" onmouseout="this.style.background='none'">All</button>
                <button type="button" onclick="document.querySelectorAll('.public-ach-cb').forEach(c=>c.checked=false)" style="font-size:11px;color:var(--c-text-3);background:none;border:1px solid var(--c-border);border-radius:20px;padding:3px 10px;cursor:pointer;font-weight:500;transition:all 0.15s;" onmouseover="this.style.background='var(--c-surface-hover)'" onmouseout="this.style.background='none'">None</button>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:6px;max-height:210px;overflow-y:auto;padding-right:2px;scrollbar-width:thin;">
              ${achievements.length === 0 ? `
                <div style="text-align:center;padding:20px;color:var(--c-text-3);font-size:12px;background:var(--c-surface);border-radius:10px;border:1px dashed var(--c-border);">
                  No achievements yet. Add your first achievement to get started.
                </div>` :
                achievements.map(a => {
                  const checked = (publicPortfolio.publicAchievementIds || []).includes(a.id);
                  const catColors = {
                    Certification: '#1A73E8', Hackathon: '#0288D1', Internship: '#00897B',
                    Project: '#7B1FA2', Research: '#2E7D32', Academic: '#3F51B5',
                    Leadership: '#E65100', Award: '#F57C00'
                  };
                  const catColor = catColors[a.category] || '#1A73E8';
                  return `
                    <label style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--c-surface);border:1.5px solid ${checked ? catColor + '40' : 'var(--c-border)'};border-radius:12px;cursor:pointer;transition:all 0.15s;user-select:none;"
                      onmouseover="this.style.borderColor='${catColor}60';this.style.background='var(--c-surface-hover)'"
                      onmouseout="this.style.borderColor=this.querySelector('input').checked?'${catColor}40':'var(--c-border)';this.style.background='var(--c-surface)'">
                      <input type="checkbox" class="public-ach-cb" value="${a.id}" ${checked ? 'checked' : ''}
                        style="width:16px;height:16px;accent-color:${catColor};flex-shrink:0;cursor:pointer;"
                        onchange="this.closest('label').style.borderColor=this.checked?'${catColor}40':'var(--c-border)'">
                      <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:500;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.title}</div>
                        <div style="font-size:11px;color:var(--c-text-3);margin-top:1px;">${a.organization} · ${a.category}</div>
                      </div>
                      <span style="font-size:10.5px;font-weight:600;padding:3px 9px;border-radius:20px;background:${catColor}15;color:${catColor};white-space:nowrap;flex-shrink:0;">${a.category}</span>
                    </label>`;
                }).join('')}
            </div>
          </div>

          <!-- Divider -->
          <div style="height:1px;background:var(--c-border);margin-bottom:20px;"></div>

          <!-- Projects Section -->
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <div style="width:28px;height:28px;border-radius:8px;background:#F3E5F5;display:flex;align-items:center;justify-content:center;color:#7B1FA2;">
                  ${Icons.tool || Icons.briefcase}
                </div>
                <div>
                  <div style="font-size:13px;font-weight:700;color:var(--c-text);">Projects</div>
                  <div style="font-size:11px;color:var(--c-text-3);">${projectsList.length} total · public ones appear on your link</div>
                </div>
              </div>
              ${projectsList.length > 0 ? `
              <div style="display:flex;gap:6px;">
                <button type="button" onclick="document.querySelectorAll('.public-proj-cb').forEach(c=>c.checked=true)" style="font-size:11px;color:#7B1FA2;background:none;border:1px solid #D8B4FE;border-radius:20px;padding:3px 10px;cursor:pointer;font-weight:500;transition:all 0.15s;" onmouseover="this.style.background='#F3E5F5'" onmouseout="this.style.background='none'">All</button>
                <button type="button" onclick="document.querySelectorAll('.public-proj-cb').forEach(c=>c.checked=false)" style="font-size:11px;color:var(--c-text-3);background:none;border:1px solid var(--c-border);border-radius:20px;padding:3px 10px;cursor:pointer;font-weight:500;transition:all 0.15s;" onmouseover="this.style.background='var(--c-surface-hover)'" onmouseout="this.style.background='none'">None</button>
              </div>` : ''}
            </div>

            <div style="display:flex;flex-direction:column;gap:6px;max-height:180px;overflow-y:auto;padding-right:2px;scrollbar-width:thin;">
              ${projectsList.length === 0 ? `
                <div style="text-align:center;padding:20px;color:var(--c-text-3);font-size:12px;background:var(--c-surface);border-radius:10px;border:1px dashed var(--c-border);">
                  No projects added yet. Head to the Projects tab to add one.
                </div>` :
                projectsList.map(p => {
                  const isChecked = p.isPublic !== false;
                  return `
                    <label style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--c-surface);border:1.5px solid ${isChecked ? '#7B1FA240' : 'var(--c-border)'};border-radius:12px;cursor:pointer;transition:all 0.15s;user-select:none;"
                      onmouseover="this.style.borderColor='#7B1FA260';this.style.background='var(--c-surface-hover)'"
                      onmouseout="this.style.borderColor=this.querySelector('input').checked?'#7B1FA240':'var(--c-border)';this.style.background='var(--c-surface)'">
                      <input type="checkbox" class="public-proj-cb" value="${p.id}" ${isChecked ? 'checked' : ''}
                        style="width:16px;height:16px;accent-color:#7B1FA2;flex-shrink:0;cursor:pointer;"
                        onchange="this.closest('label').style.borderColor=this.checked?'#7B1FA240':'var(--c-border)'">
                      <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:500;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.title}</div>
                        <div style="font-size:11px;color:var(--c-text-3);margin-top:1px;">${p.category || 'Project'}</div>
                      </div>
                      <span style="font-size:10.5px;font-weight:600;padding:3px 9px;border-radius:20px;background:${isChecked ? '#7B1FA215' : '#F5F5F5'};color:${isChecked ? '#7B1FA2' : 'var(--c-text-3)'};white-space:nowrap;flex-shrink:0;">${isChecked ? 'Public' : 'Private'}</span>
                    </label>`;
                }).join('')}
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="modal-footer" style="padding:16px 24px;background:var(--c-surface);border-top:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;">
          <div style="font-size:11px;color:var(--c-text-3);">Changes apply immediately to your public link</div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-ghost btn-sm" onclick="AscendUI.closeModal('manage-public-modal')">Cancel</button>
            <button class="btn btn-primary btn-sm" onclick="AscendViews.savePublicItemsSelection()" style="gap:6px;padding-left:16px;padding-right:16px;">
              ${Icons.check} Save changes
            </button>
          </div>
        </div>
      </div>
    </div>


    <!-- Dedicated LinkedIn Modal -->
    <div class="modal-overlay" id="add-linkedin-modal">
      <div class="modal" style="max-width:480px;">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:var(--sp-3);">
            <div style="width:38px;height:38px;border-radius:var(--r-full);background:#E8F0FE;display:flex;align-items:center;justify-content:center;color:#0A66C2;flex-shrink:0;">
              ${Icons.linkedin}
            </div>
            <div>
              <div class="modal-title" style="font-size:1.125rem;">LinkedIn Profile</div>
              <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">Connect your public LinkedIn profile</div>
            </div>
          </div>
          <button class="modal-close" onclick="AscendUI.closeModal('add-linkedin-modal')" aria-label="Close">${Icons.x}</button>
        </div>
        <div class="modal-body" style="padding:var(--sp-5);gap:var(--sp-4);">
          <div class="form-group">
            <label class="form-label" for="profile-linkedin-input">LinkedIn Profile URL or Username</label>
            <div style="position:relative;display:flex;align-items:center;">
              <span style="position:absolute;left:12px;color:#0A66C2;display:flex;align-items:center;pointer-events:none;">
                ${Icons.linkedin}
              </span>
              <input class="form-input" id="profile-linkedin-input" type="text" style="padding-left:38px;"
                placeholder="e.g. https://linkedin.com/in/username or username"
                value="${student.linkedIn || ''}"
                onkeydown="if(event.key==='Enter')AscendViews.saveLinkedIn()">
            </div>
            <div class="form-hint">Enter your full profile URL or username (e.g. https://linkedin.com/in/alex-smith)</div>
            <div class="form-error" id="err-single-linkedin" style="display:none;">${Icons.alertCircle} Please enter a valid URL or username.</div>
          </div>
        </div>
        <div class="modal-footer" style="justify-content:space-between;">
          <div>
            ${student.linkedIn ? `
              <button class="btn btn-ghost btn-sm" style="color:var(--c-rejected);" onclick="AscendViews.removeLinkedIn()">
                ${Icons.trash} Remove
              </button>` : ''}
          </div>
          <div style="display:flex;gap:var(--sp-2);">
            <button class="btn btn-ghost" onclick="AscendUI.closeModal('add-linkedin-modal')">Cancel</button>
            <button class="btn btn-primary" id="save-single-linkedin-btn" onclick="AscendViews.saveLinkedIn()">Save LinkedIn</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Dedicated GitHub Modal -->
    <div class="modal-overlay" id="add-github-modal">
      <div class="modal" style="max-width:480px;">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:var(--sp-3);">
            <div style="width:38px;height:38px;border-radius:var(--r-full);background:var(--c-surface-hover);display:flex;align-items:center;justify-content:center;color:var(--c-text);flex-shrink:0;">
              ${Icons.github}
            </div>
            <div>
              <div class="modal-title" style="font-size:1.125rem;">GitHub Profile</div>
              <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">Showcase your repositories &amp; code</div>
            </div>
          </div>
          <button class="modal-close" onclick="AscendUI.closeModal('add-github-modal')" aria-label="Close">${Icons.x}</button>
        </div>
        <div class="modal-body" style="padding:var(--sp-5);gap:var(--sp-4);">
          <div class="form-group">
            <label class="form-label" for="profile-github-input">GitHub Profile URL or Username</label>
            <div style="position:relative;display:flex;align-items:center;">
              <span style="position:absolute;left:12px;color:var(--c-text);display:flex;align-items:center;pointer-events:none;">
                ${Icons.github}
              </span>
              <input class="form-input" id="profile-github-input" type="text" style="padding-left:38px;"
                placeholder="e.g. https://github.com/username or username"
                value="${student.github || ''}"
                onkeydown="if(event.key==='Enter')AscendViews.saveGitHub()">
            </div>
            <div class="form-hint">Enter your GitHub profile URL or username (e.g. https://github.com/alexsmith)</div>
            <div class="form-error" id="err-single-github" style="display:none;">${Icons.alertCircle} Please enter a valid URL or username.</div>
          </div>
        </div>
        <div class="modal-footer" style="justify-content:space-between;">
          <div>
            ${student.github ? `
              <button class="btn btn-ghost btn-sm" style="color:var(--c-rejected);" onclick="AscendViews.removeGitHub()">
                ${Icons.trash} Remove
              </button>` : ''}
          </div>
          <div style="display:flex;gap:var(--sp-2);">
            <button class="btn btn-ghost" onclick="AscendUI.closeModal('add-github-modal')">Cancel</button>
            <button class="btn btn-primary" id="save-single-github-btn" onclick="AscendViews.saveGitHub()">Save GitHub</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Skill Modal -->
    <div class="modal-overlay" id="add-skill-modal">
      <div class="modal" style="max-width:480px;">
        <div class="modal-header">
          <span class="modal-title">Add Demonstrated Skill</span>
          <button type="button" class="modal-close" onclick="AscendUI.closeModal('add-skill-modal')" aria-label="Close">${Icons.x}</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="skill-category-select">Skill Category *</label>
            <select class="form-input form-select" id="skill-category-select">
              <option value="Technical">Technical</option>
              <option value="Communication">Communication</option>
              <option value="Leadership">Leadership</option>
              <option value="Innovation">Innovation</option>
              <option value="Career Readiness">Career Readiness</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="new-skill-input">Skill / Technology Name(s) *</label>
            <input class="form-input" id="new-skill-input" type="text" placeholder="e.g. Docker, TypeScript, Microservices">
            <div class="form-hint">Separate multiple skills with commas</div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-ghost" onclick="AscendUI.closeModal('add-skill-modal')">Cancel</button>
          <button type="button" class="btn btn-primary" onclick="AscendViews.saveNewSkill()">Add skill</button>
        </div>
      </div>
    </div>

    <!-- Public Portfolio Preview Modal Container (injected dynamically) -->
    <div id="public-preview-modal-mount"></div>

    <style>
      .profile-overview-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--sp-6);
        padding-top: var(--sp-6);
      }
      .profile-ach-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--sp-3);
      }
      @media (max-width: 768px) {
        .profile-overview-grid { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 480px) {
        .profile-ach-stats { grid-template-columns: 1fr !important; }
      }
    </style>`;
}

/* ── Public Portfolio Interactive Canvas Generator ─────────── */
function generatePublicPortfolioCanvasHTML(options = {}) {
  const { student, achievements, skills, projects, publicPortfolio } = window.AscendData;
  const { Icons } = window.AscendUI;

  const publicAchievementIds = (publicPortfolio && publicPortfolio.publicAchievementIds) || [];
  const publicAchievements = (achievements || []).filter(a => publicAchievementIds.includes(a.id));
  const publicProjects = (projects || []).filter(p => p.isPublic !== false);

  // Public header
  const institutionBadgeHTML = '';

  return `
    <div class="portfolio-public-banner">
      <div style="display:flex;align-items:center;gap:6px;font-weight:500;">
        <span style="color:var(--c-primary);display:inline-flex;">${Icons.globe}</span>
        <span>Ascend Student Portfolio</span>
      </div>
      <span>${student.institution}</span>
    </div>

    <!-- Header info -->
    <div style="display:flex;align-items:flex-start;gap:var(--sp-5);flex-wrap:wrap;margin-bottom:var(--sp-6);">
      <div class="avatar avatar-xxl" style="flex-shrink:0;">${student.initials}</div>
      <div style="flex:1;min-width:220px;">
        <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;margin-bottom:4px;">
          <div style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.02em;color:var(--c-text);">${student.name}</div>
          ${institutionBadgeHTML}
        </div>
        <div style="font-size:var(--text-base);color:var(--c-text-2);">${student.degree}</div>
        <div style="font-size:var(--text-sm);color:var(--c-text-3);margin-top:2px;">
          ${student.department} · ${student.institution}
        </div>
        <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">
          Class of ${student.graduationYear} (Year ${student.year})${student.rollNumber ? ` · Roll No: ${student.rollNumber}` : ''}
        </div>

        <!-- External Public Links -->
        <div style="display:flex;align-items:center;gap:var(--sp-2);margin-top:var(--sp-3);flex-wrap:wrap;">
          ${student.linkedIn ? `
            <a href="${student.linkedIn}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="gap:6px;font-size:11px;padding:4px 10px;">
              ${Icons.linkedin} LinkedIn ${Icons.externalLink}
            </a>` : ''}
          ${student.github ? `
            <a href="${student.github}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="gap:6px;font-size:11px;padding:4px 10px;">
              ${Icons.github} GitHub ${Icons.externalLink}
            </a>` : ''}
          ${student.portfolio ? `
            <a href="${student.portfolio}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="gap:6px;font-size:11px;padding:4px 10px;">
              ${Icons.globe} Website ${Icons.externalLink}
            </a>` : ''}
        </div>
      </div>
    </div>

    <!-- Professional Bio -->
    ${(student.bio && student.bio.trim()) ? `
    <div style="margin-bottom:var(--sp-6);">
      <div style="font-size:var(--text-xs);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--c-text-3);margin-bottom:var(--sp-2);">
        Professional Bio
      </div>
      <p style="font-size:var(--text-sm);color:var(--c-text-2);line-height:1.7;margin:0;">
        ${student.bio}
      </p>
    </div>` : ''}

    <!-- Career Interests -->
    ${student.careerInterests && student.careerInterests.length ? `
      <div style="margin-bottom:var(--sp-6);">
        <div style="font-size:var(--text-xs);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:var(--c-text-3);margin-bottom:var(--sp-2);">
          Focus Areas &amp; Interests
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);">
          ${student.careerInterests.map(i => `<span class="skill-tag">${i}</span>`).join('')}
        </div>
      </div>` : ''}

    <!-- Privacy Notice Banner -->
    <div class="public-privacy-banner">
      <span style="color:var(--c-slate);display:inline-flex;flex-shrink:0;">${Icons.lock}</span>
      <span><strong>Privacy safeguard:</strong> Uploaded certificates, original evidence documents, and internal faculty evaluations are kept strictly private to protect credential authenticity and student privacy.</span>
    </div>

    <!-- Achievements Section (Student-selected for public portfolio) -->
    <div style="margin-bottom:var(--sp-8);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-4);border-bottom:1px solid var(--c-border);padding-bottom:var(--sp-2);">
        <div style="font-size:var(--text-lg);font-weight:700;color:var(--c-text);">Achievements &amp; Credentials</div>
        <span style="font-size:var(--text-xs);color:var(--c-primary);font-weight:600;display:inline-flex;align-items:center;gap:4px;">
          ${Icons.award} ${publicAchievements.length} featured
        </span>
      </div>

      ${publicAchievements.length === 0 ? `
        <div style="padding:var(--sp-6);text-align:center;color:var(--c-text-3);background:var(--c-bg);border-radius:var(--r-md);border:1px solid var(--c-border);font-size:var(--text-sm);">
          No achievements currently selected for public display.
        </div>` : `
        <div style="display:flex;flex-direction:column;gap:var(--sp-4);">
          ${publicAchievements.map(a => `
            <div style="padding:var(--sp-4);background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-lg);display:flex;flex-direction:column;gap:var(--sp-2);">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--sp-3);flex-wrap:wrap;">
                <div style="flex:1;min-width:200px;">
                  <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;margin-bottom:2px;">
                    <span style="font-size:var(--text-base);font-weight:600;color:var(--c-text);">${a.title}</span>
                    <span class="badge badge-primary" style="font-size:10px;padding:2px 8px;">${a.category}</span>
                  </div>
                  <div style="font-size:var(--text-xs);color:var(--c-text-3);">
                    ${a.organization} · Issued ${window.AscendUI.formatDateShort(a.date)}
                  </div>
                </div>
                <div style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--c-text-3);background:var(--c-bg);padding:3px 8px;border-radius:var(--r-sm);border:1px solid var(--c-border);">
                  ${Icons.lock} Certificate private
                </div>
              </div>

              <p style="font-size:var(--text-xs);color:var(--c-text-2);line-height:1.6;margin:0;">${a.description}</p>

              ${a.skills && a.skills.length ? `
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:2px;">
                  ${a.skills.map(s => `<span class="skill-tag" style="font-size:10px;padding:2px 7px;">${s}</span>`).join('')}
                </div>` : ''}
            </div>`).join('')}
        </div>`}
    </div>

    <!-- Practical Projects Section -->
    ${publicProjects.length > 0 ? `
      <div style="margin-bottom:var(--sp-8);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-4);border-bottom:1px solid var(--c-border);padding-bottom:var(--sp-2);">
          <div style="font-size:var(--text-lg);font-weight:700;color:var(--c-text);">Featured Projects &amp; Work Samples</div>
          <span style="font-size:var(--text-xs);color:var(--c-text-3);font-weight:500;">${publicProjects.length} project${publicProjects.length !== 1 ? 's' : ''}</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%, 280px),1fr));gap:var(--sp-4);">
          ${publicProjects.map(p => `
            <div style="padding:var(--sp-4);background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-lg);display:flex;flex-direction:column;gap:var(--sp-2);">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--sp-2);">
                <span class="badge" style="background:var(--c-primary-light);color:var(--c-primary);font-size:10px;">${p.category || 'Project'}</span>
                <span style="font-size:11px;color:var(--c-text-3);">${p.date || ''}</span>
              </div>
              <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);">${p.title}</div>
              <p style="font-size:var(--text-xs);color:var(--c-text-2);line-height:1.6;margin:0;">${p.description}</p>
              ${p.skills && p.skills.length ? `
                <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:auto;padding-top:var(--sp-2);">
                  ${p.skills.map(s => `<span class="skill-tag" style="font-size:10px;padding:2px 6px;">${s}</span>`).join('')}
                </div>` : ''}
              <div style="display:flex;gap:var(--sp-2);margin-top:var(--sp-2);padding-top:var(--sp-2);border-top:1px solid var(--c-border);">
                ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="font-size:11px;padding:3px 8px;">${Icons.externalLink} Live Demo</a>` : ''}
                ${p.repoUrl ? `<a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm" style="font-size:11px;padding:3px 8px;">${Icons.github} Code</a>` : ''}
              </div>
            </div>`).join('')}
        </div>
      </div>` : ''}

    <!-- Demonstrated Skills Summary -->
    <div style="margin-bottom:var(--sp-6);">
      <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin-bottom:var(--sp-3);border-bottom:1px solid var(--c-border);padding-bottom:var(--sp-2);">
        Demonstrated Skills
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:var(--sp-2);">
        ${Object.values(skills).flat().map(s => `
          <span style="padding:4px 10px;border-radius:var(--r-full);background:var(--c-bg);border:1px solid var(--c-border);font-size:var(--text-xs);color:var(--c-text);font-weight:500;">
            ${s.name}
          </span>`).join('')}
      </div>
    </div>

    <!-- Public Footer -->
    <div style="text-align:center;padding-top:var(--sp-6);border-top:1px solid var(--c-border);font-size:var(--text-xs);color:var(--c-text-3);">
      Ascend Student Portfolio Platform · ${student.institution}
    </div>`;
}

/* ── Interactive Public Portfolio Preview Modal ────────────── */
function openPublicPortfolioModal(initialViewport = 'desktop') {
  const { student, publicPortfolio } = window.AscendData;
  const { Icons } = window.AscendUI;
  const isPublished = publicPortfolio && publicPortfolio.isPublished !== false;
  const slug = (publicPortfolio && publicPortfolio.slug) || getStudentSlug(student);
  const demoUrl = `ascend.app/p/${slug}`;

  // Remove existing preview modal if any
  const existing = document.getElementById('public-portfolio-preview-modal');
  if (existing) existing.remove();

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.id = 'public-portfolio-preview-modal';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.zIndex = '600';

  modalOverlay.innerHTML = `
    <div class="modal portfolio-preview-dialog">
      <!-- Toolbar -->
      <div class="portfolio-preview-toolbar">
        <div style="display:flex;align-items:center;gap:var(--sp-3);flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="color:var(--c-primary);display:inline-flex;">${Icons.globe}</span>
            <span style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);">Public Preview</span>
          </div>
          <span class="badge ${isPublished ? 'badge-verified' : 'badge-review'}" id="preview-modal-badge" style="font-size:11px;">
            <span class="badge-dot" style="background:${isPublished ? '#1A73E8' : '#D97706'}"></span>
            ${isPublished ? 'Live' : 'Draft (Unpublished)'}
          </span>
          <span style="font-family:ui-monospace,monospace;font-size:var(--text-xs);color:var(--c-text-3);">${demoUrl}</span>
        </div>

        <!-- Viewport selector + actions -->
        <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:4px;background:var(--c-bg);padding:2px;border-radius:var(--r-md);border:1px solid var(--c-border);">
            <button class="viewport-toggle-btn ${initialViewport === 'desktop' ? 'active' : ''}" onclick="AscendViews.setPreviewViewport('desktop', this)">Desktop</button>
            <button class="viewport-toggle-btn ${initialViewport === 'tablet' ? 'active' : ''}" onclick="AscendViews.setPreviewViewport('tablet', this)">Tablet</button>
            <button class="viewport-toggle-btn ${initialViewport === 'mobile' ? 'active' : ''}" onclick="AscendViews.setPreviewViewport('mobile', this)">Mobile</button>
          </div>
          <button class="btn btn-outline btn-sm" onclick="AscendViews.copyPortfolioLink()">
            ${Icons.copy} Copy link
          </button>
          <button class="btn btn-primary btn-sm" onclick="AscendViews.downloadPortfolio()" title="Download created portfolio">
            ${Icons.download} Download
          </button>
          <button class="btn btn-ghost btn-sm" onclick="AscendViews.closePublicPortfolioModal()" aria-label="Close preview">
            ${Icons.x}
          </button>
        </div>
      </div>

      <!-- Body / Canvas container -->
      <div class="portfolio-preview-body-wrap">
        <div class="portfolio-preview-canvas view-${initialViewport}" id="portfolio-preview-canvas">
          ${generatePublicPortfolioCanvasHTML()}
        </div>
      </div>
    </div>`;

  document.body.appendChild(modalOverlay);
  document.body.style.overflow = 'hidden';
}

function closePublicPortfolioModal() {
  const modal = document.getElementById('public-portfolio-preview-modal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

function setPreviewViewport(viewport, btn) {
  const canvas = document.getElementById('portfolio-preview-canvas');
  if (!canvas) return;
  canvas.classList.remove('view-desktop', 'view-tablet', 'view-mobile');
  canvas.classList.add(`view-${viewport}`);

  const buttons = document.querySelectorAll('.viewport-toggle-btn');
  buttons.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

/* ── Standalone Public Portfolio Route View ─────────────────── */
function renderPublicPortfolioPage() {
  const { student, publicPortfolio } = window.AscendData;
  const { Icons } = window.AscendUI;
  const isPublished = publicPortfolio && publicPortfolio.isPublished !== false;
  const slug = (publicPortfolio && publicPortfolio.slug) || getStudentSlug(student);
  const demoUrl = `ascend.app/p/${slug}`;

  return `
    <div style="max-width:880px;margin:0 auto;padding-bottom:var(--sp-12);">
      <!-- Top banner for authenticated preview -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--sp-3) var(--sp-4);background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-lg);margin-bottom:var(--sp-6);flex-wrap:wrap;gap:var(--sp-3);">
        <div style="display:flex;align-items:center;gap:var(--sp-3);">
          <button class="btn btn-ghost btn-sm" onclick="AscendApp.navigate('profile')">
            ${Icons.chevronRight ? `<span style="transform:rotate(180deg);display:inline-flex;">${Icons.chevronRight}</span>` : '←'} Back to profile
          </button>
          <span style="font-size:var(--text-xs);color:var(--c-text-3);">Previewing external public view (${demoUrl})</span>
        </div>
        <div style="display:flex;align-items:center;gap:var(--sp-2);">
          <span class="badge ${isPublished ? 'badge-verified' : 'badge-review'}" style="font-size:11px;">
            ${isPublished ? 'Published' : 'Unpublished (Draft)'}
          </span>
          <button class="btn btn-outline btn-sm" onclick="AscendViews.copyPortfolioLink()">
            ${Icons.copy} Copy link
          </button>
          <button class="btn btn-primary btn-sm" onclick="AscendViews.downloadPortfolio()" title="Download created portfolio">
            ${Icons.download} Download
          </button>
        </div>
      </div>

      <!-- Public canvas container -->
      <div style="background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--r-xl);padding:var(--sp-8);box-shadow:var(--shadow-sm);">
        ${generatePublicPortfolioCanvasHTML()}
      </div>
    </div>`;
}

/* ── Toggle Portfolio Publish / Unpublish ──────────────────── */
function togglePortfolioPublish() {
  const pp = window.AscendData.publicPortfolio;
  if (!pp) return;
  pp.isPublished = !pp.isPublished;

  const isPublished = pp.isPublished;
  window.AscendUI.showToast(
    isPublished
      ? 'Public portfolio published! Link is now active.'
      : 'Public portfolio unpublished. Set to private draft mode.',
    isPublished ? 'success' : 'info'
  );

  // If in preview modal, update badge
  const previewBadge = document.getElementById('preview-modal-badge');
  if (previewBadge) {
    previewBadge.className = `badge ${isPublished ? 'badge-verified' : 'badge-review'}`;
    previewBadge.innerHTML = `<span class="badge-dot" style="background:${isPublished ? '#1A73E8' : '#D97706'}"></span>${isPublished ? 'Live' : 'Draft (Unpublished)'}`;
  }

  // Re-render profile view if on profile page
  if (window.location.hash.replace('#', '') === 'profile' || !window.location.hash) {
    AscendApp.navigate('profile');
  }
}

/* ── Copy Portfolio Demo Link ──────────────────────────────── */
function copyPortfolioLink() {
  const { student, publicPortfolio } = window.AscendData;
  const slug = (publicPortfolio && publicPortfolio.slug) || getStudentSlug(student);
  const fullUrl = `https://ascend.app/p/${slug}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullUrl).then(() => {
      onCopySuccess(slug);
    }).catch(() => {
      fallbackCopy(fullUrl, slug);
    });
  } else {
    fallbackCopy(fullUrl, slug);
  }
}

function fallbackCopy(text, slug) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    onCopySuccess(slug);
  } catch (err) {
    window.AscendUI.showToast(`Link: https://ascend.app/p/${slug}`, 'info');
  }
  document.body.removeChild(ta);
}

function onCopySuccess(slug) {
  window.AscendUI.showToast(`Public portfolio link copied: ascend.app/p/${slug}`, 'success');
  const label = document.getElementById('copy-btn-label');
  if (label) {
    const original = label.textContent;
    label.textContent = 'Copied!';
    setTimeout(() => { if (label) label.textContent = original; }, 2000);
  }
  const goalsBtn = document.getElementById('goals-copy-link-btn');
  if (goalsBtn) {
    const original = goalsBtn.innerHTML;
    goalsBtn.innerHTML = `${(window.AscendUI.Icons && window.AscendUI.Icons.check) || ''} Copied!`;
    setTimeout(() => { if (goalsBtn) goalsBtn.innerHTML = original; }, 2000);
  }
  const overviewCopyBtn = document.getElementById('overview-copy-portfolio-btn');
  if (overviewCopyBtn) {
    const original = overviewCopyBtn.innerHTML;
    overviewCopyBtn.innerHTML = `${(window.AscendUI.Icons && window.AscendUI.Icons.check) || ''} Copied!`;
    setTimeout(() => { if (overviewCopyBtn) overviewCopyBtn.innerHTML = original; }, 2000);
  }
}

/* ── Download & Export Created Portfolio ───────────────────── */
function generateStandalonePortfolioHTML() {
  const { student } = window.AscendData;
  const canvasHtml = generatePublicPortfolioCanvasHTML();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${student.name} - Student Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --c-primary: #1A73E8;
      --c-primary-hover: #1557B0;
      --c-primary-light: #E8F0FE;
      --c-primary-dark: #174EA6;
      --c-bg: #F8F9FA;
      --c-surface: #FFFFFF;
      --c-border: #E8EAED;
      --c-text: #202124;
      --c-text-2: #5F6368;
      --c-text-3: #80868B;
      --c-slate: #5F6368;
      --r-sm: 6px;
      --r-md: 8px;
      --r-lg: 12px;
      --r-xl: 16px;
      --r-full: 9999px;
      --sp-1: 4px;
      --sp-2: 8px;
      --sp-3: 12px;
      --sp-4: 16px;
      --sp-5: 20px;
      --sp-6: 24px;
      --sp-8: 32px;
      --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--font-sans);
      background-color: var(--c-bg);
      color: var(--c-text);
      line-height: 1.5;
      padding: 32px 16px;
      -webkit-font-smoothing: antialiased;
    }
    .portfolio-wrapper {
      max-width: 860px;
      margin: 0 auto;
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      border-radius: var(--r-xl);
      padding: var(--sp-8);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      border-radius: var(--r-full);
      background: var(--c-primary-light);
      color: var(--c-primary);
    }
    .avatar-xxl {
      width: 72px;
      height: 72px;
      font-size: 24px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      border-radius: var(--r-full);
      font-size: 11px;
      font-weight: 500;
      white-space: nowrap;
    }
    .badge-primary {
      background: var(--c-primary-light);
      color: var(--c-primary);
    }
    .badge-verified {
      background: #E8F0FE;
      color: #1A73E8;
    }
    .badge-review {
      background: #FEF3C7;
      color: #92400E;
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-right: 5px;
      display: inline-block;
    }
    .skill-tag {
      display: inline-flex;
      align-items: center;
      background: var(--c-bg);
      border: 1px solid var(--c-border);
      border-radius: var(--r-full);
      padding: 4px 10px;
      font-size: 12px;
      color: var(--c-text);
      font-weight: 500;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: var(--r-md);
      font-size: 12px;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-outline {
      background: var(--c-surface);
      border: 1px solid var(--c-border);
      color: var(--c-text);
    }
    .btn-outline:hover {
      background: var(--c-bg);
      border-color: #c2e7ff;
    }
    .btn-ghost {
      background: transparent;
      border: none;
      color: var(--c-text-2);
    }
    .btn-ghost:hover {
      background: var(--c-bg);
      color: var(--c-text);
    }
    .portfolio-public-banner {
      border-bottom: 1px solid var(--c-border);
      padding-bottom: var(--sp-4);
      margin-bottom: var(--sp-6);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--sp-2);
      font-size: 12px;
      color: var(--c-text-3);
    }
    .public-privacy-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: var(--r-md);
      background: var(--c-bg);
      border: 1px solid var(--c-border);
      font-size: 12px;
      color: var(--c-text-2);
      margin-bottom: var(--sp-6);
      line-height: 1.5;
    }
    @media (max-width: 640px) {
      body { padding: 16px 8px; }
      .portfolio-wrapper { padding: 20px 16px; border-radius: var(--r-lg); }
    }
    @media print {
      body { background: #fff !important; padding: 0 !important; }
      .portfolio-wrapper { box-shadow: none !important; border: none !important; padding: 0 !important; max-width: 100% !important; }
      .no-print { display: none !important; }
      a { text-decoration: none; color: inherit; }
    }
  </style>
</head>
<body>
  <div class="portfolio-wrapper">
    ${canvasHtml}
  </div>
</body>
</html>`;
}

function downloadPortfolioHTML() {
  const { student } = window.AscendData;
  const htmlContent = generateStandalonePortfolioHTML();
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (student.name || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
  a.href = url;
  a.download = `${safeName}_Portfolio.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  if (window.AscendData.portfolioInsights) {
    window.AscendData.portfolioInsights.downloads = (window.AscendData.portfolioInsights.downloads || 0) + 1;
  }
  window.AscendUI.showToast(`Portfolio downloaded as ${safeName}_Portfolio.html!`, 'success');
}

function printPortfolioPDF() {
  const htmlContent = generateStandalonePortfolioHTML();
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.AscendUI.showToast('Please allow popups to open the PDF/Print preview.', 'warning');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 400);

  if (window.AscendData.portfolioInsights) {
    window.AscendData.portfolioInsights.downloads = (window.AscendData.portfolioInsights.downloads || 0) + 1;
  }
  window.AscendUI.showToast('Print dialog opened. Select "Save as PDF" to save.', 'info');
}

function openDownloadPortfolioModal() {
  const existing = document.getElementById('download-portfolio-modal');
  if (existing) existing.remove();

  const { student } = window.AscendData;
  const { Icons } = window.AscendUI;

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.id = 'download-portfolio-modal';
  modalOverlay.style.display = 'flex';
  modalOverlay.style.alignItems = 'center';
  modalOverlay.style.justifyContent = 'center';
  modalOverlay.style.zIndex = '700';

  modalOverlay.innerHTML = `
    <div class="modal" style="max-width:480px;width:92%;padding:var(--sp-6);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-4);">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="color:var(--c-primary);display:inline-flex;">${Icons.download}</span>
          <span class="modal-title" style="font-size:var(--text-lg);font-weight:700;">Download Created Portfolio</span>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="AscendViews.closeDownloadPortfolioModal()" aria-label="Close">
          ${Icons.x}
        </button>
      </div>
      <p style="font-size:var(--text-sm);color:var(--c-text-2);line-height:1.5;margin-bottom:var(--sp-5);">
        Export <strong>${student.name}</strong>'s created portfolio to share with recruiters, attach to applications, or keep offline.
      </p>

      <div style="display:flex;flex-direction:column;gap:var(--sp-3);margin-bottom:var(--sp-5);">
        <!-- Option 1: Standalone HTML -->
        <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--sp-3);padding:var(--sp-4);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-lg);">
          <div style="display:flex;align-items:flex-start;gap:var(--sp-3);">
            <span style="color:var(--c-primary);margin-top:2px;display:inline-flex;">${Icons.globe}</span>
            <div>
              <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);">Standalone Webpage (.html)</div>
              <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">Complete offline portfolio with interactive design &amp; links</div>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" style="flex-shrink:0;" onclick="AscendViews.downloadPortfolioHTML();AscendViews.closeDownloadPortfolioModal();">
            ${Icons.download} Download
          </button>
        </div>

        <!-- Option 2: Print / PDF -->
        <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--sp-3);padding:var(--sp-4);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-lg);">
          <div style="display:flex;align-items:flex-start;gap:var(--sp-3);">
            <span style="color:var(--c-primary);margin-top:2px;display:inline-flex;">${Icons.fileText}</span>
            <div>
              <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);">PDF Document (.pdf)</div>
              <div style="font-size:var(--text-xs);color:var(--c-text-3);margin-top:2px;">Print-ready layout to save as PDF via browser print</div>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" style="flex-shrink:0;" onclick="AscendViews.printPortfolioPDF();AscendViews.closeDownloadPortfolioModal();">
            ${Icons.download} Save PDF
          </button>
        </div>
      </div>

      <div style="display:flex;justify-content:flex-end;">
        <button class="btn btn-ghost btn-sm" onclick="AscendViews.closeDownloadPortfolioModal()">
          Cancel
        </button>
      </div>
    </div>`;

  document.body.appendChild(modalOverlay);
}

function closeDownloadPortfolioModal() {
  const modal = document.getElementById('download-portfolio-modal');
  if (modal) modal.remove();
}

function downloadPortfolio(format = null) {
  if (format === 'html') {
    downloadPortfolioHTML();
  } else if (format === 'pdf') {
    printPortfolioPDF();
  } else {
    openDownloadPortfolioModal();
  }
}

/* ── Open Manage Public Items Modal ────────────────────────── */
function openManagePublicItemsModal() {
  window.AscendUI.openModal('manage-public-modal');
}

/* ── Save Public Items Selection ───────────────────────────── */
function savePublicItemsSelection() {
  const achCheckboxes = document.querySelectorAll('.public-ach-cb');
  const selectedAchIds = [];
  achCheckboxes.forEach(cb => {
    if (cb.checked) selectedAchIds.push(cb.value);
  });

  const projCheckboxes = document.querySelectorAll('.public-proj-cb');
  projCheckboxes.forEach(cb => {
    const p = (window.AscendData.projects || []).find(it => it.id === cb.value);
    if (p) p.isPublic = cb.checked;
  });

  if (window.AscendData.publicPortfolio) {
    window.AscendData.publicPortfolio.publicAchievementIds = selectedAchIds;
  }

  window.AscendUI.closeModal('manage-public-modal');
  window.AscendUI.showToast('Public portfolio items updated!', 'success');
  AscendApp.navigate('profile');
}

/* ── Project Management Handlers ───────────────────────────── */
function openAddProjectModal() {
  const title = document.getElementById('proj-title');
  const category = document.getElementById('proj-category');
  const desc = document.getElementById('proj-desc');
  const skills = document.getElementById('proj-skills');
  const live = document.getElementById('proj-live');
  const repo = document.getElementById('proj-repo');
  const isPub = document.getElementById('proj-public');

  if (title) title.value = '';
  if (category) category.value = '';
  if (desc) desc.value = '';
  if (skills) skills.value = '';
  if (live) live.value = '';
  if (repo) repo.value = '';
  if (isPub) isPub.checked = true;

  window.AscendUI.openModal('add-project-modal');
}

function saveNewProject() {
  const titleEl = document.getElementById('proj-title');
  const descEl  = document.getElementById('proj-desc');
  const title = titleEl ? titleEl.value.trim() : '';
  const desc  = descEl ? descEl.value.trim() : '';

  if (!title) {
    window.AscendUI.showToast('Please enter a project title.', 'error');
    return;
  }
  if (!desc) {
    window.AscendUI.showToast('Please enter a project description.', 'error');
    return;
  }

  const category = document.getElementById('proj-category')?.value.trim() || 'Technical Build';
  const skills = (document.getElementById('proj-skills')?.value || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const liveUrl = document.getElementById('proj-live')?.value.trim() || null;
  const repoUrl = document.getElementById('proj-repo')?.value.trim() || null;
  const isPublic = document.getElementById('proj-public')?.checked !== false;

  const newProj = {
    id: `proj-${Date.now()}`,
    title,
    category,
    description: desc,
    skills,
    liveUrl,
    repoUrl,
    date: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    isPublic,
  };

  if (!window.AscendData.projects) window.AscendData.projects = [];
  window.AscendData.projects.unshift(newProj);
  if (window.AscendData.saveProject) window.AscendData.saveProject(newProj);

  window.AscendUI.closeModal('add-project-modal');
  window.AscendUI.showToast('Project added successfully!', 'success');

  const gridContainer = document.getElementById('projects-grid-container');
  if (gridContainer) {
    if (window.AscendViews && typeof window.AscendViews.filterProjectsList === 'function') {
      window.AscendViews.filterProjectsList();
    }
    const headerSub = document.querySelector('.section-header div div');
    if (headerSub) {
      const count = window.AscendData.projects.length;
      headerSub.textContent = `${count} project${count !== 1 ? 's' : ''} in your portfolio · Showcase builds, web apps, and research`;
    }
    return;
  }

  openProfileTab('projects-profile');
}

function toggleProjectPublic(projId) {
  const p = (window.AscendData.projects || []).find(it => it.id === projId);
  if (!p) return;
  p.isPublic = p.isPublic === false;
  if (window.AscendData.saveProject) {
    window.AscendData.saveProject(p);
  }
  window.AscendUI.showToast(
    p.isPublic ? `"${p.title}" added to public portfolio.` : `"${p.title}" hidden from public portfolio.`,
    'info'
  );

  const gridContainer = document.getElementById('projects-grid-container');
  if (gridContainer) {
    if (window.AscendViews && typeof window.AscendViews.filterProjectsList === 'function') {
      window.AscendViews.filterProjectsList();
    } else {
      const card = document.getElementById(`standalone-project-card-${projId}`);
      if (card) {
        const btn = card.querySelector('button[title="Toggle public portfolio display"]');
        if (btn) {
          const { Icons } = window.AscendUI;
          btn.innerHTML = p.isPublic !== false ? `${Icons.globe} Public` : `${Icons.eyeOff} Private`;
        }
      }
    }
    return;
  }

  const profileCard = document.getElementById(`project-card-${projId}`);
  if (profileCard) {
    const btn = profileCard.querySelector('button[title="Toggle public portfolio display"]');
    if (btn) {
      const { Icons } = window.AscendUI;
      btn.innerHTML = p.isPublic !== false ? `${Icons.globe} Public` : `${Icons.eyeOff} Private`;
    }
    const publicCount = (window.AscendData.projects || []).filter(pr => pr.isPublic !== false).length;
    const tabBtn = document.querySelector('#profile-tabs .tab-item[data-tab="projects-profile"]');
    if (tabBtn) tabBtn.textContent = `Projects (${publicCount})`;
    return;
  }

  openProfileTab('projects-profile');
}

function deleteProject(projId) {
  const p = (window.AscendData.projects || []).find(it => it.id === projId);
  if (!p) return;
  window.AscendUI.confirmDialog({
    title: 'Delete project',
    message: `Are you sure you want to remove "${p.title}"?`,
    confirmLabel: 'Delete',
    danger: true,
    onConfirm: () => {
      window.AscendData.projects = (window.AscendData.projects || []).filter(it => it.id !== projId);
      if (window.AscendData.deleteProject) window.AscendData.deleteProject(projId);
      window.AscendUI.showToast('Project removed.', 'info');

      const gridContainer = document.getElementById('projects-grid-container');
      if (gridContainer) {
        if (window.AscendViews && typeof window.AscendViews.filterProjectsList === 'function') {
          window.AscendViews.filterProjectsList();
        } else {
          const card = document.getElementById(`standalone-project-card-${projId}`);
          if (card) card.remove();
        }
        const headerSub = document.querySelector('.section-header div div');
        if (headerSub) {
          const count = (window.AscendData.projects || []).length;
          headerSub.textContent = `${count} project${count !== 1 ? 's' : ''} in your portfolio · Showcase builds, web apps, and research`;
        }
        return;
      }

      const profileCard = document.getElementById(`project-card-${projId}`);
      if (profileCard) {
        profileCard.remove();
        const publicCount = (window.AscendData.projects || []).filter(pr => pr.isPublic !== false).length;
        const tabBtn = document.querySelector('#profile-tabs .tab-item[data-tab="projects-profile"]');
        if (tabBtn) tabBtn.textContent = `Projects (${publicCount})`;
        return;
      }

      openProfileTab('projects-profile');
    }
  });
}

/* ── Open Edit Profile Modal ─────────────────────────────── */
function openEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  if (!modal) {
    const overviewTab = document.querySelector('#profile-tabs .tab-item[data-tab="overview"]');
    if (overviewTab) overviewTab.click();
    setTimeout(() => openEditProfileModal(), 50);
    return;
  }

  const s = window.AscendData.student || {};
  if (document.getElementById('edit-name')) document.getElementById('edit-name').value = s.name || '';
  if (document.getElementById('edit-degree')) document.getElementById('edit-degree').value = s.degree || '';
  if (document.getElementById('edit-department')) document.getElementById('edit-department').value = s.department || '';
  if (document.getElementById('edit-institution')) document.getElementById('edit-institution').value = s.institution || 'Delhi Institute of Technology';
  if (document.getElementById('edit-year')) document.getElementById('edit-year').value = s.year || '1';
  if (document.getElementById('edit-gradyear')) document.getElementById('edit-gradyear').value = s.graduationYear || '2028';
  if (document.getElementById('edit-rollno')) document.getElementById('edit-rollno').value = s.rollNumber || s.rollNo || '';
  if (document.getElementById('edit-bio')) document.getElementById('edit-bio').value = s.bio || '';
  if (document.getElementById('edit-interests')) document.getElementById('edit-interests').value = (s.careerInterests || []).join(', ');
  if (document.getElementById('edit-linkedin')) document.getElementById('edit-linkedin').value = s.linkedIn || '';
  if (document.getElementById('edit-github')) document.getElementById('edit-github').value = s.github || '';
  if (document.getElementById('edit-portfolio')) document.getElementById('edit-portfolio').value = s.portfolio || '';

  window.AscendUI.openModal('edit-profile-modal');
}

/* ── Save Profile Edits ──────────────────────────────────── */
function saveProfileEdit() {
  const btn = document.getElementById('save-profile-btn');
  if (btn) { btn.innerHTML = '<div class="spinner"></div> Saving…'; btn.disabled = true; }

  const s = window.AscendData.student || {};

  const name           = document.getElementById('edit-name')?.value.trim()           || s.name || 'Student';
  const degree         = document.getElementById('edit-degree')?.value.trim()         || s.degree || 'B.Tech in Computer Science';
  const department     = document.getElementById('edit-department')?.value.trim()     || s.department || 'Computer Science & Engineering';
  const institution    = document.getElementById('edit-institution')?.value.trim()    || s.institution || 'Delhi Institute of Technology';
  const year           = parseInt(document.getElementById('edit-year')?.value, 10)    || s.year || 1;
  const graduationYear = parseInt(document.getElementById('edit-gradyear')?.value, 10)|| s.graduationYear || 2028;
  const rollNumber     = document.getElementById('edit-rollno')?.value.trim()         || s.rollNumber || '';

  const bioInput       = document.getElementById('edit-bio');
  const bio            = bioInput ? bioInput.value.trim() : (s.bio || '');
  const interestsInput = document.getElementById('edit-interests');
  const interests      = interestsInput ? (interestsInput.value || '').split(',').map(item => item.trim()).filter(Boolean) : (s.careerInterests || []);
  const linkedInInput  = document.getElementById('edit-linkedin');
  const linkedIn       = linkedInInput ? linkedInInput.value.trim() : (s.linkedIn || '');
  const githubInput    = document.getElementById('edit-github');
  const github         = githubInput ? githubInput.value.trim() : (s.github || '');
  const portfolioInput = document.getElementById('edit-portfolio');
  const portfolio      = portfolioInput ? portfolioInput.value.trim() : (s.portfolio || '');

  const firstName = name.split(' ')[0] || name;
  const initials  = name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'ST';

  const updates = {
    name,
    firstName,
    initials,
    degree,
    department,
    institution,
    year,
    graduationYear,
    rollNumber,
    bio,
    careerInterests: interests,
    linkedIn,
    github,
    portfolio,
  };

  Object.assign(window.AscendData.student, updates);

  // Sync session storage user
  try {
    const sessionUser = JSON.parse(sessionStorage.getItem('ascend_user') || '{}');
    sessionUser.name = name;
    sessionStorage.setItem('ascend_user', JSON.stringify(sessionUser));
  } catch (e) {}

  if (window.AscendData.updateProfile) {
    window.AscendData.updateProfile(updates);
  }

  // Update slug if name changed
  if (window.AscendData.publicPortfolio) {
    window.AscendData.publicPortfolio.slug = getStudentSlug(window.AscendData.student);
  }

  const cl = window.AscendData.profileChecklist;
  if (Array.isArray(cl)) {
    const setDone = (id, val) => { const item = cl.find(c => c.id === id || (id === 'bio' && c.id === 'chk-3')); if (item) item.done = val; };
    setDone('bio',       !!bio);
    setDone('linkedin',  !!linkedIn);
    setDone('portfolio', !!portfolio || !!github);
    setDone('interests', interests.length > 0);
  }

  setTimeout(() => {
    if (btn) { btn.innerHTML = 'Save changes'; btn.disabled = false; }
    window.AscendUI.closeModal('edit-profile-modal');
    window.AscendUI.showToast('Profile and academic details updated successfully!', 'success');
    AscendApp.navigate('profile');
  }, 400);
}

/* ── Résumé upload helpers ───────────────────────────────── */
function handleResumeFileSelect(input) {
  if (!input.files[0]) return;
  showResumePreview(input.files[0]);
}

function handleResumeFileDrop(e) {
  e.preventDefault();
  e.currentTarget.style.background = '';
  const file = e.dataTransfer.files[0];
  if (file) showResumePreview(file);
}

function showResumePreview(file) {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    window.AscendUI.showToast('Please upload a PDF résumé.', 'error');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    window.AscendUI.showToast('File must be under 10 MB.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const resumeObj = {
      name: file.name,
      size: (file.size / 1024).toFixed(0) + ' KB',
      dataUrl: dataUrl,
      uploadedAt: new Date().toISOString()
    };
    if (!window.AscendData.student) window.AscendData.student = {};
    window.AscendData.student.resume = resumeObj;

    if (window.AscendData.updateProfile) {
      window.AscendData.updateProfile({ resume: resumeObj });
    }

    const cl = window.AscendData.profileChecklist;
    if (Array.isArray(cl)) {
      const resumeItem = cl.find(c => c.id === 'resume');
      if (resumeItem) resumeItem.done = true;
    }

    window.AscendUI.showToast('Résumé uploaded and saved successfully!', 'success');
    if (window.AscendApp && window.AscendApp.navigate) {
      window.AscendApp.navigate('profile');
    }
  };
  reader.onerror = function() {
    window.AscendUI.showToast('Failed to read résumé file.', 'error');
  };
  reader.readAsDataURL(file);
}

function clearResumeFile() {
  if (window.AscendData.student) {
    window.AscendData.student.resume = null;
  }
  if (window.AscendData.updateProfile) {
    window.AscendData.updateProfile({ resume: null });
  }
  const cl = window.AscendData.profileChecklist;
  if (Array.isArray(cl)) {
    const resumeItem = cl.find(c => c.id === 'resume');
    if (resumeItem) resumeItem.done = false;
  }
  window.AscendUI.showToast('Résumé removed.', 'info');
  if (window.AscendApp && window.AscendApp.navigate) {
    window.AscendApp.navigate('profile');
  }
}

/* ── Custom Skill Handlers ───────────────────────────────── */
function openAddSkillModal(preferredCategory) {
  const catSelect = document.getElementById('skill-category-select') || document.getElementById('new-skill-category');
  const nameInput = document.getElementById('new-skill-input') || document.getElementById('new-skill-name');
  if (catSelect && preferredCategory) {
    catSelect.value = preferredCategory;
  }
  if (nameInput) {
    nameInput.value = '';
    setTimeout(() => nameInput.focus(), 100);
  }
  window.AscendUI.openModal('add-skill-modal');
}

function saveNewSkill() {
  const catSelect = document.getElementById('skill-category-select') || document.getElementById('new-skill-category');
  const nameInput = document.getElementById('new-skill-input') || document.getElementById('new-skill-name');
  const category = catSelect?.value || 'Technical';
  const rawSkills = nameInput?.value || '';
  const skillsToAdd = rawSkills.split(',').map(s => s.trim()).filter(Boolean);

  if (skillsToAdd.length === 0) {
    window.AscendUI.showToast('Please enter at least one skill name.', 'error');
    return;
  }

  if (!window.AscendData.skills) window.AscendData.skills = {};
  if (!Array.isArray(window.AscendData.skills[category])) {
    window.AscendData.skills[category] = [];
  }

  if (!window.AscendData.student) window.AscendData.student = {};
  if (!window.AscendData.student.skills) window.AscendData.student.skills = {};
  if (!Array.isArray(window.AscendData.student.skills[category])) {
    window.AscendData.student.skills[category] = [];
  }

  skillsToAdd.forEach(skill => {
    // Un-ignore if previously removed
    const lower = skill.toLowerCase();
    if (Array.isArray(window.AscendData.skills._ignored)) {
      window.AscendData.skills._ignored = window.AscendData.skills._ignored.filter(i => i !== lower);
    }
    if (Array.isArray(window.AscendData.student.skills._ignored)) {
      window.AscendData.student.skills._ignored = window.AscendData.student.skills._ignored.filter(i => i !== lower);
    }

    const hasInSkills = window.AscendData.skills[category].some(s => (typeof s === 'string' ? s : s.name).toLowerCase() === lower);
    if (!hasInSkills) {
      window.AscendData.skills[category].push({ name: skill, level: 70 });
    }

    const hasInStudentSkills = window.AscendData.student.skills[category].some(s => (typeof s === 'string' ? s : s.name).toLowerCase() === lower);
    if (!hasInStudentSkills) {
      window.AscendData.student.skills[category].push({ name: skill, level: 70 });
    }
  });

  if (window.AscendData.updateProfile) {
    window.AscendData.updateProfile({ skills: window.AscendData.skills });
  }

  window.AscendUI.closeModal('add-skill-modal');
  window.AscendUI.showToast(`Added ${skillsToAdd.length} skill(s) to ${category}!`, 'success');
  openProfileTab('skills-profile');
}

function removeSkill(category, skillName) {
  const normLower = (skillName || '').toLowerCase().trim();

  if (window.AscendData.skills) {
    if (Array.isArray(window.AscendData.skills[category])) {
      window.AscendData.skills[category] = window.AscendData.skills[category].filter(
        s => (typeof s === 'string' ? s : (s && s.name ? s.name : '')).toLowerCase().trim() !== normLower
      );
    }
    if (!Array.isArray(window.AscendData.skills._ignored)) {
      window.AscendData.skills._ignored = [];
    }
    if (!window.AscendData.skills._ignored.includes(normLower)) {
      window.AscendData.skills._ignored.push(normLower);
    }
  }

  if (window.AscendData.student && window.AscendData.student.skills) {
    if (Array.isArray(window.AscendData.student.skills[category])) {
      window.AscendData.student.skills[category] = window.AscendData.student.skills[category].filter(
        s => (typeof s === 'string' ? s : (s && s.name ? s.name : '')).toLowerCase().trim() !== normLower
      );
    }
    if (!Array.isArray(window.AscendData.student.skills._ignored)) {
      window.AscendData.student.skills._ignored = [];
    }
    if (!window.AscendData.student.skills._ignored.includes(normLower)) {
      window.AscendData.student.skills._ignored.push(normLower);
    }
  }

  if (window.AscendData.updateProfile) {
    window.AscendData.updateProfile({ skills: window.AscendData.skills || window.AscendData.student?.skills });
  }
  window.AscendUI.showToast(`Removed "${skillName}" from ${category}.`, 'info');
  openProfileTab('skills-profile');
}

/* ── Interactive Checklist Handler ────────────────────────── */
function handleChecklistClick(id) {
  if (id === 'bio' || id === 'interests') {
    openEditProfileModal();
    setTimeout(() => {
      if (id === 'bio') document.getElementById('edit-bio')?.focus();
      if (id === 'interests') document.getElementById('edit-interests')?.focus();
    }, 150);
  } else if (id === 'resume') {
    const input = document.getElementById('profile-resume-input');
    if (input) input.click();
  } else if (id === 'linkedin') {
    openLinkedInModal();
  } else if (id === 'portfolio') {
    openGitHubModal();
  } else {
    openEditProfileModal();
  }
}

/* ── Dedicated External Profile Modal Handlers ─────────── */
function openLinkedInModal() {
  const input = document.getElementById('profile-linkedin-input');
  const err = document.getElementById('err-single-linkedin');
  if (input) {
    input.value = window.AscendData.student.linkedIn || '';
    input.classList.remove('error');
  }
  if (err) err.style.display = 'none';
  window.AscendUI.openModal('add-linkedin-modal');
  setTimeout(() => input?.focus(), 100);
}

function saveLinkedIn() {
  const input = document.getElementById('profile-linkedin-input');
  let val = (input?.value || '').trim();

  if (val) {
    if (!val.startsWith('http://') && !val.startsWith('https://')) {
      if (val.includes('linkedin.com')) {
        val = 'https://' + val;
      } else {
        const cleanUser = val.replace(/^@/, '');
        val = `https://www.linkedin.com/in/${cleanUser}`;
      }
    }
  }

  const btn = document.getElementById('save-single-linkedin-btn');
  if (btn) { btn.innerHTML = '<div class="spinner"></div> Saving…'; btn.disabled = true; }

  setTimeout(() => {
    window.AscendData.student.linkedIn = val;
    if (window.AscendData.updateProfile) {
      window.AscendData.updateProfile({ linkedIn: val });
    }

    const cl = window.AscendData.profileChecklist;
    if (Array.isArray(cl)) {
      const item = cl.find(c => c.id === 'linkedin');
      if (item) item.done = !!val;
    }

    if (btn) { btn.innerHTML = 'Save LinkedIn'; btn.disabled = false; }
    window.AscendUI.closeModal('add-linkedin-modal');
    window.AscendUI.showToast(val ? 'LinkedIn profile connected!' : 'LinkedIn profile updated.', 'success');
    AscendApp.navigate('profile');
  }, 250);
}

function removeLinkedIn() {
  window.AscendData.student.linkedIn = '';
  if (window.AscendData.updateProfile) {
    window.AscendData.updateProfile({ linkedIn: '' });
  }
  const cl = window.AscendData.profileChecklist;
  if (Array.isArray(cl)) {
    const item = cl.find(c => c.id === 'linkedin');
    if (item) item.done = false;
  }
  window.AscendUI.closeModal('add-linkedin-modal');
  window.AscendUI.showToast('LinkedIn profile removed.', 'info');
  AscendApp.navigate('profile');
}

function openGitHubModal() {
  const input = document.getElementById('profile-github-input');
  const err = document.getElementById('err-single-github');
  if (input) {
    input.value = window.AscendData.student.github || '';
    input.classList.remove('error');
  }
  if (err) err.style.display = 'none';
  window.AscendUI.openModal('add-github-modal');
  setTimeout(() => input?.focus(), 100);
}

function saveGitHub() {
  const input = document.getElementById('profile-github-input');
  let val = (input?.value || '').trim();

  if (val) {
    if (!val.startsWith('http://') && !val.startsWith('https://')) {
      if (val.includes('github.com')) {
        val = 'https://' + val;
      } else {
        const cleanUser = val.replace(/^@/, '');
        val = `https://github.com/${cleanUser}`;
      }
    }
  }

  const btn = document.getElementById('save-single-github-btn');
  if (btn) { btn.innerHTML = '<div class="spinner"></div> Saving…'; btn.disabled = true; }

  setTimeout(() => {
    window.AscendData.student.github = val;
    if (window.AscendData.updateProfile) {
      window.AscendData.updateProfile({ github: val });
    }

    const cl = window.AscendData.profileChecklist;
    if (Array.isArray(cl)) {
      const item = cl.find(c => c.id === 'portfolio');
      if (item) item.done = !!(window.AscendData.student.portfolio || val);
    }

    if (btn) { btn.innerHTML = 'Save GitHub'; btn.disabled = false; }
    window.AscendUI.closeModal('add-github-modal');
    window.AscendUI.showToast(val ? 'GitHub profile connected!' : 'GitHub profile updated.', 'success');
    AscendApp.navigate('profile');
  }, 250);
}

function removeGitHub() {
  window.AscendData.student.github = '';
  if (window.AscendData.updateProfile) {
    window.AscendData.updateProfile({ github: '' });
  }
  const cl = window.AscendData.profileChecklist;
  if (Array.isArray(cl)) {
    const item = cl.find(c => c.id === 'portfolio');
    if (item) item.done = !!(window.AscendData.student.portfolio);
  }
  window.AscendUI.closeModal('add-github-modal');
  window.AscendUI.showToast('GitHub profile removed.', 'info');
  AscendApp.navigate('profile');
}

/* ── Tab initialization & switcher ──────────────────────── */
function openProfileTab(tabName) {
  window._activeProfileTab = tabName;
  if (window.AscendApp && window.AscendApp.navigate) {
    window.AscendApp.navigate('profile');
  }
  const target = document.querySelector(`#profile-tabs .tab-item[data-tab="${tabName}"]`);
  if (target) {
    target.click();
  }
}

function initProfileTabs() {
  const tabs = document.querySelectorAll('#profile-tabs .tab-item');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`tab-${tab.dataset.tab}`)?.classList.add('active');
    });
    // Support keyboard: Enter and Space already trigger click on <button> elements
  });

  if (window._activeProfileTab) {
    const target = document.querySelector(`#profile-tabs .tab-item[data-tab="${window._activeProfileTab}"]`);
    if (target) {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      target.classList.add('active');
      target.setAttribute('aria-selected', 'true');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`tab-${window._activeProfileTab}`)?.classList.add('active');
    }
    window._activeProfileTab = null;
  }
}

window.AscendViews = window.AscendViews || {};
Object.assign(window.AscendViews, {
  getStudentSlug,
  profile: renderProfile,
  initProfile: initProfileTabs,
  openProfileTab,
  publicPortfolioPage: renderPublicPortfolioPage,
  openPublicPortfolioModal,
  closePublicPortfolioModal,
  setPreviewViewport,
  togglePortfolioPublish,
  copyPortfolioLink,
  downloadPortfolio,
  downloadPortfolioHTML,
  printPortfolioPDF,
  openDownloadPortfolioModal,
  closeDownloadPortfolioModal,
  openManagePublicItemsModal,
  savePublicItemsSelection,
  openAddProjectModal,
  saveNewProject,
  toggleProjectPublic,
  deleteProject,
  openEditProfileModal,
  saveProfileEdit,
  handleResumeFileSelect,
  handleResumeFileDrop,
  clearResumeFile,
  openAddSkillModal,
  saveNewSkill,
  removeSkill,
  handleChecklistClick,
  openLinkedInModal,
  saveLinkedIn,
  removeLinkedIn,
  openGitHubModal,
  saveGitHub,
  removeGitHub,
});
