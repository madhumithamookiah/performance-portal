/**
 * ASCEND – Feedback View
 */
function renderFeedback() {
  const { feedback } = window.AscendData;
  const { Icons, formatDate } = window.AscendUI;
  const safeFeedback = Array.isArray(feedback) ? feedback : [];

  function feedbackCardHTML(fb) {
    const mentorName = fb.mentorName || 'Faculty Advisor';
    const initials = mentorName.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'FA';
    return `
      <div class="feedback-card" id="fb-card-${fb.id}">
        <div class="feedback-header" style="flex-wrap:wrap;gap:var(--sp-2);">
          <div class="avatar avatar-md" style="background:var(--c-primary-light);color:var(--c-primary);flex-shrink:0;">
            ${initials}
          </div>
          <div class="feedback-mentor-info" style="min-width:120px;">
            <div class="feedback-mentor-name">${mentorName}</div>
            <div style="font-size:var(--text-xs);color:var(--c-text-3);">${fb.mentorRole || fb.mentorTitle || 'Advisor'}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:var(--sp-2);flex-shrink:0;margin-left:auto;">
            <span class="feedback-date">${formatDate(fb.date)}</span>
          </div>
        </div>

        <div class="feedback-subject">${fb.subject}</div>
        <div class="feedback-message">${fb.message}</div>

        ${fb.relatedAchievement ? `
          <div style="display:flex;align-items:center;gap:var(--sp-2);font-size:var(--text-xs);color:var(--c-text-2);padding:8px 12px;background:var(--c-bg);border-radius:var(--r-md);border:1px solid var(--c-border);">
            ${Icons.award} Related to: <strong>${fb.relatedAchievement}</strong>
          </div>` : ''}

        ${fb.actionItems && fb.actionItems.length > 0 ? `
          <div style="padding:var(--sp-4);background:var(--c-bg);border-radius:var(--r-md);border:1px solid var(--c-border);">
            <div style="font-size:var(--text-xs);font-weight:600;color:var(--c-text-2);margin-bottom:var(--sp-3);text-transform:uppercase;letter-spacing:0.06em;">
              Action items
            </div>
            <div style="display:flex;flex-direction:column;gap:var(--sp-2);">
              ${fb.actionItems.map((item, i) => `
                <div style="display:flex;align-items:center;gap:var(--sp-3);">
                  <div style="width:20px;height:20px;border-radius:50%;border:1.5px solid var(--c-border);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;font-weight:600;color:var(--c-text-3);">${i + 1}</div>
                  <span style="font-size:var(--text-sm);color:var(--c-text);">${item}</span>
                </div>`).join('')}
            </div>
          </div>` : ''}

        <div class="feedback-actions">
          <button class="btn btn-ghost btn-sm" onclick="AscendUI.showToast('Reply feature coming soon.','info')">
            ${Icons.messageSquare} Reply
          </button>
          <button class="btn btn-ghost btn-sm" onclick="AscendUI.showToast('Archived.','info')">
            ${Icons.download} Archive
          </button>
        </div>
      </div>`;
  }

  return `
    <!-- Header -->
    <div class="section-header" style="margin-bottom:var(--sp-6);">
      <div>
        <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;">Feedback</h1>
        <div style="font-size:var(--text-sm);color:var(--c-text-2);margin-top:4px;">
          Guidance and feedback from your mentors and faculty.
        </div>
      </div>
    </div>

    <!-- Feedback List -->
    ${safeFeedback.length > 0 ? `
      <div style="display:flex;flex-direction:column;gap:var(--sp-4);">
        ${safeFeedback.map(feedbackCardHTML).join('')}
      </div>` : `
      <div class="empty-state">
        <div class="empty-state-icon">${Icons.messageSquare}</div>
        <div class="empty-state-title">No feedback yet</div>
        <div class="empty-state-desc">Your mentors and faculty will send you feedback and guidance here once you submit achievements.</div>
      </div>`}`;
}

function markFeedbackRead(id) {
  // Read/unread option removed
}

window.AscendViews = window.AscendViews || {};
Object.assign(window.AscendViews, {
  feedback: renderFeedback,
  markFeedbackRead,
});
