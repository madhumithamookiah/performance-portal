/**
 * ASCEND – Faculty Students Directory View
 * Main workspace for tracking students across assigned classes.
 * Control order:
 * 1. Primary class selector
 * 2. Search
 * 3. Filters (compact side panel on desktop, bottom sheet on mobile)
 * 4. Sort
 */

/* ── Evaluation status badge helper ─────────────────────────── */
function evalStatusBadgeHTML(status) {
  if (status === 'evaluated' || status === 'published') {
    return `<span class="badge badge-normal" style="font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Published</span>`;
  }
  if (status === 'draft') {
    return `<span class="badge badge-draft" style="font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>Draft</span>`;
  }
  return `<span class="badge" style="background:var(--c-surface);color:var(--c-text-2);border:1px solid var(--c-border);font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Not started</span>`;
}

/* ── Desktop table row (6 essential columns with sticky Action) ─ */
function studentTableRow(s) {
  const { formatDateShort } = window.AscendUI;
  const updateTitle = s.latestUpdate ? s.latestUpdate.title : 'No recent updates';
  const updateType  = s.latestUpdate ? s.latestUpdate.type  : '—';
  const updateTime  = s.latestUpdate ? (s.latestUpdate.formattedDate || formatDateShort(s.latestUpdate.date)) : '—';

  return `
    <tr id="str-${s.id}">
      <td>
        <div class="data-table-student" style="display:flex;align-items:center;gap:var(--sp-3);">
          <div class="avatar avatar-sm" style="background:var(--c-primary-light);color:var(--c-primary);font-weight:700;flex-shrink:0;">${s.initials}</div>
          <div class="data-table-student-info">
            <div class="data-table-student-name" style="font-weight:700;color:var(--c-text);">${s.name}</div>
            <div class="data-table-student-sub" style="font-size:11px;color:var(--c-text-2);">${s.email}</div>
          </div>
        </div>
      </td>
      <td>
        <div style="font-size:var(--text-xs);font-weight:600;font-family:monospace;color:var(--c-text);">${s.rollNo}</div>
        <div style="font-size:11px;color:var(--c-text-2);margin-top:1px;">${s.program} · Sec ${s.section.replace('Section ', '')}</div>
      </td>
      <td>
        <div style="font-size:var(--text-xs);font-weight:600;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:210px;" title="${updateTitle}">${updateTitle}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:2px;">
          <span class="badge badge-normal" style="font-size:9px;padding:1px 6px;font-weight:600;">${updateType}</span>
          <span style="font-size:11px;color:var(--c-text-2);">${updateTime}</span>
        </div>
      </td>
      <td><div style="font-size:var(--text-xs);color:var(--c-text);font-weight:500;">${formatDateShort(s.lastActivity)}</div></td>
      <td>${evalStatusBadgeHTML(s.evaluationStatus)}</td>
      <td class="fstu-action-col">
        <button class="btn btn-outline btn-sm" onclick="FacultyViews.openStudentDetail('${s.id}')" style="white-space:nowrap;min-height:36px;" aria-label="View student ${s.name}">
          View student
        </button>
      </td>
    </tr>`;
}

/* ── Mobile student card (minimum 44px action touch target) ─── */
function studentMobileCard(s) {
  const { formatDateShort } = window.AscendUI;
  const updateTitle = s.latestUpdate ? s.latestUpdate.title : 'No recent updates';
  const updateType  = s.latestUpdate ? s.latestUpdate.type  : '—';
  const updateTime  = s.latestUpdate ? (s.latestUpdate.formattedDate || formatDateShort(s.latestUpdate.date)) : '—';

  return `
    <div class="card card-hover" style="padding:var(--sp-4);"
      onclick="FacultyViews.openStudentDetail('${s.id}')"
      role="button" tabindex="0" aria-label="View student ${s.name}"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();FacultyViews.openStudentDetail('${s.id}');}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--sp-3);margin-bottom:var(--sp-3);">
        <div style="display:flex;align-items:center;gap:var(--sp-3);">
          <div class="avatar avatar-md" style="background:var(--c-primary-light);color:var(--c-primary);font-weight:700;flex-shrink:0;">${s.initials}</div>
          <div>
            <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">${s.name}</div>
            <div style="font-size:var(--text-xs);color:var(--c-text-2);font-family:monospace;">${s.rollNo} · ${s.program}</div>
          </div>
        </div>
        ${evalStatusBadgeHTML(s.evaluationStatus)}
      </div>

      <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:var(--sp-3);background:var(--c-bg);padding:var(--sp-2) var(--sp-3);border-radius:var(--r-md);border:1px solid var(--c-border);">
        <div style="font-size:10px;font-weight:700;color:var(--c-text-2);text-transform:uppercase;letter-spacing:0.04em;">Latest Update</div>
        <div style="font-size:var(--text-xs);font-weight:600;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${updateTitle}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--c-text-2);margin-top:2px;">
          <span>${updateType} · ${updateTime}</span>
          <span>Active: ${formatDateShort(s.lastActivity)}</span>
        </div>
      </div>

      <button class="btn btn-outline btn-sm" style="width:100%;min-height:44px;font-weight:600;"
        onclick="event.stopPropagation();FacultyViews.openStudentDetail('${s.id}')"
        aria-label="View student ${s.name}">
        View student
      </button>
    </div>`;
}

/* ── Count active filters ────────────────────────────────────── */
function countActiveFilters() {
  const fields = ['fstu-filter-program','fstu-filter-section','fstu-filter-activity','fstu-filter-record-type','fstu-filter-setup','fstu-filter-eval','fstu-filter-feedback'];
  return fields.filter(id => {
    const el = document.getElementById(id);
    return el && el.value !== '';
  }).length;
}

/* ── Update filter badge and label ───────────────────────────── */
function updateFilterCountBadge() {
  const count = countActiveFilters();
  const btnLabel = document.getElementById('fstu-filters-btn-label');
  const drawerCount = document.getElementById('fstu-drawer-count-badge');
  const resetBtn = document.getElementById('fstu-reset-btn');

  if (btnLabel) {
    btnLabel.textContent = count > 0 ? `Filters · ${count}` : 'Filters';
  }
  if (drawerCount) {
    drawerCount.textContent = count;
    drawerCount.style.display = count > 0 ? 'inline-block' : 'none';
  }
  if (resetBtn) {
    resetBtn.style.display = count > 0 ? 'inline-flex' : 'none';
  }
}

/* ── Main Students Directory Render ─────────────────────────── */
function renderFacultyStudents() {
  const { getClasses, getSelectedClass, getStudents } = window.AscendFacultyData;
  const { Icons } = window.AscendUI;

  const classes = getClasses();
  let selectedClassId = window.AscendFacultyData.selectedClassId;
  if (!selectedClassId) {
    selectedClassId = 'class-cse-5a';
  }
  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const students = getStudents(selectedClass.id);

  const programmes = [...new Set(window.AscendFacultyData.students.map(s => s.program))];
  const sections   = [...new Set(window.AscendFacultyData.students.map(s => s.section))];

  const rowsHTML  = students.map(studentTableRow).join('');
  const cardsHTML = students.map(studentMobileCard).join('');

  return `
    <style>
      /* Pinned Action Column */
      .fstu-action-col {
        position: sticky;
        right: 0;
        background: var(--c-surface);
        z-index: 2;
        text-align: right;
      }
      thead .fstu-action-col {
        background: var(--c-bg);
        z-index: 3;
      }

      /* Desktop / Mobile view toggling */
      @media (min-width: 769px) {
        .faculty-mobile-cards { display: none !important; }
        .data-table-wrap { display: block !important; }
      }
      @media (max-width: 768px) {
        .data-table-wrap { display: none !important; }
        .faculty-mobile-cards { display: flex !important; }
      }

      /* Filters Drawer Backdrop */
      .fstu-filters-backdrop {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        z-index: 500;
      }

      /* Desktop Side Panel */
      @media (min-width: 769px) {
        .fstu-filters-drawer {
          display: none;
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 380px;
          background: var(--c-surface);
          z-index: 501;
          box-shadow: -6px 0 28px rgba(0,0,0,0.14);
          flex-direction: column;
        }
        .fstu-filters-drawer.open {
          display: flex;
        }
      }

      /* Mobile Bottom Sheet */
      @media (max-width: 768px) {
        .fstu-filters-drawer {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          max-height: 88vh;
          background: var(--c-surface);
          z-index: 501;
          border-radius: 20px 20px 0 0;
          box-shadow: 0 -8px 32px rgba(0,0,0,0.22);
          flex-direction: column;
        }
        .fstu-filters-drawer.open {
          display: flex;
        }
      }
    </style>

    <!-- Header -->
    <div class="section-header" style="margin-bottom:var(--sp-4);flex-wrap:wrap;gap:var(--sp-2);">
      <div>
        <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;color:var(--c-text);margin:0;">
          Students Directory
        </h1>
        <div style="font-size:var(--text-sm);color:var(--c-text-2);margin-top:4px;">
          Track students, development milestones, and portfolio updates across your assigned classes
        </div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="AscendUI.showToast('Exporting student roster report…','info')" aria-label="Export student roster">
        ${Icons.download} Export Roster
      </button>
    </div>

    <!-- ── 1. Primary Class Selector ──────────────────────────────── -->
    <div class="card" style="margin-bottom:var(--sp-4);padding:var(--sp-3) var(--sp-4);background:var(--c-surface);border:1.5px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);">
      <div style="display:flex;align-items:center;gap:var(--sp-3);min-width:0;">
        <div style="width:40px;height:40px;border-radius:var(--r-md);background:var(--c-primary-light);color:var(--c-primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          ${Icons.users}
        </div>
        <div style="min-width:0;">
          <div style="font-size:11px;font-weight:700;color:var(--c-primary);text-transform:uppercase;letter-spacing:0.06em;">
            Primary Class Workspace
          </div>
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" id="fstu-class-label">
            ${selectedClass.name}
          </div>
          <div style="font-size:11px;color:var(--c-text-2);margin-top:2px;">
            ${selectedClass.department} · ${selectedClass.academicYear} · <span id="fstu-class-count" style="font-weight:600;color:var(--c-text);">${students.length} enrolled students</span>
          </div>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
        <label for="fstu-class-select" style="font-size:var(--text-xs);font-weight:600;color:var(--c-text-2);white-space:nowrap;">Switch Class:</label>
        <select class="form-input form-select" id="fstu-class-select" style="min-width:260px;font-weight:600;font-size:var(--text-xs);" onchange="FacultyViews.onStudentsClassChange(this.value)" aria-label="Select assigned class">
          ${classes.map(c => `
            <option value="${c.id}" ${c.id === selectedClass.id ? 'selected' : ''}>
              ${c.name}${c.id === 'class-cse-5a' ? ' (Default)' : ''}
            </option>`).join('')}
        </select>
      </div>
    </div>

    <!-- ── 2, 3, 4. Search, Filters & Sort Controls Bar ───────────── -->
    <div class="card" style="padding:var(--sp-3) var(--sp-4);margin-bottom:var(--sp-5);">
      <div style="display:flex;flex-wrap:wrap;gap:var(--sp-3);align-items:center;justify-content:space-between;">

        <!-- 2. Search (Always visible beside or below selector) -->
        <div class="search-input-wrap" style="flex:2;min-width:240px;">
          ${Icons.search}
          <input type="search" class="form-input search-input" id="fstu-search"
            placeholder="Search by name, roll number, or email…"
            oninput="FacultyViews.filterStudents()"
            aria-label="Search students by name, roll number, or email">
        </div>

        <!-- 3. Filters Button & Reset -->
        <div style="display:flex;align-items:center;gap:var(--sp-2);">
          <button class="btn btn-outline btn-sm" id="fstu-filters-toggle-btn"
            onclick="FacultyViews.openFiltersPanel()"
            aria-label="Open filter options" aria-haspopup="dialog"
            style="min-height:38px;font-weight:600;font-size:var(--text-xs);display:flex;align-items:center;gap:6px;">
            ${Icons.filter}
            <span id="fstu-filters-btn-label">Filters</span>
          </button>
          <button class="btn btn-ghost btn-sm" id="fstu-reset-btn"
            onclick="FacultyViews.resetStudentsFilters()"
            style="display:none;color:var(--c-text-2);min-height:38px;font-size:var(--text-xs);"
            aria-label="Reset all filters">
            Clear all
          </button>
        </div>

        <!-- 4. Sort Dropdown -->
        <div style="display:flex;align-items:center;gap:var(--sp-2);min-width:200px;">
          <label style="font-size:var(--text-xs);font-weight:600;color:var(--c-text-2);white-space:nowrap;" for="fstu-sort">Sort:</label>
          <select class="form-input form-select" id="fstu-sort" style="width:100%;font-size:var(--text-xs);font-weight:500;" onchange="FacultyViews.filterStudents()" aria-label="Sort students">
            <option value="latest-activity">Latest activity</option>
            <option value="least-activity">Least recent activity</option>
            <option value="recent-achievement">Most recent achievement</option>
            <option value="most-records">Most portfolio records</option>
            <option value="alpha">Alphabetical</option>
          </select>
        </div>

      </div>
    </div>

    <!-- ── Desktop Data Table (6 Columns) ────────────────────────── -->
    <div class="data-table-wrap faculty-table-wrap" style="margin-bottom:var(--sp-5);overflow-x:auto;">
      <table class="data-table" id="fac-students-table" style="min-width:680px;width:100%;">
        <thead>
          <tr>
            <th style="min-width:180px;">Student</th>
            <th style="min-width:120px;">Roll Number</th>
            <th style="min-width:220px;">Latest Update</th>
            <th style="min-width:110px;">Last Active</th>
            <th style="min-width:120px;">Evaluation Status</th>
            <th class="fstu-action-col" style="min-width:110px;text-align:right;">Action</th>
          </tr>
        </thead>
        <tbody id="fac-students-tbody">
          ${rowsHTML}
        </tbody>
      </table>
      <div class="data-table-pagination" id="fac-students-pagination">
        <div class="pagination-info" id="fstu-pagination-info">Showing ${students.length} of ${students.length} students in selected class</div>
      </div>
    </div>

    <!-- ── Mobile Cards View ─────────────────────────────────────── -->
    <div class="faculty-mobile-cards" id="fac-students-mobile" style="display:flex;flex-direction:column;gap:var(--sp-3);margin-bottom:var(--sp-5);">
      ${cardsHTML}
    </div>

    <!-- ── Compact Filters Side Panel (Desktop) / Bottom Sheet (Mobile) ── -->
    <div id="fstu-filters-backdrop" class="fstu-filters-backdrop" onclick="FacultyViews.closeFiltersPanel()" aria-hidden="true"></div>
    <div id="fstu-filters-drawer" class="fstu-filters-drawer" role="dialog" aria-modal="true" aria-label="Filter students">

      <div style="padding:var(--sp-4) var(--sp-5);border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:var(--sp-2);">
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Filters</div>
          <span id="fstu-drawer-count-badge" class="badge badge-primary" style="display:none;font-size:10px;">0</span>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="FacultyViews.closeFiltersPanel()" aria-label="Close filters panel" style="min-height:36px;min-width:36px;padding:0;display:flex;align-items:center;justify-content:center;">
          ${Icons.x}
        </button>
      </div>

      <div style="padding:var(--sp-5);display:flex;flex-direction:column;gap:var(--sp-4);overflow-y:auto;flex:1;">

        <!-- Filter 1: Programme / Section -->
        <div class="form-group">
          <label class="form-label" for="fstu-filter-program">Programme</label>
          <select class="form-input form-select" id="fstu-filter-program" aria-label="Filter by programme">
            <option value="">All programmes</option>
            ${programmes.map(p => `<option value="${p}">${p}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="fstu-filter-section">Section</label>
          <select class="form-input form-select" id="fstu-filter-section" aria-label="Filter by section">
            <option value="">All sections</option>
            ${sections.map(sec => `<option value="${sec}">${sec}</option>`).join('')}
          </select>
        </div>

        <!-- Filter 2: Recent Activity -->
        <div class="form-group">
          <label class="form-label" for="fstu-filter-activity">Recent Activity</label>
          <select class="form-input form-select" id="fstu-filter-activity" aria-label="Filter by recent activity">
            <option value="">All activity periods</option>
            <option value="this-week">This week</option>
            <option value="this-month">This month</option>
            <option value="inactive-30">No activity in 30+ days</option>
          </select>
        </div>

        <!-- Filter 3: Portfolio Record Type -->
        <div class="form-group">
          <label class="form-label" for="fstu-filter-record-type">Portfolio Record Type</label>
          <select class="form-input form-select" id="fstu-filter-record-type" aria-label="Filter by portfolio record type">
            <option value="">All record types</option>
            <option value="Certification">Certification</option>
            <option value="Project">Project</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Internship">Internship</option>
            <option value="Workshop">Workshop</option>
            <option value="Research">Research</option>
            <option value="Leadership">Leadership</option>
            <option value="Award">Award</option>
          </select>
        </div>

        <!-- Filter 4: Profile Setup -->
        <div class="form-group">
          <label class="form-label" for="fstu-filter-setup">Profile Setup</label>
          <select class="form-input form-select" id="fstu-filter-setup" aria-label="Filter by profile setup status">
            <option value="">All setup statuses</option>
            <option value="complete">Complete</option>
            <option value="incomplete">Needs details</option>
          </select>
        </div>

        <!-- Filter 5: Evaluation Status -->
        <div class="form-group">
          <label class="form-label" for="fstu-filter-eval">Evaluation Status</label>
          <select class="form-input form-select" id="fstu-filter-eval" aria-label="Filter by evaluation status">
            <option value="">All evaluation statuses</option>
            <option value="not-started">Not started</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <!-- Filter 6: Feedback -->
        <div class="form-group">
          <label class="form-label" for="fstu-filter-feedback">Feedback</label>
          <select class="form-input form-select" id="fstu-filter-feedback" aria-label="Filter by feedback status">
            <option value="">All feedback</option>
            <option value="follow-up-needed">Follow-up needed</option>
          </select>
        </div>

      </div>

      <div style="padding:var(--sp-4) var(--sp-5);border-top:1px solid var(--c-border);display:flex;gap:var(--sp-3);background:var(--c-surface);">
        <button class="btn btn-outline" style="flex:1;min-height:44px;" onclick="FacultyViews.resetStudentsFilters()">
          Clear all
        </button>
        <button class="btn btn-primary" style="flex:2;min-height:44px;" onclick="FacultyViews.applyFiltersPanel()">
          Apply filters
        </button>
      </div>

    </div>`;
}

/* ── Filters Panel Open / Close ──────────────────────────────── */
function openFiltersPanel() {
  const drawer   = document.getElementById('fstu-filters-drawer');
  const backdrop = document.getElementById('fstu-filters-backdrop');
  if (!drawer || !backdrop) return;

  drawer.classList.add('open');
  backdrop.style.display = 'block';
  document.body.style.overflow = 'hidden';

  const firstSelect = drawer.querySelector('select');
  if (firstSelect) setTimeout(() => firstSelect.focus(), 60);

  // Bind Escape key
  window._fstuEscHandler = function(e) {
    if (e.key === 'Escape') closeFiltersPanel();
  };
  window.addEventListener('keydown', window._fstuEscHandler);
}

function closeFiltersPanel() {
  const drawer   = document.getElementById('fstu-filters-drawer');
  const backdrop = document.getElementById('fstu-filters-backdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.style.display = 'none';
  document.body.style.overflow = '';

  if (window._fstuEscHandler) {
    window.removeEventListener('keydown', window._fstuEscHandler);
  }
  document.getElementById('fstu-filters-toggle-btn')?.focus();
}

function applyFiltersPanel() {
  closeFiltersPanel();
  filterFacultyStudents();
  updateFilterCountBadge();
}

/* ── Class Switch Handler ────────────────────────────────────── */
function onStudentsClassChange(classId) {
  window.AscendFacultyData.setSelectedClass(classId);
  const selectedClass = window.AscendFacultyData.getSelectedClass();
  const labelEl = document.getElementById('fstu-class-label');
  if (labelEl) labelEl.textContent = selectedClass.name;
  const countEl = document.getElementById('fstu-class-count');
  const classStudents = window.AscendFacultyData.getStudents(classId);
  if (countEl) countEl.textContent = `${classStudents.length} enrolled students`;
  filterFacultyStudents();
}

/* ── Reset Filters ───────────────────────────────────────────── */
function resetStudentsFilters() {
  [
    'fstu-search',
    'fstu-filter-program',
    'fstu-filter-section',
    'fstu-filter-activity',
    'fstu-filter-record-type',
    'fstu-filter-setup',
    'fstu-filter-eval',
    'fstu-filter-feedback',
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const sortEl = document.getElementById('fstu-sort');
  if (sortEl) sortEl.value = 'latest-activity';

  filterFacultyStudents();
  updateFilterCountBadge();
}

/* ── Filter Logic ────────────────────────────────────────────── */
function filterFacultyStudents() {
  const classId    = window.AscendFacultyData.selectedClassId;
  const q          = (document.getElementById('fstu-search')?.value || '').toLowerCase().trim();
  const program    = document.getElementById('fstu-filter-program')?.value || '';
  const section    = document.getElementById('fstu-filter-section')?.value || '';
  const activity   = document.getElementById('fstu-filter-activity')?.value || '';
  const recordType = document.getElementById('fstu-filter-record-type')?.value || '';
  const setup      = document.getElementById('fstu-filter-setup')?.value || '';
  const evalStatus = document.getElementById('fstu-filter-eval')?.value || '';
  const feedback   = document.getElementById('fstu-filter-feedback')?.value || '';
  const sort       = document.getElementById('fstu-sort')?.value || 'latest-activity';

  // Base student list against currently selected class, unless "All assigned classes" (all)
  const baseList = window.AscendFacultyData.getStudents(classId);
  let data = [...baseList];

  // 1. Search by name, roll number, or email
  if (q) {
    data = data.filter(s =>
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.rollNo && s.rollNo.toLowerCase().includes(q))
    );
  }

  // 2. Programme & Section filters
  if (program) data = data.filter(s => s.program === program);
  if (section) data = data.filter(s => s.section === section);

  // 3. Recent Activity filter (This week, This month, No activity in 30+ days)
  if (activity) {
    const refDate = new Date('2026-09-05T23:59:59Z');
    data = data.filter(s => {
      if (!s.lastActivity) return activity === 'inactive-30';
      const diffDays = Math.floor((refDate - new Date(s.lastActivity)) / (1000 * 60 * 60 * 24));
      if (activity === 'this-week')    return diffDays <= 7;
      if (activity === 'this-month')   return diffDays <= 30;
      if (activity === 'inactive-30') return diffDays > 30 || s.attentionStatus === 'no-activity';
      return true;
    });
  }

  // 4. Portfolio Record Type filter
  if (recordType) {
    const rt = recordType.toLowerCase();
    data = data.filter(s => {
      const latestMatch = s.latestUpdate?.type && s.latestUpdate.type.toLowerCase() === rt;
      const summaryMatch = s.portfolioSummary && s.portfolioSummary.toLowerCase().includes(rt);
      const achMatch = Array.isArray(s.achievements) && s.achievements.some(a => (a.category || '').toLowerCase() === rt);
      return latestMatch || summaryMatch || achMatch;
    });
  }

  // 5. Profile Setup filter (Complete / Needs details)
  if (setup) {
    if (setup === 'complete') {
      data = data.filter(s => s.profileSetupStatus === 'complete');
    } else if (setup === 'incomplete') {
      data = data.filter(s =>
        s.profileSetupStatus === 'incomplete' ||
        s.attentionStatus === 'incomplete-profile' ||
        (Array.isArray(s.missingProfileFields) && s.missingProfileFields.length > 0)
      );
    }
  }

  // 6. Evaluation Status filter (Not started / Draft / Published)
  if (evalStatus) {
    if (evalStatus === 'published') {
      data = data.filter(s => s.evaluationStatus === 'evaluated' || s.evaluationStatus === 'published');
    } else if (evalStatus === 'draft') {
      data = data.filter(s => s.evaluationStatus === 'draft');
    } else if (evalStatus === 'not-started') {
      data = data.filter(s => s.evaluationStatus === 'pending' || s.evaluationStatus === 'not-started' || !s.evaluationStatus);
    }
  }

  // 7. Feedback filter (Follow-up needed)
  if (feedback === 'follow-up-needed') {
    const allFeedback = window.AscendFacultyData.facultyFeedback || [];
    data = data.filter(s =>
      allFeedback.some(fb => fb.toStudentId === s.id && (fb.followUpState === 'due' || (fb.followUpDate && new Date(fb.followUpDate) <= new Date('2026-09-05T23:59:59Z') && fb.followUpState !== 'completed')))
    );
  }

  // 8. Sorting
  if (sort === 'alpha') {
    data.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'least-activity') {
    data.sort((a, b) => new Date(a.lastActivity) - new Date(b.lastActivity));
  } else if (sort === 'recent-achievement') {
    data.sort((a, b) => {
      const dateA = a.latestUpdate?.date ? new Date(a.latestUpdate.date) : new Date(a.lastActivity);
      const dateB = b.latestUpdate?.date ? new Date(b.latestUpdate.date) : new Date(b.lastActivity);
      return dateB - dateA;
    });
  } else if (sort === 'most-records') {
    data.sort((a, b) => {
      const countA = a.totalAchievements || (a.achievements ? a.achievements.length : 0);
      const countB = b.totalAchievements || (b.achievements ? b.achievements.length : 0);
      return countB - countA;
    });
  } else {
    // Default: latest activity
    data.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
  }

  // Render results
  const tbody      = document.getElementById('fac-students-tbody');
  const mobileWrap = document.getElementById('fac-students-mobile');
  const info       = document.getElementById('fstu-pagination-info');

  const emptyDesktop = `<tr><td colspan="6" style="text-align:center;padding:var(--sp-8);color:var(--c-text-2);">
    <div style="font-size:var(--text-base);font-weight:600;margin-bottom:4px;color:var(--c-text);">No students match your criteria</div>
    <div style="font-size:var(--text-xs);margin-bottom:var(--sp-3);">Try adjusting your search query or clearing active filters.</div>
    <button class="btn btn-outline btn-sm" onclick="FacultyViews.resetStudentsFilters()">Clear all filters</button>
  </td></tr>`;

  const emptyMobile = `<div class="card" style="text-align:center;padding:var(--sp-8);color:var(--c-text-2);">
    <div style="font-size:var(--text-base);font-weight:600;margin-bottom:4px;color:var(--c-text);">No students match your criteria</div>
    <div style="font-size:var(--text-xs);margin-bottom:var(--sp-3);">Try adjusting your search query or clearing active filters.</div>
    <button class="btn btn-outline btn-sm" onclick="FacultyViews.resetStudentsFilters()">Clear all filters</button>
  </div>`;

  if (tbody)      tbody.innerHTML      = data.length ? data.map(studentTableRow).join('') : emptyDesktop;
  if (mobileWrap) mobileWrap.innerHTML = data.length ? data.map(studentMobileCard).join('') : emptyMobile;
  if (info)       info.textContent     = `Showing ${data.length} of ${baseList.length} students in selected class`;

  updateFilterCountBadge();
}

/* ── Open student detail view ────────────────────────────────── */
function openStudentDetail(studentId) {
  window._facultySelectedStudentId = studentId;
  AscendApp.navigate('faculty-student-detail');
}

window.FacultyViews = window.FacultyViews || {};
Object.assign(window.FacultyViews, {
  students: renderFacultyStudents,
  onStudentsClassChange,
  resetStudentsFilters,
  filterStudents: filterFacultyStudents,
  openStudentDetail,
  openFiltersPanel,
  closeFiltersPanel,
  applyFiltersPanel,
});
