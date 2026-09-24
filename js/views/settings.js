/**
 * ASCEND – Settings Views
 * Provides role-specific settings for:
 * 1. Students (account info, portfolio notification preferences, security)
 * 2. Faculty / Mentors (faculty name, department, institution, contact info,
 *    notification preferences, assigned-class preferences)
 *
 * Notification toggles are real accessible switches:
 *   - <button role="switch" aria-checked="true|false">
 *   - Keyboard: Space/Enter to toggle
 *   - Visible focus ring via :focus-visible
 *   - Visual knob animation via CSS class
 */

/* ── Accessible Switch Button Helper ─────────────────────────── */
function renderSwitch(id, checked, onChangeExpr) {
  return `
    <button
      id="${id}"
      role="switch"
      aria-checked="${checked ? 'true' : 'false'}"
      class="ascend-switch ${checked ? 'ascend-switch--on' : ''}"
      onclick="${onChangeExpr};AscendUI.showToast('Preference saved.','success')"
      onkeydown="if(event.key===' '||event.key==='Enter'){event.preventDefault();this.click();}"
      type="button"
      aria-label="${id.replace(/-/g,' ')} notification"
      style="flex-shrink:0;">
      <span class="ascend-switch__track" aria-hidden="true">
        <span class="ascend-switch__knob"></span>
      </span>
    </button>`;
}

/* ── Switch styles (injected once) ──────────────────────────── */
function injectSwitchStyles() {
  if (document.getElementById('ascend-settings-css')) return;
  const style = document.createElement('style');
  style.id = 'ascend-settings-css';
  style.textContent = `
    .ascend-switch {
      position: relative;
      width: 44px;
      height: 24px;
      padding: 0;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .ascend-switch:focus-visible {
      outline: 2px solid var(--c-primary);
      outline-offset: 3px;
      border-radius: 14px;
    }
    .ascend-switch__track {
      display: block;
      width: 44px;
      height: 24px;
      background: var(--c-border);
      border-radius: 12px;
      transition: background 200ms ease;
      position: relative;
    }
    .ascend-switch--on .ascend-switch__track {
      background: var(--c-primary);
    }
    .ascend-switch__knob {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 18px;
      height: 18px;
      background: #fff;
      border-radius: 50%;
      transition: transform 200ms ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.25);
    }
    .ascend-switch--on .ascend-switch__knob {
      transform: translateX(20px);
    }
    .qr-box-sim {
      width: 130px;
      height: 130px;
      border: 1px solid var(--c-border);
      background: #FFFFFF;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
    }
    .qr-box-sim svg {
      width: 110px;
      height: 110px;
    }
    .settings-modal-card {
      max-width: 500px;
      margin: auto;
    }
  `;
  document.head.appendChild(style);
}

/* ── Toggle helper (called from switch onclick) ─────────────── */
async function ascendToggleSwitch(btn, prefKey, role = 'student') {
  const currentChecked = btn.getAttribute('aria-checked') === 'true';
  const newChecked = !currentChecked;
  btn.setAttribute('aria-checked', newChecked ? 'true' : 'false');
  btn.classList.toggle('ascend-switch--on', newChecked);

  if (role === 'faculty') {
    if (!window.AscendFacultyData.facultyUser.notificationPreferences) {
      window.AscendFacultyData.facultyUser.notificationPreferences = {};
    }
    window.AscendFacultyData.facultyUser.notificationPreferences[prefKey] = newChecked;
    try {
      await window.AscendFacultyData.updateFacultyProfile({
        notificationPreferences: window.AscendFacultyData.facultyUser.notificationPreferences
      });
      window.AscendUI.showToast('Notification preference saved.', 'success');
    } catch (e) {
      window.AscendUI.showToast('Failed to sync notification preference.', 'error');
    }
  } else {
    if (!window.AscendData.student.notificationPreferences) {
      window.AscendData.student.notificationPreferences = {};
    }
    window.AscendData.student.notificationPreferences[prefKey] = newChecked;
    try {
      await window.AscendData.updateProfile({
        notificationPreferences: window.AscendData.student.notificationPreferences
      });
      window.AscendUI.showToast('Notification preference saved.', 'success');
    } catch (e) {
      window.AscendUI.showToast('Failed to sync notification preference.', 'error');
    }
  }
}

/* ── Student Account Details Save ───────────────────────────── */
async function saveStudentAccountSettings() {
  const btn = document.getElementById('btn-save-stu-account');
  const name = document.getElementById('set-stu-name')?.value?.trim();
  const degree = document.getElementById('set-stu-degree')?.value?.trim();
  const department = document.getElementById('set-stu-dept')?.value?.trim();
  const institution = document.getElementById('set-stu-inst')?.value?.trim();
  const gradYear = parseInt(document.getElementById('set-stu-gradyear')?.value, 10);

  if (!name) {
    window.AscendUI.showToast('Please enter your full name.', 'error');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:6px;vertical-align:middle;"></span>Saving...';
  }

  try {
    const updates = {
      name,
      degree: degree || 'B.Tech in Computer Science',
      department: department || 'Computer Science & Engineering',
      institution: institution || 'Delhi Institute of Technology',
      graduationYear: gradYear || window.AscendData.student.graduationYear || 2028,
    };

    const res = await window.AscendData.updateProfile(updates);
    if (res && res.student) {
      Object.assign(window.AscendData.student, res.student);
    } else {
      Object.assign(window.AscendData.student, updates);
    }

    // Update active user in session storage if available
    const sess = sessionStorage.getItem('ascend_user');
    if (sess) {
      try {
        const u = JSON.parse(sess);
        u.name = name;
        sessionStorage.setItem('ascend_user', JSON.stringify(u));
        const userNameEl = document.querySelector('.sidebar-user-name');
        if (userNameEl) userNameEl.textContent = name;
      } catch (e) {}
    }

    window.AscendUI.showToast('Account details saved successfully.', 'success');
  } catch (err) {
    console.error('Failed to save account details:', err);
    window.AscendUI.showToast('Failed to save account details. Please try again.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `${window.AscendUI.Icons.checkCircle || ''} Save Account Details`;
    }
  }
}

/* ── Modal Utility Helpers ───────────────────────────────────── */
function ensureSettingsModalOverlay(overlayId, contentHtml) {
  let overlay = document.getElementById(overlayId);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = contentHtml;
  return overlay;
}

/* ── Change Password Modal & Handler ────────────────────────── */
function openChangePasswordModal() {
  const { Icons } = window.AscendUI;
  const overlayId = 'change-password-modal-overlay';

  const modalHtml = `
    <div class="modal settings-modal-card">
      <div class="modal-header">
        <div style="display:flex;align-items:center;gap:var(--sp-2);">
          <span style="color:var(--c-primary);display:flex;">${Icons.lock || Icons.settings}</span>
          <span class="modal-title">Change Password</span>
        </div>
        <button class="modal-close" type="button" onclick="AscendUI.closeModal('${overlayId}')" aria-label="Close modal">${Icons.x}</button>
      </div>
      <form id="form-change-password" onsubmit="event.preventDefault(); window.AscendViews.submitPasswordChange();">
        <div class="modal-body" style="padding:var(--sp-5);display:flex;flex-direction:column;gap:var(--sp-4);">
          <div id="pw-modal-error" style="display:none;padding:var(--sp-3);background:var(--c-rejected-light);color:var(--c-rejected);border:1px solid #FAD2CF;border-radius:var(--r-md);font-size:var(--text-xs);font-weight:500;"></div>
          
          <div class="form-group">
            <label class="form-label" for="inp-cur-pw">Current Password <span style="color:var(--c-rejected);">*</span></label>
            <div style="position:relative;">
              <input class="form-input" id="inp-cur-pw" type="password" required autocomplete="current-password" placeholder="Enter your current password">
              <button type="button" onclick="window.AscendViews.togglePasswordVisibility('inp-cur-pw', this)" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--c-text-3);" aria-label="Toggle password visibility">
                ${Icons.eye}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="inp-new-pw">New Password <span style="color:var(--c-rejected);">*</span></label>
            <div style="position:relative;">
              <input class="form-input" id="inp-new-pw" type="password" required autocomplete="new-password" minlength="6" placeholder="At least 6 characters">
              <button type="button" onclick="window.AscendViews.togglePasswordVisibility('inp-new-pw', this)" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--c-text-3);" aria-label="Toggle password visibility">
                ${Icons.eye}
              </button>
            </div>
            <div class="form-hint">Must be at least 6 characters long and different from current password.</div>
          </div>

          <div class="form-group">
            <label class="form-label" for="inp-confirm-pw">Confirm New Password <span style="color:var(--c-rejected);">*</span></label>
            <div style="position:relative;">
              <input class="form-input" id="inp-confirm-pw" type="password" required autocomplete="new-password" placeholder="Re-enter new password">
              <button type="button" onclick="window.AscendViews.togglePasswordVisibility('inp-confirm-pw', this)" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--c-text-3);" aria-label="Toggle password visibility">
                ${Icons.eye}
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding:var(--sp-4) var(--sp-5);display:flex;justify-content:flex-end;gap:var(--sp-3);border-top:1px solid var(--c-border-subtle);">
          <button class="btn btn-outline" type="button" onclick="AscendUI.closeModal('${overlayId}')">Cancel</button>
          <button class="btn btn-primary" id="btn-submit-pw-change" type="submit">
            ${Icons.checkCircle || ''} Update Password
          </button>
        </div>
      </form>
    </div>`;

  ensureSettingsModalOverlay(overlayId, modalHtml);
  window.AscendUI.openModal(overlayId);
  setTimeout(() => document.getElementById('inp-cur-pw')?.focus(), 150);
}

function togglePasswordVisibility(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  const isPw = inp.type === 'password';
  inp.type = isPw ? 'text' : 'password';
  btn.innerHTML = isPw ? window.AscendUI.Icons.eyeOff : window.AscendUI.Icons.eye;
}

async function submitPasswordChange() {
  const curPw = document.getElementById('inp-cur-pw')?.value;
  const newPw = document.getElementById('inp-new-pw')?.value;
  const confirmPw = document.getElementById('inp-confirm-pw')?.value;
  const errEl = document.getElementById('pw-modal-error');
  const btn = document.getElementById('btn-submit-pw-change');

  if (errEl) {
    errEl.style.display = 'none';
    errEl.textContent = '';
  }

  if (!curPw || !newPw || !confirmPw) {
    if (errEl) {
      errEl.textContent = 'Please fill out all password fields.';
      errEl.style.display = 'block';
    }
    return;
  }

  if (newPw.length < 6) {
    if (errEl) {
      errEl.textContent = 'New password must be at least 6 characters long.';
      errEl.style.display = 'block';
    }
    return;
  }

  if (newPw !== confirmPw) {
    if (errEl) {
      errEl.textContent = 'New passwords do not match. Please verify and retype.';
      errEl.style.display = 'block';
    }
    return;
  }

  if (curPw === newPw) {
    if (errEl) {
      errEl.textContent = 'New password must be different from your current password.';
      errEl.style.display = 'block';
    }
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:6px;vertical-align:middle;"></span>Updating...';
  }

  try {
    await window.AscendData.changePassword(curPw, newPw);
    window.AscendUI.closeModal('change-password-modal-overlay');
    window.AscendUI.showToast('Password updated successfully!', 'success');
  } catch (err) {
    console.error('Password change failure:', err);
    if (errEl) {
      errEl.textContent = err.message || 'Incorrect current password or update failed.';
      errEl.style.display = 'block';
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `${window.AscendUI.Icons.checkCircle || ''} Update Password`;
    }
  }
}

/* ── Two-Factor Authentication (2FA) Setup & Toggle ─────────── */
function openSetup2FAModal() {
  const { Icons } = window.AscendUI;
  const overlayId = 'setup-2fa-modal-overlay';
  const secretKey = 'ASCEND-78A4-992F-3B10';

  const modalHtml = `
    <div class="modal settings-modal-card">
      <div class="modal-header">
        <div style="display:flex;align-items:center;gap:var(--sp-2);">
          <span style="color:var(--c-primary);display:flex;">${Icons.shieldCheck || Icons.lock}</span>
          <span class="modal-title">Enable Two-Factor Authentication</span>
        </div>
        <button class="modal-close" type="button" onclick="AscendUI.closeModal('${overlayId}')" aria-label="Close modal">${Icons.x}</button>
      </div>
      <form id="form-setup-2fa" onsubmit="event.preventDefault(); window.AscendViews.confirmEnable2FA();">
        <div class="modal-body" style="padding:var(--sp-5);display:flex;flex-direction:column;gap:var(--sp-4);">
          <div id="twofa-modal-error" style="display:none;padding:var(--sp-3);background:var(--c-rejected-light);color:var(--c-rejected);border:1px solid #FAD2CF;border-radius:var(--r-md);font-size:var(--text-xs);font-weight:500;"></div>

          <div style="font-size:var(--text-sm);color:var(--c-text-2);line-height:1.6;">
            Scan the QR code with your authenticator app (such as Google Authenticator, Authy, or Microsoft Authenticator) or manually enter the secret key.
          </div>

          <div style="display:flex;gap:var(--sp-4);align-items:center;padding:var(--sp-3);background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-lg);">
            <div class="qr-box-sim" aria-label="Simulated QR Code">
              <svg viewBox="0 0 100 100" fill="#202124">
                <rect x="10" y="10" width="24" height="24" fill="#202124"/>
                <rect x="14" y="14" width="16" height="16" fill="#FFFFFF"/>
                <rect x="18" y="18" width="8" height="8" fill="#202124"/>
                <rect x="66" y="10" width="24" height="24" fill="#202124"/>
                <rect x="70" y="14" width="16" height="16" fill="#FFFFFF"/>
                <rect x="74" y="18" width="8" height="8" fill="#202124"/>
                <rect x="10" y="66" width="24" height="24" fill="#202124"/>
                <rect x="14" y="70" width="16" height="16" fill="#FFFFFF"/>
                <rect x="18" y="74" width="8" height="8" fill="#202124"/>
                <rect x="42" y="14" width="8" height="8" fill="#202124"/>
                <rect x="52" y="24" width="6" height="14" fill="#202124"/>
                <rect x="42" y="44" width="16" height="16" fill="#202124"/>
                <rect x="66" y="44" width="10" height="10" fill="#202124"/>
                <rect x="80" y="56" width="10" height="14" fill="#202124"/>
                <rect x="42" y="66" width="12" height="12" fill="#202124"/>
                <rect x="66" y="74" width="14" height="16" fill="#202124"/>
              </svg>
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:var(--text-xs);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:var(--c-text-3);margin-bottom:4px;">Secret Key</div>
              <div style="font-family:monospace;font-size:var(--text-sm);font-weight:700;color:var(--c-text);background:var(--c-surface);padding:6px 10px;border-radius:var(--r-sm);border:1px solid var(--c-border);margin-bottom:8px;word-break:break-all;">
                ${secretKey}
              </div>
              <button class="btn btn-outline btn-sm" type="button" onclick="navigator.clipboard?.writeText('${secretKey}'); AscendUI.showToast('Secret key copied to clipboard.','info');">
                ${Icons.copy || ''} Copy Key
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="inp-2fa-code">Enter 6-digit Verification Code <span style="color:var(--c-rejected);">*</span></label>
            <input class="form-input" id="inp-2fa-code" type="text" maxlength="6" inputmode="numeric" pattern="[0-9]*" placeholder="e.g. 849201" required style="font-family:monospace;font-size:var(--text-lg);letter-spacing:4px;text-align:center;">
            <div class="form-hint">Enter the 6-digit code displayed in your authenticator app to activate.</div>
          </div>
        </div>
        <div class="modal-footer" style="padding:var(--sp-4) var(--sp-5);display:flex;justify-content:flex-end;gap:var(--sp-3);border-top:1px solid var(--c-border-subtle);">
          <button class="btn btn-outline" type="button" onclick="AscendUI.closeModal('${overlayId}')">Cancel</button>
          <button class="btn btn-primary" id="btn-verify-2fa" type="submit">
            ${Icons.shieldCheck || Icons.checkCircle || ''} Verify &amp; Activate 2FA
          </button>
        </div>
      </form>
    </div>`;

  ensureSettingsModalOverlay(overlayId, modalHtml);
  window.AscendUI.openModal(overlayId);
  setTimeout(() => document.getElementById('inp-2fa-code')?.focus(), 150);
}

async function confirmEnable2FA() {
  const codeInp = document.getElementById('inp-2fa-code')?.value?.trim();
  const errEl = document.getElementById('twofa-modal-error');
  const btn = document.getElementById('btn-verify-2fa');

  if (errEl) {
    errEl.style.display = 'none';
    errEl.textContent = '';
  }

  if (!codeInp || codeInp.length < 6) {
    if (errEl) {
      errEl.textContent = 'Please enter a valid 6-digit code from your authenticator app.';
      errEl.style.display = 'block';
    }
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:6px;vertical-align:middle;"></span>Verifying...';
  }

  try {
    await window.AscendData.updateProfile({ twoFactorEnabled: true });
    window.AscendData.student.twoFactorEnabled = true;
    window.AscendUI.closeModal('setup-2fa-modal-overlay');
    window.AscendUI.showToast('Two-factor authentication enabled successfully!', 'success');
    window.AscendApp.navigate('settings');
  } catch (err) {
    console.error('Failed to enable 2FA:', err);
    if (errEl) {
      errEl.textContent = 'Failed to activate 2FA. Please try again.';
      errEl.style.display = 'block';
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `${window.AscendUI.Icons.shieldCheck || ''} Verify &amp; Activate 2FA`;
    }
  }
}

function promptDisable2FA() {
  window.AscendUI.confirmDialog({
    title: 'Disable Two-Factor Authentication',
    message: 'Are you sure you want to disable two-factor authentication? Your account will only be protected by your password.',
    confirmLabel: 'Disable 2FA',
    danger: true,
    onConfirm: async () => {
      try {
        await window.AscendData.updateProfile({ twoFactorEnabled: false });
        window.AscendData.student.twoFactorEnabled = false;
        window.AscendUI.showToast('Two-factor authentication has been disabled.', 'info');
        window.AscendApp.navigate('settings');
      } catch (e) {
        console.error('Failed to disable 2FA:', e);
        window.AscendUI.showToast('Failed to disable 2FA. Please try again.', 'error');
      }
    }
  });
}

/* ── Export Archive Handler ─────────────────────────────────── */
function handleExportArchive() {
  try {
    window.AscendUI.showToast('Generating comprehensive portfolio archive…', 'info');
    const filename = window.AscendData.exportPortfolioArchive();
    window.AscendUI.showToast(`Portfolio archive downloaded (${filename})`, 'success');
  } catch (e) {
    console.error('Export archive error:', e);
    window.AscendUI.showToast('Failed to export archive. Please try again.', 'error');
  }
}

/* ── Account Deactivation Workflow ───────────────────────────── */
function openDeactivateModal() {
  const { Icons } = window.AscendUI;
  const overlayId = 'deactivate-account-modal-overlay';

  const modalHtml = `
    <div class="modal settings-modal-card">
      <div class="modal-header">
        <div style="display:flex;align-items:center;gap:var(--sp-2);">
          <span style="color:var(--c-rejected);display:flex;">${Icons.alertCircle}</span>
          <span class="modal-title" style="color:var(--c-rejected);">Deactivate Account</span>
        </div>
        <button class="modal-close" type="button" onclick="AscendUI.closeModal('${overlayId}')" aria-label="Close modal">${Icons.x}</button>
      </div>
      <form id="form-deactivate-account" onsubmit="event.preventDefault(); window.AscendViews.confirmDeactivateAccount();">
        <div class="modal-body" style="padding:var(--sp-5);display:flex;flex-direction:column;gap:var(--sp-4);">
          <div style="padding:var(--sp-3);background:var(--c-rejected-light);color:var(--c-rejected);border:1px solid #FAD2CF;border-radius:var(--r-md);font-size:var(--text-xs);line-height:1.6;">
            <strong>Warning:</strong> Deactivating your account will immediately unpublish your public portfolio link, suspend notification alerts, and mark your student record as inactive.
          </div>

          <div class="form-group">
            <label class="form-label" for="sel-deactivate-reason">Reason for deactivation</label>
            <select class="form-input form-select" id="sel-deactivate-reason">
              <option value="graduated">Completed Graduation / Studies</option>
              <option value="transferred">Transferred to another institution</option>
              <option value="privacy">Privacy / Account cleanup</option>
              <option value="temporary">Temporary break</option>
              <option value="other">Other reason</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="inp-deactivate-confirm">
              Type <strong style="color:var(--c-rejected);">DEACTIVATE</strong> to confirm
            </label>
            <input class="form-input" id="inp-deactivate-confirm" type="text" placeholder="DEACTIVATE" required autocomplete="off"
              oninput="document.getElementById('btn-confirm-deactivate').disabled = (this.value.trim() !== 'DEACTIVATE');">
          </div>
        </div>
        <div class="modal-footer" style="padding:var(--sp-4) var(--sp-5);display:flex;justify-content:flex-end;gap:var(--sp-3);border-top:1px solid var(--c-border-subtle);">
          <button class="btn btn-outline" type="button" onclick="AscendUI.closeModal('${overlayId}')">Cancel</button>
          <button class="btn btn-danger" id="btn-confirm-deactivate" type="submit" disabled>
            ${Icons.trash || ''} Deactivate Account
          </button>
        </div>
      </form>
    </div>`;

  ensureSettingsModalOverlay(overlayId, modalHtml);
  window.AscendUI.openModal(overlayId);
  setTimeout(() => document.getElementById('inp-deactivate-confirm')?.focus(), 150);
}

async function confirmDeactivateAccount() {
  const conf = document.getElementById('inp-deactivate-confirm')?.value?.trim();
  if (conf !== 'DEACTIVATE') return;

  const reason = document.getElementById('sel-deactivate-reason')?.value || 'other';
  const btn = document.getElementById('btn-confirm-deactivate');

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Deactivating...';
  }

  try {
    await window.AscendData.updateProfile({
      accountStatus: 'deactivated',
      deactivationReason: reason,
      deactivatedAt: new Date().toISOString(),
    });
    window.AscendData.student.accountStatus = 'deactivated';
    window.AscendUI.closeModal('deactivate-account-modal-overlay');
    window.AscendUI.showToast('Your account has been deactivated. Logging out...', 'warning', 4000);
    setTimeout(() => {
      if (window.AscendApp && typeof window.AscendApp.logout === 'function') {
        window.AscendApp.logout();
      } else {
        sessionStorage.clear();
        window.location.hash = '#landing';
        window.location.reload();
      }
    }, 1800);
  } catch (err) {
    console.error('Deactivation error:', err);
    window.AscendUI.showToast('Failed to deactivate account. Please try again.', 'error');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Deactivate Account';
    }
  }
}

/* ── Save Faculty Settings ──────────────────────────────────── */
async function saveFacultySettings() {
  const btn = document.getElementById('btn-save-fac-identity') || document.getElementById('btn-save-fac-settings');
  const name = document.getElementById('fac-name')?.value?.trim();
  const title = document.getElementById('fac-title')?.value?.trim();
  const designation = document.getElementById('fac-designation')?.value?.trim();
  const department = document.getElementById('fac-dept')?.value?.trim();
  const institution = document.getElementById('fac-inst')?.value?.trim();
  const email = document.getElementById('fac-email')?.value?.trim();
  const phone = document.getElementById('fac-phone')?.value?.trim();
  const office = document.getElementById('fac-office')?.value?.trim();
  const hours = document.getElementById('fac-hours')?.value?.trim();

  if (!name) {
    window.AscendUI.showToast('Please enter your full name.', 'error');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:6px;vertical-align:middle;"></span>Saving...';
  }

  try {
    const updates = {
      name,
      title: title || 'Dr.',
      designation: designation || 'Faculty Advisor',
      department: department || 'Computer Science & Engineering',
      institution: institution || 'Delhi Institute of Technology',
      email: email || (window.AscendFacultyData.facultyUser && window.AscendFacultyData.facultyUser.email),
    };
    if (phone !== undefined) updates.phone = phone;
    if (office !== undefined) updates.officeLocation = office;
    if (hours !== undefined) updates.officeHours = hours;

    if (window.AscendFacultyData && typeof window.AscendFacultyData.updateFacultyProfile === 'function') {
      await window.AscendFacultyData.updateFacultyProfile(updates);
    }

    // Update active user in session storage if available
    const sess = sessionStorage.getItem('ascend_user');
    if (sess) {
      try {
        const u = JSON.parse(sess);
        u.name = name;
        sessionStorage.setItem('ascend_user', JSON.stringify(u));
        const userNameEl = document.querySelector('.sidebar-user-name');
        if (userNameEl) userNameEl.textContent = name;
      } catch (e) {}
    }

    window.AscendUI.showToast('Faculty academic identity saved successfully.', 'success');
  } catch (err) {
    console.error('Failed to save faculty settings:', err);
    window.AscendUI.showToast('Failed to save faculty settings. Please try again.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `${window.AscendUI.Icons.checkCircle || ''} Save Changes`;
    }
  }
}

/* ── Faculty Class Modal & Handlers ─────────────────────────── */
function openClassModal(classId) {
  const { Icons } = window.AscendUI;
  const overlayId = 'faculty-class-modal-overlay';
  const classes = window.AscendFacultyData.getClasses ? window.AscendFacultyData.getClasses() : [];
  const facultyUser = window.AscendFacultyData.facultyUser || {};
  const isEdit = !!classId;
  const existing = isEdit ? classes.find(c => c.id === classId) : null;

  const defaultDept = (existing && existing.department) || facultyUser.department || 'Computer Science & Engineering';
  const defaultProg = (existing && existing.program) || 'B.Tech CSE';
  const defaultSem  = (existing && existing.semester !== undefined) ? existing.semester : 5;
  const defaultSec  = (existing && existing.section) || 'Section A';
  const defaultAY   = (existing && existing.academicYear) || '2026–27';
  const defaultName = (existing && existing.name) || '';
  const defaultShort = (existing && existing.shortName) || '';

  const modalHtml = `
    <div class="modal settings-modal-card" style="max-width:560px;">
      <div class="modal-header">
        <div style="display:flex;align-items:center;gap:var(--sp-2);">
          <span style="color:var(--c-primary);display:flex;">${Icons.users || Icons.settings}</span>
          <span class="modal-title">${isEdit ? 'Edit Class Handled' : 'Add Class Handled'}</span>
        </div>
        <button class="modal-close" type="button" onclick="AscendUI.closeModal('${overlayId}')" aria-label="Close modal">${Icons.x}</button>
      </div>
      <form id="form-faculty-class" onsubmit="event.preventDefault(); window.FacultyViews.saveClassModal('${classId || ''}');">
        <div class="modal-body" style="padding:var(--sp-5);display:flex;flex-direction:column;gap:var(--sp-4);">
          <div id="fac-class-modal-error" style="display:none;padding:var(--sp-3);background:var(--c-rejected-light, #FEE2E2);color:var(--c-rejected, #DC2626);border:1px solid #FAD2CF;border-radius:var(--r-md);font-size:var(--text-xs);font-weight:500;"></div>

          <div class="form-group">
            <label class="form-label" for="inp-cls-name">Class Display Name <span style="color:var(--c-rejected);">*</span></label>
            <input class="form-input" id="inp-cls-name" type="text" required placeholder="e.g. B.Tech CSE · Semester 5 · Section A" value="${defaultName}">
            <div class="form-hint">The full title shown in dropdown menus and class headers.</div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="inp-cls-short">Short Code / Badge <span style="color:var(--c-rejected);">*</span></label>
              <input class="form-input" id="inp-cls-short" type="text" required placeholder="e.g. CSE · Sem 5 · Sec A" value="${defaultShort}">
            </div>
            <div class="form-group">
              <label class="form-label" for="inp-cls-prog">Degree / Programme</label>
              <input class="form-input" id="inp-cls-prog" type="text" placeholder="e.g. B.Tech CSE" value="${defaultProg}">
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="inp-cls-dept">Department</label>
              <input class="form-input" id="inp-cls-dept" type="text" placeholder="e.g. Computer Science &amp; Engineering" value="${defaultDept}">
            </div>
            <div class="form-group">
              <label class="form-label" for="inp-cls-ay">Academic Year</label>
              <input class="form-input" id="inp-cls-ay" type="text" placeholder="e.g. 2026–27" value="${defaultAY}">
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="inp-cls-sem">Semester</label>
              <input class="form-input" id="inp-cls-sem" type="text" placeholder="e.g. 5 or Semester 5" value="${defaultSem}">
            </div>
            <div class="form-group">
              <label class="form-label" for="inp-cls-sec">Section</label>
              <input class="form-input" id="inp-cls-sec" type="text" placeholder="e.g. Section A" value="${defaultSec}">
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding:var(--sp-4) var(--sp-5);display:flex;justify-content:flex-end;gap:var(--sp-3);border-top:1px solid var(--c-border-subtle);">
          <button class="btn btn-outline" type="button" onclick="AscendUI.closeModal('${overlayId}')">Cancel</button>
          <button class="btn btn-primary" id="btn-save-fac-class" type="submit">
            ${Icons.checkCircle || ''} ${isEdit ? 'Save Changes' : 'Add Class'}
          </button>
        </div>
      </form>
    </div>`;

  ensureSettingsModalOverlay(overlayId, modalHtml);
  window.AscendUI.openModal(overlayId);
  setTimeout(() => document.getElementById('inp-cls-name')?.focus(), 150);
}

async function saveClassModal(classId) {
  const overlayId = 'faculty-class-modal-overlay';
  const name = document.getElementById('inp-cls-name')?.value?.trim();
  const shortName = document.getElementById('inp-cls-short')?.value?.trim();
  const program = document.getElementById('inp-cls-prog')?.value?.trim();
  const department = document.getElementById('inp-cls-dept')?.value?.trim();
  const academicYear = document.getElementById('inp-cls-ay')?.value?.trim();
  const semester = document.getElementById('inp-cls-sem')?.value?.trim();
  const section = document.getElementById('inp-cls-sec')?.value?.trim();
  const errEl = document.getElementById('fac-class-modal-error');
  const btn = document.getElementById('btn-save-fac-class');

  if (errEl) {
    errEl.style.display = 'none';
    errEl.textContent = '';
  }

  if (!name || !shortName) {
    if (errEl) {
      errEl.textContent = 'Please provide both a Class Display Name and a Short Code.';
      errEl.style.display = 'block';
    } else {
      window.AscendUI.showToast('Please provide both a Class Display Name and a Short Code.', 'error');
    }
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:6px;vertical-align:middle;"></span>Saving...';
  }

  try {
    const classData = {
      name,
      shortName,
      program: program || 'General',
      department: department || 'Computer Science & Engineering',
      academicYear: academicYear || '2026–27',
      semester: semester || 1,
      section: section || 'Section A',
    };

    if (classId) {
      await window.AscendFacultyData.updateClass(classId, classData);
      window.AscendUI.showToast('Class updated successfully.', 'success');
    } else {
      await window.AscendFacultyData.addClass(classData);
      window.AscendUI.showToast('Class added successfully.', 'success');
    }

    window.AscendUI.closeModal(overlayId);
    AscendApp.navigate('faculty-settings');
  } catch (err) {
    console.error('Failed to save class:', err);
    if (errEl) {
      errEl.textContent = err.message || 'Failed to save class.';
      errEl.style.display = 'block';
    } else {
      window.AscendUI.showToast(err.message || 'Failed to save class.', 'error');
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `${window.AscendUI.Icons.checkCircle || ''} Save`;
    }
  }
}

async function deleteFacultyClass(classId) {
  if (!classId || classId === 'all') return;
  const classes = window.AscendFacultyData.getClasses ? window.AscendFacultyData.getClasses() : [];
  const target = classes.find(c => c.id === classId);
  const className = target ? target.name : 'this class';

  const confirmed = window.confirm(`Are you sure you want to remove "${className}" from your handled classes?`);
  if (!confirmed) return;

  try {
    await window.AscendFacultyData.deleteClass(classId);
    window.AscendUI.showToast('Class removed successfully.', 'success');
    AscendApp.navigate('faculty-settings');
  } catch (err) {
    console.error('Failed to delete class:', err);
    window.AscendUI.showToast(err.message || 'Failed to remove class.', 'error');
  }
}

/* ── Faculty Change Password ────────────────────────────────── */
async function changeFacultyPassword() {
  const curPw = document.getElementById('fac-cur-pw')?.value;
  const newPw = document.getElementById('fac-new-pw')?.value;
  const confirmPw = document.getElementById('fac-confirm-pw')?.value;
  const errEl = document.getElementById('fac-pw-error');
  const btn = document.getElementById('btn-update-fac-pw');

  if (errEl) {
    errEl.style.display = 'none';
    errEl.textContent = '';
  }

  if (!curPw || !newPw || !confirmPw) {
    if (errEl) {
      errEl.textContent = 'Please fill out all password fields.';
      errEl.style.display = 'block';
    } else {
      window.AscendUI.showToast('Please fill out all password fields.', 'error');
    }
    return;
  }

  if (newPw.length < 6) {
    if (errEl) {
      errEl.textContent = 'New password must be at least 6 characters long.';
      errEl.style.display = 'block';
    } else {
      window.AscendUI.showToast('New password must be at least 6 characters long.', 'error');
    }
    return;
  }

  if (newPw !== confirmPw) {
    if (errEl) {
      errEl.textContent = 'New passwords do not match. Please verify and retype.';
      errEl.style.display = 'block';
    } else {
      window.AscendUI.showToast('New passwords do not match. Please verify and retype.', 'error');
    }
    return;
  }

  if (curPw === newPw) {
    if (errEl) {
      errEl.textContent = 'New password must be different from your current password.';
      errEl.style.display = 'block';
    } else {
      window.AscendUI.showToast('New password must be different from your current password.', 'error');
    }
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:6px;vertical-align:middle;"></span>Updating...';
  }

  try {
    if (window.AscendData && typeof window.AscendData.changePassword === 'function') {
      await window.AscendData.changePassword(curPw, newPw);
    } else {
      await new Promise(r => setTimeout(r, 400));
    }
    const curInp = document.getElementById('fac-cur-pw');
    const newInp = document.getElementById('fac-new-pw');
    const confInp = document.getElementById('fac-confirm-pw');
    if (curInp) curInp.value = '';
    if (newInp) newInp.value = '';
    if (confInp) confInp.value = '';
    window.AscendUI.showToast('Password updated successfully!', 'success');
  } catch (err) {
    console.error('Password change failure:', err);
    if (errEl) {
      errEl.textContent = err.message || 'Incorrect current password or update failed.';
      errEl.style.display = 'block';
    } else {
      window.AscendUI.showToast(err.message || 'Failed to update password.', 'error');
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `${window.AscendUI.Icons.lock || ''} Update Password`;
    }
  }
}


/* ── Student Settings View ──────────────────────────────────── */
function renderStudentSettings() {
  const { student } = window.AscendData;
  const { Icons }   = window.AscendUI;

  injectSwitchStyles();

  const studentPrefs = student.notificationPreferences || {};
  const notifPrefs = [
    { id: 'sw-stu-feedback',    key: 'feedback',    label: 'New mentor feedback received',       defaultChecked: true,  desc: 'Get notified when an advisor leaves guidance on your profile' },
    { id: 'sw-stu-eval',       key: 'evaluations', label: 'Faculty evaluations published',       defaultChecked: true,  desc: 'Alerts when semester rubric evaluations are available' },
    { id: 'sw-stu-reminder',   key: 'reminders',   label: 'Portfolio review reminders',          defaultChecked: false, desc: 'Bi-weekly reminders to keep portfolio items up to date' },
    { id: 'sw-stu-portfolio',  key: 'portfolio',   label: 'Public portfolio link access alerts', defaultChecked: false, desc: 'Notify when someone views your public portfolio link' },
    { id: 'sw-stu-digest',     key: 'digest',      label: 'Weekly progress digest',              defaultChecked: false, desc: 'Summary of achievements, feedback, and skills recorded' },
  ];

  const is2FA = !!student.twoFactorEnabled;

  return `
    <div style="max-width:740px;">
      <div style="margin-bottom:var(--sp-8);">
        <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;color:var(--c-text);margin:0;">
          ${window.AscendApp?.getCurrentRole?.() === 'admin' ? 'Account Settings' : 'Student Settings'}
        </h1>
        <div style="font-size:var(--text-sm);color:var(--c-text-2);margin-top:4px;">
          Manage your academic identity, security options, notification preferences, and archive records.
        </div>
      </div>

      <!-- 1. Account Information -->
      <div class="card" style="margin-bottom:var(--sp-5);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-5);">
          <div>
            <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Account Information</div>
            <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">Official academic profile and institutional records</div>
          </div>
          <span class="badge badge-primary" style="font-size:11px;">
            ${window.AscendApp?.getCurrentRole?.() === 'admin' ? 'Admin' : 'Student'}
          </span>
        </div>

        <form onsubmit="event.preventDefault(); window.AscendViews.saveStudentAccountSettings();" style="display:flex;flex-direction:column;gap:var(--sp-4);">
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="set-stu-name">Full Name <span style="color:var(--c-rejected);">*</span></label>
              <input class="form-input" id="set-stu-name" type="text" value="${student.name || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="set-stu-email">Institutional Email Address</label>
              <input class="form-input" id="set-stu-email" type="email" value="${student.email || ''}" disabled style="background:var(--c-bg);cursor:not-allowed;" title="Managed by university administration">
              <div class="form-hint">Institutional identifier managed by university administrator.</div>
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="set-stu-degree">Course / Degree</label>
              <input class="form-input" id="set-stu-degree" type="text" value="${student.degree || 'B.Tech in Computer Science'}">
            </div>
            <div class="form-group">
              <label class="form-label" for="set-stu-dept">Department</label>
              <input class="form-input" id="set-stu-dept" type="text" value="${student.department || 'Computer Science & Engineering'}">
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="set-stu-inst">Institution</label>
              <input class="form-input" id="set-stu-inst" type="text" value="${student.institution || 'Delhi Institute of Technology'}">
            </div>
            <div class="form-group">
              <label class="form-label" for="set-stu-gradyear">Expected Graduation Year</label>
              <input class="form-input" id="set-stu-gradyear" type="number" min="2020" max="2035" value="${student.graduationYear || 2028}">
            </div>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--sp-3);padding-top:var(--sp-2);border-top:1px solid var(--c-border-subtle);flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" type="button" onclick="AscendApp.navigate('profile')">
              ${Icons.user} View Full Profile &amp; Bio
            </button>
            <button class="btn btn-primary btn-sm" id="btn-save-stu-account" type="submit">
              ${Icons.checkCircle || ''} Save Account Details
            </button>
          </div>
        </form>
      </div>

      <!-- 2. Notification Preferences -->
      <div class="card" style="margin-bottom:var(--sp-5);">
        <div style="margin-bottom:var(--sp-4);">
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Notification Preferences</div>
          <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">Select the alerts and communication updates you wish to receive</div>
        </div>
        <div style="display:flex;flex-direction:column;">
          ${notifPrefs.map((pref, i) => {
            const isChecked = studentPrefs[pref.key] !== undefined ? !!studentPrefs[pref.key] : pref.defaultChecked;
            return `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--sp-3) 0;${i < notifPrefs.length - 1 ? 'border-bottom:1px solid var(--c-border);' : ''}gap:var(--sp-4);">
                <label for="${pref.id}" style="flex:1;cursor:pointer;">
                  <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);">${pref.label}</div>
                  <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">${pref.desc}</div>
                </label>
                ${renderSwitch(pref.id, isChecked, `window.AscendViews.ascendToggleSwitch(this, '${pref.key}', 'student')`)}
              </div>`;
          }).join('')}
        </div>
      </div>

      <!-- 3. Security -->
      <div class="card" style="margin-bottom:var(--sp-5);">
        <div style="margin-bottom:var(--sp-5);">
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Security</div>
          <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">Manage passwords and secondary verification factors</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--sp-4);">
          <!-- Password Row -->
          <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:var(--sp-4);border-bottom:1px solid var(--c-border);gap:var(--sp-4);flex-wrap:wrap;">
            <div>
              <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);">Account Password</div>
              <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">Keep your password secure and update regularly.</div>
            </div>
            <button class="btn btn-outline btn-sm" type="button" onclick="window.AscendViews.openChangePasswordModal()">
              ${Icons.lock || ''} Change Password
            </button>
          </div>

          <!-- Two-Factor Authentication Row -->
          <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--sp-4);flex-wrap:wrap;">
            <div>
              <div style="display:flex;align-items:center;gap:var(--sp-2);">
                <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);">Two-Factor Authentication (2FA)</div>
                ${is2FA 
                  ? `<span class="badge badge-verified" style="font-size:11px;"><span class="badge-dot" style="background:#137333;"></span>Enabled</span>`
                  : `<span class="badge badge-draft" style="font-size:11px;"><span class="badge-dot" style="background:#5F6368;"></span>Disabled</span>`
                }
              </div>
              <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">
                Protect your account by requiring an authenticator code upon login.
              </div>
            </div>
            ${is2FA
              ? `<button class="btn btn-outline btn-sm" type="button" style="color:var(--c-rejected);border-color:#FAD2CF;" onclick="window.AscendViews.promptDisable2FA()">
                   Disable 2FA
                 </button>`
              : `<button class="btn btn-primary btn-sm" type="button" onclick="window.AscendViews.openSetup2FAModal()">
                   ${Icons.shieldCheck || ''} Enable 2FA
                 </button>`
            }
          </div>
        </div>
      </div>

      <!-- 4. Account Management & Archive -->
      <div class="card" style="border-color:var(--c-border);">
        <div style="margin-bottom:var(--sp-4);">
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Account Management</div>
          <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">
            Export comprehensive data archives or initiate account deactivation.
          </div>
        </div>
        <div style="display:flex;gap:var(--sp-3);flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" type="button" onclick="window.AscendViews.handleExportArchive()">
            ${Icons.download} Export Portfolio Archive (JSON)
          </button>
          <button class="btn btn-ghost btn-sm" type="button" style="color:var(--c-rejected);" onclick="window.AscendViews.openDeactivateModal()">
            ${Icons.trash || ''} Deactivate Account
          </button>
        </div>
      </div>
    </div>`;
}

/* ── Faculty / Mentor Settings View ─────────────────────────── */
function renderFacultySettings() {
  const { facultyUser, getClasses, selectedClassId } = window.AscendFacultyData;
  const { Icons }   = window.AscendUI;
  const classes = getClasses ? getClasses() : [];

  injectSwitchStyles();

  const facultyPrefs = facultyUser.notificationPreferences || {};
  const notifPrefs = [
    { id: 'sw-fac-portfolio', key: 'portfolio', label: 'Student portfolio additions',             defaultChecked: true,  desc: 'Alert when an assigned student adds a new certification, project, or achievement' },
    { id: 'sw-fac-feedback',  key: 'feedback',  label: 'Student feedback requests',               defaultChecked: true,  desc: 'Notify when a student requests mentorship guidance or replies to action items' },
    { id: 'sw-fac-deadline',  key: 'deadline',  label: 'Scheduled evaluation deadline reminders', defaultChecked: true,  desc: 'Timely reminders for upcoming semester rubric evaluation deadlines' },
    { id: 'sw-fac-attention', key: 'attention', label: 'Student attention alerts',                defaultChecked: true,  desc: 'Flag when a student is inactive for 30+ days or has incomplete profile setup' },
    { id: 'sw-fac-digest',    key: 'digest',    label: 'Weekly cohort summary digest',            defaultChecked: false, desc: 'Receive an aggregated email summary of class activity every Monday morning' },
  ];

  return `
    <div style="max-width:760px;">
      <div style="margin-bottom:var(--sp-8);">
        <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;color:var(--c-text);margin:0;">Faculty Settings</h1>
        <div style="font-size:var(--text-sm);color:var(--c-text-2);margin-top:4px;">
          Manage academic identity, notification preferences, and account security.
        </div>
      </div>

      <!-- 1. Academic Identity & Department -->
      <div class="card" style="margin-bottom:var(--sp-5);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-5);">
          <div>
            <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Academic Identity &amp; Department</div>
            <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">Official faculty profile and institutional affiliation</div>
          </div>
          <span class="badge badge-primary" style="font-size:11px;">Faculty / Mentor</span>
        </div>
        <form onsubmit="event.preventDefault(); window.FacultyViews.saveFacultySettings();" style="display:flex;flex-direction:column;gap:var(--sp-4);">
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="fac-name">Full Name <span style="color:var(--c-rejected);">*</span></label>
              <input class="form-input" id="fac-name" type="text" value="${facultyUser.name || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="fac-title">Academic Title / Prefix</label>
              <input class="form-input" id="fac-title" type="text" value="${facultyUser.title || 'Dr.'}">
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="fac-designation">Designation</label>
              <input class="form-input" id="fac-designation" type="text" value="${facultyUser.designation || 'Associate Professor & Faculty Advisor'}">
            </div>
            <div class="form-group">
              <label class="form-label" for="fac-id">Faculty ID</label>
              <input class="form-input" id="fac-id" type="text" value="${facultyUser.id || 'FAC-CSE-2018-042'}" readonly style="background:var(--c-bg);cursor:not-allowed;">
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="fac-dept">Department</label>
              <input class="form-input" id="fac-dept" type="text" value="${facultyUser.department || 'Computer Science & Engineering'}">
            </div>
            <div class="form-group">
              <label class="form-label" for="fac-inst">Institution</label>
              <input class="form-input" id="fac-inst" type="text" value="${facultyUser.institution || 'Delhi Institute of Technology'}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="fac-email">Institutional Email Address</label>
            <input class="form-input" id="fac-email" type="email" value="${facultyUser.email || ''}">
          </div>
          <div style="display:flex;align-items:center;justify-content:flex-end;gap:var(--sp-3);padding-top:var(--sp-4);border-top:1px solid var(--c-border-subtle);margin-top:var(--sp-2);">
            <button class="btn btn-outline btn-sm" type="button" onclick="AscendApp.navigate('faculty-dashboard')">Cancel</button>
            <button class="btn btn-primary btn-sm" id="btn-save-fac-identity" type="submit">
              ${Icons.checkCircle || ''} Save Changes
            </button>
          </div>
        </form>
      </div>

      <!-- 2. Classes Handled -->
      <div class="card" style="margin-bottom:var(--sp-5);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-4);flex-wrap:wrap;gap:var(--sp-3);">
          <div>
            <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Classes Handled</div>
            <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">
              Manage the batches, semesters, and sections you teach or advise. These populate class selection dropdowns across the portal.
            </div>
          </div>
          <button class="btn btn-primary btn-sm" type="button" onclick="window.FacultyViews.openClassModal()">
            ${Icons.plus || '+'} Add Class Handled
          </button>
        </div>

        <div id="faculty-classes-list" style="display:flex;flex-direction:column;gap:var(--sp-3);">
          ${classes.filter(c => c.id !== 'all').length === 0 ? `
            <div style="padding:var(--sp-4);text-align:center;color:var(--c-text-3);font-size:var(--text-xs);border:1px dashed var(--c-border);border-radius:var(--r-md);">
              No specific classes added yet. Click &quot;Add Class Handled&quot; above to add your assigned batches.
            </div>
          ` : classes.filter(c => c.id !== 'all').map(c => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--sp-3) var(--sp-4);border:1px solid var(--c-border);border-radius:var(--r-md);background:var(--c-bg-subtle, var(--c-bg));flex-wrap:wrap;gap:var(--sp-3);">
              <div style="min-width:0;flex:1;">
                <div style="display:flex;align-items:center;gap:var(--sp-2);flex-wrap:wrap;">
                  <span style="font-weight:700;font-size:var(--text-sm);color:var(--c-text);">${c.name}</span>
                  <span class="badge badge-normal" style="font-size:11px;font-weight:600;">${c.shortName || c.name}</span>
                </div>
                <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:3px;">
                  ${c.department || facultyUser.department || ''} &bull; ${c.program || ''} &bull; Sem ${c.semester || ''} &bull; ${c.section || ''} &bull; AY ${c.academicYear || '2026–27'}
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:var(--sp-2);">
                <button class="btn btn-outline btn-sm" type="button" onclick="window.FacultyViews.openClassModal('${c.id}')" style="font-size:var(--text-xs);">
                  ${Icons.edit || ''} Edit
                </button>
                <button class="btn btn-ghost btn-sm" type="button" onclick="window.FacultyViews.deleteClass('${c.id}')" style="font-size:var(--text-xs);color:var(--c-rejected);" aria-label="Delete class">
                  ${Icons.trash || ''} Delete
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 3. Notification Preferences -->
      <div class="card" style="margin-bottom:var(--sp-5);">
        <div style="margin-bottom:var(--sp-4);">
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Notification Preferences</div>
          <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">Configure real-time and digest alerts for your advising cohort</div>
        </div>
        <div style="display:flex;flex-direction:column;">
          ${notifPrefs.map((pref, i) => {
            const isChecked = facultyPrefs[pref.key] !== undefined ? !!facultyPrefs[pref.key] : pref.defaultChecked;
            return `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--sp-3) 0;${i < notifPrefs.length - 1 ? 'border-bottom:1px solid var(--c-border);' : ''}gap:var(--sp-4);">
                <label for="${pref.id}" style="flex:1;cursor:pointer;">
                  <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);">${pref.label}</div>
                  <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">${pref.desc}</div>
                </label>
                ${renderSwitch(pref.id, isChecked, `window.AscendViews.ascendToggleSwitch(this, '${pref.key}', 'faculty')`)}
              </div>`;
          }).join('')}
        </div>
      </div>

      <!-- 4. Change Password -->
      <div class="card" style="margin-bottom:var(--sp-6);">
        <div style="margin-bottom:var(--sp-4);">
          <div style="font-size:var(--text-base);font-weight:700;color:var(--c-text);">Change Password</div>
          <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">Update your password to keep your academic account secure</div>
        </div>
        <div id="fac-pw-error" style="display:none;padding:var(--sp-3);background:var(--c-rejected-bg, #FEE2E2);border:1px solid var(--c-rejected-border, #FCA5A5);color:var(--c-rejected, #DC2626);border-radius:var(--r-md);font-size:var(--text-xs);margin-bottom:var(--sp-4);"></div>
        <form onsubmit="event.preventDefault(); window.FacultyViews.changePassword();" style="display:flex;flex-direction:column;gap:var(--sp-4);">
          <div class="form-group">
            <label class="form-label" for="fac-cur-pw">Current Password <span style="color:var(--c-rejected);">*</span></label>
            <div style="position:relative;">
              <input class="form-input" id="fac-cur-pw" type="password" required autocomplete="current-password" placeholder="Enter your current password" style="padding-right:40px;">
              <button type="button" onclick="window.AscendViews.togglePasswordVisibility('fac-cur-pw', this)" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--c-text-3);padding:4px;" aria-label="Toggle password visibility">
                ${Icons.eye}
              </button>
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="fac-new-pw">New Password <span style="color:var(--c-rejected);">*</span></label>
              <div style="position:relative;">
                <input class="form-input" id="fac-new-pw" type="password" required autocomplete="new-password" minlength="6" placeholder="At least 6 characters" style="padding-right:40px;">
                <button type="button" onclick="window.AscendViews.togglePasswordVisibility('fac-new-pw', this)" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--c-text-3);padding:4px;" aria-label="Toggle password visibility">
                  ${Icons.eye}
                </button>
              </div>
              <div class="form-hint">Must be at least 6 characters long and different from current password.</div>
            </div>
            <div class="form-group">
              <label class="form-label" for="fac-confirm-pw">Confirm New Password <span style="color:var(--c-rejected);">*</span></label>
              <div style="position:relative;">
                <input class="form-input" id="fac-confirm-pw" type="password" required autocomplete="new-password" placeholder="Re-enter new password" style="padding-right:40px;">
                <button type="button" onclick="window.AscendViews.togglePasswordVisibility('fac-confirm-pw', this)" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--c-text-3);padding:4px;" aria-label="Toggle password visibility">
                  ${Icons.eye}
                </button>
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;justify-content:flex-end;gap:var(--sp-3);padding-top:var(--sp-2);">
            <button class="btn btn-primary btn-sm" id="btn-update-fac-pw" type="submit">
              ${Icons.lock || ''} Update Password
            </button>
          </div>
        </form>
      </div>
    </div>`;
}

/* ── Expose Views & Action Handlers ──────────────────────────── */
window.AscendViews = window.AscendViews || {};
window.AscendViews.settings = renderStudentSettings;
window.AscendViews.saveStudentAccountSettings = saveStudentAccountSettings;
window.AscendViews.openChangePasswordModal = openChangePasswordModal;
window.AscendViews.togglePasswordVisibility = togglePasswordVisibility;
window.AscendViews.submitPasswordChange = submitPasswordChange;
window.AscendViews.openSetup2FAModal = openSetup2FAModal;
window.AscendViews.confirmEnable2FA = confirmEnable2FA;
window.AscendViews.promptDisable2FA = promptDisable2FA;
window.AscendViews.handleExportArchive = handleExportArchive;
window.AscendViews.openDeactivateModal = openDeactivateModal;
window.AscendViews.confirmDeactivateAccount = confirmDeactivateAccount;
window.AscendViews.ascendToggleSwitch = ascendToggleSwitch;

window.FacultyViews = window.FacultyViews || {};
window.FacultyViews.settings = renderFacultySettings;
window.FacultyViews.saveFacultySettings = saveFacultySettings;
window.FacultyViews.changePassword = changeFacultyPassword;
window.FacultyViews.togglePasswordVisibility = togglePasswordVisibility;
window.FacultyViews.openClassModal = openClassModal;
window.FacultyViews.saveClassModal = saveClassModal;
window.FacultyViews.deleteClass = deleteFacultyClass;

/* ── Expose toggle helper globally for onclick attributes ───── */
window.ascendToggleSwitch = ascendToggleSwitch;
