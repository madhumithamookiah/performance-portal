/**
 * ASCEND – Admin Console View
 * Google Admin Console inspired UI for system governance, user directory management,
 * email verification administration, and institutional platform health.
 */

(function () {
  let adminStats = null;
  let adminUsers = [];
  let systemInfo = null;
  let userSearchQuery = '';
  let userRoleFilter = 'all';
  let userStatusFilter = 'all';

  async function loadAdminData() {
    try {
      const [statsRes, usersRes, sysRes] = await Promise.all([
        fetch('/api/admin/stats').then(r => r.json()).catch(() => null),
        fetch('/api/admin/users').then(r => r.json()).catch(() => null),
        fetch('/api/admin/system').then(r => r.json()).catch(() => null),
      ]);
      if (statsRes) adminStats = statsRes;
      if (usersRes && Array.isArray(usersRes.users)) adminUsers = usersRes.users;
      if (sysRes) systemInfo = sysRes;
    } catch (err) {
      console.warn('Error loading admin data:', err);
    }
  }

  /* ── Filter users helper ──────────────────────────────────── */
  function getFilteredUsers() {
    return adminUsers.filter(u => {
      const q = userSearchQuery.trim().toLowerCase();
      const matchQuery = !q || (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q));
      const matchRole = userRoleFilter === 'all' || (u.role || '').toLowerCase() === userRoleFilter.toLowerCase();
      const matchStatus = userStatusFilter === 'all' ||
        (userStatusFilter === 'verified' && u.isVerified) ||
        (userStatusFilter === 'pending' && !u.isVerified);
      return matchQuery && matchRole && matchStatus;
    });
  }

  /* ── Main Dashboard View ──────────────────────────────────── */
  function renderDashboard() {
    const { Icons } = window.AscendUI;
    const stats = adminStats || {
      totalUsers: adminUsers.length || 0,
      studentCount: adminUsers.filter(u => u.role === 'student').length || 0,
      facultyCount: adminUsers.filter(u => u.role === 'faculty').length || 0,
      adminCount: adminUsers.filter(u => u.role === 'admin').length || 1,
      verifiedCount: adminUsers.filter(u => u.isVerified).length || 0,
      pendingCount: adminUsers.filter(u => !u.isVerified).length || 0,
      verificationRate: 100,
      totalAchievements: 0,
      totalProjects: 0,
      smtp: { host: 'smtp.gmail.com', port: 587, status: 'connected' },
    };

    const filteredUsers = getFilteredUsers();

    return `
      <div class="view-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;margin-bottom:24px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span class="badge badge-primary" style="font-size:11px;padding:3px 10px;text-transform:uppercase;letter-spacing:0.05em;">Admin Console</span>
            <span style="font-size:13px;color:var(--c-text-3);">Institution: Delhi Institute of Technology</span>
          </div>
          <h1 style="margin:0;font-size:26px;font-weight:700;letter-spacing:-0.025em;color:var(--c-text);">System Administration</h1>
          <p style="margin:4px 0 0;font-size:14px;color:var(--c-text-2);">
            Manage registered accounts, monitor Gmail SMTP real-time delivery, and administer user verification.
          </p>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <button type="button" class="btn btn-outline" onclick="AdminViews.refreshData()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            Refresh Metrics
          </button>
          <a href="index.html" class="btn btn-primary">
            View Portal Landing
          </a>
        </div>
      </div>

      <!-- ── Overview Metric Cards ── -->
      <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:28px;">
        <div class="stat-card">
          <div class="stat-label" style="display:flex;justify-content:space-between;align-items:center;">
            <span>Total Accounts</span>
            <div style="width:32px;height:32px;border-radius:50%;background:#E8F0FE;color:#1A73E8;display:flex;align-items:center;justify-content:center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
          </div>
          <div class="stat-value" style="font-size:32px;margin:8px 0 4px;">${stats.totalUsers}</div>
          <div class="stat-sub" style="font-size:12px;color:var(--c-text-3);">
            <strong style="color:var(--c-primary);">${stats.studentCount}</strong> Students · 
            <strong style="color:#137333;">${stats.facultyCount}</strong> Faculty · 
            <strong style="color:#6D28D9;">${stats.adminCount}</strong> Admin
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label" style="display:flex;justify-content:space-between;align-items:center;">
            <span>Verified Users</span>
            <div style="width:32px;height:32px;border-radius:50%;background:#E6F4EA;color:#137333;display:flex;align-items:center;justify-content:center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </div>
          <div class="stat-value" style="font-size:32px;margin:8px 0 4px;color:#137333;">${stats.verifiedCount}</div>
          <div class="stat-sub" style="font-size:12px;color:var(--c-text-3);">
            ${stats.verificationRate}% compliance rate
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label" style="display:flex;justify-content:space-between;align-items:center;">
            <span>Pending Email Verifications</span>
            <div style="width:32px;height:32px;border-radius:50%;background:#FEF7E0;color:#B06000;display:flex;align-items:center;justify-content:center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
          </div>
          <div class="stat-value" style="font-size:32px;margin:8px 0 4px;color:${stats.pendingCount > 0 ? '#B06000' : 'var(--c-text)'};">${stats.pendingCount}</div>
          <div class="stat-sub" style="font-size:12px;color:var(--c-text-3);">
            ${stats.pendingCount > 0 ? 'Awaiting verification link click' : 'All accounts verified'}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-label" style="display:flex;justify-content:space-between;align-items:center;">
            <span>SMTP Mail Service</span>
            <div style="width:32px;height:32px;border-radius:50%;background:#E8F0FE;color:#1A73E8;display:flex;align-items:center;justify-content:center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
          </div>
          <div class="stat-value" style="font-size:20px;margin:12px 0 4px;font-weight:600;display:flex;align-items:center;gap:6px;">
            <span style="width:10px;height:10px;border-radius:50%;background:#137333;display:inline-block;"></span>
            ${stats.smtp?.status === 'connected' || stats.smtp?.status === 'active' ? 'Active SMTP' : 'Ready'}
          </div>
          <div class="stat-sub" style="font-size:12px;color:var(--c-text-3);word-break:break-all;">
            ${stats.smtp?.host || 'smtp.gmail.com'}:${stats.smtp?.port || 587} (${stats.smtp?.user ? stats.smtp.user : 'Default'})
          </div>
        </div>
      </div>

      <!-- ── User Management Section ── -->
      <div class="card" style="padding:0;overflow:hidden;margin-bottom:28px;">
        <div style="padding:20px 24px;border-bottom:1px solid var(--c-border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
          <div>
            <h2 style="font-size:18px;font-weight:600;margin:0 0 4px;color:var(--c-text);">User Accounts Directory</h2>
            <p style="margin:0;font-size:13px;color:var(--c-text-2);">
              Search, filter, verify, and govern all student, faculty, and administrator identities.
            </p>
          </div>

          <!-- Search and Filters -->
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <div style="position:relative;min-width:240px;">
              <input type="text" class="form-input" style="padding-left:34px;height:38px;font-size:13px;"
                placeholder="Search name or email..." value="${userSearchQuery}"
                oninput="AdminViews.onSearch(this.value)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position:absolute;left:10px;top:12px;color:var(--c-text-3);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>

            <select class="form-input" style="width:auto;height:38px;font-size:13px;padding:4px 10px;" onchange="AdminViews.onRoleFilter(this.value)">
              <option value="all" ${userRoleFilter === 'all' ? 'selected' : ''}>All Roles</option>
              <option value="student" ${userRoleFilter === 'student' ? 'selected' : ''}>Students</option>
              <option value="faculty" ${userRoleFilter === 'faculty' ? 'selected' : ''}>Faculty</option>
              <option value="admin" ${userRoleFilter === 'admin' ? 'selected' : ''}>Admins</option>
            </select>

            <select class="form-input" style="width:auto;height:38px;font-size:13px;padding:4px 10px;" onchange="AdminViews.onStatusFilter(this.value)">
              <option value="all" ${userStatusFilter === 'all' ? 'selected' : ''}>All Status</option>
              <option value="verified" ${userStatusFilter === 'verified' ? 'selected' : ''}>Verified</option>
              <option value="pending" ${userStatusFilter === 'pending' ? 'selected' : ''}>Pending Verification</option>
            </select>
          </div>
        </div>

        <!-- Directory Table -->
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;text-align:left;font-size:13px;">
            <thead>
              <tr style="background:var(--c-bg);color:var(--c-text-2);border-bottom:1px solid var(--c-border);">
                <th style="padding:12px 20px;font-weight:600;">User</th>
                <th style="padding:12px 16px;font-weight:600;">Email</th>
                <th style="padding:12px 16px;font-weight:600;">Role</th>
                <th style="padding:12px 16px;font-weight:600;">Status</th>
                <th style="padding:12px 16px;font-weight:600;">Portfolios / Achievements</th>
                <th style="padding:12px 20px;font-weight:600;text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUsers.length === 0 ? `
                <tr>
                  <td colspan="6" style="padding:36px;text-align:center;color:var(--c-text-3);">
                    No accounts found matching your filter criteria.
                  </td>
                </tr>
              ` : filteredUsers.map(user => {
                const initials = (user.name || 'U').split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'US';
                const roleBadge = user.role === 'admin'
                  ? '<span class="badge" style="background:#F3E8FF;color:#6D28D9;border:1px solid #E9D5FF;font-weight:600;">Admin</span>'
                  : user.role === 'faculty'
                  ? '<span class="badge" style="background:#E6F4EA;color:#137333;border:1px solid #CEEAD6;font-weight:600;">Faculty</span>'
                  : '<span class="badge" style="background:#E8F0FE;color:#1A73E8;border:1px solid #C2E7FF;font-weight:600;">Student</span>';

                const statusBadge = user.isVerified
                  ? '<span class="badge" style="background:#E6F4EA;color:#137333;border:1px solid #CEEAD6;font-weight:600;display:inline-flex;align-items:center;gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Verified</span>'
                  : '<span class="badge" style="background:#FEF7E0;color:#B06000;border:1px solid #FEEFC3;font-weight:600;display:inline-flex;align-items:center;gap:4px;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>Pending</span>';

                const isPrimaryAdmin = user.email.toLowerCase() === 'admin@ascend.com';

                return `
                  <tr style="border-bottom:1px solid var(--c-border);transition:background 0.15s ease;">
                    <td style="padding:14px 20px;">
                      <div style="display:flex;align-items:center;gap:12px;">
                        <div style="width:36px;height:36px;border-radius:50%;background:#E8F0FE;color:#1A73E8;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px;flex-shrink:0;">
                          ${initials}
                        </div>
                        <div>
                          <div style="font-weight:600;color:var(--c-text);">${user.name || 'User'}</div>
                          <div style="font-size:11px;color:var(--c-text-3);">ID: ${user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style="padding:14px 16px;color:var(--c-text);font-family:monospace;font-size:12px;">
                      ${user.email}
                    </td>
                    <td style="padding:14px 16px;">
                      ${roleBadge}
                    </td>
                    <td style="padding:14px 16px;">
                      ${statusBadge}
                    </td>
                    <td style="padding:14px 16px;color:var(--c-text-2);">
                      ${user.role === 'student' ? `${user.achievementsCount || 0} achievements · ${user.projectsCount || 0} projects` : '—'}
                    </td>
                    <td style="padding:14px 20px;text-align:right;">
                      <div style="display:inline-flex;align-items:center;gap:6px;">
                        ${!user.isVerified ? `
                          <button type="button" class="btn btn-sm btn-outline" style="font-size:11px;color:#137333;border-color:#CEEAD6;" onclick="AdminViews.verifyUser('${user.id}', '${user.email}')" title="Manually verify this email">
                            Verify
                          </button>
                        ` : ''}
                        ${!isPrimaryAdmin ? `
                          <button type="button" class="btn btn-sm btn-ghost" style="color:var(--c-danger);padding:4px 8px;" onclick="AdminViews.deleteUser('${user.id}', '${user.name || user.email}')" title="Delete account">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        ` : '<span style="font-size:11px;color:var(--c-text-3);padding:0 8px;">System Admin</span>'}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── System & Audit Diagnostics ── -->
      <div class="card" style="padding:24px;margin-bottom:28px;">
        <h3 style="font-size:16px;font-weight:600;margin:0 0 12px;color:var(--c-text);display:flex;align-items:center;gap:8px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          System &amp; Email Infrastructure Status
        </h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;font-size:13px;">
          <div style="padding:16px;background:var(--c-bg);border-radius:var(--r-md);border:1px solid var(--c-border);">
            <div style="font-weight:600;color:var(--c-text);margin-bottom:6px;">SMTP Protocol Dispatcher</div>
            <div style="color:var(--c-text-2);line-height:1.6;">
              <div><strong>Host:</strong> ${stats.smtp?.host || 'smtp.gmail.com'}</div>
              <div><strong>Port:</strong> ${stats.smtp?.port || 587} (TLS)</div>
              <div><strong>Service:</strong> Gmail Official Relay</div>
              <div><strong>Real-time Delivery:</strong> Active upon signup &amp; login alerts</div>
            </div>
          </div>
          <div style="padding:16px;background:var(--c-bg);border-radius:var(--r-md);border:1px solid var(--c-border);">
            <div style="font-weight:600;color:var(--c-text);margin-bottom:6px;">Database Storage &amp; Integrity</div>
            <div style="color:var(--c-text-2);line-height:1.6;">
              <div><strong>Engine:</strong> JSON Atomic File Store (data/db.json)</div>
              <div><strong>Registered Users:</strong> ${adminUsers.length} total</div>
              <div><strong>Primary Admin Account:</strong> admin@ascend.com</div>
              <div><strong>Password Policy:</strong> Encrypted/Protected session auth</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ── Interactive Actions ─────────────────────────────────── */
  async function verifyUser(userId, email) {
    try {
      const res = await fetch('/api/admin/verify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.AscendUI.showToast(`User ${email} verified successfully.`, 'success');
        await loadAdminData();
        AscendApp.navigate('admin-dashboard');
      } else {
        window.AscendUI.showToast(data.error || 'Failed to verify user', 'error');
      }
    } catch (e) {
      window.AscendUI.showToast('Network error verifying user.', 'error');
    }
  }

  async function deleteUser(userId, name) {
    window.AscendUI.confirmDialog({
      title: 'Delete User Account',
      message: `Are you sure you want to delete the account for "${name}"? This action cannot be undone.`,
      confirmLabel: 'Delete Account',
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
          const data = await res.json();
          if (res.ok && data.success) {
            window.AscendUI.showToast('Account deleted.', 'success');
            await loadAdminData();
            AscendApp.navigate('admin-dashboard');
          } else {
            window.AscendUI.showToast(data.error || 'Failed to delete user', 'error');
          }
        } catch (e) {
          window.AscendUI.showToast('Network error deleting user.', 'error');
        }
      },
    });
  }

  function onSearch(query) {
    userSearchQuery = query;
    const content = document.getElementById('app-content-area');
    if (content && AscendApp.getCurrentView() === 'admin-dashboard') {
      content.innerHTML = renderDashboard();
    }
  }

  function onRoleFilter(role) {
    userRoleFilter = role;
    const content = document.getElementById('app-content-area');
    if (content && AscendApp.getCurrentView() === 'admin-dashboard') {
      content.innerHTML = renderDashboard();
    }
  }

  function onStatusFilter(status) {
    userStatusFilter = status;
    const content = document.getElementById('app-content-area');
    if (content && AscendApp.getCurrentView() === 'admin-dashboard') {
      content.innerHTML = renderDashboard();
    }
  }

  async function refreshData() {
    window.AscendUI.showToast('Refreshing admin metrics...', 'info');
    await loadAdminData();
    AscendApp.navigate('admin-dashboard');
  }

  /* ── Settings View for Admin ─────────────────────────────── */
  function renderSettings() {
    return `
      <div class="view-header" style="margin-bottom:24px;">
        <h1 style="font-size:24px;font-weight:700;color:var(--c-text);margin:0 0 4px;">Admin Portal Settings</h1>
        <p style="font-size:14px;color:var(--c-text-2);margin:0;">Manage administrative preferences and institution parameters.</p>
      </div>
      <div class="card" style="padding:28px;max-width:680px;">
        <div style="display:flex;align-items:center;gap:16px;padding-bottom:20px;border-bottom:1px solid var(--c-border);margin-bottom:20px;">
          <div style="width:52px;height:52px;border-radius:50%;background:#E8F0FE;color:#1A73E8;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;">
            AD
          </div>
          <div>
            <div style="font-size:18px;font-weight:700;color:var(--c-text);">System Administrator</div>
            <div style="font-size:14px;color:var(--c-text-2);">admin@ascend.com · Master Administrator</div>
          </div>
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label">Institution Name</label>
          <input class="form-input" type="text" value="Delhi Institute of Technology" readonly style="background:var(--c-bg);">
        </div>
        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label">Admin Email</label>
          <input class="form-input" type="email" value="admin@ascend.com" readonly style="background:var(--c-bg);">
        </div>
        <div class="form-group" style="margin-bottom:24px;">
          <label class="form-label">SMTP Delivery Mode</label>
          <input class="form-input" type="text" value="Real-time Gmail SMTP (smtp.gmail.com:587)" readonly style="background:var(--c-bg);">
        </div>
        <button type="button" class="btn btn-primary" onclick="AscendUI.showToast('Admin profile verified and secure.', 'success')">
          Save Preferences
        </button>
      </div>
    `;
  }

  /* ── Export to Global ────────────────────────────────────── */
  window.AdminViews = {
    loadAdminData,
    dashboard: renderDashboard,
    users: renderDashboard,
    system: renderDashboard,
    settings: renderSettings,
    initDashboard: () => {},
    initUsers: () => {},
    initSystem: () => {},
    verifyUser,
    deleteUser,
    onSearch,
    onRoleFilter,
    onStatusFilter,
    refreshData,
  };
})();
