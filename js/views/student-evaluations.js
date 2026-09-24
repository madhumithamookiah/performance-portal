/**
 * ASCEND – Student Evaluations & Monthly Tracking View
 * Read-only display of published faculty rubric evaluations and student monthly activity records.
 * Live-updated: evaluations pushed by faculty appear immediately via AscendData.evaluations.
 * Pure professional SVG icons — zero emojis.
 */

/* ── Rubric Levels → Visual Style Map (Professional SVG Icons) ─ */
const STUDENT_RUBRIC_LEVELS = {
  Outstanding: {
    color: '#1A73E8',
    bg: 'rgba(26,115,232,0.10)',
    border: 'rgba(26,115,232,0.25)',
    iconSvg: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    barPct: 100,
  },
  Strong: {
    color: '#1557D0',
    bg: 'rgba(21,87,208,0.10)',
    border: 'rgba(21,87,208,0.25)',
    iconSvg: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>',
    barPct: 75,
  },
  'Meets Expectations': {
    color: '#2E7D32',
    bg: 'rgba(46,125,50,0.10)',
    border: 'rgba(46,125,50,0.25)',
    iconSvg: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    barPct: 50,
  },
  Developing: {
    color: '#D97706',
    bg: 'rgba(217,119,6,0.10)',
    border: 'rgba(217,119,6,0.25)',
    iconSvg: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 11 12 6 7 11"/><line x1="12" y1="18" x2="12" y2="6"/></svg>',
    barPct: 25,
  },
};

const STUDENT_RUBRIC_CRITERIA = [
  { key: 'technical',          label: 'Technical Competency',          iconPath: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18' },
  { key: 'projectAbility',     label: 'Project / Application Ability',   iconPath: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
  { key: 'communication',      label: 'Communication',                  iconPath: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
  { key: 'leadership',         label: 'Collaboration & Leadership',     iconPath: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
  { key: 'careerPreparedness', label: 'Career Preparedness',            iconPath: 'M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' },
];

/* ── Active View Sub-Tab State ───────────────────────────────── */
window._studentEvalActiveTab = window._studentEvalActiveTab || 'evaluations';

/* ── Main Render ─────────────────────────────────────────────── */
function renderStudentEvaluations() {
  const { formatDate, Icons } = window.AscendUI || {};
  const allEvals = (window.AscendData && Array.isArray(window.AscendData.evaluations))
    ? window.AscendData.evaluations.filter(function(e) { return e.status === 'published'; })
    : [];

  const monthlySummaries = (window.AscendData && Array.isArray(window.AscendData.monthlySummaries))
    ? window.AscendData.monthlySummaries
    : [];

  const activeTab = window._studentEvalActiveTab || 'evaluations';

  return [
    '<!-- Page Header -->',
    '<div style="margin-bottom:24px;">',
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;">',
        '<div>',
          '<h1 style="font-size:1.6rem;font-weight:800;letter-spacing:-0.03em;color:var(--c-text);margin:0 0 4px;">My Evaluations &amp; Monthly Records</h1>',
          '<div style="font-size:13.5px;color:var(--c-text-2);line-height:1.5;">Faculty rubric assessments and factual monthly activity records &bull; Read-only formal records.</div>',
        '</div>',
        '<div style="display:flex;align-items:center;gap:8px;padding:8px 14px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:12px;font-size:12px;color:var(--c-text-2);">',
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
          'Live &mdash; updates when faculty publishes',
        '</div>',
      '</div>',
    '</div>',

    '<!-- Sub-Navigation Tabs -->',
    '<div style="display:flex;gap:8px;margin-bottom:24px;border-bottom:1px solid var(--c-border);padding-bottom:12px;">',
      '<button class="btn ' + (activeTab === 'evaluations' ? 'btn-primary' : 'btn-ghost') + ' btn-sm" onclick="AscendViews.switchStudentEvalTab(\'evaluations\')" style="font-weight:600;">',
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
        'Semester Evaluations (' + allEvals.length + ')',
      '</button>',
      '<button class="btn ' + (activeTab === 'monthly' ? 'btn-primary' : 'btn-ghost') + ' btn-sm" onclick="AscendViews.switchStudentEvalTab(\'monthly\')" style="font-weight:600;">',
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        'Monthly Activity Summaries (' + monthlySummaries.length + ')',
      '</button>',
    '</div>',

    activeTab === 'evaluations' ? renderSemesterEvaluationsTab(allEvals, formatDate) : renderMonthlySummariesTab(monthlySummaries, formatDate),

    '<style>',
    '@media(max-width:640px){.eval-summary-grid{grid-template-columns:1fr!important}.eval-criteria-grid{grid-template-columns:1fr!important}}',
    '@media(max-width:900px){.eval-summary-grid{grid-template-columns:repeat(2,1fr)!important}}',
    '.eval-card-enter{animation:evalSlideIn 0.35s cubic-bezier(0.22,1,0.36,1) both}',
    '@keyframes evalSlideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}',
    '</style>',
  ].join('');
}

/* ── Semester Evaluations Tab Content ────────────────────────── */
function renderSemesterEvaluationsTab(allEvals, formatDate) {
  return [
    '<div class="eval-summary-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:24px;">',
      '<div class="card" style="padding:18px 20px;border-left:4px solid #1A73E8;">',
        '<div style="font-size:28px;font-weight:800;color:#1A73E8;letter-spacing:-0.04em;">' + allEvals.length + '</div>',
        '<div style="font-size:12px;font-weight:600;color:var(--c-text);margin-top:2px;">Published Evaluations</div>',
        '<div style="font-size:11px;color:var(--c-text-3);margin-top:1px;">Formal semester records released</div>',
      '</div>',
      '<div class="card" style="padding:18px 20px;border-left:4px solid #2E7D32;">',
        '<div style="font-size:16px;font-weight:800;color:#2E7D32;letter-spacing:-0.02em;">' + (allEvals.length > 0 ? (allEvals[allEvals.length-1].evaluationPeriod || 'Semester 5') : '—') + '</div>',
        '<div style="font-size:12px;font-weight:600;color:var(--c-text);margin-top:2px;">Earliest Period</div>',
        '<div style="font-size:11px;color:var(--c-text-3);margin-top:1px;">First evaluated semester</div>',
      '</div>',
      '<div class="card" style="padding:18px 20px;border-left:4px solid #1557D0;">',
        '<div style="font-size:16px;font-weight:800;color:#1557D0;letter-spacing:-0.02em;">' + (allEvals.length > 0 ? (allEvals[0].evaluationPeriod || 'Semester 5') : '—') + '</div>',
        '<div style="font-size:12px;font-weight:600;color:var(--c-text);margin-top:2px;">Latest Period</div>',
        '<div style="font-size:11px;color:var(--c-text-3);margin-top:1px;">Most recent assessment</div>',
      '</div>',
    '</div>',

    '<div id="student-evals-list">',
      allEvals.length === 0 ? renderStudentEvalEmpty() : allEvals.map(function(ev){ return renderStudentEvalCard(ev, formatDate); }).join(''),
    '</div>',
  ].join('');
}

/* ── Monthly Activity Summaries Tab Content ──────────────────── */
function renderMonthlySummariesTab(summaries, formatDate) {
  if (!summaries.length) {
    return '<div class="card" style="padding:48px 24px;text-align:center;color:var(--c-text-3);">' +
      '<div style="font-size:var(--text-base);font-weight:600;color:var(--c-text);margin-bottom:4px;">No monthly activity records available</div>' +
      '<div style="font-size:var(--text-xs);">As you log achievements and projects, monthly summaries will be generated here.</div>' +
    '</div>';
  }

  return [
    '<div style="display:flex;flex-direction:column;gap:16px;">',
      summaries.map(function(m) {
        var isReviewed = !!m.reviewedByStudent;
        return '<div class="card" style="padding:20px 24px;border:1.5px solid var(--c-border);border-left:4px solid ' + (isReviewed ? 'var(--c-primary)' : '#D97706') + ';">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:12px;">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
              '<div style="width:34px;height:34px;border-radius:8px;background:var(--c-primary-light);color:var(--c-primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
              '</div>' +
              '<div>' +
                '<div style="font-size:15px;font-weight:700;color:var(--c-text);">' + m.month + '</div>' +
                '<div style="font-size:11px;color:var(--c-text-3);">Factual activity record &bull; Not a performance score</div>' +
              '</div>' +
            '</div>' +
            '<div>' +
              (isReviewed
                ? '<span class="badge" style="background:#E8F0FE;color:#1A73E8;border:1px solid #C2D8FF;font-weight:600;font-size:11px;padding:3px 10px;display:inline-flex;align-items:center;gap:4px;">' +
                    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Reviewed' +
                  '</span>'
                : '<span class="badge" style="background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;font-weight:600;font-size:11px;padding:3px 10px;display:inline-flex;align-items:center;gap:4px;">' +
                    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Review Needed' +
                  '</span>') +
            '</div>' +
          '</div>' +

          '<div style="padding:14px 16px;background:var(--c-bg);border:1px solid var(--c-border);border-radius:10px;margin-bottom:12px;">' +
            '<div style="font-size:var(--text-sm);font-weight:600;color:var(--c-text);line-height:1.5;">' + m.summaryText + '</div>' +
            '<div style="display:flex;align-items:center;gap:8px;margin-top:8px;flex-wrap:wrap;">' +
              '<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;background:var(--c-surface);border:1px solid var(--c-border);color:var(--c-text-2);">' +
                m.achievementsAdded + ' achievement' + (m.achievementsAdded !== 1 ? 's' : '') + ' added' +
              '</span>' +
              '<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;background:var(--c-surface);border:1px solid var(--c-border);color:var(--c-text-2);">' +
                m.projectsUpdated + ' project' + (m.projectsUpdated !== 1 ? 's' : '') + ' updated' +
              '</span>' +
              '<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;background:var(--c-surface);border:1px solid var(--c-border);color:var(--c-text-2);">' +
                m.feedbackReceived + ' feedback note' + (m.feedbackReceived !== 1 ? 's' : '') +
              '</span>' +
              '<span style="font-size:11px;color:var(--c-text-3);">&bull; Last activity: ' + (m.lastActivityFormatted || 'Recently') + '</span>' +
            '</div>' +
          '</div>' +

          '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:12px;color:var(--c-text-3);">' +
            '<div>' +
              (isReviewed && m.reviewedAt
                ? 'Reviewed on ' + (formatDate ? formatDate(m.reviewedAt) : m.reviewedAt.slice(0,10))
                : (isReviewed ? 'Marked as reviewed' : 'Pending student confirmation')) +
            '</div>' +
            '<div>' +
              (!isReviewed
                ? '<button class="btn btn-primary btn-sm" onclick="AscendViews.onStudentReviewMonth(\'' + m.monthKey + '\')">' +
                    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg> Mark as reviewed' +
                  '</button>'
                : '<button class="btn btn-ghost btn-sm" disabled style="opacity:0.75;cursor:default;">Confirmed</button>') +
            '</div>' +
          '</div>' +
        '</div>';
      }).join(''),
    '</div>',
  ].join('');
}

/* ── Empty State ─────────────────────────────────────────────── */
function renderStudentEvalEmpty() {
  return '<div class="card" style="padding:60px 24px;text-align:center;">' +
    '<div style="width:72px;height:72px;margin:0 auto 16px;border-radius:50%;background:linear-gradient(135deg,#E8F0FE,#EEF4FF);display:flex;align-items:center;justify-content:center;">' +
      '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' +
    '</div>' +
    '<div style="font-size:17px;font-weight:700;color:var(--c-text);margin-bottom:8px;">No semester evaluations published yet</div>' +
    '<div style="font-size:13px;color:var(--c-text-3);max-width:380px;margin:0 auto;line-height:1.6;">Your faculty advisor has not published any formal semester evaluations yet. When released, they will appear here automatically.</div>' +
    '<div style="margin-top:20px;display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:#E8F0FE;border-radius:20px;font-size:12px;color:#1A73E8;font-weight:500;">' +
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
      'Updates live when faculty publishes &bull; Drafts remain private to faculty' +
    '</div>' +
  '</div>';
}

/* ── Single Evaluation Card ──────────────────────────────────── */
function renderStudentEvalCard(ev, formatDate) {
  var evalDate = ev.publishedAt || ev.lastUpdated || ev.createdAt || '';
  var evaluatorInitials = (ev.evaluatorName || 'FA').split(' ').filter(function(n){ return n.length > 0; }).map(function(n){ return n[0]; }).slice(0,2).join('').toUpperCase();

  var levelOrder = { Outstanding: 4, Strong: 3, 'Meets Expectations': 2, Developing: 1 };
  var criteriaRanked = STUDENT_RUBRIC_CRITERIA.map(function(c) {
    return {
      key: c.key,
      label: c.label,
      iconPath: c.iconPath,
      level: (ev.scores && ev.scores[c.key] && ev.scores[c.key].level) || 'Developing',
      comment: (ev.scores && ev.scores[c.key] && ev.scores[c.key].comment) || '',
    };
  }).sort(function(a,b){ return (levelOrder[b.level]||0)-(levelOrder[a.level]||0); });

  var strongest = criteriaRanked[0];
  var strongestStyle = STUDENT_RUBRIC_LEVELS[strongest.level] || STUDENT_RUBRIC_LEVELS['Developing'];

  var criteriaHTML = STUDENT_RUBRIC_CRITERIA.map(function(c) {
    var score = (ev.scores && ev.scores[c.key]) || {};
    var level = score.level || 'Developing';
    var comment = score.comment || '';
    var st = STUDENT_RUBRIC_LEVELS[level] || STUDENT_RUBRIC_LEVELS['Developing'];

    return '<div style="padding:14px;background:var(--c-surface);border:1.5px solid ' + st.border + ';border-radius:14px;display:flex;flex-direction:column;gap:8px;transition:box-shadow 0.15s;" onmouseover="this.style.boxShadow=\'0 4px 16px rgba(0,0,0,0.08)\'" onmouseout="this.style.boxShadow=\'none\'">' +
      '<div style="display:flex;align-items:center;gap:8px;">' +
        '<div style="width:30px;height:30px;border-radius:8px;background:' + st.bg + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="' + st.color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + c.iconPath + '"/></svg>' +
        '</div>' +
        '<div style="font-size:11.5px;font-weight:700;color:var(--c-text);line-height:1.3;">' + c.label + '</div>' +
      '</div>' +
      '<div>' +
        '<span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:' + st.bg + ';color:' + st.color + ';border:1px solid ' + st.border + ';display:inline-flex;align-items:center;gap:4px;white-space:nowrap;">' +
          st.iconSvg + ' ' + level +
        '</span>' +
      '</div>' +
      '<div style="height:5px;background:var(--c-border);border-radius:99px;overflow:hidden;">' +
        '<div style="height:100%;width:' + st.barPct + '%;background:' + st.color + ';border-radius:99px;transition:width 0.6s ease;"></div>' +
      '</div>' +
      (comment
        ? '<div style="font-size:11px;color:var(--c-text-2);line-height:1.5;font-style:italic;border-top:1px solid var(--c-border);padding-top:8px;margin-top:2px;">&ldquo;' + comment + '&rdquo;</div>'
        : '<div style="font-size:10.5px;color:var(--c-text-3);font-style:italic;">No specific comment</div>') +
    '</div>';
  }).join('');

  return '<div class="card eval-card-enter" style="padding:0;overflow:hidden;margin-bottom:20px;border:1.5px solid var(--c-border);" id="seval-' + ev.id + '">' +
    '<!-- Gradient header -->' +
    '<div style="background:linear-gradient(135deg,#1A73E8 0%,#1557B0 100%);padding:20px 24px;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#fff;flex-shrink:0;backdrop-filter:blur(4px);">' +
            evaluatorInitials +
          '</div>' +
          '<div>' +
            '<div style="font-size:15px;font-weight:700;color:#fff;">' + (ev.evaluatorName || 'Faculty Advisor') + '</div>' +
            '<div style="font-size:11.5px;color:rgba(255,255,255,0.75);margin-top:2px;">' + (ev.evaluationPeriod || 'Semester Evaluation') + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 12px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:20px;font-size:11px;font-weight:600;color:#fff;">' +
            '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Published' +
          '</span>' +
          (evalDate ? '<span style="font-size:11px;color:rgba(255,255,255,0.65);">' + (formatDate ? formatDate(evalDate) : evalDate) + '</span>' : '') +
        '</div>' +
      '</div>' +
    '</div>' +

    '<!-- Highlight bar: Strongest Area -->' +
    '<div style="display:flex;align-items:center;gap:10px;padding:10px 24px;background:' + strongestStyle.bg + ';border-bottom:1px solid var(--c-border);">' +
      '<span style="display:inline-flex;color:' + strongestStyle.color + ';">' + strongestStyle.iconSvg + '</span>' +
      '<span style="font-size:12px;color:var(--c-text-2);">Demonstrated area: </span>' +
      '<span style="font-size:12px;font-weight:700;color:' + strongestStyle.color + ';">' + strongest.label + '</span>' +
      '<span style="margin-left:4px;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:' + strongestStyle.bg + ';color:' + strongestStyle.color + ';border:1px solid ' + strongestStyle.border + ';">' + strongest.level + '</span>' +
    '</div>' +

    '<!-- Criteria grid -->' +
    '<div class="eval-criteria-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;padding:20px 24px;">' +
      criteriaHTML +
    '</div>' +

    '<!-- Faculty summary -->' +
    '<div style="margin:0 24px 20px;padding:16px 18px;background:linear-gradient(135deg,#F8FAFF,#EEF4FF);border:1px solid #C2D8FF;border-radius:14px;">' +
      '<div style="font-size:10.5px;font-weight:700;color:#1557B0;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:8px;display:flex;align-items:center;gap:6px;">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
        'Faculty Summary &amp; Recommendations' +
      '</div>' +
      '<div style="font-size:13px;color:var(--c-text);line-height:1.8;">' +
        (ev.overallSummary || '<span style="color:var(--c-text-3);font-style:italic;">No summary provided.</span>') +
      '</div>' +
    '</div>' +

    '<!-- Footer -->' +
    '<div style="padding:12px 24px;background:var(--c-surface);border-top:1px solid var(--c-border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">' +
      '<div style="font-size:11px;color:var(--c-text-3);">Evaluated by <strong style="color:var(--c-text-2);">' + (ev.evaluatorName || 'Faculty') + '</strong>' +
        (evalDate ? ' &middot; Published ' + (formatDate ? formatDate(evalDate) : evalDate) : '') +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--c-text-3);">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
        'Read-only &mdash; formal faculty record' +
      '</div>' +
    '</div>' +
  '</div>';
}

/* ── Tab Switcher Handler ────────────────────────────────────── */
function switchStudentEvalTab(tabKey) {
  window._studentEvalActiveTab = tabKey;
  const content = document.getElementById('app-content-area');
  if (content && window.AscendViews && window.AscendViews.studentEvaluations) {
    content.innerHTML = window.AscendViews.studentEvaluations();
  }
}

/* ── Live Refresh Trigger ────────────────────────────────────── */
function refreshStudentEvalList() {
  const content = document.getElementById('app-content-area');
  if (content && window.AscendViews && window.AscendViews.studentEvaluations) {
    content.innerHTML = window.AscendViews.studentEvaluations();
  }
  if (window.AscendUI && window.AscendUI.showToast) {
    window.AscendUI.showToast('Your faculty evaluation has been published!', 'success');
  }
}

/* ── Export ──────────────────────────────────────────────────── */
window.AscendViews = window.AscendViews || {};
Object.assign(window.AscendViews, {
  studentEvaluations: renderStudentEvaluations,
  switchStudentEvalTab: switchStudentEvalTab,
  refreshStudentEvalList: refreshStudentEvalList,
});
