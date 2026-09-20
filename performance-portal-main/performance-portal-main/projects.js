/**
 * ASCEND – Dedicated Projects View
 * Separate Projects page accessible directly from the sidebar.
 * Mirrors and synchronizes with the Profile's projects experience.
 */

(function () {
  let projectFilterState = {
    search: '',
    category: '',
    visibility: '',
    sort: 'newest'
  };

  function projectCardHTML(p) {
    const { Icons } = window.AscendUI;
    const isPublic = p.isPublic !== false;

    return `
      <div class="project-card" id="standalone-project-card-${p.id}">
        <div class="project-meta-strip">
          <span class="badge" style="background:var(--c-primary-light);color:var(--c-primary);font-size:11px;font-weight:600;">
            ${p.category || 'Project'}
          </span>
          <div style="display:flex;align-items:center;gap:var(--sp-2);">
            <button type="button" class="btn btn-ghost btn-sm" style="padding:2px 6px;font-size:11px;" onclick="AscendViews.toggleProjectPublic('${p.id}')" title="Toggle public portfolio display">
              ${isPublic ? `${Icons.globe} Public` : `${Icons.eyeOff} Private`}
            </button>
            <button type="button" class="btn btn-ghost btn-sm" style="padding:2px 6px;color:var(--c-rejected);" onclick="AscendViews.deleteProject('${p.id}')" aria-label="Delete project">
              ${Icons.trash}
            </button>
          </div>
        </div>

        <div style="font-size:var(--text-base);font-weight:600;color:var(--c-text);">${p.title}</div>
        <p style="font-size:var(--text-sm);color:var(--c-text-2);line-height:1.6;margin:0;">${p.description}</p>

        ${p.skills && p.skills.length ? `
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:var(--sp-2);">
            ${p.skills.map(s => `<span class="skill-tag" style="font-size:11px;padding:3px 8px;">${typeof s === 'string' ? s : s.name}</span>`).join('')}
          </div>` : ''}

        <div class="project-links">
          ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="font-size:11px;padding:4px 8px;">${Icons.externalLink} Live demo</a>` : ''}
          ${p.repoUrl ? `<a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm" style="font-size:11px;padding:4px 8px;">${Icons.github} Repository</a>` : ''}
          <span style="font-size:11px;color:var(--c-text-3);margin-left:auto;">${p.date || ''}</span>
        </div>
      </div>`;
  }

  function getFilteredProjects() {
    let list = Array.isArray(window.AscendData.projects) ? [...window.AscendData.projects] : [];

    if (projectFilterState.search) {
      const q = projectFilterState.search.toLowerCase();
      list = list.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (Array.isArray(p.skills) && p.skills.some(s => (typeof s === 'string' ? s : s.name || '').toLowerCase().includes(q)))
      );
    }

    if (projectFilterState.category) {
      list = list.filter(p => (p.category || 'Project') === projectFilterState.category);
    }

    if (projectFilterState.visibility === 'public') {
      list = list.filter(p => p.isPublic !== false);
    } else if (projectFilterState.visibility === 'private') {
      list = list.filter(p => p.isPublic === false);
    }

    if (projectFilterState.sort === 'title') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (projectFilterState.sort === 'oldest') {
      list.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    }

    return list;
  }

  function renderProjects() {
    const { projects = [] } = window.AscendData;
    const { Icons } = window.AscendUI;

    const filtered = getFilteredProjects();

    const categoriesSet = new Set();
    projects.forEach(p => { if (p.category) categoriesSet.add(p.category); });
    const categoriesList = Array.from(categoriesSet);

    const cardsHTML = filtered.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state-icon">${Icons.bookOpen || Icons.tool}</div>
        <div class="empty-state-title">${projects.length === 0 ? 'No projects yet' : 'No matching projects'}</div>
        <div class="empty-state-desc">
          ${projects.length === 0
            ? 'Add personal, academic, or open-source projects to showcase your practical experience.'
            : 'Try adjusting your search query or filter selection.'}
        </div>
        <button class="btn btn-primary btn-sm" onclick="AscendViews.openAddProjectModal()">
          ${Icons.plus} Add project
        </button>
      </div>` : `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%, 280px),1fr));gap:var(--sp-4);">
        ${filtered.map(projectCardHTML).join('')}
      </div>`;

    return `
      <!-- Header -->
      <div class="section-header" style="margin-bottom:var(--sp-6);">
        <div>
          <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;">Projects</h1>
          <div style="font-size:var(--text-sm);color:var(--c-text-2);margin-top:4px;">
            ${projects.length} project${projects.length !== 1 ? 's' : ''} in your portfolio · Showcase builds, web apps, and research
          </div>
        </div>
        <button class="btn btn-primary" onclick="AscendViews.openAddProjectModal()">
          ${Icons.plus} Add project
        </button>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar" id="proj-filter-bar" style="margin-bottom:var(--sp-6);">
        <div class="search-input-wrap">
          ${Icons.search}
          <input type="search" class="form-input search-input" id="proj-search"
            placeholder="Search projects or technologies…" value="${projectFilterState.search}"
            oninput="AscendViews.filterProjectsList()">
        </div>
        <select class="form-input form-select" id="proj-filter-category" style="width:auto;" onchange="AscendViews.filterProjectsList()">
          <option value="">All categories</option>
          ${categoriesList.map(c => `<option value="${c}" ${projectFilterState.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
        <select class="form-input form-select" id="proj-filter-visibility" style="width:auto;" onchange="AscendViews.filterProjectsList()">
          <option value="" ${!projectFilterState.visibility ? 'selected' : ''}>All visibility</option>
          <option value="public" ${projectFilterState.visibility === 'public' ? 'selected' : ''}>Public on portfolio</option>
          <option value="private" ${projectFilterState.visibility === 'private' ? 'selected' : ''}>Private only</option>
        </select>
        <select class="form-input form-select" id="proj-filter-sort" style="width:auto;" onchange="AscendViews.filterProjectsList()">
          <option value="newest" ${projectFilterState.sort === 'newest' ? 'selected' : ''}>Newest first</option>
          <option value="oldest" ${projectFilterState.sort === 'oldest' ? 'selected' : ''}>Oldest first</option>
          <option value="title" ${projectFilterState.sort === 'title' ? 'selected' : ''}>A–Z</option>
        </select>
      </div>

      <!-- Project Cards Grid -->
      <div id="projects-grid-container">
        ${cardsHTML}
      </div>

      <!-- Add Project Modal (Embedded for standalone page support) -->
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
              <input class="form-input" id="proj-category" type="text" placeholder="e.g. Web App, Mobile App, AI / ML, Cloud">
            </div>
            <div class="form-group">
              <label class="form-label" for="proj-desc">Description *</label>
              <textarea class="form-input form-textarea" id="proj-desc" rows="3" placeholder="Briefly describe what you built, problem solved, and outcomes…"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label" for="proj-skills">Technologies &amp; Skills</label>
              <input class="form-input" id="proj-skills" type="text" placeholder="e.g. Python, React, Node.js, Docker">
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
    `;
  }

  function filterProjectsList() {
    const s = document.getElementById('proj-search')?.value || '';
    const cat = document.getElementById('proj-filter-category')?.value || '';
    const vis = document.getElementById('proj-filter-visibility')?.value || '';
    const sort = document.getElementById('proj-filter-sort')?.value || 'newest';

    projectFilterState = { search: s, category: cat, visibility: vis, sort };

    const container = document.getElementById('projects-grid-container');
    if (!container) return;

    const filtered = getFilteredProjects();
    const { Icons } = window.AscendUI;
    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${Icons.bookOpen || Icons.tool}</div>
          <div class="empty-state-title">No matching projects</div>
          <div class="empty-state-desc">Try clearing your filters or search keywords.</div>
          <button class="btn btn-primary btn-sm" onclick="AscendViews.resetProjectFilters()">
            Clear filters
          </button>
        </div>`;
    } else {
      container.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%, 280px),1fr));gap:var(--sp-4);">
          ${filtered.map(projectCardHTML).join('')}
        </div>`;
    }
  }

  function resetProjectFilters() {
    projectFilterState = { search: '', category: '', visibility: '', sort: 'newest' };
    const s = document.getElementById('proj-search');
    const c = document.getElementById('proj-filter-category');
    const v = document.getElementById('proj-filter-visibility');
    const o = document.getElementById('proj-filter-sort');
    if (s) s.value = '';
    if (c) c.value = '';
    if (v) v.value = '';
    if (o) o.value = 'newest';
    filterProjectsList();
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

    // If on the dedicated Projects view, make the changes LIVE in the project page itself:
    const gridContainer = document.getElementById('projects-grid-container');
    if (gridContainer) {
      filterProjectsList();
      return;
    }

    // If on the profile page, update card in-place without page redirect:
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

    if (window.AscendViews && typeof window.AscendViews.openProfileTab === 'function') {
      window.AscendViews.openProfileTab('projects-profile');
    }
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
          filterProjectsList();
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

        if (window.AscendViews && typeof window.AscendViews.openProfileTab === 'function') {
          window.AscendViews.openProfileTab('projects-profile');
        }
      }
    });
  }

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
      filterProjectsList();
      const headerSub = document.querySelector('.section-header div div');
      if (headerSub) {
        const count = window.AscendData.projects.length;
        headerSub.textContent = `${count} project${count !== 1 ? 's' : ''} in your portfolio · Showcase builds, web apps, and research`;
      }
      return;
    }

    if (window.AscendViews && typeof window.AscendViews.openProfileTab === 'function') {
      window.AscendViews.openProfileTab('projects-profile');
    }
  }

  window.AscendViews = window.AscendViews || {};
  Object.assign(window.AscendViews, {
    projects: renderProjects,
    filterProjectsList,
    resetProjectFilters,
    toggleProjectPublic,
    deleteProject,
    openAddProjectModal,
    saveNewProject,
  });
})();
