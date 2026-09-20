/**
 * ASCEND – HOD Faculty Assignments View
 * Displays which faculty mentor is assigned to each class/section, faculty workloads,
 * unassigned cohorts, and provides assignment controls with instant local-state updates.
 */

(function () {
  window.HODViews = window.HODViews || {};

  window.HODViews.openAssignModal = function (classId) {
    const { classes, facultyMentors } = window.AscendHODData;
    const { Icons } = window.AscendUI;

    const targetClass = classes.find(c => c.id === classId) || classes[0];
    if (!targetClass) return;

    document.getElementById('assign-mentor-modal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'assign-mentor-modal';
    modal.className = 'modal-backdrop active';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(32,33,36,0.6);z-index:600;display:flex;align-items:center;justify-content:center;padding:16px;';

    modal.innerHTML = `
      <div class="modal-card" style="background:var(--c-surface);border-radius:var(--r-xl);max-width:520px;width:100%;border:1px solid var(--c-border);box-shadow:var(--shadow-lg);animation:welcomeIn 0.2s ease forwards;">
        <!-- Modal Header -->
        <div style="padding:var(--sp-4) var(--sp-6);border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;">
          <div>
            <h2 style="font-size:var(--text-lg);font-weight:700;color:var(--c-text);margin:0;">
              Assign Faculty Mentor
            </h2>
            <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">
              Cohort: <strong>${targetClass.name}</strong> (${targetClass.studentCount} students)
            </div>
          </div>
          <button type="button" class="icon-btn" onclick="document.getElementById('assign-mentor-modal')?.remove();" aria-label="Close modal">
            ${Icons.x}
          </button>
        </div>

        <!-- Form Body -->
        <form id="assign-mentor-form" style="padding:var(--sp-6);" onsubmit="HODViews.submitAssignMentor(event, '${targetClass.id}')">
          <div class="form-group" style="margin-bottom:var(--sp-4);">
            <label class="form-label" style="font-weight:600;font-size:var(--text-xs);margin-bottom:6px;display:block;">
              Select Faculty Mentor
            </label>
            <select id="assign-faculty-select" class="form-input form-select" style="font-size:var(--text-sm);font-weight:600;" required onchange="HODViews.previewWorkloadChange('${targetClass.id}', this.value)">
              <option value="">Choose a faculty advisor…</option>
              <option value="unassigned" ${!targetClass.assignedFacultyId ? 'selected' : ''}>-- Mark Unassigned --</option>
              ${facultyMentors.map(f => {
                const isCurrent = f.id === targetClass.assignedFacultyId;
                return `
                  <option value="${f.id}" ${isCurrent ? 'selected' : ''}>
                    ${f.name} (${f.designation}) &bull; Currently: ${f.assignedStudentsCount} students
                  </option>`;
              }).join('')}
            </select>
          </div>

          <!-- Live Workload Preview Box -->
          <div id="workload-preview-box" style="padding:12px;background:#F8FAFD;border:1px solid #D2E3FC;border-radius:var(--r-md);font-size:var(--text-xs);color:var(--c-text-2);margin-bottom:var(--sp-5);">
            <div style="font-weight:700;color:var(--c-primary);margin-bottom:4px;display:flex;align-items:center;gap:6px;">
              ${Icons.info} Workload Preview
            </div>
            <div>Assigning this cohort will adjust student advisee counts and mentor advisory status in real-time.</div>
          </div>

          <div style="display:flex;align-items:center;justify-content:flex-end;gap:var(--sp-3);">
            <button type="button" class="btn btn-outline" onclick="document.getElementById('assign-mentor-modal')?.remove();">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" id="confirm-assign-btn">
              Confirm Assignment
            </button>
          </div>
        </form>
      </div>`;

    document.body.appendChild(modal);
  };

  window.HODViews.previewWorkloadChange = function (classId, facultyId) {
    const { classes, facultyMentors } = window.AscendHODData;
    const box = document.getElementById('workload-preview-box');
    if (!box) return;

    if (!facultyId || facultyId === 'unassigned') {
      box.innerHTML = `
        <div style="font-weight:700;color:#B06000;margin-bottom:2px;">Status: Unassigned</div>
        <div>Class will have no assigned faculty advisor until a mentor is designated.</div>`;
      return;
    }

    const targetClass = classes.find(c => c.id === classId);
    const fac = facultyMentors.find(f => f.id === facultyId);
    if (!fac || !targetClass) return;

    const currentStudents = fac.assignedStudentsCount;
    const isAlreadyAssigned = fac.assignedClassIds.includes(classId);
    const projectedStudents = isAlreadyAssigned ? currentStudents : (currentStudents + targetClass.studentCount);
    const isHeavy = projectedStudents > 90;

    box.innerHTML = `
      <div style="font-weight:700;color:${isHeavy ? '#C5221F' : 'var(--c-primary)'};margin-bottom:2px;">
        ${fac.name}: ${currentStudents} &rarr; ${projectedStudents} advisees
      </div>
      <div style="color:${isHeavy ? '#C5221F' : 'var(--c-text-2)'};">
        ${isHeavy ? 'Warning: Mentor will exceed normal workload threshold (>90 students).' : 'Projected workload is within departmental advisor parameters.'}
      </div>`;
  };

  window.HODViews.submitAssignMentor = function (e, classId) {
    e.preventDefault();
    const select = document.getElementById('assign-faculty-select');
    if (!select) return;

    const facultyId = select.value;
    const res = window.AscendHODData.assignMentor(classId, facultyId);

    document.getElementById('assign-mentor-modal')?.remove();

    if (res.success) {
      window.AscendUI.showToast(res.message || `Assigned ${res.className} to ${res.facultyName}.`, 'success');
      const content = document.getElementById('app-content-area');
      if (content && window.AscendApp?.getCurrentView() === 'hod-faculty-assignments') {
        content.innerHTML = window.HODViews.facultyAssignments();
      }
    } else {
      window.AscendUI.showToast(res.error || 'Failed to update assignment.', 'error');
    }
  };

  window.HODViews.facultyAssignments = function () {
    const { Icons } = window.AscendUI;
    const { classes, facultyMentors } = window.AscendHODData;

    const totalFaculty = facultyMentors.length;
    const assignedFaculty = facultyMentors.filter(f => f.assignedClassIds.length > 0).length;
    const unassignedFaculty = totalFaculty - assignedFaculty;
    const unassignedClasses = classes.filter(c => !c.assignedFacultyId);
    const avgStudents = Math.round(classes.reduce((sum, c) => sum + c.studentCount, 0) / (assignedFaculty || 1));

    return `
      <!-- ── Page Header ────────────────────────────────────────────── -->
      <div style="margin-bottom:var(--sp-5);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);">
        <div>
          <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;color:var(--c-text);margin:0 0 4px;">
            Faculty Mentor Assignments
          </h1>
          <div style="font-size:var(--text-sm);color:var(--c-text-2);">
            Departmental class-to-mentor allocation, workload tracking, and re-assignment controls.
          </div>
        </div>
      </div>

      <!-- ── Workload Metric Overview ───────────────────────────────── -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:var(--sp-4);margin-bottom:var(--sp-5);">
        <div class="card" style="padding:var(--sp-4);">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--c-text-3);">Total Department Faculty</div>
          <div style="font-size:24px;font-weight:700;color:var(--c-text);margin-top:2px;">${totalFaculty} Mentors</div>
          <div style="font-size:11px;color:var(--c-text-2);margin-top:2px;">Computer Science &amp; Engineering</div>
        </div>
        <div class="card" style="padding:var(--sp-4);">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--c-text-3);">Currently Assigned</div>
          <div style="font-size:24px;font-weight:700;color:#166534;margin-top:2px;">${assignedFaculty} Mentors</div>
          <div style="font-size:11px;color:var(--c-text-2);margin-top:2px;">Advising active cohort sections</div>
        </div>
        <div class="card" style="padding:var(--sp-4);">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--c-text-3);">Available / Unassigned</div>
          <div style="font-size:24px;font-weight:700;color:#0369A1;margin-top:2px;">${unassignedFaculty} Mentors</div>
          <div style="font-size:11px;color:var(--c-text-2);margin-top:2px;">Available for new cohort intake</div>
        </div>
        <div class="card" style="padding:var(--sp-4);">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--c-text-3);">Avg Students / Mentor</div>
          <div style="font-size:24px;font-weight:700;color:var(--c-primary);margin-top:2px;">${avgStudents} Advisees</div>
          <div style="font-size:11px;color:var(--c-text-2);margin-top:2px;">Balanced department ratio</div>
        </div>
      </div>

      <!-- ── Unassigned Alert Banner (if applicable) ────────────────── -->
      ${unassignedClasses.length > 0 ? `
        <div style="margin-bottom:var(--sp-5);padding:14px 18px;background:#FFFBFB;border:1px solid #FAD2CF;border-radius:var(--r-lg);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--sp-3);">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:36px;height:36px;border-radius:50%;background:#FCE8E6;color:#C5221F;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${Icons.alertCircle}
            </div>
            <div>
              <div style="font-size:var(--text-sm);font-weight:700;color:#C5221F;">
                ${unassignedClasses.length} Cohort${unassignedClasses.length !== 1 ? 's' : ''} Require Mentor Assignment
              </div>
              <div style="font-size:var(--text-xs);color:var(--c-text-2);">
                ${unassignedClasses.map(c => `<strong>${c.name}</strong> (${c.studentCount} students)`).join(', ')} currently lack an assigned faculty advisor.
              </div>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" style="background:#fff;border-color:#C5221F;color:#C5221F;" onclick="HODViews.openAssignModal('${unassignedClasses[0].id}')">
            Assign First Available Cohort
          </button>
        </div>` : ''}

      <!-- ── 1. Class-to-Mentor Assignment Allocation Table ──────────── -->
      <div class="card" style="padding:0;overflow:hidden;margin-bottom:var(--sp-6);">
        <div style="padding:var(--sp-4) var(--sp-5);border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;">
          <div>
            <h2 style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin:0;">
              Class &amp; Section Mentor Allocations
            </h2>
            <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">
              Review active assignments and reassign advisors as required
            </div>
          </div>
        </div>

        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;text-align:left;font-size:var(--text-xs);">
            <thead>
              <tr style="background:#F8FAFD;border-bottom:1px solid var(--c-border);color:var(--c-text-2);font-weight:600;">
                <th style="padding:12px 18px;">Cohort / Section</th>
                <th style="padding:12px 14px;">Programme &amp; Semester</th>
                <th style="padding:12px 12px;text-align:center;">Enrolled Students</th>
                <th style="padding:12px 16px;">Assigned Faculty Advisor</th>
                <th style="padding:12px 14px;">Status</th>
                <th style="padding:12px 18px;text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${classes.map(c => {
                const isUnassigned = !c.assignedFacultyId;
                return `
                  <tr style="border-bottom:1px solid var(--c-border-subtle);transition:background var(--dur-fast);" class="table-hover-row">
                    <td style="padding:14px 18px;font-weight:700;color:var(--c-text);">
                      ${c.name}
                    </td>
                    <td style="padding:14px 14px;color:var(--c-text-2);">
                      ${c.programme} &bull; Sem ${c.semester}
                    </td>
                    <td style="padding:14px 12px;text-align:center;font-weight:700;">
                      ${c.studentCount}
                    </td>
                    <td style="padding:14px 16px;">
                      ${isUnassigned ? `
                        <span class="badge badge-risk" style="font-size:11px;">Unassigned</span>` : `
                        <div style="font-weight:600;color:var(--c-text);">${c.assignedFacultyName}</div>`}
                    </td>
                    <td style="padding:14px 14px;">
                      <span class="badge ${isUnassigned ? 'badge-risk' : 'badge-verified'}" style="font-size:10px;">
                        ${isUnassigned ? 'Action Required' : 'Active'}
                      </span>
                    </td>
                    <td style="padding:14px 18px;text-align:right;">
                      <button type="button" class="btn btn-outline btn-sm" onclick="HODViews.openAssignModal('${c.id}')">
                        ${isUnassigned ? 'Assign Mentor' : 'Reassign Mentor'}
                      </button>
                    </td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── 2. Faculty Workload Roster ──────────────────────────────── -->
      <div class="card" style="padding:0;overflow:hidden;">
        <div style="padding:var(--sp-4) var(--sp-5);border-bottom:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;">
          <div>
            <h2 style="font-size:var(--text-base);font-weight:700;color:var(--c-text);margin:0;">
              Faculty Advisor Workload Directory
            </h2>
            <div style="font-size:var(--text-xs);color:var(--c-text-2);margin-top:2px;">
              Monitors assigned cohort counts and total advisee student distribution across faculty members
            </div>
          </div>
        </div>

        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;text-align:left;font-size:var(--text-xs);">
            <thead>
              <tr style="background:#F8FAFD;border-bottom:1px solid var(--c-border);color:var(--c-text-2);font-weight:600;">
                <th style="padding:12px 18px;">Faculty Member</th>
                <th style="padding:12px 14px;">Designation</th>
                <th style="padding:12px 12px;text-align:center;">Assigned Classes</th>
                <th style="padding:12px 12px;text-align:center;">Total Advisees</th>
                <th style="padding:12px 16px;">Assigned Cohort Names</th>
                <th style="padding:12px 18px;text-align:right;">Workload Status</th>
              </tr>
            </thead>
            <tbody>
              ${facultyMentors.map(f => {
                const assignedClassNames = f.assignedClassIds.map(cid => {
                  const cls = classes.find(c => c.id === cid);
                  return cls ? cls.shortName : cid;
                }).join(', ') || 'None';

                const isHeavy = f.status === 'High Workload';
                const isUnassigned = f.status === 'Unassigned';

                return `
                  <tr style="border-bottom:1px solid var(--c-border-subtle);transition:background var(--dur-fast);" class="table-hover-row">
                    <td style="padding:14px 18px;">
                      <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:30px;height:30px;border-radius:50%;background:${f.avatarBg};color:${f.avatarText};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;">
                          ${f.name.split(' ').filter(Boolean).map(p=>p[0]).slice(0,2).join('')}
                        </div>
                        <div>
                          <div style="font-weight:700;color:var(--c-text);">${f.name}</div>
                          <div style="font-size:10px;color:var(--c-text-3);">${f.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style="padding:14px 14px;color:var(--c-text-2);">${f.designation}</td>
                    <td style="padding:14px 12px;text-align:center;font-weight:700;">
                      ${f.assignedClassIds.length}
                    </td>
                    <td style="padding:14px 12px;text-align:center;font-weight:700;color:${isHeavy ? '#C5221F' : 'var(--c-text)'};">
                      ${f.assignedStudentsCount}
                    </td>
                    <td style="padding:14px 16px;color:var(--c-text-2);">
                      ${assignedClassNames}
                    </td>
                    <td style="padding:14px 18px;text-align:right;">
                      <span class="badge ${isHeavy ? 'badge-risk' : (isUnassigned ? 'badge-draft' : 'badge-verified')}" style="font-size:10px;">
                        ${f.status}
                      </span>
                    </td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  };
})();
