/**
 * ASCEND – HOD / Department Coordinator Settings View
 * Registered explicitly on route: #hod-settings
 * Manages department identity, programmes, academic periods, notification preferences,
 * and assigned departmental scope.
 */

(function () {
  window.HODViews = window.HODViews || {};

  /* Accessible Switch Helper for HOD Settings */
  function renderHODSwitch(id, checked, key) {
    return `
      <button
        id="${id}"
        role="switch"
        aria-checked="${checked ? 'true' : 'false'}"
        class="ascend-switch ${checked ? 'ascend-switch--on' : ''}"
        onclick="HODViews.togglePreference('${key}', this)"
        type="button"
        aria-label="${id.replace(/-/g,' ')}"
        style="flex-shrink:0;">
        <span class="ascend-switch__track" aria-hidden="true">
          <span class="ascend-switch__knob"></span>
        </span>
      </button>`;
  }

  window.HODViews.togglePreference = function (key, btn) {
    const isOn = btn.getAttribute('aria-checked') === 'true';
    const newState = !isOn;
    btn.setAttribute('aria-checked', newState ? 'true' : 'false');
    btn.classList.toggle('ascend-switch--on', newState);

    const updateObj = { notifications: {} };
    updateObj.notifications[key] = newState;
    window.AscendHODData.updateSettings(updateObj);
    window.AscendUI.showToast('Department preference saved.', 'success');
  };

  window.HODViews.saveIdentity = function (e) {
    e.preventDefault();
    const deptName = document.getElementById('hod-dept-name')?.value.trim();
    const deptCode = document.getElementById('hod-dept-code')?.value.trim();
    const coordName = document.getElementById('hod-coord-name')?.value.trim();
    const office = document.getElementById('hod-office-loc')?.value.trim();
    const email = document.getElementById('hod-email')?.value.trim();

    window.AscendHODData.updateSettings({
      departmentName: deptName,
      departmentCode: deptCode,
      coordinatorName: coordName,
      officeLocation: office,
      email: email,
    });
    window.AscendUI.showToast('Department identity updated successfully.', 'success');
  };

  window.HODViews.settings = function () {
    const { Icons } = window.AscendUI;
    const { settings, hodUser } = window.AscendHODData;
    const notifs = settings.notifications;

    return `
      <style>
        .settings-grid {
          display: grid;
          grid-template-columns: 7fr 5fr;
          gap: var(--sp-6);
          align-items: start;
        }
        @media (max-width: 992px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>

      <!-- ── Page Header ────────────────────────────────────────────── -->
      <div style="margin-bottom:var(--sp-5);">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;color:var(--c-text);margin:0;">
            Department Settings
          </h1>
          <span class="badge badge-primary" style="font-size:11px;">#hod-settings</span>
        </div>
        <div style="font-size:var(--text-sm);color:var(--c-text-2);">
          Departmental profile, active degree programmes, academic period parameters, and notification alerts.
        </div>
      </div>

      <div class="settings-grid">

        <!-- Left Column: Department Identity & Academic Periods -->
        <div style="display:flex;flex-direction:column;gap:var(--sp-5);">

          <!-- Department Identity Form -->
          <div class="card" style="padding:var(--sp-6);">
            <div style="margin-bottom:var(--sp-4);padding-bottom:var(--sp-3);border-bottom:1px solid var(--c-border);">
              <h2 style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin:0 0 4px;">
                Department Identity
              </h2>
              <div style="font-size:var(--text-xs);color:var(--c-text-2);">
                Institutional registration and coordinator contact details
              </div>
            </div>

            <form onsubmit="HODViews.saveIdentity(event)">
              <div class="form-group" style="margin-bottom:var(--sp-4);">
                <label class="form-label" for="hod-dept-name">Department Name</label>
                <input class="form-input" id="hod-dept-name" type="text" value="${settings.departmentName}" required>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-3);margin-bottom:var(--sp-4);">
                <div class="form-group">
                  <label class="form-label" for="hod-dept-code">Department Code</label>
                  <input class="form-input" id="hod-dept-code" type="text" value="${settings.departmentCode}" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="hod-inst-name">Institution</label>
                  <input class="form-input" id="hod-inst-name" type="text" value="${settings.institution}" readonly style="background:var(--c-bg);">
                </div>
              </div>

              <div class="form-group" style="margin-bottom:var(--sp-4);">
                <label class="form-label" for="hod-coord-name">HOD / Department Coordinator Name</label>
                <input class="form-input" id="hod-coord-name" type="text" value="${settings.coordinatorName}" required>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-3);margin-bottom:var(--sp-5);">
                <div class="form-group">
                  <label class="form-label" for="hod-office-loc">Office Location</label>
                  <input class="form-input" id="hod-office-loc" type="text" value="${settings.officeLocation}">
                </div>
                <div class="form-group">
                  <label class="form-label" for="hod-email">Official Email</label>
                  <input class="form-input" id="hod-email" type="email" value="${settings.email}" required>
                </div>
              </div>

              <div style="display:flex;justify-content:flex-end;">
                <button type="submit" class="btn btn-primary btn-sm">
                  Save Department Profile
                </button>
              </div>
            </form>
          </div>

          <!-- Academic Periods & Evaluation Deadlines -->
          <div class="card" style="padding:var(--sp-6);">
            <div style="margin-bottom:var(--sp-4);padding-bottom:var(--sp-3);border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;">
              <div>
                <h2 style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin:0 0 4px;">
                  Academic Periods &amp; Deadlines
                </h2>
                <div style="font-size:var(--text-xs);color:var(--c-text-2);">
                  Active semester terms and student rubric evaluation cutoff dates
                </div>
              </div>
              <span class="badge badge-verified" style="font-size:10px;">2026–27 Cycle Active</span>
            </div>

            <div style="display:flex;flex-direction:column;gap:12px;">
              ${settings.academicPeriods.map(p => `
                <div style="padding:12px 14px;background:#FAFBFD;border:1px solid var(--c-border-subtle);border-radius:var(--r-md);display:flex;align-items:center;justify-content:space-between;gap:12px;">
                  <div>
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
                      <span style="font-size:var(--text-xs);font-weight:700;color:var(--c-text);">${p.name}</span>
                      ${p.active ? '<span class="badge badge-primary" style="font-size:10px;">Current</span>' : ''}
                    </div>
                    <div style="font-size:11px;color:var(--c-text-3);">
                      Term: ${p.start} to ${p.end} &bull; Evaluation Cutoff: <strong style="color:#B06000;">${p.evalDeadline}</strong>
                    </div>
                  </div>
                  <button type="button" class="btn btn-outline btn-sm" onclick="AscendUI.showToast('Academic period editing is managed institutionally.','info')" style="font-size:11px;">
                    Edit Cutoff
                  </button>
                </div>`).join('')}
            </div>
          </div>
        </div>

        <!-- Right Column: Programmes, Scope, and Notification Preferences -->
        <div style="display:flex;flex-direction:column;gap:var(--sp-5);">

          <!-- Departmental Scope Summary -->
          <div class="card" style="padding:var(--sp-6);">
            <div style="margin-bottom:var(--sp-4);padding-bottom:var(--sp-3);border-bottom:1px solid var(--c-border);">
              <h2 style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin:0 0 4px;">
                Assigned Department Scope
              </h2>
              <div style="font-size:var(--text-xs);color:var(--c-text-2);">
                Primary departmental coverage and allied oversight
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;text-align:center;margin-bottom:var(--sp-4);">
              <div style="padding:10px;background:#F8FAFD;border:1px solid #D2E3FC;border-radius:var(--r-md);">
                <div style="font-size:10px;text-transform:uppercase;color:var(--c-text-3);font-weight:700;">Classes</div>
                <div style="font-size:20px;font-weight:700;color:var(--c-primary);">${settings.scope.totalClasses}</div>
              </div>
              <div style="padding:10px;background:#F8FAFD;border:1px solid #D2E3FC;border-radius:var(--r-md);">
                <div style="font-size:10px;text-transform:uppercase;color:var(--c-text-3);font-weight:700;">Students</div>
                <div style="font-size:20px;font-weight:700;color:var(--c-text);">${settings.scope.totalStudents}</div>
              </div>
              <div style="padding:10px;background:#F8FAFD;border:1px solid #D2E3FC;border-radius:var(--r-md);">
                <div style="font-size:10px;text-transform:uppercase;color:var(--c-text-3);font-weight:700;">Faculty</div>
                <div style="font-size:20px;font-weight:700;color:#166534;">${settings.scope.totalFaculty}</div>
              </div>
            </div>

            <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-bottom:var(--sp-3);font-weight:600;">
              Programmes under Department Oversight:
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${settings.programmes.map(prog => `
                <div style="padding:8px 12px;background:#FAFAFA;border:1px solid var(--c-border-subtle);border-radius:var(--r-sm);display:flex;align-items:center;justify-content:space-between;font-size:var(--text-xs);">
                  <span style="font-weight:600;color:var(--c-text);">${prog.name}</span>
                  <span class="badge badge-draft" style="font-size:10px;">${prog.cohorts} section${prog.cohorts > 1 ? 's' : ''}</span>
                </div>`).join('')}
            </div>
          </div>

          <!-- Notification Preferences -->
          <div class="card" style="padding:var(--sp-6);">
            <div style="margin-bottom:var(--sp-4);padding-bottom:var(--sp-3);border-bottom:1px solid var(--c-border);">
              <h2 style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin:0 0 4px;">
                Coordinator Notification Preferences
              </h2>
              <div style="font-size:var(--text-xs);color:var(--c-text-2);">
                Automated email alerts and departmental monitoring digests
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:14px;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
                <div>
                  <div style="font-size:var(--text-xs);font-weight:600;color:var(--c-text);">Weekly Department Summary Digest</div>
                  <div style="font-size:11px;color:var(--c-text-3);">Email digest of cross-cohort portfolio updates and submissions</div>
                </div>
                ${renderHODSwitch('sw-weekly-digest', notifs.weeklyDigest, 'weeklyDigest')}
              </div>

              <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
                <div>
                  <div style="font-size:var(--text-xs);font-weight:600;color:var(--c-text);">Low-Activity Cohort Alerts</div>
                  <div style="font-size:11px;color:var(--c-text-3);">Notify when a class has fewer than 10 updates in 30 days</div>
                </div>
                ${renderHODSwitch('sw-low-activity', notifs.lowActivityAlerts, 'lowActivityAlerts')}
              </div>

              <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
                <div>
                  <div style="font-size:var(--text-xs);font-weight:600;color:var(--c-text);">Unassigned Class Alerts</div>
                  <div style="font-size:11px;color:var(--c-text-3);">Immediate alert when a cohort lacks an active faculty advisor</div>
                </div>
                ${renderHODSwitch('sw-unassigned', notifs.unassignedClassAlerts, 'unassignedClassAlerts')}
              </div>

              <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
                <div>
                  <div style="font-size:var(--text-xs);font-weight:600;color:var(--c-text);">Evaluation Deadline Reminders</div>
                  <div style="font-size:11px;color:var(--c-text-3);">Alerts at 14 days, 7 days, and 48 hours before cycle cutoff</div>
                </div>
                ${renderHODSwitch('sw-eval-deadlines', notifs.evaluationDeadlines, 'evaluationDeadlines')}
              </div>

              <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
                <div>
                  <div style="font-size:var(--text-xs);font-weight:600;color:var(--c-text);">Faculty Workload Changes</div>
                  <div style="font-size:11px;color:var(--c-text-3);">Confirmations when mentors are assigned or reassigned</div>
                </div>
                ${renderHODSwitch('sw-workload-updates', notifs.facultyAssignmentUpdates, 'facultyAssignmentUpdates')}
              </div>
            </div>
          </div>
        </div>
      </div>`;
  };
})();
