/**
 * ASCEND – Achievements View + Add Achievement Modal
 */

/* ── Achievement Card ──────────────────────────────────────── */
function achievementCardHTML(a) {
  const { Icons, formatDate, skillTag } = window.AscendUI;
  const cardColor = a.color || '#1A73E8';

  return `
    <div class="achievement-card" id="ach-card-${a.id}">
      <div class="achievement-card-top" style="background:${cardColor}"></div>
      <div class="achievement-card-body">
        <div class="achievement-card-header">
          <div style="display:flex;align-items:flex-start;gap:var(--sp-3);flex:1;">
            <div class="achievement-card-icon" style="background:${cardColor}15;color:${cardColor};">
              ${Icons[a.iconKey] || Icons.award}
            </div>
            <div style="flex:1;min-width:0;">
              <div class="achievement-card-title">${a.title}</div>
              <div class="achievement-card-org">${a.organization}</div>
            </div>
          </div>
        </div>
        <div class="achievement-card-meta">
          <div class="achievement-card-meta-item">${Icons.calendar} ${formatDate(a.date)}</div>
          <div class="achievement-card-meta-item">${Icons.award} ${a.category}</div>
          ${(a.proofLink || a.proofData || a.proofFileName) ? `
            <div class="achievement-card-meta-item" style="cursor:pointer;" onclick="AscendViews.viewProof('${a.id}')" title="Click to view proof">
              ${Icons.link} Proof attached
            </div>` : ''}
        </div>
        <p style="font-size:var(--text-sm);color:var(--c-text-2);line-height:1.7;">${a.description}</p>
        <div class="achievement-card-skills">
          ${a.skills.map(s => skillTag(s)).join('')}
        </div>
        <div class="achievement-card-footer">
          <div style="display:flex;gap:var(--sp-2);">
            ${(a.proofLink || a.proofData || a.proofFileName) ? `
              <button type="button" class="btn btn-ghost btn-sm" onclick="AscendViews.viewProof('${a.id}')" title="View attached proof or credential">
                ${Icons.externalLink} View proof
              </button>` : ''}
          </div>
          <div style="display:flex;gap:var(--sp-2);">
            <button class="btn btn-ghost btn-sm" onclick="AscendViews.editAchievement('${a.id}')">
              ${Icons.edit} Edit
            </button>
            <button class="btn btn-ghost btn-sm" style="color:var(--c-rejected);" onclick="AscendViews.deleteAchievement('${a.id}')">
              ${Icons.trash}
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

/* ── Main Achievements View ──────────────────────────────── */
function renderAchievements() {
  const { achievements, categories } = window.AscendData;
  const { Icons } = window.AscendUI;

  const cardsHTML = achievements.length === 0 ? `
    <div class="empty-state">
      <div class="empty-state-icon">${Icons.award}</div>
      <div class="empty-state-title">No achievements yet</div>
      <div class="empty-state-desc">Submit your first achievement to start building your professional portfolio.</div>
      <button class="btn btn-primary" onclick="AscendViews.openAddModal()">
        ${Icons.plus} Add your first achievement
      </button>
    </div>` : achievements.map(achievementCardHTML).join('');

  return `
    <!-- Header -->
    <div class="section-header" style="margin-bottom:var(--sp-6);">
      <div>
        <h1 style="font-size:var(--text-2xl);font-weight:700;letter-spacing:-0.025em;">Achievements</h1>
        <div style="font-size:var(--text-sm);color:var(--c-text-2);margin-top:4px;">
          ${achievements.length} achievement${achievements.length !== 1 ? 's' : ''} in your portfolio
        </div>
      </div>
      <button class="btn btn-primary" onclick="AscendViews.openAddModal()">
        ${Icons.plus} Add achievement
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar" id="ach-filter-bar">
      <div class="search-input-wrap">
        ${Icons.search}
        <input type="search" class="form-input search-input" id="ach-search"
          placeholder="Search achievements…" oninput="AscendViews.filterAchievements()">
      </div>
      <select class="form-input form-select" id="ach-category" style="width:auto;" onchange="AscendViews.filterAchievements()">
        <option value="">All categories</option>
        ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
      </select>
      <select class="form-input form-select" id="ach-year" style="width:auto;" onchange="AscendViews.filterAchievements()">
        <option value="">All years</option>
        <option value="2026">2026</option>
        <option value="2025">2025</option>
        <option value="2024">2024</option>
      </select>
      <select class="form-input form-select" id="ach-sort" style="width:auto;" onchange="AscendViews.filterAchievements()">
        <option value="date-desc">Newest first</option>
        <option value="date-asc">Oldest first</option>
        <option value="title">A–Z</option>
      </select>
    </div>

    <!-- Cards -->
    <div id="achievements-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:var(--sp-5);">
      ${cardsHTML}
    </div>

    <!-- Add Achievement Modal -->
    ${renderAddAchievementModal()}

    <!-- View Proof / Certificate Modal -->
    ${renderProofViewerModal()}`;
}

/* ── Filter Logic ────────────────────────────────────────── */
function filterAchievements() {
  const q    = (document.getElementById('ach-search')?.value || '').toLowerCase();
  const cat  = document.getElementById('ach-category')?.value || '';
  const year = document.getElementById('ach-year')?.value || '';

  let filtered = [...window.AscendData.achievements];
  if (q)    filtered = filtered.filter(a => a.title.toLowerCase().includes(q) || a.organization.toLowerCase().includes(q));
  if (cat)  filtered = filtered.filter(a => a.category === cat);
  if (year) filtered = filtered.filter(a => a.date.startsWith(year));

  const sortVal = document.getElementById('ach-sort')?.value || 'date-desc';
  filtered.sort((a, b) => {
    if (sortVal === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sortVal === 'date-asc')  return new Date(a.date) - new Date(b.date);
    if (sortVal === 'title')     return a.title.localeCompare(b.title);
    return 0;
  });

  const grid = document.getElementById('achievements-grid');
  if (grid) {
    grid.innerHTML = filtered.length > 0
      ? filtered.map(achievementCardHTML).join('')
      : `<div class="empty-state" style="grid-column:1/-1;">
           <div class="empty-state-icon">${window.AscendUI.Icons.search}</div>
           <div class="empty-state-title">No matching achievements</div>
           <div class="empty-state-desc">Try clearing your search or adjusting the filters.</div>
         </div>`;
  }
}

/* ── Delete Achievement ──────────────────────────────────── */
function deleteAchievement(id) {
  window.AscendUI.confirmDialog({
    title: 'Delete achievement',
    message: 'This will permanently remove this achievement from your profile. This action cannot be undone.',
    confirmLabel: 'Delete',
    danger: true,
    onConfirm: () => {
      window.AscendData.achievements = window.AscendData.achievements.filter(a => a.id !== id);
      if (window.AscendData.deleteAchievement) window.AscendData.deleteAchievement(id);
      window.AscendUI.showToast('Achievement deleted.', 'warning');
      AscendApp.navigate('achievements');
    },
  });
}

/* ── Category Configurations & Metadata ──────────────────── */
const ACH_CATEGORIES = [
  {
    name: 'Certification',
    iconKey: 'cloud',
    color: '#1A73E8',
    bg: '#E8F0FE',
    titlePlaceholder: 'e.g. AWS Certified Solutions Architect Associate',
    orgPlaceholder: 'e.g. Amazon Web Services',
    tip: 'Certifications demonstrate industry-recognized technical proficiency and domain knowledge.',
    skills: ['Cloud Architecture', 'AWS / GCP / Azure', 'DevOps & CI/CD', 'Cybersecurity', 'Database Administration', 'Networking', 'Python', 'Kubernetes', 'Linux', 'System Design'],
    docTitle: 'Certificate Document (PDF or Badge Image)',
    docSubtitle: 'Supports PDF, PNG, JPG, or JPEG — up to 10 MB',
    docPlaceholder: 'Click to browse or drop certificate (PDF, PNG, JPG)',
    urlLabel: 'Public Credential / Verification URL',
    urlPlaceholder: 'https://www.credly.com/badges/... or https://catalog-education.oracle.com/...',
    urlHint: 'Direct URL to verify your badge or credential online (e.g. Credly, AWS, Microsoft, Coursera).',
    evidenceTip: 'Industry certifications with verifiable Credly or official links validate your domain proficiency to mentors and recruiters.',
    impactLabel: 'Credential Scope, Score & Practical Application',
    impactPlaceholder: 'Detail the core domains tested, exam score or distinction, and how you have applied this knowledge in coursework or real projects…',
    impactPrompts: ['• Core Competencies: ', '• Practical Application: ', '• Score / Distinction: '],
    impactQuestions: [
      'What core technologies and domain standards were evaluated?',
      'How have you applied this certification in real-world projects or coursework?',
      'Did you achieve any score, distinction, or honors?'
    ]
  },
  {
    name: 'Hackathon',
    iconKey: 'sparkle',
    color: '#0288D1',
    bg: '#E1F5FE',
    titlePlaceholder: 'e.g. 1st Place Winner - Smart India Hackathon',
    orgPlaceholder: 'e.g. MoE & AICTE / Tech Fest',
    tip: 'Highlight your team role, prototype built, and problem tackled under time pressure.',
    skills: ['Rapid Prototyping', 'Full-Stack Development', 'RESTful APIs', 'Pitching & Presentation', 'UI/UX Design', 'Git Collaboration', 'Agile Sprinting', 'Problem Solving', 'Team Collaboration', 'MVP Development'],
    docTitle: 'Hackathon Certificate, Pitch Deck, or Prototype Photo',
    docSubtitle: 'Supports PDF, PNG, JPG, or JPEG — up to 10 MB',
    docPlaceholder: 'Click to browse or drop hackathon proof (PDF, PNG, JPG)',
    urlLabel: 'Project Submission / Devpost / GitHub Repository URL',
    urlPlaceholder: 'https://devpost.com/software/... or https://github.com/...',
    urlHint: 'Link to your Devpost project page, GitHub code repository, or live demo.',
    evidenceTip: 'Hackathon submissions with working demos or public repositories stand out for technical execution and teamwork.',
    impactLabel: 'Problem Tackled, Prototype Built & Winning Standing',
    impactPlaceholder: 'Describe the problem addressed, prototype architecture built under time pressure, team contribution, and final competition standing…',
    impactPrompts: ['• Problem Tackled: ', '• Prototype Built & Tech: ', '• Standing & Team Role: '],
    impactQuestions: [
      'What real-world problem did your team tackle in the hackathon?',
      'What functional prototype or MVP did you build and with what stack?',
      'What was your final ranking/award (e.g. 1st Place, Top 5) and personal contribution?'
    ]
  },
  {
    name: 'Internship',
    iconKey: 'briefcase',
    color: '#00897B',
    bg: '#E0F2F1',
    titlePlaceholder: 'e.g. Software Engineering Intern',
    orgPlaceholder: 'e.g. Microsoft India / Infosys',
    tip: 'Describe your core responsibilities, key tech stack, and deliverable impact.',
    skills: ['Production Codebase', 'Software Engineering', 'Code Review & QA', 'Agile / Scrum', 'Jira / Project Tracking', 'API Development', 'System Architecture', 'Cross-team Collaboration', 'CI/CD Pipelines', 'Technical Documentation'],
    docTitle: 'Internship Certificate, Offer Letter, or LOR',
    docSubtitle: 'Supports PDF, PNG, JPG, or JPEG — up to 10 MB',
    docPlaceholder: 'Click to browse or drop internship document (PDF, PNG, JPG)',
    urlLabel: 'Company Website, Public Project, or Mentor LinkedIn URL',
    urlPlaceholder: 'https://company.com/ or https://github.com/company-project or https://linkedin.com/in/...',
    urlHint: 'Link to company portal, public project release, or mentor\'s LinkedIn profile.',
    evidenceTip: 'Verified work experience and mentor recommendations establish credibility for future full-time opportunities.',
    impactLabel: 'Core Deliverables, Tech Stack & Measurable Impact',
    impactPlaceholder: 'Highlight your assigned features, technologies utilized, development methodology, and measurable business or performance impact…',
    impactPrompts: ['• Key Deliverables & Scope: ', '• Tech Stack & Methods: ', '• Measurable Impact: '],
    impactQuestions: [
      'What core features, services, or modules were you responsible for building?',
      'What tech stack and modern engineering workflows (CI/CD, Agile) were used?',
      'What measurable impact did your work achieve (e.g., improved load time by 30%, served 10k users)?'
    ]
  },
  {
    name: 'Project',
    iconKey: 'tool',
    color: '#7B1FA2',
    bg: '#F3E5F5',
    titlePlaceholder: 'e.g. Autonomous Drone Navigation System',
    orgPlaceholder: 'e.g. Robotics Club / Personal Open Source',
    tip: 'Highlight project architecture, tech stack, and user adoption or benchmark results.',
    skills: ['React', 'Node.js', 'Python', 'System Architecture', 'Database Design', 'Docker', 'RESTful APIs', 'Git', 'TypeScript', 'Cloud Deployment'],
    docTitle: 'Project Report, Architecture Diagram, or Demo Screenshot',
    docSubtitle: 'Supports PDF, PNG, JPG, or JPEG — up to 10 MB',
    docPlaceholder: 'Click to browse or drop project report, diagram, or demo screenshot (PDF, PNG, JPG)',
    urlLabel: 'Live Demo, GitHub Repository, or Documentation URL',
    urlPlaceholder: 'https://github.com/... or https://myproject.com/',
    urlHint: 'Link to live project deployment, GitHub repository, or documentation.',
    evidenceTip: 'Working live demos and well-documented GitHub repositories showcase practical engineering skills.',
    impactLabel: 'Problem Solved, Architectural Choices & Adoption / Benchmark Metrics',
    impactPlaceholder: 'Describe the core challenge solved, system architecture, performance optimizations, and user adoption or benchmark metrics…',
    impactPrompts: ['• Challenge Solved: ', '• Architectural Highlights: ', '• Metrics & Adoption: '],
    impactQuestions: [
      'What core problem or gap does this project solve?',
      'What were your key architectural decisions and tech stack tradeoffs?',
      'What measurable adoption, benchmark results, or performance improvements were achieved?'
    ]
  },
  {
    name: 'Research',
    iconKey: 'microscope',
    color: '#2E7D32',
    bg: '#E8F5E9',
    titlePlaceholder: 'e.g. Published Paper on Deep Learning for Healthcare',
    orgPlaceholder: 'e.g. IEEE Conference / Springer Journal',
    tip: 'Attach DOI, paper link, or institutional preprint verification.',
    skills: ['Research Methodology', 'Academic Writing', 'Literature Review', 'Data Analysis & Modeling', 'LaTeX', 'Statistical Testing', 'Experimental Design', 'Peer Review Process', 'Python / R / MATLAB', 'Algorithm Design'],
    docTitle: 'Research Paper PDF, Acceptance Letter, or Presentation',
    docSubtitle: 'Supports PDF, PNG, JPG, or JPEG — up to 10 MB',
    docPlaceholder: 'Click to browse or drop paper manuscript or acceptance letter (PDF, PNG, JPG)',
    urlLabel: 'DOI Link, arXiv URL, or Journal / Conference Publication Page',
    urlPlaceholder: 'https://doi.org/10... or https://arxiv.org/abs/... or https://ieeexplore.ieee.org/...',
    urlHint: 'Direct DOI link or indexed journal/conference paper link.',
    evidenceTip: 'Peer-reviewed publications with valid DOIs highlight scholarly rigor and advance research credentials.',
    impactLabel: 'Hypothesis, Novel Methodology & Publication Impact',
    impactPlaceholder: 'Summarize the research question, dataset & experimental methodology, key novel contributions, and publication venue…',
    impactPrompts: ['• Research Hypothesis: ', '• Novel Methodology: ', '• Publication & Contribution: '],
    impactQuestions: [
      'What primary research question or gap in literature did you investigate?',
      'What novel algorithm, model, or empirical methodology was developed?',
      'Where was the paper accepted/published, and what are the key findings or citation impact?'
    ]
  },
  {
    name: 'Academic',
    iconKey: 'graduationCap',
    color: '#3F51B5',
    bg: '#E8EAF6',
    titlePlaceholder: 'e.g. Semester 4 Department Rank 1 Merit',
    orgPlaceholder: 'e.g. Delhi Institute of Technology',
    tip: 'Highlight your semester GPA, subject distinction, or academic honors.',
    skills: ['Data Structures & Algorithms', 'Mathematics & Logic', 'Subject Mastery', 'Problem Solving', 'Theory of Computation', 'Database Management', 'Object-Oriented Design', 'Computer Networks', 'Operating Systems', 'Academic Excellence'],
    docTitle: 'Grade Card, Semester Transcript, or Merit Certificate',
    docSubtitle: 'Supports PDF, PNG, JPG, or JPEG — up to 10 MB',
    docPlaceholder: 'Click to browse or drop grade card or transcript (PDF, PNG, JPG)',
    urlLabel: 'University Portal / Result Verification URL',
    urlPlaceholder: 'https://university.edu/results/... or https://portal.edu/...',
    urlHint: 'Link to institutional academic results portal, Dean\'s list, or official circular.',
    evidenceTip: 'Official transcripts and verified department rankings demonstrate consistent academic discipline.',
    impactLabel: 'Academic Distinction, Coursework Rigor & Conceptual Highlights',
    impactPlaceholder: 'Highlight your semester GPA, subject honors, departmental rank, and deep theoretical concepts mastered…',
    impactPrompts: ['• Rank / Grade Distinction: ', '• Coursework Rigor & Honors: ', '• Conceptual Mastery: '],
    impactQuestions: [
      'What specific semester GPA, rank (e.g. Rank 1 in Dept), or distinction was awarded?',
      'What difficult subject areas or honors coursework were undertaken?',
      'What theoretical or analytical concepts did you master through this milestone?'
    ]
  },
  {
    name: 'Leadership',
    iconKey: 'star',
    color: '#E65100',
    bg: '#FFF3E0',
    titlePlaceholder: 'e.g. President - Developer Student Club',
    orgPlaceholder: 'e.g. DSC / IEEE Student Branch',
    tip: 'Detail the initiative led, team size, attendee reach, and organizational outcomes.',
    skills: ['Team Leadership', 'Event Management', 'Public Speaking', 'Mentorship', 'Strategic Planning', 'Community Building', 'Cross-Functional Coordination', 'Budget Management', 'Problem Solving', 'Conflict Resolution'],
    docTitle: 'Appointment Letter, Event Brochure, or Commendation Certificate',
    docSubtitle: 'Supports PDF, PNG, JPG, or JPEG — up to 10 MB',
    docPlaceholder: 'Click to browse or drop leadership appointment, brochure, or certificate (PDF, PNG, JPG)',
    urlLabel: 'Club Website, Event Page, or Press / Social Media Feature URL',
    urlPlaceholder: 'https://dsc-chapter.org/ or https://linkedin.com/posts/...',
    urlHint: 'Link to student chapter page, event registration portal, or official press announcement.',
    evidenceTip: 'Leadership milestones demonstrate executive maturity, organization, and peer mentorship.',
    impactLabel: 'Initiative Led, Team Size, Community Reach & Outcomes',
    impactPlaceholder: 'Detail the initiative led, size of team managed, number of participants reached, and concrete outcomes achieved…',
    impactPrompts: ['• Initiative & Scope: ', '• Team & Stakeholder Leadership: ', '• Reach & Concrete Outcomes: '],
    impactQuestions: [
      'What initiative, committee, or organization did you lead?',
      'How large was the team or volunteer base you mentored and coordinated?',
      'What attendee reach, community growth, or concrete outcomes did you deliver?'
    ]
  },
  {
    name: 'Award',
    iconKey: 'trophy',
    color: '#F57C00',
    bg: '#FFF3E0',
    titlePlaceholder: 'e.g. National Coding Olympiad Gold Medal',
    orgPlaceholder: 'e.g. ACM / Computer Society of India',
    tip: 'Specify competition standing, judging criteria, and credential details.',
    skills: ['Competitive Programming', 'Algorithmic Problem Solving', 'Advanced Mathematics', 'Technical Innovation', 'High Performance under Pressure', 'Speed Coding', 'Analytical Thinking', 'Critical Reasoning', 'Algorithm Optimization', 'Excellence'],
    docTitle: 'Award Certificate, Medal / Trophy Photo, or Citation',
    docSubtitle: 'Supports PDF, PNG, JPG, or JPEG — up to 10 MB',
    docPlaceholder: 'Click to browse or drop award certificate or trophy photo (PDF, PNG, JPG)',
    urlLabel: 'Official Contest Leaderboard / Winner Announcement URL',
    urlPlaceholder: 'https://codeforces.com/contest/... or https://hackerearth.com/...',
    urlHint: 'Link to official contest ranking, press release, or organizational announcement.',
    evidenceTip: 'Honors and competitive programming podium finishes underscore exceptional technical mastery and distinction.',
    impactLabel: 'Competition Standing, Selection Rigor & Recognition Scope',
    impactPlaceholder: 'Detail the competition scale, number of competitors, judging criteria, and the significance of the award tier received…',
    impactPrompts: ['• Competition & Standing: ', '• Selection Criteria & Scope: ', '• Recognition Highlight: '],
    impactQuestions: [
      'What competition or contest was this (e.g. National Coding Olympiad), and what was your tier/medal?',
      'What was the pool of participants and what evaluation criteria were used?',
      'What notable recognition or prizes did you receive?'
    ]
  }
];

/* ── Certificate SVG Data Generator (for High-Res Document Preview) ── */
function generateCertificateDataUrl(ach, studentName) {
  const catColor = ach.color || '#1A73E8';
  const org = ach.organization || 'Ascend Academic & Professional Authority';
  const title = ach.title || 'Verified Achievement';
  const date = ach.date || '2026';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="640" viewBox="0 0 900 640">
    <defs>
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#F8FAFD"/>
      </linearGradient>
      <linearGradient id="bar" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${catColor}"/>
        <stop offset="50%" stop-color="#34A853"/>
        <stop offset="100%" stop-color="#FBBC04"/>
      </linearGradient>
    </defs>
    <rect width="900" height="640" rx="16" fill="url(#g1)" stroke="#D2E3FC" stroke-width="4"/>
    <rect x="0" y="0" width="900" height="12" fill="url(#bar)"/>
    <rect x="30" y="40" width="840" height="560" rx="12" fill="#FFFFFF" stroke="${catColor}" stroke-width="1.5" stroke-dasharray="6,4"/>
    <text x="450" y="110" font-family="'Google Sans',Arial,sans-serif" font-size="14" font-weight="bold" fill="${catColor}" text-anchor="middle" letter-spacing="3">${(org || 'ASCEND PORTAL').toUpperCase()}</text>
    <text x="450" y="150" font-family="'Google Sans',Arial,sans-serif" font-size="12" font-weight="600" fill="#5F6368" text-anchor="middle" letter-spacing="2">OFFICIAL CERTIFICATE OF ACHIEVEMENT</text>
    <line x1="300" y1="170" x2="600" y2="170" stroke="#E8EAED" stroke-width="2"/>
    <text x="450" y="220" font-family="'Google Sans',Arial,sans-serif" font-size="15" fill="#3C4043" text-anchor="middle">This is to officially certify that</text>
    <text x="450" y="270" font-family="'Google Sans',Arial,sans-serif" font-size="28" font-weight="bold" fill="#202124" text-anchor="middle">${studentName || 'Aarav Sharma'}</text>
    <text x="450" y="320" font-family="'Google Sans',Arial,sans-serif" font-size="15" fill="#3C4043" text-anchor="middle">has successfully completed and demonstrated verified competency in</text>
    <text x="450" y="375" font-family="'Google Sans',Arial,sans-serif" font-size="24" font-weight="bold" fill="${catColor}" text-anchor="middle">${title}</text>
    <text x="450" y="430" font-family="'Google Sans',Arial,sans-serif" font-size="13" fill="#5F6368" text-anchor="middle">Category: ${ach.category || 'Achievement'} · Completed: ${date} · Digitally Signed &amp; Sealed</text>
    <rect x="350" y="460" width="200" height="34" rx="17" fill="#E6F4EA" stroke="#CEEAD6"/>
    <text x="450" y="482" font-family="'Google Sans',Arial,sans-serif" font-size="12" font-weight="bold" fill="#137333" text-anchor="middle">✔ ASCEND VERIFIED EVIDENCE</text>
    <text x="450" y="540" font-family="monospace" font-size="11" fill="#70757A" text-anchor="middle">Credential ID: ASC-${(ach.id || '001').slice(-8).toUpperCase()}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* ── Fullscreen Image Lightbox Viewer ─────────────────────── */
function openImageLightbox(imgSrc, title) {
  let lightbox = document.getElementById('image-lightbox-modal');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'image-lightbox-modal';
    lightbox.className = 'image-lightbox-overlay';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.onclick = (e) => {
      if (e.target === lightbox) closeImageLightbox();
    };
    document.body.appendChild(lightbox);
  }

  const safeTitle = (title || 'Document Evidence Image').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  lightbox.innerHTML = `
    <div class="image-lightbox-container" onclick="event.stopPropagation()">
      <div class="image-lightbox-topbar">
        <div class="image-lightbox-title">${safeTitle}</div>
        <div class="image-lightbox-actions">
          <button type="button" class="lightbox-btn" onclick="window.open('${imgSrc}', '_blank')">
            ${window.AscendUI.Icons.externalLink} Open in New Tab
          </button>
          <button type="button" class="lightbox-btn" onclick="AscendViews.closeImageLightbox()" aria-label="Close image">
            ${window.AscendUI.Icons.x} Close
          </button>
        </div>
      </div>
      <img src="${imgSrc}" class="image-lightbox-img" alt="${safeTitle}">
    </div>
  `;
  lightbox.style.display = 'flex';
}

function closeImageLightbox() {
  const lightbox = document.getElementById('image-lightbox-modal');
  if (lightbox) lightbox.style.display = 'none';
}

function openPdfDocument(dataUrl, filename) {
  openProofFile({
    id: 'doc-file',
    title: filename || 'Document Preview',
    proofFileName: filename || 'Document.pdf',
    proofData: dataUrl
  });
}

function openProofFile(achOrId) {
  let ach = null;
  if (achOrId && typeof achOrId === 'object') {
    ach = achOrId;
  } else if (achOrId && typeof achOrId === 'string') {
    if (window.AscendData && Array.isArray(window.AscendData.achievements)) {
      ach = window.AscendData.achievements.find(a => a.id === achOrId);
    }
    if (!ach && window._activeProofAch && window._activeProofAch.id === achOrId) {
      ach = window._activeProofAch;
    }
  }
  if (!ach && window._activeProofAch) {
    ach = window._activeProofAch;
  }

  if (!ach) {
    if (window.AscendUI && window.AscendUI.showToast) {
      window.AscendUI.showToast('Achievement or document details not found.', 'error');
    }
    return;
  }

  const fileName = ach.proofFileName || ((ach.proofLink && ach.proofLink !== 'Certificate Attached' && !ach.proofLink.startsWith('http')) ? ach.proofLink : 'Official_Certificate.pdf');
  let dataUrl = ach.proofData;
  const proofLink = (ach.proofLink || '').trim();

  // If no dataUrl but proofLink is a web URL, open directly
  if (!dataUrl && (/^https?:\/\//i.test(proofLink) || (/^www\./i.test(proofLink) && !proofLink.includes(' ')))) {
    const targetUrl = /^https?:\/\//i.test(proofLink) ? proofLink : 'https://' + proofLink;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  // If no dataUrl, synthesize authentic certificate PDF dataUrl
  if (!dataUrl && (fileName || proofLink)) {
    const student = (window.AscendData && window.AscendData.student) || { name: 'Aarav Sharma' };
    dataUrl = generateCertificateDataUrl(ach, student.name);
    ach.proofData = dataUrl;
    if (window.AscendData && window.AscendData.saveAchievement) {
      window.AscendData.saveAchievement(ach);
    }
  }

  if (dataUrl) {
    if (dataUrl.startsWith('data:')) {
      try {
        const parts = dataUrl.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
        const bstr = (typeof atob !== 'undefined') ? atob(parts[1]) : (typeof Buffer !== 'undefined' ? Buffer.from(parts[1], 'base64').toString('binary') : '');
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          const a = document.createElement('a');
          a.href = blobUrl;
          a.target = '_blank';
          a.rel = 'noopener,noreferrer';
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            if (a.parentNode) a.parentNode.removeChild(a);
          }, 1000);
        }
        return;
      } catch (err) {
        console.error('[Ascend] Error opening dataUrl as Blob:', err);
        window.open(dataUrl, '_blank');
        return;
      }
    } else {
      window.open(dataUrl, '_blank', 'noopener,noreferrer');
      return;
    }
  }

  if (window.AscendUI && window.AscendUI.showToast) {
    window.AscendUI.showToast('No attached document found for this achievement.', 'warning');
  }
}

function openUploadedPreviewFile() {
  if (uploadedFileMeta && uploadedFileMeta.dataUrl) {
    openProofFile({
      id: 'preview-uploaded-doc',
      title: uploadedFileMeta.name || 'Uploaded Document',
      proofFileName: uploadedFileMeta.name || 'document.pdf',
      proofData: uploadedFileMeta.dataUrl
    });
  } else {
    if (window.AscendUI && window.AscendUI.showToast) {
      window.AscendUI.showToast('No uploaded file data available to view.', 'warning');
    }
  }
}

const generateCertificatePdfDataUrl = generateCertificateDataUrl;

/* ── Proof / Certificate Viewer Modal HTML ───────────────── */
function renderProofViewerModal() {
  const { Icons } = window.AscendUI;
  return `
    <div class="modal-overlay" id="view-proof-modal" onclick="if(event.target===this)AscendUI.closeModal('view-proof-modal')">
      <div class="modal" style="max-width:700px;width:100%;border-radius:20px;overflow:hidden;" role="dialog" aria-modal="true" aria-labelledby="proof-modal-title" onclick="event.stopPropagation()">
        <div class="modal-header" style="background:#F8FAFD;border-bottom:1px solid var(--c-border);padding:16px 20px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div id="proof-modal-header-icon" style="width:34px;height:34px;border-radius:50%;background:#E8F0FE;display:flex;align-items:center;justify-content:center;color:#1A73E8;flex-shrink:0;">
              ${Icons.award}
            </div>
            <div>
              <div class="modal-title" id="proof-modal-title" style="font-size:16px;font-weight:700;color:var(--c-text);">Achievement Proof & Evidence</div>
              <div style="font-size:11px;color:var(--c-text-3);" id="proof-modal-subtitle">Verified Milestone & Attached Documentation</div>
            </div>
          </div>
          <button type="button" class="modal-close" onclick="AscendUI.closeModal('view-proof-modal')" aria-label="Close modal">
            ${Icons.x}
          </button>
        </div>
        <div class="modal-body" id="proof-modal-content" style="padding:20px;max-height:74vh;overflow-y:auto;background:var(--c-bg);">
          <!-- Populated dynamically by openProofViewerModal -->
        </div>
        <div class="modal-footer" id="proof-modal-footer" style="display:flex;align-items:center;justify-content:space-between;background:var(--c-surface);border-top:1px solid var(--c-border);padding:14px 20px;">
          <button type="button" class="btn btn-outline btn-sm" onclick="window.print()">
            ${Icons.download || Icons.file} Print / Save Details
          </button>
          <div style="display:flex;align-items:center;gap:8px;" id="proof-modal-actions">
            <button type="button" class="btn btn-primary btn-sm" onclick="AscendUI.closeModal('view-proof-modal')">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

/* ── View Proof Handler ────────────────────────────────    */
function viewProof(id) {
  const ach = (window.AscendData && Array.isArray(window.AscendData.achievements))
    ? window.AscendData.achievements.find(a => a.id === id)
    : null;
  if (!ach) {
    if (window.AscendUI && window.AscendUI.showToast) {
      window.AscendUI.showToast('Achievement details not found.', 'error');
    }
    return;
  }

  // Open the comprehensive proof details modal so details, doc, and URL are all listed
  openProofViewerModal(ach);
}

function openProofViewerModal(ach) {
  let modal = document.getElementById('view-proof-modal');
  if (!modal) {
    const div = document.createElement('div');
    div.innerHTML = renderProofViewerModal();
    modal = div.firstElementChild;
    document.body.appendChild(modal);
  }

  const { Icons, formatDate, skillTag } = window.AscendUI;
  const student = (window.AscendData && window.AscendData.student) || { name: 'Aarav Sharma' };
  const cardColor = ach.color || '#1A73E8';

  const modalTitle = document.getElementById('proof-modal-title');
  const modalContent = document.getElementById('proof-modal-content');
  const modalActions = document.getElementById('proof-modal-actions');
  const headerIcon = document.getElementById('proof-modal-header-icon');

  if (modalTitle) {
    modalTitle.textContent = `${ach.title} – Verification Proof`;
  }
  const modalSubtitle = document.getElementById('proof-modal-subtitle');
  if (modalSubtitle) {
    modalSubtitle.textContent = 'Verified Evidence Document';
  }
  if (headerIcon) {
    headerIcon.style.background = `${cardColor}15`;
    headerIcon.style.color = cardColor;
    headerIcon.innerHTML = Icons[ach.iconKey] || Icons.award;
  }

  // Determine URL validity
  const rawProof = (ach.proofLink || '').trim();
  const isWebUrl = /^https?:\/\//i.test(rawProof) || (/^www\./i.test(rawProof) && !rawProof.includes(' '));
  const fullUrl = isWebUrl ? (/^https?:\/\//i.test(rawProof) ? rawProof : `https://${rawProof}`) : null;

  // Determine Document validity
  const hasUploadedBinary = !!(ach.proofData && typeof ach.proofData === 'string');
  const isImageBinary = hasUploadedBinary && ach.proofData.startsWith('data:image/');
  const isPdfBinary = hasUploadedBinary && ach.proofData.startsWith('data:application/pdf');

  // Filename
  let proofFileName = ach.proofFileName;
  if (!proofFileName) {
    if (ach.proofLink && !isWebUrl && ach.proofLink !== 'Certificate Attached') {
      proofFileName = ach.proofLink;
    } else if (hasUploadedBinary) {
      proofFileName = isPdfBinary ? `${ach.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Document.pdf` : `${ach.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Certificate.png`;
    } else if (ach.proofLink === 'Certificate Attached') {
      proofFileName = `${ach.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Certificate.png`;
    }
  }

  const hasDoc = !!(hasUploadedBinary || proofFileName || ach.proofLink === 'Certificate Attached');
  const safeTitle = (ach.title || 'Achievement Proof').replace(/'/g, "\\'");

  if (modalActions) {
    let actionButtons = '';
    if (hasDoc) {
      actionButtons += `
        <button type="button" class="btn btn-outline btn-sm" onclick="AscendViews.openProofFile('${ach.id}')" title="Open actual uploaded file in new tab">
          ${Icons.externalLink || Icons.file} Open File
        </button>`;
    } else if (fullUrl) {
      actionButtons += `
        <button type="button" class="btn btn-outline btn-sm" onclick="window.open('${fullUrl}', '_blank', 'noopener,noreferrer')" title="Open verification URL">
          ${Icons.externalLink} Open Link
        </button>`;
    }
    actionButtons += `
      <button type="button" class="btn btn-primary btn-sm" onclick="AscendUI.closeModal('view-proof-modal')">
        Close
      </button>`;
    modalActions.innerHTML = actionButtons;
  }

  if (modalContent) {
    // Build Certificate / Document File Column HTML (NO explicit embedded doc/thumbnail)
    let docCardHTML = '';
    if (hasDoc) {
      docCardHTML = `
        <div class="proof-evidence-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:14px;background:#F8FAFD;border:1.5px solid #D2E3FC;border-radius:12px;padding:16px;">
          <div>
            <div class="proof-card-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="color:var(--c-primary);font-size:18px;">${Icons.fileText || Icons.file}</span>
                <span style="font-weight:700;font-size:12px;color:var(--c-text);text-transform:uppercase;letter-spacing:0.04em;">Certificate / Document File</span>
              </div>
              <span class="proof-card-badge doc" style="font-size:10.5px;font-weight:600;color:#137333;background:#E6F4EA;border:1px solid #CEEAD6;padding:2px 8px;border-radius:10px;">Digitally Sealed</span>
            </div>
            <div style="margin-top:6px;">
              <div style="font-weight:600;font-size:13.5px;color:var(--c-primary);word-break:break-all;line-height:1.4;cursor:pointer;text-decoration:underline;"
                   onclick="AscendViews.openProofFile('${ach.id}')"
                   title="Click to open ${proofFileName}">
                ${proofFileName}
              </div>
              <div style="font-size:11px;color:var(--c-text-3);margin-top:4px;">
                ${isPdfBinary ? 'PDF Document' : (isImageBinary ? 'Uploaded Image Document' : 'Official Attached Certificate')} · Verified Evidence
              </div>
            </div>
          </div>
          <div>
            <button type="button" class="btn btn-primary btn-sm" onclick="event.stopPropagation();AscendViews.openProofFile('${ach.id}')" style="display:inline-flex;align-items:center;gap:6px;">
              ${Icons.externalLink || ''} Open File
            </button>
          </div>
        </div>`;
    } else {
      docCardHTML = `
        <div class="proof-evidence-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:14px;background:var(--c-surface);border:1.5px solid var(--c-border);border-radius:12px;padding:16px;">
          <div>
            <div class="proof-card-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="color:var(--c-text-3);font-size:18px;">${Icons.file}</span>
                <span style="font-weight:700;font-size:12px;color:var(--c-text-2);text-transform:uppercase;letter-spacing:0.04em;">Certificate / Document File</span>
              </div>
              <span class="proof-card-badge empty" style="font-size:10.5px;color:var(--c-text-3);background:var(--c-bg);padding:2px 8px;border-radius:10px;">None</span>
            </div>
            <div style="font-size:12px;color:var(--c-text-3);margin-top:6px;">No certificate or document file was uploaded.</div>
          </div>
          <div>
            <span style="font-size:11px;color:var(--c-text-3);font-style:italic;">No file uploaded</span>
          </div>
        </div>`;
    }

    // Build Public Verification URL Column HTML
    let urlCardHTML = '';
    if (fullUrl) {
      urlCardHTML = `
        <div class="proof-evidence-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:14px;background:#F8FAFD;border:1.5px solid #D2E3FC;border-radius:12px;padding:16px;">
          <div>
            <div class="proof-card-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="color:#137333;font-size:18px;">${Icons.link || Icons.globe}</span>
                <span style="font-weight:700;font-size:12px;color:var(--c-text);text-transform:uppercase;letter-spacing:0.04em;">Verification URL</span>
              </div>
              <span class="proof-card-badge url" style="font-size:10.5px;font-weight:600;color:#1A73E8;background:#E8F0FE;border:1px solid #D2E3FC;padding:2px 8px;border-radius:10px;">Live Link</span>
            </div>
            <div style="margin-top:6px;">
              <a href="${fullUrl}" target="_blank" rel="noopener noreferrer" style="font-weight:600;font-size:13.5px;color:var(--c-primary);word-break:break-all;line-height:1.4;text-decoration:underline;display:block;" title="${fullUrl}">
                ${fullUrl}
              </a>
              <div style="font-size:11px;color:var(--c-text-3);margin-top:4px;">
                Public institutional credential verification link
              </div>
            </div>
          </div>
          <div>
            <button type="button" class="btn btn-outline btn-sm" onclick="event.stopPropagation();window.open('${fullUrl}', '_blank', 'noopener,noreferrer')" style="display:inline-flex;align-items:center;gap:6px;">
              ${Icons.externalLink || ''} Open Link
            </button>
          </div>
        </div>`;
    } else {
      urlCardHTML = `
        <div class="proof-evidence-card" style="display:flex;flex-direction:column;justify-content:space-between;gap:14px;background:var(--c-surface);border:1.5px solid var(--c-border);border-radius:12px;padding:16px;">
          <div>
            <div class="proof-card-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="color:var(--c-text-3);font-size:18px;">${Icons.link}</span>
                <span style="font-weight:700;font-size:12px;color:var(--c-text-2);text-transform:uppercase;letter-spacing:0.04em;">Verification URL</span>
              </div>
              <span class="proof-card-badge empty" style="font-size:10.5px;color:var(--c-text-3);background:var(--c-bg);padding:2px 8px;border-radius:10px;">None</span>
            </div>
            <div style="font-size:12px;color:var(--c-text-3);margin-top:6px;">No online verification URL was provided.</div>
          </div>
          <div>
            <span style="font-size:11px;color:var(--c-text-3);font-style:italic;">No URL provided</span>
          </div>
        </div>`;
    }

    modalContent.innerHTML = `
      <div style="border:2px solid ${cardColor}30;border-radius:16px;background:var(--c-surface);overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,0.05);">
        <div style="height:6px;background:linear-gradient(90deg, ${cardColor}, #34A853, #FBBC04, #EA4335);"></div>

        <div style="padding:24px 20px;text-align:center;background:radial-gradient(circle at center, #FFFFFF 0%, #F8FAFD 100%);">
          <!-- Authority Header -->
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:10px;">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:${cardColor}15;color:${cardColor};">
              ${Icons[ach.iconKey] || Icons.award}
            </span>
            <span style="font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--c-text-2);">
              ${ach.organization || 'Institutional Verification'}
            </span>
          </div>

          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:var(--c-text-3);margin-bottom:4px;">
            Official Portfolio Credential
          </div>

          <h2 style="font-size:22px;font-weight:700;color:var(--c-text);margin:6px 0 10px;line-height:1.3;">
            ${ach.title}
          </h2>

          <div style="font-size:13px;color:var(--c-text-2);margin-bottom:14px;">
            Officially verified and awarded to <strong>${student.name || 'Aarav Sharma'}</strong>
          </div>

          <div style="display:inline-flex;align-items:center;gap:6px;background:#E6F4EA;border:1px solid #CEEAD6;color:#137333;font-size:12px;font-weight:600;padding:4px 14px;border-radius:20px;margin-bottom:16px;">
            ${Icons.check} Institutional Evidence Verified
          </div>

          <!-- Metadata Grid -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:12px;margin:14px 0;padding:14px;background:var(--c-surface);border:1px solid var(--c-border);border-radius:12px;text-align:left;">
            <div>
              <div style="font-size:10px;font-weight:600;color:var(--c-text-3);text-transform:uppercase;">Category</div>
              <div style="font-size:13px;font-weight:600;color:var(--c-text);margin-top:2px;">${ach.category}</div>
            </div>
            <div>
              <div style="font-size:10px;font-weight:600;color:var(--c-text-3);text-transform:uppercase;">Date Completed</div>
              <div style="font-size:13px;font-weight:600;color:var(--c-text);margin-top:2px;">${formatDate(ach.date)}</div>
            </div>
            <div>
              <div style="font-size:10px;font-weight:600;color:var(--c-text-3);text-transform:uppercase;">Organization</div>
              <div style="font-size:13px;font-weight:600;color:var(--c-primary);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${ach.organization || 'Verified Issuer'}</div>
            </div>
            <div>
              <div style="font-size:10px;font-weight:600;color:var(--c-text-3);text-transform:uppercase;">Credential ID</div>
              <div style="font-size:12px;font-family:monospace;color:var(--c-text-2);margin-top:2px;">ASC-${(ach.id || '001').slice(-8).toUpperCase()}</div>
            </div>
          </div>

          <!-- Skills tags -->
          ${(Array.isArray(ach.skills) && ach.skills.length > 0) ? `
            <div style="margin-top:14px;text-align:center;">
              <div style="font-size:11px;font-weight:600;color:var(--c-text-3);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;">Demonstrated Skills & Competencies</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;">
                ${ach.skills.map(s => skillTag(s)).join('')}
              </div>
            </div>` : ''}

          <!-- Description -->
          ${ach.description ? `
            <div style="margin-top:14px;padding:10px 14px;background:var(--c-bg);border-radius:8px;font-size:12px;color:var(--c-text-2);line-height:1.6;text-align:left;">
              ${ach.description}
            </div>` : ''}

          <!-- Evidence Columns: Separate Column for Certificate/Document File & URL -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:14px;margin-top:18px;text-align:left;">
            ${docCardHTML}
            ${urlCardHTML}
          </div>
        </div>
      </div>`;
  }

  window.AscendUI.openModal('view-proof-modal');
}

/* ── Modal State ─────────────────────────────────────────── */
let currentAchStep = 1;
let selectedSkills = [];
let editingAchId = null;
let uploadedFileMeta = null;

/* ── Add / Edit Achievement Modal HTML ───────────────────── */
function renderAddAchievementModal() {
  const { Icons } = window.AscendUI;
  const initialCategory = ACH_CATEGORIES[0];

  const catCardsHTML = ACH_CATEGORIES.map((cat, idx) => `
    <div class="ach-cat-card ${idx === 0 ? 'selected' : ''}" data-cat="${cat.name}"
      style="--cat-accent:${cat.color};--cat-bg:${cat.bg};"
      onclick="AscendViews.selectCategory('${cat.name}')">
      <div class="ach-cat-icon" style="color:${cat.color};">
        ${Icons[cat.iconKey] || Icons.award}
      </div>
      <span style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${cat.name}</span>
    </div>
  `).join('');

  const defaultSuggestions = (window.AscendData && window.AscendData.skillOptions)
    ? window.AscendData.skillOptions
    : ['Python', 'JavaScript', 'React', 'Node.js', 'Machine Learning', 'Cloud Computing', 'SQL & Databases', 'Problem Solving', 'Data Analysis', 'Docker / DevOps'];

  const suggestPillsHTML = defaultSuggestions.map(s => `
    <button type="button" class="ach-suggest-pill" data-skill="${s}" onclick="AscendViews.toggleSkill('${s}')">
      <span>+</span> ${s}
    </button>
  `).join('');

  return `
    <div class="modal-overlay" id="add-achievement-modal" onclick="if(event.target===this)AscendUI.closeModal('add-achievement-modal')">
      <div class="modal modal-achievement" onclick="event.stopPropagation()">
        <!-- Top Category Colored Accent Bar -->
        <div class="ach-modal-accent-bar" id="ach-modal-accent-bar" style="background:linear-gradient(90deg, ${initialCategory.color}, ${initialCategory.color}CC);"></div>

        <!-- Header -->
        <div class="ach-modal-header">
          <div class="ach-header-left">
            <div class="ach-header-icon" id="ach-header-icon" style="background:${initialCategory.bg};color:${initialCategory.color};">
              ${Icons[initialCategory.iconKey] || Icons.award}
            </div>
            <div>
              <div class="ach-header-title" id="ach-modal-title">Add New Achievement</div>
              <div class="ach-header-sub" id="ach-modal-sub">Record and verify your academic, professional, and extracurricular milestones</div>
            </div>
          </div>
          <button class="modal-close" onclick="AscendUI.closeModal('add-achievement-modal')" aria-label="Close">${Icons.x}</button>
        </div>

        <!-- Stepper Navigation -->
        <div class="ach-stepper-wrap">
          <button type="button" class="ach-step-item active" id="step-tab-1" onclick="AscendViews.goToStep(1)">
            <span class="ach-step-num" id="step-num-1">1</span>
            <span>Details</span>
          </button>
          <div class="ach-step-divider"></div>
          <button type="button" class="ach-step-item" id="step-tab-2" onclick="AscendViews.goToStep(2)">
            <span class="ach-step-num" id="step-num-2">2</span>
            <span>Evidence</span>
          </button>
          <div class="ach-step-divider"></div>
          <button type="button" class="ach-step-item" id="step-tab-3" onclick="AscendViews.goToStep(3)">
            <span class="ach-step-num" id="step-num-3">3</span>
            <span>Skills & Impact</span>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body" id="add-ach-form-body" style="padding:20px 24px;">

          <!-- STEP 1: Core Details -->
          <div class="ach-step-section active" id="ach-step-1">
            <!-- Visual Category Grid -->
            <div class="form-group">
              <label class="form-label">Category <span class="required">*</span></label>
              <div class="ach-cat-grid" id="ach-cat-grid">
                ${catCardsHTML}
              </div>
              <input type="hidden" id="ach-cat" value="${initialCategory.name}">
              <div class="form-error" id="err-cat" style="display:none;">${Icons.alertCircle} Please select a category.</div>
            </div>

            <!-- Title -->
            <div class="form-group">
              <label class="form-label" for="ach-title">Achievement Title <span class="required">*</span></label>
              <input class="form-input" id="ach-title" type="text"
                placeholder="${initialCategory.titlePlaceholder}"
                oninput="AscendViews.updateLivePreview();document.getElementById('err-title').style.display='none';this.classList.remove('error');">
              <div class="form-error" id="err-title" style="display:none;">${Icons.alertCircle} Please enter an achievement title.</div>
            </div>

            <!-- Issuing Organisation + Date row -->
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="ach-org">Issuing Organisation / Body <span class="required">*</span></label>
                <input class="form-input" id="ach-org" type="text"
                  placeholder="${initialCategory.orgPlaceholder}"
                  oninput="AscendViews.updateLivePreview();document.getElementById('err-org').style.display='none';this.classList.remove('error');">
                <div class="form-error" id="err-org" style="display:none;">${Icons.alertCircle} Please enter the organisation or issuer.</div>
              </div>
              <div class="form-group">
                <label class="form-label" for="ach-date">Date Earned / Completed <span class="required">*</span></label>
                <input class="form-input" id="ach-date" type="date"
                  max="${new Date().toISOString().split('T')[0]}"
                  oninput="AscendViews.updateLivePreview();document.getElementById('err-date').style.display='none';this.classList.remove('error');">
                <div class="form-error" id="err-date" style="display:none;">${Icons.alertCircle} Please choose a valid date.</div>
              </div>
            </div>

            <!-- Context Tip Box -->
            <div class="ach-callout" id="ach-step1-tip">
              <span style="font-size:16px;">💡</span>
              <span id="ach-tip-text">${initialCategory.tip}</span>
            </div>
          </div>

          <!-- STEP 2: Evidence & Verification -->
          <div class="ach-step-section" id="ach-step-2">
            <!-- Upload Zone -->
            <div class="form-group">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <label class="form-label" id="ach-doc-label">${initialCategory.docTitle || 'Certificate or Supporting Document'}</label>
                <span style="font-size:var(--text-xs);color:var(--c-text-3);">Optional but recommended</span>
              </div>

              <div class="ach-dropzone" id="upload-zone" onclick="document.getElementById('file-input').click()"
                ondragover="event.preventDefault();this.classList.add('drag-over')"
                ondragleave="this.classList.remove('drag-over')"
                ondrop="AscendViews.handleFileDrop(event)">
                <div class="upload-zone-icon">${Icons.upload}</div>
                <div id="ach-upload-title" style="font-weight:600;font-size:var(--text-sm);color:var(--c-text);">${initialCategory.docPlaceholder || 'Click to browse or drag & drop certificate'}</div>
                <div class="upload-zone-hint" id="ach-upload-hint">${initialCategory.docSubtitle || 'Supports PDF, PNG, JPG, or JPEG — up to 10 MB'}</div>
              </div>

              <input type="file" id="file-input" accept=".pdf,.png,.jpg,.jpeg" style="display:none"
                onchange="AscendViews.handleFileSelect(this)">

              <!-- Rich File Preview Card -->
              <div id="file-preview" style="display:none;" class="ach-file-preview-card">
                <div class="ach-thumb-box" id="file-thumb-container">
                  ${Icons.file}
                </div>
                <div style="flex:1;min-width:0;">
                  <div class="upload-file-name" id="file-name" style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>
                  <div style="display:flex;align-items:center;gap:8px;margin-top:2px;">
                    <span class="upload-file-size" id="file-size" style="font-size:12px;color:var(--c-text-3);"></span>
                    <span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:#137333;background:#E6F4EA;padding:1px 6px;border-radius:10px;">
                      ${Icons.check} Ready
                    </span>
                  </div>
                </div>
                <button type="button" class="btn btn-ghost btn-sm" onclick="AscendViews.clearFile()" style="color:var(--c-rejected);">
                  ${Icons.trash} Remove
                </button>
              </div>
            </div>

            <!-- Credential Link -->
            <div class="form-group">
              <label class="form-label" for="ach-proof" id="ach-proof-label">${initialCategory.urlLabel || 'Public Verification / Credential URL'}</label>
              <div style="position:relative;">
                <input class="form-input" id="ach-proof" type="url"
                  placeholder="${initialCategory.urlPlaceholder || 'https://credly.com/badges/...'}"
                  oninput="AscendViews.updateLivePreview();">
              </div>
              <div class="form-hint" id="ach-proof-hint">${initialCategory.urlHint || 'Direct URL to verify your badge or credential online.'}</div>
            </div>

            <div class="ach-callout">
              <span style="font-size:16px;">🛡️</span>
              <span id="ach-evidence-tip-text">${initialCategory.evidenceTip || 'Verified achievements receive an official verified badge on your institutional profile and exportable transcripts.'}</span>
            </div>
          </div>

          <!-- STEP 3: Skills & Reflection -->
          <div class="ach-step-section" id="ach-step-3">
            <!-- Interactive Skills Manager -->
            <div class="form-group ach-skills-wrapper">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <label class="form-label" id="ach-skills-label">Demonstrated Skills &amp; Competencies</label>
                <span id="ach-skills-count" style="font-size:var(--text-xs);color:var(--c-text-3);">0 skills selected</span>
              </div>

              <!-- Active Selected Chips Box -->
              <div class="ach-selected-chips-box" id="ach-selected-chips">
                <span style="font-size:12px;color:var(--c-text-faint);" id="ach-no-skills-msg">Click suggested skills below or type your own…</span>
              </div>

              <!-- Custom Skill Input -->
              <div class="ach-custom-input-wrap">
                <input type="text" class="form-input" id="ach-custom-skill-input"
                  placeholder="Type custom skill and press Enter (e.g. Next.js, Kubernetes)…"
                  style="font-size:13px;padding:6px 12px;"
                  onkeydown="if(event.key==='Enter'){event.preventDefault();AscendViews.addCustomSkill();}">
                <button type="button" class="btn btn-outline btn-sm" onclick="AscendViews.addCustomSkill()">
                  ${Icons.plus} Add
                </button>
              </div>

              <!-- Popular Skill Suggestions -->
              <div>
                <div id="ach-skills-suggest-label" style="font-size:11px;font-weight:600;color:var(--c-text-3);text-transform:uppercase;margin-bottom:6px;letter-spacing:0.5px;">Recommended for ${initialCategory.name}</div>
                <div class="ach-suggest-pills" id="ach-suggest-pills">
                  ${(initialCategory.skills || defaultSuggestions).map(s => `
                    <button type="button" class="ach-suggest-pill" data-skill="${s}" onclick="AscendViews.toggleSkill('${s.replace(/'/g, "\\'")}')">
                      <span>+</span> ${s}
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Impact Guide Box -->
            <div class="ach-impact-guide" id="ach-impact-guide">
              <div class="ach-impact-guide-header">
                <span>🎯</span>
                <span id="ach-impact-guide-title">Key Impact &amp; Reflection Questions for ${initialCategory.name}</span>
              </div>
              <ul class="ach-impact-guide-list" id="ach-impact-guide-list">
                ${(initialCategory.impactQuestions || []).map(q => `<li>${q}</li>`).join('')}
              </ul>
            </div>

            <!-- Description with Prompts -->
            <div class="form-group" style="margin-top:6px;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <label class="form-label" for="ach-desc" id="ach-desc-label">${initialCategory.impactLabel || 'Accomplishment Summary & Impact'}</label>
                <span id="ach-desc-count" style="font-size:var(--text-xs);color:var(--c-text-3);">0 / 600</span>
              </div>
              <!-- Quick STAR Method Starter Prompts -->
              <div class="ach-prompt-bar" id="ach-prompt-bar">
                ${(initialCategory.impactPrompts || []).map(p => {
                  const label = p.replace(/^•\s*/, '').replace(/:\s*$/, '');
                  const safeP = p.replace(/'/g, "\\'");
                  return `<button type="button" class="ach-prompt-btn" onclick="AscendViews.insertPrompt('${safeP}')">+ ${label}</button>`;
                }).join('')}
              </div>
              <textarea class="form-input form-textarea" id="ach-desc"
                placeholder="${initialCategory.impactPlaceholder || 'Briefly describe what you built or accomplished, key problem solved, and measurable impact…'}"
                maxlength="600"
                oninput="AscendViews.updateDescCount();AscendViews.updateLivePreview();"></textarea>
            </div>

            <!-- Live Achievement Card Preview -->
            <div class="ach-live-preview-container">
              <div class="ach-live-preview-header">
                <span>Live Portfolio Card Preview</span>
                <span style="font-size:11px;color:var(--c-primary);font-weight:500;">Updates in real time</span>
              </div>
              <div id="ach-live-card-target">
                <!-- Dynamic card preview rendered here -->
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer with Dynamic Action Buttons -->
        <div class="modal-footer" style="display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;gap:8px;">
            <button type="button" class="btn btn-ghost" onclick="AscendUI.closeModal('add-achievement-modal')">Cancel</button>
            <button type="button" class="btn btn-ghost" id="ach-draft-btn" onclick="AscendViews.saveDraft()" title="Save incomplete details for later">Save as draft</button>
          </div>
          <div style="display:flex;gap:8px;">
            <button type="button" class="btn btn-outline" id="ach-prev-btn" style="display:none;" onclick="AscendViews.prevStep()">
              ← Back
            </button>
            <button type="button" class="btn btn-primary" id="ach-next-btn" onclick="AscendViews.nextStep()">
              Next: Evidence →
            </button>
            <button type="button" class="btn btn-primary" id="submit-ach-btn" style="display:none;" onclick="AscendViews.submitAchievement()">
              Add to portfolio
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

/* ── Open Clean Add Modal ─────────────────────────────────── */
function openAddModal() {
  editingAchId = null;
  selectedSkills = [];
  uploadedFileMeta = null;

  const modalTitle = document.getElementById('ach-modal-title');
  const modalSub = document.getElementById('ach-modal-sub');
  const submitBtn = document.getElementById('submit-ach-btn');
  const draftBtn = document.getElementById('ach-draft-btn');

  if (modalTitle) modalTitle.textContent = 'Add New Achievement';
  if (modalSub) modalSub.textContent = 'Record and verify your academic, professional, and extracurricular milestones';
  if (submitBtn) submitBtn.innerHTML = 'Add to portfolio';
  if (draftBtn) draftBtn.style.display = 'inline-flex';

  // Reset inputs
  const titleInp = document.getElementById('ach-title');
  const orgInp = document.getElementById('ach-org');
  const dateInp = document.getElementById('ach-date');
  const proofInp = document.getElementById('ach-proof');
  const descInp = document.getElementById('ach-desc');
  if (titleInp) { titleInp.value = ''; titleInp.classList.remove('error'); }
  if (orgInp) { orgInp.value = ''; orgInp.classList.remove('error'); }
  if (dateInp) { dateInp.value = ''; dateInp.classList.remove('error'); }
  if (proofInp) proofInp.value = '';
  if (descInp) descInp.value = '';

  ['err-title', 'err-cat', 'err-org', 'err-date'].forEach(errId => {
    const el = document.getElementById(errId);
    if (el) el.style.display = 'none';
  });

  clearFile();
  selectCategory('Certification');
  setStep(1);
  renderSkillChips();
  updateDescCount();
  updateLivePreview();

  window.AscendUI.openModal('add-achievement-modal');
}

/* ── Edit Achievement ─────────────────────────────────────── */
function editAchievement(id) {
  const ach = (window.AscendData && Array.isArray(window.AscendData.achievements))
    ? window.AscendData.achievements.find(a => a.id === id)
    : null;
  if (!ach) {
    window.AscendUI.showToast('Achievement not found.', 'error');
    return;
  }

  editingAchId = id;
  selectedSkills = Array.isArray(ach.skills) ? [...ach.skills] : [];

  const modalTitle = document.getElementById('ach-modal-title');
  const modalSub = document.getElementById('ach-modal-sub');
  const submitBtn = document.getElementById('submit-ach-btn');
  const draftBtn = document.getElementById('ach-draft-btn');

  if (modalTitle) modalTitle.textContent = 'Edit Achievement';
  if (modalSub) modalSub.textContent = 'Update your accomplishment details, verification links, or acquired skills';
  if (submitBtn) submitBtn.innerHTML = 'Save changes';
  if (draftBtn) draftBtn.style.display = 'none';

  // Populate inputs
  const titleInp = document.getElementById('ach-title');
  const orgInp = document.getElementById('ach-org');
  const dateInp = document.getElementById('ach-date');
  const proofInp = document.getElementById('ach-proof');
  const descInp = document.getElementById('ach-desc');
  if (titleInp) { titleInp.value = ach.title || ''; titleInp.classList.remove('error'); }
  if (orgInp) { orgInp.value = ach.organization || ''; orgInp.classList.remove('error'); }
  if (dateInp) { dateInp.value = ach.date || ''; dateInp.classList.remove('error'); }

  // Check if proofLink is an actual web URL
  const rawProof = (ach.proofLink || '').trim();
  const isWebUrl = /^https?:\/\//i.test(rawProof) || (/^www\./i.test(rawProof) && !rawProof.includes(' '));
  if (proofInp) {
    proofInp.value = isWebUrl ? rawProof : '';
  }

  if (descInp) descInp.value = ach.description || '';

  ['err-title', 'err-cat', 'err-org', 'err-date'].forEach(errId => {
    const el = document.getElementById(errId);
    if (el) el.style.display = 'none';
  });

  clearFile();
  // Restore document if present
  const hasUploadedBinary = !!(ach.proofData && typeof ach.proofData === 'string');
  const hasAttachedFile = !!(ach.proofFileName || hasUploadedBinary || ach.proofLink === 'Certificate Attached');
  if (hasAttachedFile) {
    uploadedFileMeta = {
      name: ach.proofFileName || (hasUploadedBinary ? (ach.proofData.startsWith('data:application/pdf') ? `${ach.title}_Document.pdf` : `${ach.title}_Certificate.png`) : `${ach.title}_Certificate.png`),
      size: 'Attached',
      dataUrl: ach.proofData || null,
    };
    const nameEl = document.getElementById('file-name');
    const sizeEl = document.getElementById('file-size');
    const thumbEl = document.getElementById('file-thumb-container');
    if (nameEl) nameEl.textContent = uploadedFileMeta.name;
    if (sizeEl) sizeEl.textContent = uploadedFileMeta.size;
    if (thumbEl) {
      if (uploadedFileMeta.dataUrl && uploadedFileMeta.dataUrl.startsWith('data:image/')) {
        thumbEl.innerHTML = `<img src="${uploadedFileMeta.dataUrl}" alt="Preview" style="width:100%;height:100%;object-fit:cover;">`;
      } else {
        thumbEl.innerHTML = window.AscendUI.Icons.file;
      }
    }
    const preview = document.getElementById('file-preview');
    const dropzone = document.getElementById('upload-zone');
    if (preview) preview.style.display = 'flex';
    if (dropzone) dropzone.style.display = 'none';
  }

  selectCategory(ach.category || 'Certification');
  setStep(1);
  renderSkillChips();
  updateDescCount();
  updateLivePreview();

  window.AscendUI.openModal('add-achievement-modal');
}

/* ── Category Selection ───────────────────────────────────── */
function selectCategory(catName) {
  const cat = ACH_CATEGORIES.find(c => c.name === catName) || ACH_CATEGORIES[0];
  const catInput = document.getElementById('ach-cat');
  if (catInput) catInput.value = cat.name;

  // Update card selected states
  if (typeof document !== 'undefined') {
    document.querySelectorAll('.ach-cat-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.cat === cat.name);
    });

    // Update accent bar
    const accentBar = document.getElementById('ach-modal-accent-bar');
    if (accentBar) {
      accentBar.style.background = `linear-gradient(90deg, ${cat.color}, ${cat.color}CC)`;
    }

    // Update header icon
    const headerIcon = document.getElementById('ach-header-icon');
    if (headerIcon) {
      headerIcon.style.background = cat.bg;
      headerIcon.style.color = cat.color;
      headerIcon.innerHTML = window.AscendUI.Icons[cat.iconKey] || window.AscendUI.Icons.award;
    }

    // STEP 1 updates:
    const titleInp = document.getElementById('ach-title');
    if (titleInp) {
      titleInp.placeholder = cat.titlePlaceholder;
    }
    const orgInp = document.getElementById('ach-org');
    if (orgInp) {
      orgInp.placeholder = cat.orgPlaceholder;
    }
    const tipText = document.getElementById('ach-tip-text');
    if (tipText) tipText.textContent = cat.tip;

    // STEP 2 updates (Evidence & Verification tailored to category):
    const docLabel = document.getElementById('ach-doc-label');
    if (docLabel) docLabel.textContent = cat.docTitle || 'Certificate or Supporting Document';

    const uploadTitle = document.getElementById('ach-upload-title');
    if (uploadTitle) uploadTitle.textContent = cat.docPlaceholder || 'Click to browse or drag & drop certificate';

    const uploadHint = document.getElementById('ach-upload-hint');
    if (uploadHint) uploadHint.textContent = cat.docSubtitle || 'Supports PDF, PNG, JPG, or JPEG — up to 10 MB';

    const proofLabel = document.getElementById('ach-proof-label');
    if (proofLabel) proofLabel.textContent = cat.urlLabel || 'Public Verification / Credential URL';

    const proofInp = document.getElementById('ach-proof');
    if (proofInp) proofInp.placeholder = cat.urlPlaceholder || 'https://...';

    const proofHint = document.getElementById('ach-proof-hint');
    if (proofHint) proofHint.textContent = cat.urlHint || 'Direct URL to verify your achievement online.';

    const evidenceTip = document.getElementById('ach-evidence-tip-text');
    if (evidenceTip) evidenceTip.textContent = cat.evidenceTip || 'Verified achievements receive an official verified badge on your institutional profile.';

    // STEP 3 updates (Skills & Impact tailored to category):
    const suggestLabel = document.getElementById('ach-skills-suggest-label');
    if (suggestLabel) suggestLabel.textContent = `Recommended for ${cat.name}`;

    const pillsContainer = document.getElementById('ach-suggest-pills');
    if (pillsContainer) {
      const skillsList = cat.skills || ['Problem Solving', 'Communication', 'Technical Execution'];
      pillsContainer.innerHTML = skillsList.map(s => {
        const isSelected = selectedSkills.includes(s);
        const safeS = s.replace(/'/g, "\\'");
        return `
          <button type="button" class="ach-suggest-pill" data-skill="${s}" onclick="AscendViews.toggleSkill('${safeS}')"
            style="${isSelected ? 'border-color:var(--c-primary);background:var(--c-primary-light);color:var(--c-primary-dark);' : ''}">
            <span>${isSelected ? '✓' : '+'}</span> ${s}
          </button>`;
      }).join('');
    }

    const guideTitle = document.getElementById('ach-impact-guide-title');
    if (guideTitle) guideTitle.textContent = `Key Impact & Reflection Questions for ${cat.name}`;

    const guideList = document.getElementById('ach-impact-guide-list');
    if (guideList) {
      guideList.innerHTML = (cat.impactQuestions || []).map(q => `<li>${q}</li>`).join('');
    }

    const descLabel = document.getElementById('ach-desc-label');
    if (descLabel) descLabel.textContent = cat.impactLabel || 'Accomplishment Summary & Impact';

    const promptBar = document.getElementById('ach-prompt-bar');
    if (promptBar) {
      promptBar.innerHTML = (cat.impactPrompts || []).map(p => {
        const label = p.replace(/^•\s*/, '').replace(/:\s*$/, '');
        const safeP = p.replace(/'/g, "\\'");
        return `<button type="button" class="ach-prompt-btn" onclick="AscendViews.insertPrompt('${safeP}')">+ ${label}</button>`;
      }).join('');
    }

    const descInp = document.getElementById('ach-desc');
    if (descInp) {
      descInp.placeholder = cat.impactPlaceholder || 'Briefly describe what you built or accomplished…';
    }

    updateLivePreview();
  }
}

/* ── Stepper Logic ────────────────────────────────────────── */
function setStep(stepNum) {
  currentAchStep = stepNum;

  if (typeof document === 'undefined') return;

  // Update tabs
  for (let i = 1; i <= 3; i++) {
    const tab = document.getElementById(`step-tab-${i}`);
    const num = document.getElementById(`step-num-${i}`);
    if (tab && num) {
      tab.classList.toggle('active', i === stepNum);
      tab.classList.toggle('completed', i < stepNum);
      if (i < stepNum) {
        num.innerHTML = window.AscendUI.Icons.check;
      } else {
        num.textContent = String(i);
      }
    }

    const sec = document.getElementById(`ach-step-${i}`);
    if (sec) {
      sec.classList.toggle('active', i === stepNum);
    }
  }

  // Update footer buttons
  const prevBtn = document.getElementById('ach-prev-btn');
  const nextBtn = document.getElementById('ach-next-btn');
  const submitBtn = document.getElementById('submit-ach-btn');

  if (prevBtn) prevBtn.style.display = stepNum > 1 ? 'inline-flex' : 'none';

  if (nextBtn) {
    if (stepNum === 1) {
      nextBtn.style.display = 'inline-flex';
      nextBtn.innerHTML = 'Next: Evidence →';
    } else if (stepNum === 2) {
      nextBtn.style.display = 'inline-flex';
      nextBtn.innerHTML = 'Next: Skills & Impact →';
    } else {
      nextBtn.style.display = 'none';
    }
  }

  if (submitBtn) {
    submitBtn.style.display = stepNum === 3 ? 'inline-flex' : 'none';
  }

  if (stepNum === 3) {
    renderSkillChips();
    updateLivePreview();
  }
}

function goToStep(targetStep) {
  if (targetStep > currentAchStep) {
    if (!validateStep1()) return;
  }
  setStep(targetStep);
}

function nextStep() {
  if (currentAchStep === 1) {
    if (!validateStep1()) return;
    setStep(2);
  } else if (currentAchStep === 2) {
    setStep(3);
  }
}

function prevStep() {
  if (currentAchStep === 3) {
    setStep(2);
  } else if (currentAchStep === 2) {
    setStep(1);
  }
}

function validateStep1() {
  let valid = true;
  const fields = [
    { id: 'ach-title', errId: 'err-title' },
    { id: 'ach-cat',   errId: 'err-cat'   },
    { id: 'ach-org',   errId: 'err-org'   },
    { id: 'ach-date',  errId: 'err-date'  },
  ];

  fields.forEach(({ id, errId }) => {
    const input = document.getElementById(id);
    const err = document.getElementById(errId);
    if (input) {
      const empty = !input.value.trim();
      input.classList.toggle('error', empty);
      if (err) err.style.display = empty ? 'flex' : 'none';
      if (empty) valid = false;
    }
  });

  if (!valid) {
    window.AscendUI.showToast('Please fill all required fields in Step 1.', 'warning');
  }
  return valid;
}

/* ── Skills Management ───────────────────────────────────── */
function renderSkillChips() {
  const container = document.getElementById('ach-selected-chips');
  const countBadge = document.getElementById('ach-skills-count');
  if (!container) return;

  if (countBadge) {
    countBadge.textContent = `${selectedSkills.length} skill${selectedSkills.length !== 1 ? 's' : ''} selected`;
  }

  if (selectedSkills.length === 0) {
    container.innerHTML = `<span style="font-size:12px;color:var(--c-text-faint);" id="ach-no-skills-msg">Click suggested skills below or type your own…</span>`;
  } else {
    container.innerHTML = selectedSkills.map(s => `
      <span class="ach-chip">
        ${s}
        <span class="ach-chip-remove" onclick="AscendViews.removeSkill('${s.replace(/'/g, "\\'")}')" title="Remove skill">×</span>
      </span>
    `).join('');
  }

  // Highlight matching suggestions
  document.querySelectorAll('.ach-suggest-pill').forEach(pill => {
    const skillName = pill.dataset.skill;
    const isSelected = selectedSkills.includes(skillName);
    pill.style.borderColor = isSelected ? 'var(--c-primary)' : 'var(--c-border)';
    pill.style.background = isSelected ? 'var(--c-primary-light)' : 'var(--c-surface)';
    pill.style.color = isSelected ? 'var(--c-primary-dark)' : 'var(--c-text-2)';
    const span = pill.querySelector('span');
    if (span) span.textContent = isSelected ? '✓' : '+';
  });
}

function addCustomSkill() {
  const input = document.getElementById('ach-custom-skill-input');
  if (!input) return;
  const raw = input.value.trim();
  if (!raw) return;

  const skillsToAdd = raw.split(',').map(s => s.trim()).filter(Boolean);
  skillsToAdd.forEach(s => {
    if (!selectedSkills.includes(s)) {
      selectedSkills.push(s);
    }
  });

  input.value = '';
  renderSkillChips();
  updateLivePreview();
}

function removeSkill(skill) {
  selectedSkills = selectedSkills.filter(s => s !== skill);
  renderSkillChips();
  updateLivePreview();
}

function toggleSkill(skill) {
  // Support both element parameter (legacy) and skill string parameter
  const skillName = typeof skill === 'string' ? skill : (skill?.dataset?.skill || skill?.textContent || '');
  if (!skillName) return;

  if (selectedSkills.includes(skillName)) {
    removeSkill(skillName);
  } else {
    selectedSkills.push(skillName);
    renderSkillChips();
    updateLivePreview();
  }
}

/* ── Description Prompts & Counter ────────────────────────── */
function insertPrompt(text) {
  const textarea = document.getElementById('ach-desc');
  if (!textarea) return;
  const cur = textarea.value.trim();
  if (cur.length > 0) {
    textarea.value = cur + '\n' + text;
  } else {
    textarea.value = text;
  }
  textarea.focus();
  updateDescCount();
  updateLivePreview();
}

function updateDescCount() {
  const textarea = document.getElementById('ach-desc');
  const counter = document.getElementById('ach-desc-count');
  if (textarea && counter) {
    counter.textContent = `${textarea.value.length} / 600`;
  }
}

/* ── File Upload & Dropzone ───────────────────────────────── */
function handleFileSelect(input) {
  if (!input.files || !input.files[0]) return;
  processFile(input.files[0]);
}

function handleFileDrop(e) {
  e.preventDefault();
  document.getElementById('upload-zone')?.classList.remove('drag-over');
  const file = e.dataTransfer?.files?.[0];
  if (file) processFile(file);
}

function processFile(file) {
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    window.AscendUI.showToast('Please upload a PDF, PNG, or JPG file.', 'error');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    window.AscendUI.showToast('File size must be under 10 MB.', 'warning');
    return;
  }

  uploadedFileMeta = {
    name: file.name,
    size: (file.size / 1024 > 1024 ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : (file.size / 1024).toFixed(0) + ' KB'),
    type: file.type,
    dataUrl: null
  };

  const nameEl = document.getElementById('file-name');
  const sizeEl = document.getElementById('file-size');
  const thumbEl = document.getElementById('file-thumb-container');

  if (nameEl) nameEl.textContent = uploadedFileMeta.name;
  if (sizeEl) sizeEl.textContent = uploadedFileMeta.size;

  if (typeof FileReader !== 'undefined') {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedFileMeta.dataUrl = e.target.result;
      if (thumbEl) {
        if (file.type.startsWith('image/')) {
          thumbEl.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width:100%;height:100%;object-fit:cover;">`;
        } else {
          thumbEl.innerHTML = window.AscendUI.Icons.file;
        }
      }
    };
    reader.readAsDataURL(file);
  } else {
    if (thumbEl) thumbEl.innerHTML = window.AscendUI.Icons.file;
  }

  const preview = document.getElementById('file-preview');
  const dropzone = document.getElementById('upload-zone');
  if (preview) preview.style.display = 'flex';
  if (dropzone) dropzone.style.display = 'none';

  updateLivePreview();
}

function clearFile() {
  uploadedFileMeta = null;
  const preview = document.getElementById('file-preview');
  const dropzone = document.getElementById('upload-zone');
  const fileInp = document.getElementById('file-input');
  if (preview) preview.style.display = 'none';
  if (dropzone) dropzone.style.display = 'flex';
  if (fileInp) fileInp.value = '';
  updateLivePreview();
}

/* ── Live Card Preview ────────────────────────────────────── */
function updateLivePreview() {
  const target = document.getElementById('ach-live-card-target');
  if (!target) return;

  const catVal = document.getElementById('ach-cat')?.value || 'Certification';
  const catConfig = ACH_CATEGORIES.find(c => c.name === catVal) || ACH_CATEGORIES[0];
  const title = document.getElementById('ach-title')?.value.trim() || 'Your Achievement Title';
  const org = document.getElementById('ach-org')?.value.trim() || 'Issuing Organization';
  const date = document.getElementById('ach-date')?.value || new Date().toISOString().split('T')[0];
  const desc = document.getElementById('ach-desc')?.value.trim() || 'Detailed overview of the milestone, learning takeaways, and verifiable results will appear here.';
  const proofLink = document.getElementById('ach-proof')?.value.trim() || (uploadedFileMeta ? '#' : null);

  const previewData = {
    id: 'preview-card',
    title,
    category: catVal,
    organization: org,
    date,
    skills: selectedSkills.length > 0 ? selectedSkills : ['Demonstrated Skill', 'Domain Competency'],
    description: desc,
    proofLink,
    iconKey: catConfig.iconKey,
    color: catConfig.color,
  };

  target.innerHTML = achievementCardHTML(previewData);
  target.querySelectorAll('button, a').forEach(el => {
    el.style.pointerEvents = 'none';
    el.removeAttribute('onclick');
  });
}

/* ── Submit Achievement (Create or Update) ─────────────────── */
function submitAchievement() {
  if (!validateStep1()) {
    setStep(1);
    return;
  }

  const btn = document.getElementById('submit-ach-btn');
  if (btn) {
    btn.innerHTML = '<div class="spinner"></div> Saving…';
    btn.disabled = true;
  }

  setTimeout(() => {
    const { genId } = window.AscendData;
    const catVal = document.getElementById('ach-cat')?.value || 'Certification';
    const catConfig = ACH_CATEGORIES.find(c => c.name === catVal) || ACH_CATEGORIES[0];

    const titleVal = document.getElementById('ach-title')?.value.trim() || 'Untitled Achievement';
    const orgVal = document.getElementById('ach-org')?.value.trim() || '';
    const dateVal = document.getElementById('ach-date')?.value || new Date().toISOString().split('T')[0];
    const descVal = document.getElementById('ach-desc')?.value.trim() || '';
    const proofVal = document.getElementById('ach-proof')?.value.trim() || (uploadedFileMeta ? 'Certificate Attached' : null);

    if (editingAchId) {
      // Update existing achievement
      const ach = window.AscendData.achievements.find(a => a.id === editingAchId);
      if (ach) {
        ach.title = titleVal;
        ach.category = catVal;
        ach.organization = orgVal;
        ach.date = dateVal;
        ach.skills = [...selectedSkills];
        ach.description = descVal;
        ach.proofLink = proofVal;
        ach.proofData = uploadedFileMeta ? (uploadedFileMeta.dataUrl || ach.proofData || null) : null;
        ach.proofFileName = uploadedFileMeta ? (uploadedFileMeta.name || ach.proofFileName || null) : null;
        ach.iconKey = catConfig.iconKey;
        ach.color = catConfig.color;
      }
      if (window.AscendData.saveAchievement && ach) {
        window.AscendData.saveAchievement(ach);
      }
      window.AscendUI.showToast('Achievement updated successfully!', 'success');
    } else {
      // Create new achievement
      const newAch = {
        id:           genId('ach'),
        title:        titleVal,
        category:     catVal,
        organization: orgVal,
        date:         dateVal,
        skills:       [...selectedSkills],
        status:       'added',
        description:  descVal,
        proofLink:    proofVal,
        proofData:    uploadedFileMeta?.dataUrl || null,
        proofFileName: uploadedFileMeta?.name || null,
        iconKey:      catConfig.iconKey,
        color:        catConfig.color,
      };

      window.AscendData.achievements.unshift(newAch);
      if (window.AscendData.saveAchievement) window.AscendData.saveAchievement(newAch);

      // Add to activity
      if (Array.isArray(window.AscendData.activity)) {
        window.AscendData.activity.unshift({
          id: genId('act'),
          title: newAch.title,
          subtitle: `${newAch.category} added`,
          status: 'added',
          date: newAch.date,
          iconKey: newAch.iconKey,
        });
      }

      window.AscendUI.showToast('Achievement added to your portfolio!', 'success');
    }

    if (btn) {
      btn.innerHTML = editingAchId ? 'Save changes' : 'Add to portfolio';
      btn.disabled = false;
    }

    editingAchId = null;
    window.AscendUI.closeModal('add-achievement-modal');
    if (typeof AscendApp !== 'undefined' && AscendApp.navigate) {
      AscendApp.navigate('achievements');
    }
  }, 600);
}

/* ── Save Draft ───────────────────────────────────────────── */
function saveDraft() {
  const title = document.getElementById('ach-title')?.value.trim();
  if (!title) {
    document.getElementById('ach-title')?.classList.add('error');
    const err = document.getElementById('err-title');
    if (err) err.style.display = 'flex';
    window.AscendUI.showToast('Please enter an achievement title before saving as draft.', 'warning');
    setStep(1);
    document.getElementById('ach-title')?.focus();
    return;
  }

  const { genId } = window.AscendData;
  const catVal = document.getElementById('ach-cat')?.value || 'Certification';
  const catConfig = ACH_CATEGORIES.find(c => c.name === catVal) || ACH_CATEGORIES[0];

  const draft = {
    id: genId('ach'),
    title,
    category:     catVal,
    organization: document.getElementById('ach-org')?.value.trim() || 'Self / In Progress',
    date:         document.getElementById('ach-date')?.value || new Date().toISOString().split('T')[0],
    skills:       [...selectedSkills],
    status:       'draft',
    description:  document.getElementById('ach-desc')?.value.trim() || '',
    proofLink:    document.getElementById('ach-proof')?.value.trim() || (uploadedFileMeta ? 'Certificate Attached' : null),
    proofData:    uploadedFileMeta?.dataUrl || null,
    proofFileName: uploadedFileMeta?.name || null,
    iconKey:      catConfig.iconKey,
    color:        '#5F6368',
  };

  window.AscendData.achievements.unshift(draft);
  editingAchId = null;
  window.AscendUI.closeModal('add-achievement-modal');
  window.AscendUI.showToast('Draft saved to portfolio.', 'info');
  if (typeof AscendApp !== 'undefined' && AscendApp.navigate) {
    AscendApp.navigate('achievements');
  }
}

window.AscendViews = window.AscendViews || {};
Object.assign(window.AscendViews, {
  achievements: renderAchievements,
  filterAchievements,
  deleteAchievement,
  editAchievement,
  viewProof,
  openProofViewerModal,
  openProofFile,
  openUploadedPreviewFile,
  openPdfDocument: openProofFile,
  generateCertificatePdfDataUrl,
  generateCertificateDataUrl: generateCertificatePdfDataUrl,
  openImageLightbox,
  closeImageLightbox,
  ACH_CATEGORIES,
  openAddModal,
  setStep,
  goToStep,
  nextStep,
  prevStep,
  selectCategory,
  toggleSkill,
  addCustomSkill,
  removeSkill,
  insertPrompt,
  updateDescCount,
  updateLivePreview,
  handleFileSelect,
  handleFileDrop,
  clearFile,
  submitAchievement,
  saveDraft,
});

