/**
 * ASCEND – Core Router & Shell Controller
 * Manages routing, sidebar navigation, topbars, responsive layouts, and role switching (Student, Faculty).
 */

(function () {
  /* ── Current Role State ───────────────────────────────────── */
  let currentRole = sessionStorage.getItem('ascend_role') || 'student';
  if (currentRole !== 'faculty' && currentRole !== 'admin') currentRole = 'student';
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
    evaluations: {
      render: () => window.AscendViews.studentEvaluations ? window.AscendViews.studentEvaluations() : '<div class="card" style="padding:var(--sp-6);">Loading Evaluations…</div>',
      init: () => {},
      title: 'My Evaluations',
      role: 'student',
    },

    settings: {
      render: () => {
        if (currentRole === 'admin') {
          return (window.AdminViews && window.AdminViews.settings) ? window.AdminViews.settings() : window.AscendViews.settings();
        }
        if (currentRole === 'faculty') {
          return (window.FacultyViews && window.FacultyViews.settings) ? window.FacultyViews.settings() : window.AscendViews.settings();
        }
        return window.AscendViews.settings();
      },
      init: () => {},
      title: () => (currentRole === 'admin' ? 'Admin Settings' : (currentRole === 'faculty' ? 'Faculty Settings' : 'Settings')),
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
      render: () => {
        setTimeout(() => window.AscendApp?.navigate('faculty-dashboard'), 0);
        return '<div class="card p-6">Redirecting to Dashboard…</div>';
      },
      init: () => {},
      title: 'Faculty Dashboard',
      role: 'faculty',
    },

    // Admin Routes
    'admin-dashboard': {
      render: () => window.AdminViews ? window.AdminViews.dashboard() : '<div class="card p-6">Loading Academic Overview…</div>',
      init: () => {},
      title: 'Academic Oversight Overview',
      role: 'admin',
    },
    'admin-projects': {
      render: () => window.AdminViews ? window.AdminViews.projects() : '<div class="card p-6">Loading Student Projects…</div>',
      init: () => {},
      title: 'Student Projects Directory',
      role: 'admin',
    },
    'admin-achievements': {
      render: () => window.AdminViews ? window.AdminViews.achievements() : '<div class="card p-6">Loading Student Achievements…</div>',
      init: () => {},
      title: 'Student Achievements & Credentials',
      role: 'admin',
    },
    'admin-faculty': {
      render: () => window.AdminViews ? window.AdminViews.faculty() : '<div class="card p-6">Loading Faculty Oversight…</div>',
      init: () => {},
      title: 'Faculty Responsiveness & Monitoring',
      role: 'admin',
    },
    'admin-students': {
      render: () => window.AdminViews ? window.AdminViews.students() : '<div class="card p-6">Loading Student Directory…</div>',
      init: () => {},
      title: 'Student Directory & Portfolios',
      role: 'admin',
    },
    'admin-users': {
      render: () => window.AdminViews ? window.AdminViews.users() : '<div class="card p-6">Loading User Accounts…</div>',
      init: () => {},
      title: 'Institutional User Accounts',
      role: 'admin',
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
        { id: 'evaluations', label: 'My Evaluations', iconKey: 'clipboardList' },
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
        { id: 'settings', label: 'Settings', iconKey: 'settings' },
      ],
      bottomItems: [
        { id: 'faculty-dashboard', label: 'Dashboard', iconKey: 'home' },
        { id: 'faculty-students', label: 'Students', iconKey: 'users' },
        { id: 'faculty-goals-feedback', label: 'Feedback', iconKey: 'messageSquare' },
        { id: 'faculty-evaluations', label: 'Evaluations', iconKey: 'fileText' },
        { id: 'settings', label: 'Settings', iconKey: 'settings' },
      ],
    },
    admin: {
      sectionLabel: 'Institution Administration',
      items: [
        { id: 'admin-dashboard', label: 'Academic Overview', iconKey: 'grid' },
        { id: 'admin-projects', label: 'Student Projects', iconKey: 'folder' },
        { id: 'admin-achievements', label: 'Achievements & Certs', iconKey: 'award' },
        { id: 'admin-faculty', label: 'Faculty Oversight', iconKey: 'users' },
        { id: 'admin-students', label: 'Student Directory', iconKey: 'graduationCap' },
        { id: 'admin-users', label: 'User Accounts', iconKey: 'shieldCheck' },
        { id: 'settings', label: 'Admin Settings', iconKey: 'settings' },
      ],
      bottomItems: [
        { id: 'admin-dashboard', label: 'Overview', iconKey: 'grid' },
        { id: 'admin-projects', label: 'Projects', iconKey: 'folder' },
        { id: 'admin-achievements', label: 'Certs', iconKey: 'award' },
        { id: 'admin-faculty', label: 'Faculty', iconKey: 'users' },
        { id: 'admin-users', label: 'Users', iconKey: 'shieldCheck' },
      ],
    },
  };

  /* ── User Information by Role ────────────────────────────── */
  function getUserInfo() {
    let sessionUser = null;
    try {
      sessionUser = JSON.parse(sessionStorage.getItem('ascend_user') || 'null');
    } catch (e) {}

    if (currentRole === 'admin') {
      const name = (sessionUser && sessionUser.role === 'admin') ? sessionUser.name : 'System Administrator';
      return { name, initials: 'AD', sub: 'Administrator' };
    }
    if (currentRole === 'faculty') {
      const f = window.AscendFacultyData ? window.AscendFacultyData.facultyUser : { name: 'Faculty Advisor', initials: 'FA', designation: 'Faculty Advisor' };
      const name = (sessionUser && sessionUser.role === 'faculty') ? sessionUser.name : f.name;
      const initials = name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'FA';
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
    if (!routes[viewId]) {
      console.warn(`AscendApp: unknown view "${viewId}"`);
      // Fallback
      viewId = (currentRole === 'admin') ? 'admin-dashboard' : ((currentRole === 'faculty') ? 'faculty-dashboard' : 'dashboard');
    }

    // Role synchronization based on route:
    const targetRole = routes[viewId].role;
    let roleChanged = false;
    if (targetRole === 'admin' && currentRole !== 'admin') {
      currentRole = 'admin';
      sessionStorage.setItem('ascend_role', 'admin');
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
      const routeTitle = (viewId === 'settings' && currentRole === 'faculty')
        ? 'Faculty Settings'
        : (typeof routes[viewId].title === 'function' ? routes[viewId].title() : routes[viewId].title);
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
    } else if (role === 'admin' && window.AdminViews && window.AdminViews.loadAdminData) {
      await window.AdminViews.loadAdminData();
    }

    // Rebuild shell elements for new role
    buildSidebar();
    buildMobileTopBar();
    buildBottomNav();
    buildTopbar();

    const defaultView = (role === 'admin') ? 'admin-dashboard' : ((role === 'faculty') ? 'faculty-dashboard' : 'dashboard');
    navigate(defaultView);
    window.AscendUI.showToast(`Switched to ${role.toUpperCase()} mode`, 'info');
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
    const activeView = currentView || ((currentRole === 'faculty') ? 'faculty-dashboard' : 'dashboard');

    const sidebar = document.getElementById('app-sidebar');
    if (!sidebar) return;

    const userTargetView = currentRole === 'student' ? 'profile' : 'settings';
    const userAria = currentRole === 'student' ? 'Go to profile' : 'Faculty settings';

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
        ${navConfig.items.map(item => `
            <button type="button" class="nav-item ${activeView === item.id ? 'active' : ''}" data-view="${item.id}"
              aria-label="${item.label}" aria-current="${activeView === item.id ? 'page' : 'false'}" onclick="AscendApp.navigate('${item.id}')">
              <span class="nav-icon">${Icons[item.iconKey] || '•'}</span>
              <span>${item.label}</span>
            </button>`).join('')}
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
    const unreadCount = getUnreadNotifCount();

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
        <div class="notif-btn-wrap" id="mobile-notif-wrap">
          <button type="button" class="icon-btn" id="mobile-notif-btn"
            onclick="AscendApp.toggleNotifications(event, 'mobile-notif-wrap')" aria-label="Notifications" style="min-width:44px;min-height:44px;">
            ${Icons.bell}
            ${unreadCount > 0 ? `<span class="notif-badge" id="mobile-notif-badge">${unreadCount}</span>` : ''}
          </button>
        </div>
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
    const activeView = currentView || ((currentRole === 'faculty') ? 'faculty-dashboard' : 'dashboard');

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
    const unreadCount = getUnreadNotifCount();
    const activeView = currentView || ((currentRole === 'faculty') ? 'faculty-dashboard' : 'dashboard');

    const bar = document.getElementById('desktop-topbar');
    if (!bar) return;
    const currentTitle = (activeView === 'settings' && currentRole === 'admin')
      ? 'Admin Settings'
      : ((activeView === 'settings' && currentRole === 'faculty')
        ? 'Faculty Settings'
        : (routes[activeView] ? (typeof routes[activeView].title === 'function' ? routes[activeView].title() : routes[activeView].title) : 'Dashboard'));

    const showSearch = (currentRole !== 'student');

    let searchPlaceholder = 'Search students, cohorts, feedback…';
    if (currentRole === 'admin') {
      if (activeView === 'admin-projects') searchPlaceholder = 'Search projects by title, author, tech stack…';
      else if (activeView === 'admin-achievements') searchPlaceholder = 'Search achievements, credentials, student…';
      else if (activeView === 'admin-faculty') searchPlaceholder = 'Search faculty advisors, department…';
      else if (activeView === 'admin-students') searchPlaceholder = 'Search students by name, roll no, degree…';
      else if (activeView === 'admin-users') searchPlaceholder = 'Search user accounts, email, role…';
      else searchPlaceholder = 'Search students, projects, faculty, certs…';
    }

    bar.innerHTML = `
      <div class="topbar-title" id="topbar-title">${currentTitle}</div>
      ${showSearch ? `
      <div class="topbar-search-slot">
        <div class="search-input-wrap">
          ${Icons.search}
          <input type="search" class="form-input search-input" id="topbar-search-input"
            placeholder="${searchPlaceholder}"
            aria-label="Search" oninput="AscendApp.handleTopSearch(this.value)">
        </div>
      </div>` : ''}
      <div class="topbar-actions">
        ${renderRoleSwitcherHTML()}
        <div class="notif-btn-wrap" id="desktop-notif-wrap">
          <button type="button" class="icon-btn" id="desktop-notif-btn"
            onclick="AscendApp.toggleNotifications(event, 'desktop-notif-wrap')" aria-label="Notifications">
            ${Icons.bell}
            ${unreadCount > 0 ? `<span class="notif-badge" id="desktop-notif-badge">${unreadCount}</span>` : ''}
          </button>
        </div>
        <button class="icon-btn" aria-label="Account menu" id="desktop-avatar-btn"
          onclick="AscendApp.openAccountDropdown(event, 'desktop-avatar-btn')" style="padding:0;border-radius:50%;width:32px;height:32px;">
          <div class="avatar avatar-sm" style="pointer-events:none;">${user.initials}</div>
        </button>
      </div>`;
  }

  /* ── Google-style Topbar Search Handler ──────────────────── */
  function handleTopSearch(query) {
    const q = (query || '').trim();
    if (currentRole === 'admin') {
      if (window.AdminViews) {
        if (currentView === 'admin-projects') {
          window.AdminViews.onProjectSearch && window.AdminViews.onProjectSearch(q);
        } else if (currentView === 'admin-achievements') {
          window.AdminViews.onAchievementSearch && window.AdminViews.onAchievementSearch(q);
        } else if (currentView === 'admin-faculty') {
          window.AdminViews.onFacultySearch && window.AdminViews.onFacultySearch(q);
        } else if (currentView === 'admin-students') {
          window.AdminViews.onStudentSearch && window.AdminViews.onStudentSearch(q);
        } else if (currentView === 'admin-users') {
          window.AdminViews.onUserSearch && window.AdminViews.onUserSearch(q);
        } else {
          window.AdminViews.onGlobalSearch && window.AdminViews.onGlobalSearch(q);
        }
      }
      return;
    }
    if (currentRole === 'student') {
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

  /* ── Notification System ─────────────────────────────────── */
  function getNotificationsForCurrentRole() {
    if (currentRole === 'student') {
      return (window.AscendData && window.AscendData.notifications) || [];
    } else if (currentRole === 'faculty') {
      return (window.AscendFacultyData && window.AscendFacultyData.notifications) || [];
    }
    return [];
  }

  function getUnreadNotifCount() {
    const list = getNotificationsForCurrentRole();
    return list.filter(n => !n.isRead).length;
  }

  function updateNotifBadges() {
    const count = getUnreadNotifCount();
    ['desktop-notif-wrap', 'mobile-notif-wrap'].forEach(wrapId => {
      const wrap = document.getElementById(wrapId);
      if (!wrap) return;
      const btn = wrap.querySelector('button');
      if (!btn) return;
      let badge = wrap.querySelector('.notif-badge');
      if (count > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'notif-badge';
          btn.appendChild(badge);
        }
        badge.textContent = count;
      } else if (badge) {
        badge.remove();
      }
    });
  }

  function toggleNotifications(e, triggerId) {
    if (e) e.stopPropagation();
    const existing = document.querySelector('.notification-flyout');
    if (existing) {
      existing.remove();
      return;
    }

    const { Icons } = window.AscendUI;
    const trigger = document.getElementById(triggerId);
    if (!trigger) return;

    const notifs = getNotificationsForCurrentRole();
    const unreadCount = notifs.filter(n => !n.isRead).length;

    const flyout = document.createElement('div');
    flyout.className = 'notification-flyout';
    flyout.innerHTML = `
      <div class="notif-flyout-header">
        <div class="notif-flyout-title">
          <span>Notifications</span>
          ${unreadCount > 0 ? `<span class="badge badge-primary" style="font-size:11px;padding:2px 7px;border-radius:10px;">${unreadCount} new</span>` : ''}
        </div>
        ${unreadCount > 0 ? `
        <button type="button" class="notif-flyout-mark-read" onclick="AscendApp.markAllNotificationsRead(event)">
          Mark all as read
        </button>` : ''}
      </div>
      <div class="notif-flyout-list">
        ${notifs.length === 0 ? `
          <div class="notif-empty">
            <div style="margin-bottom:6px;opacity:0.6;">${Icons.bell}</div>
            <div>No notifications at this time</div>
          </div>
        ` : notifs.map(n => {
          let iconSvg = Icons.bell;
          if (n.type === 'monthly_summary') iconSvg = Icons.calendar;
          else if (n.type === 'month_end_reminder') iconSvg = Icons.clock;
          else if (n.type === 'eval_published' || n.type === 'eval_due') iconSvg = Icons.clipboardList;
          else if (n.type === 'inactive_students') iconSvg = Icons.alertCircle;

          return `
            <div class="notif-item ${!n.isRead ? 'unread' : ''}" onclick="AscendApp.handleNotificationClick('${n.id}', '${n.actionView || ''}')">
              <div class="notif-item-icon">${iconSvg}</div>
              <div class="notif-item-body">
                <div class="notif-item-header">
                  <span class="notif-item-title">${n.title}</span>
                  <span class="notif-item-time">${n.formattedDate || ''}</span>
                </div>
                <div class="notif-item-msg">${n.message}</div>
                ${n.actionLabel ? `
                  <button type="button" class="notif-item-action-btn" onclick="event.stopPropagation();AscendApp.handleNotificationClick('${n.id}', '${n.actionView || ''}')">
                    <span>${n.actionLabel}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                ` : ''}
              </div>
              ${!n.isRead ? `<span class="notif-item-dot" title="Unread"></span>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;

    trigger.style.position = 'relative';
    trigger.appendChild(flyout);

    setTimeout(() => {
      const closeHandler = (evt) => {
        if (!flyout.contains(evt.target)) {
          flyout.remove();
          document.removeEventListener('click', closeHandler);
        }
      };
      document.addEventListener('click', closeHandler);
    }, 0);
  }

  function markAllNotificationsRead(e) {
    if (e) e.stopPropagation();
    const notifs = getNotificationsForCurrentRole();
    notifs.forEach(n => n.isRead = true);
    updateNotifBadges();
    const flyout = document.querySelector('.notification-flyout');
    if (flyout) flyout.remove();
    window.AscendUI.showToast('All notifications marked as read', 'info');
  }

  function handleNotificationClick(notifId, actionView) {
    const notifs = getNotificationsForCurrentRole();
    const n = notifs.find(item => item.id === notifId);
    if (n) {
      n.isRead = true;
    }
    updateNotifBadges();
    const flyout = document.querySelector('.notification-flyout');
    if (flyout) flyout.remove();

    if (actionView) {
      navigate(actionView);
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
      <button class="account-dropdown-item" onclick="AscendApp.navigate('settings');document.querySelector('.account-dropdown')?.remove();">
        ${Icons.settings} ${currentRole === 'admin' ? 'Admin Settings' : (currentRole === 'faculty' ? 'Faculty Settings' : 'Settings')}
      </button>
      ${currentRole === 'admin' ? `
      <button class="account-dropdown-item" onclick="AscendApp.navigate('admin-dashboard');document.querySelector('.account-dropdown')?.remove();">
        ${Icons.grid} Academic Oversight
      </button>` : (currentRole === 'student' ? `
      <button class="account-dropdown-item" onclick="AscendApp.navigate('profile');document.querySelector('.account-dropdown')?.remove();">
        ${Icons.user} My Profile
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

    const defaultView = (currentRole === 'admin') ? 'admin-dashboard' : ((currentRole === 'faculty') ? 'faculty-dashboard' : 'dashboard');
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
      } else if (currentRole === 'admin' && window.AdminViews && window.AdminViews.loadAdminData) {
        dataLoaders.push(window.AdminViews.loadAdminData());
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
    toggleNotifications,
    markAllNotificationsRead,
    handleNotificationClick,
    updateNotifBadges,
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
