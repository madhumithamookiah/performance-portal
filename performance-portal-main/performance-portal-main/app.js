/**
 * ASCEND – Core Router & Shell Controller
 * Manages routing, sidebar navigation, topbars, responsive layouts, and role switching (Student, Faculty).
 */

(function () {
  /* ── Current Role State ───────────────────────────────────── */
  let currentRole = sessionStorage.getItem('ascend_role') || 'student';
  if (currentRole === 'admin') currentRole = 'hod';
  let currentView = null;

  /* ── Master Route Registry ───────────────────────────────── */
  const routes = {
    // Standard / Student Routes
    dashboard: {
      render: () => window.AscendViews.dashboard(),
      init: () => {},
      title: 'Student Dashboard',
      role: 'all',
    },
    profile: {
      render: () => window.AscendViews.profile(),
      init: () => window.AscendViews.initProfile?.(),
      title: 'My Profile',
      role: 'all',
    },
    projects: {
      render: () => window.AscendViews.projects ? window.AscendViews.projects() : '<div class="card p-6">Loading Projects…</div>',
      init: () => {},
      title: 'Projects',
      role: 'all',
    },
    achievements: {
      render: () => window.AscendViews.achievements(),
      init: () => { window.AscendViews.selectedSkills = []; },
      title: 'Achievements',
      role: 'all',
    },
    goals: {
      render: () => window.AscendViews.goals(),
      init: () => window.AscendViews.initGoals?.(),
      title: 'Portfolio Overview',
      role: 'all',
    },
    portfolio: {
      render: () => window.AscendViews.goals(),
      init: () => window.AscendViews.initGoals?.(),
      title: 'Portfolio Overview',
      role: 'all',
    },
    feedback: {
      render: () => window.AscendViews.feedback(),
      init: () => {},
      title: 'Feedback',
      role: 'all',
    },
    settings: {
      render: () => (currentRole === 'faculty')
        ? (window.FacultyViews && window.FacultyViews.settings ? window.FacultyViews.settings() : window.AscendViews.settings())
        : window.AscendViews.settings(),
      init: () => {},
      title: () => (currentRole === 'faculty' ? 'Faculty Settings' : 'Settings'),
      role: 'all',
    },
    'public-portfolio': {
      render: () => window.AscendViews.publicPortfolioPage(),
      init: () => window.AscendViews.initPublicPortfolio?.(),
      title: 'Public Portfolio',
      role: 'all',
    },

    // Faculty Routes
    'faculty-dashboard': {
      render: () => window.FacultyViews.dashboard(),
      init: () => {},
      title: 'Faculty Dashboard',
      role: 'faculty',
    },
    'faculty-students': {
      render: () => window.FacultyViews.students(),
      init: () => {},
      title: 'Students Directory',
      role: 'faculty',
    },
    'faculty-student-detail': {
      render: () => window.FacultyViews.studentDetail(),
      init: () => {},
      title: 'Student Profile Detail',
      role: 'faculty',
    },
    'faculty-goals-feedback': {
      render: () => window.FacultyViews.goalsFeedback(),
      init: () => {},
      title: 'Feedback & Guidance',
      role: 'faculty',
    },
    'faculty-evaluations': {
      render: () => window.FacultyViews.evaluations(),
      init: () => {},
      title: 'Rubric Evaluations',
      role: 'faculty',
    },
    'faculty-analytics': {
      render: () => window.FacultyViews.analytics(),
      init: () => {},
      title: 'Cohort Insights',
      role: 'faculty',
    },

    // HOD / Department Coordinator Routes
    'hod-dashboard': {
      render: () => window.HODViews ? window.HODViews.dashboard() : '<div class="card p-6">Loading HOD Dashboard…</div>',
      init: () => {},
      title: 'Department Dashboard',
      role: 'hod',
    },
    'hod-cohort-insights': {
      render: () => window.HODViews ? window.HODViews.cohortInsights() : '<div class="card p-6">Loading Cohort Insights…</div>',
      init: () => {},
      title: 'Cohort Insights',
      role: 'hod',
    },
    'hod-classes': {
      render: () => window.HODViews ? window.HODViews.classes() : '<div class="card p-6">Loading Classes…</div>',
      init: () => {},
      title: 'Classes Directory',
      role: 'hod',
    },
    'hod-faculty-assignments': {
      render: () => window.HODViews ? window.HODViews.facultyAssignments() : '<div class="card p-6">Loading Faculty Assignments…</div>',
      init: () => {},
      title: 'Faculty Assignments',
      role: 'hod',
    },
    'hod-evaluation-monitoring': {
      render: () => window.HODViews ? window.HODViews.evaluationMonitoring() : '<div class="card p-6">Loading Evaluation Monitoring…</div>',
      init: () => {},
      title: 'Evaluation Monitoring',
      role: 'hod',
    },
    'hod-settings': {
      render: () => window.HODViews ? window.HODViews.settings() : '<div class="card p-6">Loading Department Settings…</div>',
      init: () => {},
      title: 'Department Settings',
      role: 'hod',
    },
  };

  /* ── Navigation Configurations by Role ───────────────────── */
  const NAV_CONFIGS = {
    student: {
      sectionLabel: 'Student Portal',
      items: [
        { id: 'dashboard', label: 'Dashboard', iconKey: 'home' },
        { id: 'profile', label: 'My Profile', iconKey: 'user' },
        { id: 'projects', label: 'Projects', iconKey: 'folder' },
        { id: 'achievements', label: 'Achievements', iconKey: 'award' },
        { id: 'goals', label: 'Portfolio Overview', iconKey: 'target' },
        { id: 'feedback', label: 'Feedback', iconKey: 'messageSquare' },
        { id: 'settings', label: 'Settings', iconKey: 'settings' },
      ],
      bottomItems: [
        { id: 'dashboard',    label: 'Home',        iconKey: 'home' },
        { id: 'projects',     label: 'Projects',    iconKey: 'folder' },
        { id: 'achievements', label: 'Achievements', iconKey: 'award' },
        { id: 'goals',        label: 'Portfolio',    iconKey: 'target' },
        { id: 'profile',      label: 'Profile',      iconKey: 'user' },
      ],
    },
    faculty: {
      sectionLabel: 'Faculty & Mentor Portal',
      items: [
        { id: 'faculty-dashboard', label: 'Dashboard', iconKey: 'home' },
        { id: 'faculty-students', label: 'Students', iconKey: 'users' },
        { id: 'faculty-goals-feedback', label: 'Feedback', iconKey: 'messageSquare' },
        { id: 'faculty-evaluations', label: 'Evaluations', iconKey: 'fileText' },
        { id: 'faculty-analytics', label: 'Cohort Insights', iconKey: 'barChart' },
        { id: 'settings', label: 'Settings', iconKey: 'settings' },
      ],
      bottomItems: [
        { id: 'faculty-dashboard', label: 'Dashboard', iconKey: 'home' },
        { id: 'faculty-students', label: 'Students', iconKey: 'users' },
        { id: 'faculty-goals-feedback', label: 'Feedback', iconKey: 'messageSquare' },
        { id: 'faculty-evaluations', label: 'Evaluations', iconKey: 'fileText' },
        { id: 'faculty-analytics', label: 'Insights', iconKey: 'barChart' },
      ],
    },
    hod: {
      sectionLabel: 'HOD Department Oversight',
      items: [
        { id: 'hod-dashboard', label: 'Department Dashboard', iconKey: 'grid' },
        { id: 'hod-cohort-insights', label: 'Cohort Insights', iconKey: 'barChart' },
        { id: 'hod-classes', label: 'Classes', iconKey: 'layers' },
        { id: 'hod-faculty-assignments', label: 'Faculty Assignments', iconKey: 'users' },
        { id: 'hod-evaluation-monitoring', label: 'Evaluation Monitoring', iconKey: 'fileText' },
        { id: 'hod-settings', label: 'Settings', iconKey: 'settings' },
      ],
      bottomItems: [
        { id: 'hod-dashboard', label: 'Dashboard', iconKey: 'grid' },
        { id: 'hod-cohort-insights', label: 'Insights', iconKey: 'barChart' },
        { id: 'hod-classes', label: 'Classes', iconKey: 'layers' },
        { id: 'hod-faculty-assignments', label: 'Faculty', iconKey: 'users' },
        { id: 'hod-evaluation-monitoring', label: 'Evaluations', iconKey: 'fileText' },
      ],
    },
  };

  /* ── User Information by Role ────────────────────────────── */
  function getUserInfo() {
    let sessionUser = null;
    try {
      sessionUser = JSON.parse(sessionStorage.getItem('ascend_user') || 'null');
    } catch (e) {}

    if (currentRole === 'hod') {
      const h = window.AscendHODData ? window.AscendHODData.hodUser : { name: 'Prof. Sunita Rao, Ph.D.', initials: 'SR', designation: 'Head of Department' };
      const name = (sessionUser && (sessionUser.role === 'hod' || sessionUser.role === 'admin')) ? sessionUser.name : h.name;
      const initials = name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'SR';
      return { name, initials, sub: 'Head of Department' };
    }

    if (currentRole === 'faculty') {
      const f = window.AscendFacultyData ? window.AscendFacultyData.facultyUser : { name: 'Dr. Rakesh Mehta', initials: 'RM', designation: 'Faculty Advisor' };
      const name = (sessionUser && sessionUser.role === 'faculty') ? sessionUser.name : f.name;
      const initials = name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'RM';
      return { name, initials, sub: 'Faculty Advisor' };
    }
    const s = window.AscendData ? window.AscendData.student : { name: 'Student', initials: 'ST' };
    const name = (sessionUser && sessionUser.role === 'student') ? sessionUser.name : s.name;
    const initials = name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'ST';
    return { name, initials, sub: 'Student' };
  }

  /* ── Demo Role Switcher HTML ──────────────────────────────── */
  function renderRoleSwitcherHTML() {
    return '';
  }

  /* ── Mobile Sidebar Drawer Toggle ───────────────────────── */
  function toggleSidebar(open) {
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;
    const shouldOpen = open !== undefined ? open : !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', shouldOpen);
    if (overlay) overlay.classList.toggle('open', shouldOpen);
    if (document.body) document.body.style.overflow = shouldOpen ? 'hidden' : '';
  }

  /* ── Navigate Function ───────────────────────────────────── */
  function navigate(viewId) {
    if (viewId === 'admin' || viewId === 'admin-dashboard') {
      viewId = 'hod-dashboard';
    }
    if (currentRole === 'hod' && viewId === 'settings') {
      viewId = 'hod-settings';
    }

    if (!routes[viewId]) {
      console.warn(`AscendApp: unknown view "${viewId}"`);
      // Fallback
      viewId = (currentRole === 'hod') ? 'hod-dashboard' : ((currentRole === 'faculty') ? 'faculty-dashboard' : 'dashboard');
    }

    // Role synchronization based on route:
    const targetRole = routes[viewId].role;
    let roleChanged = false;
    if (targetRole === 'hod' && currentRole !== 'hod') {
      currentRole = 'hod';
      sessionStorage.setItem('ascend_role', 'hod');
      roleChanged = true;
    } else if (targetRole === 'faculty' && currentRole !== 'faculty') {
      currentRole = 'faculty';
      sessionStorage.setItem('ascend_role', 'faculty');
      roleChanged = true;
    } else if (targetRole === 'student' && currentRole !== 'student') {
      currentRole = 'student';
      sessionStorage.setItem('ascend_role', 'student');
      roleChanged = true;
    }

    currentView = viewId;
    if (window.AscendApp) {
      window.AscendApp.currentView = viewId;
    }
    if (window.location && window.location.hash !== '#' + viewId) {
      window.location.hash = viewId;
    }

    // Rebuild shell elements if role switched
    if (roleChanged) {
      buildSidebar();
      buildMobileTopBar();
      buildBottomNav();
      buildTopbar();
    }

    // Render content
    const content = document.getElementById('app-content-area');
    if (content) {
      try {
        content.innerHTML = routes[viewId].render();
        routes[viewId].init();
      } catch (renderErr) {
        console.error(`AscendApp: Error rendering view "${viewId}":`, renderErr);
        content.innerHTML = `
          <div class="card p-6" style="text-align:center;padding:48px 24px;margin:24px auto;max-width:560px;">
            <div style="font-size:18px;font-weight:600;margin-bottom:8px;color:var(--c-error, #d93025);">Unable to display ${routes[viewId]?.title || viewId}</div>
            <p style="color:var(--c-text-2);margin-bottom:16px;">An unexpected error occurred while loading this view.</p>
            <button class="btn btn-primary btn-sm" onclick="AscendApp.navigate('${viewId}')">Retry</button>
          </div>`;
      }
      content.scrollTop = 0;
      if (typeof window.scrollTo === 'function') window.scrollTo(0, 0);
    }

    // Update topbar title
    const titleEl = document.getElementById('topbar-title');
    if (titleEl) {
      const routeTitle = (viewId === 'hod-settings')
        ? 'Department Settings'
        : ((viewId === 'settings' && currentRole === 'faculty')
          ? 'Faculty Settings'
          : (typeof routes[viewId].title === 'function' ? routes[viewId].title() : routes[viewId].title));
      titleEl.textContent = routeTitle;
    }

    // Sync active nav item
    updateNavActive(viewId);

    // Auto-close mobile sidebar drawer upon navigation
    toggleSidebar(false);
  }

  /* ── Set Role Function ────────────────────────────────────── */
  async function setRole(role) {
    currentRole = role;
    sessionStorage.setItem('ascend_role', role);

    let sessionUser = null;
    try { sessionUser = JSON.parse(sessionStorage.getItem('ascend_user') || 'null'); } catch (e) {}

    if (role === 'student' && window.AscendData && window.AscendData.loadStudentData) {
      await window.AscendData.loadStudentData(sessionUser?.id);
    } else if (role === 'faculty' && window.AscendFacultyData && window.AscendFacultyData.loadFacultyData) {
      await window.AscendFacultyData.loadFacultyData();
    }

    // Rebuild shell elements for new role
    buildSidebar();
    buildMobileTopBar();
    buildBottomNav();
    buildTopbar();

    const defaultView = (role === 'hod') ? 'hod-dashboard' : ((role === 'faculty') ? 'faculty-dashboard' : 'dashboard');
    navigate(defaultView);
    window.AscendUI.showToast(`Switched to ${role === 'hod' ? 'HOD' : role.toUpperCase()} mode`, 'info');
  }

  function toggleRoleDropdown(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('demo-role-dropdown');
    if (!dropdown) return;
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) {
      setTimeout(() => {
        document.addEventListener('click', () => { dropdown.style.display = 'none'; }, { once: true });
      }, 0);
    }
  }

  /* ── Update active nav states ────────────────────────────── */
  function updateNavActive(viewId) {
    document.querySelectorAll('.nav-item[data-view]').forEach(el => {
      const isActive = el.dataset.view === viewId;
      el.classList.toggle('active', isActive);
      el.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
    document.querySelectorAll('.bottom-nav-item[data-view]').forEach(el => {
      const isActive = el.dataset.view === viewId;
      el.classList.toggle('active', isActive);
      el.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  /* ── Build Sidebar ───────────────────────────────────────── */
  function buildSidebar() {
    const { Icons, ascendLogo } = window.AscendUI;
    const user = getUserInfo();
    const navConfig = NAV_CONFIGS[currentRole] || NAV_CONFIGS.student;
    const activeView = currentView || ((currentRole === 'hod') ? 'hod-dashboard' : ((currentRole === 'faculty') ? 'faculty-dashboard' : 'dashboard'));

    const sidebar = document.getElementById('app-sidebar');
    if (!sidebar) return;

    // Get badges
    let fbCount = 0;
    if (window.AscendData?.feedback) {
      fbCount = window.AscendData.feedback.filter(f => !f.isRead).length;
    }

    const userTargetView = currentRole === 'hod' ? 'hod-settings' : (currentRole === 'student' ? 'profile' : 'settings');
    const userAria = currentRole === 'hod' ? 'Department settings' : (currentRole === 'student' ? 'Go to profile' : 'Faculty settings');

    sidebar.innerHTML = `
      <div class="sidebar-logo" style="display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:var(--sp-3);">
          ${ascendLogo(28)}
          <span class="sidebar-logo-text">Asc<span>end</span></span>
        </div>
        <button type="button" class="icon-btn sidebar-close-btn" style="display:none;" onclick="AscendApp.toggleSidebar(false)" aria-label="Close navigation menu">
          ${Icons.x}
        </button>
      </div>
      <nav class="sidebar-nav" role="navigation" aria-label="Main navigation">
        <div class="sidebar-section-label">${navConfig.sectionLabel}</div>
        ${navConfig.items.map(item => {
          let badge = '';
          if (item.id === 'feedback' && fbCount > 0) {
            badge = `<span class="nav-badge">${fbCount}</span>`;
          }
          return `
            <button type="button" class="nav-item ${activeView === item.id ? 'active' : ''}" data-view="${item.id}"
              aria-label="${item.label}" aria-current="${activeView === item.id ? 'page' : 'false'}" onclick="AscendApp.navigate('${item.id}')">
              <span class="nav-icon">${Icons[item.iconKey] || '•'}</span>
              <span>${item.label}</span>
              ${badge}
            </button>`;
        }).join('')}
      </nav>
      <div class="sidebar-footer">
        <button type="button" class="sidebar-user" onclick="AscendApp.navigate('${userTargetView}')" aria-label="${userAria}">
          <div class="avatar avatar-sm">${user.initials}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${user.name}</div>
            <div class="sidebar-user-role">${user.sub}</div>
          </div>
        </button>
        <button class="btn btn-ghost btn-sm" style="width:100%;margin-top:8px;justify-content:flex-start;gap:8px;"
          onclick="AscendApp.logout()">
          ${Icons.logOut} Sign out
        </button>
      </div>`;
  }

  /* ── Build Mobile Topbar ─────────────────────────────────── */
  function buildMobileTopBar() {
    const { Icons, ascendLogo } = window.AscendUI;
    const user = getUserInfo();

    const bar = document.getElementById('mobile-topbar');
    if (!bar) return;
    bar.innerHTML = `
      <div class="mobile-topbar-left">
        <button type="button" class="mobile-sidebar-toggle" onclick="AscendApp.toggleSidebar(true)" aria-label="Open navigation menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="mobile-topbar-logo">
          ${ascendLogo(22)}
          <span>Asc<span>end</span></span>
        </div>
      </div>
      <div class="mobile-topbar-actions">
        ${renderRoleSwitcherHTML()}
        <button class="icon-btn" aria-label="Account menu" id="mobile-avatar-btn"
          onclick="AscendApp.openAccountDropdown(event, 'mobile-avatar-btn')" style="padding:0;border-radius:50%;min-width:44px;min-height:44px;">
          <div class="avatar avatar-sm" style="pointer-events:none;">${user.initials}</div>
        </button>
      </div>`;
  }

  /* ── Build Bottom Navigation ─────────────────────────────── */
  function buildBottomNav() {
    const { Icons } = window.AscendUI;
    const navConfig = NAV_CONFIGS[currentRole] || NAV_CONFIGS.student;
    const activeView = currentView || ((currentRole === 'hod') ? 'hod-dashboard' : ((currentRole === 'faculty') ? 'faculty-dashboard' : 'dashboard'));

    const nav = document.getElementById('bottom-nav');
    if (!nav) return;
    nav.innerHTML = `
      <div class="bottom-nav-inner">
        ${navConfig.bottomItems.map(item => `
          <button type="button" class="bottom-nav-item ${activeView === item.id ? 'active' : ''}" data-view="${item.id}"
            onclick="AscendApp.navigate('${item.id}')" aria-label="${item.label}" aria-current="${activeView === item.id ? 'page' : 'false'}">
            ${Icons[item.iconKey] || '•'}
            <span>${item.label}</span>
          </button>`).join('')}
      </div>`;
  }

  /* ── Build Desktop Topbar ────────────────────────────────── */
  function buildTopbar() {
    const { Icons } = window.AscendUI;
    const user = getUserInfo();
    const activeView = currentView || ((currentRole === 'hod') ? 'hod-dashboard' : ((currentRole === 'faculty') ? 'faculty-dashboard' : 'dashboard'));

    const bar = document.getElementById('desktop-topbar');
    if (!bar) return;
    const currentTitle = (activeView === 'hod-settings')
      ? 'Department Settings'
      : ((activeView === 'settings' && currentRole === 'faculty')
        ? 'Faculty Settings'
        : (routes[activeView] ? (typeof routes[activeView].title === 'function' ? routes[activeView].title() : routes[activeView].title) : 'Dashboard'));

    const notifTargetView = currentRole === 'hod' ? 'hod-dashboard' : (currentRole === 'student' ? 'feedback' : 'faculty-goals-feedback');
    const showSearch = (currentRole !== 'student');

    bar.innerHTML = `
      <div class="topbar-title" id="topbar-title">${currentTitle}</div>
      ${showSearch ? `
      <div class="topbar-search-slot">
        <div class="search-input-wrap">
          ${Icons.search}
          <input type="search" class="form-input search-input" id="topbar-search-input"
            placeholder="Search ${currentRole === 'hod' ? 'department classes, faculty mentors, cohorts…' : 'students, cohorts, feedback…'}"
            aria-label="Search" oninput="AscendApp.handleTopSearch(this.value)">
        </div>
      </div>` : ''}
      <div class="topbar-actions">
        ${renderRoleSwitcherHTML()}
        <button type="button" class="icon-btn" onclick="AscendApp.navigate('${notifTargetView}')" aria-label="Notifications">
          ${Icons.bell}
        </button>
        <button class="icon-btn" aria-label="Account menu" id="desktop-avatar-btn"
          onclick="AscendApp.openAccountDropdown(event, 'desktop-avatar-btn')" style="padding:0;border-radius:50%;width:32px;height:32px;">
          <div class="avatar avatar-sm" style="pointer-events:none;">${user.initials}</div>
        </button>
      </div>`;
  }

  /* ── Google-style Topbar Search Handler ──────────────────── */
  function handleTopSearch(query) {
    const q = (query || '').trim();
    if (currentRole === 'hod') {
      if (currentView !== 'hod-classes' && q.length > 0) {
        navigate('hod-classes');
      }
      const clsSearch = document.getElementById('class-search-input');
      if (clsSearch) {
        clsSearch.value = q;
        if (window.HODViews && window.HODViews.onClassesFilterChange) {
          window.HODViews.onClassesFilterChange();
        }
      }
    } else if (currentRole === 'student') {
      if (currentView !== 'achievements' && q.length > 0) {
        navigate('achievements');
      }
      const achSearch = document.getElementById('ach-search');
      if (achSearch) {
        achSearch.value = q;
        if (window.AscendViews && window.AscendViews.filterAchievements) {
          window.AscendViews.filterAchievements();
        }
      }
    } else {
      if (currentView !== 'faculty-students' && currentView !== 'faculty-evaluations' && currentView !== 'faculty-goals-feedback' && q.length > 0) {
        navigate('faculty-students');
      }
      const fstuSearch = document.getElementById('fstu-search');
      if (fstuSearch) {
        fstuSearch.value = q;
        if (window.FacultyViews && window.FacultyViews.filterStudents) {
          window.FacultyViews.filterStudents();
        }
      }
      const evalSearch = document.getElementById('eval-search');
      if (evalSearch) {
        evalSearch.value = q;
        if (window.FacultyViews && window.FacultyViews.filterEvaluations) {
          window.FacultyViews.filterEvaluations();
        }
      }
      const fbSearch = document.getElementById('fb-filter-search');
      if (fbSearch) {
        fbSearch.value = q;
        if (window.FacultyViews && window.FacultyViews.filterFeedbackHistory) {
          window.FacultyViews.filterFeedbackHistory();
        }
      }
    }
  }

  /* ── Account Dropdown ────────────────────────────────────────── */
  function openAccountDropdown(e, triggerId) {
    if (e) e.stopPropagation();
    const existing = document.querySelector('.account-dropdown');
    if (existing) { existing.remove(); return; }
    const { Icons } = window.AscendUI;
    const user = getUserInfo();
    const trigger = document.getElementById(triggerId);
    if (!trigger) return;

    const dropdown = document.createElement('div');
    dropdown.className = 'account-dropdown';
    dropdown.innerHTML = `
      <div class="account-dropdown-header">
        <div class="avatar avatar-sm" style="flex-shrink:0;">${user.initials}</div>
        <div class="account-dropdown-info">
          <div class="account-dropdown-name">${user.name}</div>
          <div class="account-dropdown-role">${user.sub}</div>
        </div>
      </div>
      <div class="account-dropdown-divider"></div>
      <button class="account-dropdown-item" onclick="AscendApp.navigate('${currentRole === 'hod' ? 'hod-settings' : 'settings'}');document.querySelector('.account-dropdown')?.remove();">
        ${Icons.settings} ${currentRole === 'hod' ? 'Department Settings' : (currentRole === 'faculty' ? 'Faculty Settings' : 'Settings')}
      </button>
      ${currentRole === 'student' ? `
      <button class="account-dropdown-item" onclick="AscendApp.navigate('profile');document.querySelector('.account-dropdown')?.remove();">
        ${Icons.user} My Profile
      </button>` : (currentRole === 'hod' ? `
      <button class="account-dropdown-item" onclick="AscendApp.navigate('hod-dashboard');document.querySelector('.account-dropdown')?.remove();">
        ${Icons.grid || Icons.home} Department Dashboard
      </button>` : `
      <button class="account-dropdown-item" onclick="AscendApp.navigate('faculty-dashboard');document.querySelector('.account-dropdown')?.remove();">
        ${Icons.home} Faculty Dashboard
      </button>`)}
      <div class="account-dropdown-divider"></div>
      <button class="account-dropdown-item account-dropdown-item-danger" onclick="AscendApp.logout();document.querySelector('.account-dropdown')?.remove();">
        ${Icons.logOut} Sign out
      </button>`;

    trigger.style.position = 'relative';
    trigger.appendChild(dropdown);
    setTimeout(() => document.addEventListener('click', () => dropdown.remove(), { once: true }), 0);
  }

  /* ── Logout ──────────────────────────────────────────────── */
  function logout() {
    window.AscendUI.confirmDialog({
      title: 'Sign out',
      message: 'Are you sure you want to sign out of your Ascend account?',
      confirmLabel: 'Sign out',
      danger: false,
      onConfirm: () => {
        sessionStorage.removeItem('ascend_logged_in');
        sessionStorage.removeItem('ascend_role');
        window.location.href = 'index.html';
      },
    });
  }


  /* ── Hash Router ─────────────────────────────────────────── */
  function handleHash() {
    let hash = (window.location && window.location.hash) ? window.location.hash.replace('#', '').trim() : null;

    // Clean path support (e.g. /dashboard, /profile)
    if (!hash && window.location && window.location.pathname) {
      const p = window.location.pathname.replace(/^\/+/, '').split('/')[0].trim();
      if (p && routes[p]) {
        hash = p;
      }
    }

    if (hash === 'admin' || hash === 'admin-dashboard') {
      navigate('hod-dashboard');
      return;
    }

    if (currentRole === 'hod' && hash === 'settings') {
      navigate('hod-settings');
      return;
    }

    const defaultView = (currentRole === 'hod') ? 'hod-dashboard' : ((currentRole === 'faculty') ? 'faculty-dashboard' : 'dashboard');
    const targetView = (hash && routes[hash]) ? hash : defaultView;

    // Render whenever view changes OR if content area still displays placeholder spinner / is unrendered
    const content = document.getElementById('app-content-area');
    const needsRender = (targetView !== currentView) || !content || !content.children.length || !!content.querySelector('.spinner');

    if (needsRender) {
      navigate(targetView);
    }
  }

  /* ── Initialization ──────────────────────────────────────── */
  async function init() {
    let sessionUser = null;
    try {
      sessionUser = JSON.parse(sessionStorage.getItem('ascend_user') || 'null');
    } catch (e) {}

    // Load dynamic data from backend API for active role (with 3s fallback so UI is never blocked)
    try {
      const dataLoaders = [];
      if (currentRole === 'student' && window.AscendData && window.AscendData.loadStudentData) {
        dataLoaders.push(window.AscendData.loadStudentData(sessionUser?.id));
      } else if (currentRole === 'faculty' && window.AscendFacultyData && window.AscendFacultyData.loadFacultyData) {
        dataLoaders.push(window.AscendFacultyData.loadFacultyData());
      }
      if (dataLoaders.length > 0) {
        await Promise.race([
          Promise.all(dataLoaders),
          new Promise(resolve => setTimeout(resolve, 3000))
        ]);
      }
    } catch (e) {
      console.warn('Backend data initialization note:', e);
    }

    buildSidebar();
    buildMobileTopBar();
    buildBottomNav();
    buildTopbar();
    handleHash();
    window.addEventListener('hashchange', handleHash);

    // Keyboard navigation support
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.target.classList.contains('nav-item')) {
        e.target.click();
      }
    });
  }

  /* ── Public API ──────────────────────────────────────────── */
  window.AscendApp = {
    routes,
    navigate,
    openProfileTab: (tabName) => {
      if (window.AscendViews && window.AscendViews.openProfileTab) {
        window.AscendViews.openProfileTab(tabName);
      } else {
        navigate('profile');
      }
    },
    logout,
    init,
    setRole,
    toggleRoleDropdown,
    openAccountDropdown,
    toggleSidebar,
    handleTopSearch,
    getCurrentRole: () => currentRole,
    getCurrentView: () => currentView,
    registerRoute(id, config) {
      routes[id] = config;
    },
  };

  /* ── Boot ────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
