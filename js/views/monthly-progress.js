/**
 * ASCEND – Student Monthly Progress View
 * Dedicated workspace for reviewing past and present monthly activity summaries,
 * factual portfolio additions, and developmental timeline events.
 * Pure professional SVG icons — zero emojis.
 */

function renderMonthlyProgress() {
  const { Icons, formatDate } = window.AscendUI;
  const summaries = (window.AscendData && Array.isArray(window.AscendData.monthlySummaries))
    ? window.AscendData.monthlySummaries
    : [];

  const selectedKey = window._studentSelectedMonthlyProgressKey || (summaries[0] ? summaries[0].monthKey : '2026-09');
  const activeSummary = summaries.find(m => m.monthKey === selectedKey) || summaries[0] || {
    month: 'September 2026',
    monthKey: '2026-09',
    achievementsAdded: 2,
    achievementTitles: ['AWS Certified Cloud Practitioner', 'Smart India Hackathon Finalist'],
    projectsUpdated: 1,
    projectTitles: ['Ascend Distributed File System'],
    feedbackReceived: 1,
    profileDetailsUpdated: true,
    lastActivityFormatted: '4 days ago',
    reviewedByStudent: false,
    summaryText: 'September activity: 2 achievements added, 1 project updated, 3 skills recorded, and 1 faculty feedback note received.',
  };

  const isReviewed = !!activeSummary.reviewedByStudent;
  const reviewedText = activeSummary.reviewedAt ? `Confirmed on ${formatDate(activeSummary.reviewedAt)}` : 'Marked as reviewed';

  return `
    <div style="max-width:1000px;margin:0 auto;">
      <!-- Page Header -->
      <div style="margin-bottom:var(--sp-6);">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;">
          <div>
            <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;color:var(--c-text);margin:0 0 4px;">
              Monthly Progress Summaries
            </h1>
            <div style="font-size:var(--text-sm);color:var(--c-text-2);line-height:1.5;">
              Factual summaries compiled automatically from completed achievements, projects, and mentorship notes.
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <button class="btn btn-outline btn-sm" onclick="AscendApp.navigate('dashboard')">
              Back to Dashboard
            </button>
            <button class="btn btn-primary btn-sm" onclick="AscendApp.navigate('achievements');setTimeout(()=>AscendUI.openModal('add-achievement-modal'),200)">
              ${Icons.plus} Add Completed Work
            </button>
          </div>
        </div>
      </div>

      <!-- Factual Principle Notice Banner -->
      <div class="card" style="padding:14px 18px;margin-bottom:var(--sp-5);background:#F8FAFD;border:1px solid #C2D8FF;display:flex;align-items:center;gap:12px;">
        <div style="width:32px;height:32px;border-radius:50%;background:#E8F0FE;color:var(--c-primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          ${Icons.info}
        </div>
        <div style="font-size:12.5px;color:var(--c-text-2);line-height:1.5;">
          <strong>Factual Tracking Principle:</strong> Progress summaries reflect your actual documented activity. Ascend does not assign automated grades, rankings, or scores. Formal qualitative evaluations are conducted by your faculty advisor.
        </div>
      </div>

      <!-- Main Layout: Month Selector Sidebar + Detail Workspace -->
      <div style="display:grid;grid-template-columns:300px 1fr;gap:var(--sp-5);" class="monthly-progress-grid">

        <!-- Left Column: Past Months List -->
        <div style="display:flex;flex-direction:column;gap:var(--sp-3);">
          <div style="font-size:var(--text-xs);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--c-text-3);padding-left:4px;">
            Monthly Archives
          </div>

          ${summaries.map(m => {
            const isSelected = m.monthKey === activeSummary.monthKey;
            const rev = !!m.reviewedByStudent;
            return `
              <div class="card card-hover" style="padding:14px 16px;cursor:pointer;border-left:4px solid ${isSelected ? 'var(--c-primary)' : 'var(--c-border)'};background:${isSelected ? 'var(--c-surface)' : 'var(--c-bg)'};"
                onclick="AscendViews.selectMonthlyProgress('${m.monthKey}')">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                  <span style="font-size:var(--text-sm);font-weight:700;color:var(--c-text);">${m.month}</span>
                  ${rev ? `
                    <span class="badge" style="background:#E8F0FE;color:#1A73E8;border:1px solid #C2D8FF;font-size:10.5px;padding:2px 7px;">
                      ${Icons.check} Reviewed
                    </span>` : `
                    <span class="badge" style="background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;font-size:10.5px;padding:2px 7px;">
                      Pending
                    </span>`}
                </div>
                <div style="font-size:11.5px;color:var(--c-text-2);line-height:1.4;">
                  ${m.achievementsAdded} achievement${m.achievementsAdded !== 1 ? 's' : ''} &bull; ${m.projectsUpdated} project${m.projectsUpdated !== 1 ? 's' : ''}
                </div>
                <div style="font-size:11px;color:var(--c-text-3);margin-top:4px;">
                  Activity: ${m.lastActivityFormatted || 'Recorded'}
                </div>
              </div>`;
          }).join('')}
        </div>

        <!-- Right Column: Active Month Detail -->
        <div style="display:flex;flex-direction:column;gap:var(--sp-5);">

          <!-- Active Month Overview Card -->
          <div class="card" style="padding:22px 24px;border-left:4px solid var(--c-primary);">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
              <div>
                <div style="font-size:var(--text-xl);font-weight:800;color:var(--c-text);">
                  ${activeSummary.month} Progress Summary
                </div>
                <div style="font-size:12px;color:var(--c-text-3);margin-top:2px;">
                  Last portfolio update logged: ${activeSummary.lastActivityFormatted || 'Recently'}
                </div>
              </div>
              <div>
                ${isReviewed ? `
                  <span class="badge" style="background:#E8F0FE;color:#1A73E8;border:1px solid #C2D8FF;font-size:12px;padding:6px 12px;display:inline-flex;align-items:center;gap:6px;">
                    ${Icons.check} ${reviewedText}
                  </span>` : `
                  <button class="btn btn-primary btn-sm" onclick="AscendViews.confirmMonthReview('${activeSummary.monthKey}')">
                    ${Icons.check} Confirm &amp; Mark as Reviewed
                  </button>`}
              </div>
            </div>

            <!-- Factual Narrative Box -->
            <div style="padding:14px 16px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);margin-bottom:16px;">
              <div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);line-height:1.6;">
                &ldquo;${activeSummary.summaryText}&rdquo;
              </div>
            </div>

            <!-- 4 Factual Key Metric Boxes -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:16px;">
              <div style="padding:12px 14px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);">
                <div style="font-size:11px;font-weight:600;color:var(--c-text-3);text-transform:uppercase;">Achievements</div>
                <div style="font-size:22px;font-weight:800;color:var(--c-primary);line-height:1.2;margin-top:2px;">
                  ${activeSummary.achievementsAdded}
                </div>
                <div style="font-size:11px;color:var(--c-text-2);margin-top:2px;">Added this month</div>
              </div>

              <div style="padding:12px 14px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);">
                <div style="font-size:11px;font-weight:600;color:var(--c-text-3);text-transform:uppercase;">Projects</div>
                <div style="font-size:22px;font-weight:800;color:var(--c-primary);line-height:1.2;margin-top:2px;">
                  ${activeSummary.projectsUpdated}
                </div>
                <div style="font-size:11px;color:var(--c-text-2);margin-top:2px;">Updated or added</div>
              </div>

              <div style="padding:12px 14px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);">
                <div style="font-size:11px;font-weight:600;color:var(--c-text-3);text-transform:uppercase;">Feedback</div>
                <div style="font-size:22px;font-weight:800;color:var(--c-primary);line-height:1.2;margin-top:2px;">
                  ${activeSummary.feedbackReceived}
                </div>
                <div style="font-size:11px;color:var(--c-text-2);margin-top:2px;">Faculty notes received</div>
              </div>

              <div style="padding:12px 14px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-md);">
                <div style="font-size:11px;font-weight:600;color:var(--c-text-3);text-transform:uppercase;">Profile Info</div>
                <div style="font-size:22px;font-weight:800;color:var(--c-primary);line-height:1.2;margin-top:2px;">
                  ${activeSummary.profileDetailsUpdated ? 'Active' : 'Current'}
                </div>
                <div style="font-size:11px;color:var(--c-text-2);margin-top:2px;">Bio &amp; links intact</div>
              </div>
            </div>

            <!-- Factual Activity Event Timeline for This Month -->
            <div style="border-top:1px solid var(--c-border);padding-top:16px;">
              <div style="font-size:var(--text-sm);font-weight:700;color:var(--c-text);margin-bottom:12px;">
                Recorded Items for ${activeSummary.month}
              </div>

              ${((activeSummary.achievementTitles && activeSummary.achievementTitles.length > 0) || (activeSummary.projectTitles && activeSummary.projectTitles.length > 0)) ? `
                <div style="display:flex;flex-direction:column;gap:8px;">
                  ${(activeSummary.achievementTitles || []).map(title => `
                    <div style="padding:10px 14px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-sm);display:flex;align-items:center;justify-content:space-between;gap:12px;">
                      <div style="display:flex;align-items:center;gap:10px;">
                        <span style="color:var(--c-primary);">${Icons.award}</span>
                        <div>
                          <div style="font-size:var(--text-xs);font-weight:600;color:var(--c-text);">${title}</div>
                          <div style="font-size:11px;color:var(--c-text-3);">Completed credential added to portfolio</div>
                        </div>
                      </div>
                      <span class="badge badge-normal" style="font-size:10px;">Achievement</span>
                    </div>`).join('')}

                  ${(activeSummary.projectTitles || []).map(title => `
                    <div style="padding:10px 14px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:var(--r-sm);display:flex;align-items:center;justify-content:space-between;gap:12px;">
                      <div style="display:flex;align-items:center;gap:10px;">
                        <span style="color:#059669;">${Icons.folder}</span>
                        <div>
                          <div style="font-size:var(--text-xs);font-weight:600;color:var(--c-text);">${title}</div>
                          <div style="font-size:11px;color:var(--c-text-3);">Practical codebase milestone recorded</div>
                        </div>
                      </div>
                      <span class="badge badge-normal" style="font-size:10px;">Project</span>
                    </div>`).join('')}
                </div>` : `
                <div style="padding:18px;background:var(--c-bg);border:1px dashed var(--c-border);border-radius:var(--r-md);text-align:center;font-size:var(--text-xs);color:var(--c-text-3);">
                  No new credentials or project updates were recorded in ${activeSummary.month}.
                </div>`}
            </div>
          </div>

        </div>
      </div>
    </div>

    <style>
      @media (max-width: 768px) {
        .monthly-progress-grid { grid-template-columns: 1fr !important; }
      }
    </style>`;
}

/* ── View Event Handlers ─────────────────────────────────────── */
function selectMonthlyProgress(monthKey) {
  window._studentSelectedMonthlyProgressKey = monthKey;
  const content = document.getElementById('app-content-area');
  if (content && window.AscendViews && window.AscendViews.monthlyProgress) {
    content.innerHTML = window.AscendViews.monthlyProgress();
  }
}

async function confirmMonthReview(monthKey) {
  if (window.AscendData && window.AscendData.markMonthReviewed) {
    await window.AscendData.markMonthReviewed(monthKey);
    if (window.AscendUI && window.AscendUI.showToast) {
      window.AscendUI.showToast(`Progress summary for ${monthKey} confirmed.`, 'success');
    }
  }
  selectMonthlyProgress(monthKey);
}

window.AscendViews = window.AscendViews || {};
Object.assign(window.AscendViews, {
  monthlyProgress: renderMonthlyProgress,
  selectMonthlyProgress,
  confirmMonthReview,
});
