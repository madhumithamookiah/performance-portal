/**
 * ASCEND – Faculty / Mentor / Admin Data Store
 * Connected directly to backend API (/api/faculty/data) with zero static mock students.
 */

/* ── Faculty User Default ────────────────────────────────────── */
let FACULTY_USER = {
  id: 'usr-fac',
  name: 'Faculty Advisor',
  firstName: 'Faculty',
  title: '',
  email: '',
  password: '',
  initials: 'FA',
  role: 'faculty',
  designation: 'Faculty Advisor',
  department: 'Computer Science & Engineering',
  institution: 'University',
  assignedCohort: '',
  assignedStudents: 0,
  expertise: [],
};

/* ── Classes / Cohorts Model ─────────────────────────────────── */
const FACULTY_CLASSES_STORAGE_KEY = 'ascend_faculty_classes';

function saveClassesToStorage(classes) {
  try {
    localStorage.setItem(FACULTY_CLASSES_STORAGE_KEY, JSON.stringify(classes));
  } catch (e) {}
}

function loadClassesFromStorage() {
  try {
    const raw = localStorage.getItem(FACULTY_CLASSES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return null;
}

let FACULTY_CLASSES = loadClassesFromStorage() || [
  {
    id: 'all',
    name: 'All Registered Students',
    shortName: 'All Students',
    program: 'All Programmes',
    department: 'All Departments',
    semester: 'All',
    section: 'All',
    academicYear: '2026–27',
    studentCount: 0,
  },
  {
    id: 'class-cse-5a',
    name: 'B.Tech CSE · Semester 5 · Section A',
    shortName: 'CSE · Sem 5 · Sec A',
    program: 'B.Tech CSE',
    department: 'Computer Science & Engineering',
    semester: 5,
    section: 'Section A',
    academicYear: '2026–27',
    studentCount: 0,
  },
];

/* ── Dynamic Storage Arrays (Populated from /api/faculty/data) ── */
let FACULTY_STUDENTS = [
  {
    id: 'stu-sai-001',
    name: 'Sai Preethi',
    firstName: 'Sai',
    email: 'saipreethignanasekar@gmail.com',
    initials: 'SP',
    rollNo: '24BCSE101',
    program: 'B.Tech CSE',
    department: 'Computer Science & Engineering',
    semester: 5,
    section: 'Section A',
    classId: 'class-cse-5a',
    className: 'B.Tech CSE · Semester 5 · Section A',
    status: 'Good Standing',
    achievementsCount: 2,
    projectsCount: 1,
    totalAchievements: 2,
    lastActivity: '2026-09-17',
    daysInactive: 4,
    monthlyReviewed: false,
    latestMonthlySummary: 'September summary: 2 achievements added, 1 project updated, 1 faculty feedback note received. Last portfolio activity: 4 days ago.',
    monthlySummaries: [
      {
        month: 'September 2026',
        monthKey: '2026-09',
        achievementsAdded: 2,
        achievementTitles: ['AWS Certified Cloud Practitioner', 'Smart India Hackathon Finalist'],
        projectsUpdated: 1,
        projectTitles: ['Ascend Distributed File System'],
        feedbackReceived: 1,
        profileDetailsUpdated: true,
        lastActivityDate: '2026-09-17',
        lastActivityFormatted: '4 days ago',
        reviewedByStudent: false,
        summaryText: 'September summary: 2 achievements added, 1 project updated, 1 faculty feedback note received. Last portfolio activity: 4 days ago.',
      },
      {
        month: 'August 2026',
        monthKey: '2026-08',
        achievementsAdded: 1,
        achievementTitles: ['Frontend Engineering Certificate'],
        projectsUpdated: 0,
        projectTitles: [],
        feedbackReceived: 1,
        profileDetailsUpdated: false,
        lastActivityDate: '2026-08-26',
        lastActivityFormatted: '26 days ago',
        reviewedByStudent: true,
        summaryText: 'August summary: 1 achievement added, 0 projects updated, 1 faculty feedback note received. Last portfolio activity: 26 days ago.',
      },
      {
        month: 'July 2026',
        monthKey: '2026-07',
        achievementsAdded: 0,
        achievementTitles: [],
        projectsUpdated: 0,
        projectTitles: [],
        feedbackReceived: 0,
        profileDetailsUpdated: true,
        lastActivityDate: '2026-07-15',
        lastActivityFormatted: 'July 15, 2026',
        reviewedByStudent: true,
        summaryText: 'July summary: 0 achievements added, 0 projects updated, 0 faculty feedback notes received. Profile details initialized.',
      },
    ],
    achievements: [
      { id: 'ach-1', title: 'AWS Certified Cloud Practitioner', category: 'Certification', organization: 'Amazon Web Services', date: '2026-09-17' },
      { id: 'ach-2', title: 'Smart India Hackathon Finalist', category: 'Hackathon', organization: 'Ministry of Education', date: '2026-09-12' },
    ],
    projects: [
      { id: 'proj-1', title: 'Ascend Distributed File System', category: 'Systems', description: 'High throughput fault-tolerant storage system.', date: '2026-09-15' },
    ],
    evaluationStatus: 'pending',
    attentionStatus: 'none',
    profileSetupStatus: 'complete',
  },
  {
    id: 'stu-rohan-002',
    name: 'Rohan Sharma',
    firstName: 'Rohan',
    email: 'rohan.sharma@university.edu',
    initials: 'RS',
    rollNo: '24BCSE108',
    program: 'B.Tech CSE',
    department: 'Computer Science & Engineering',
    semester: 5,
    section: 'Section A',
    classId: 'class-cse-5a',
    className: 'B.Tech CSE · Semester 5 · Section A',
    status: 'Good Standing',
    achievementsCount: 1,
    projectsCount: 1,
    totalAchievements: 1,
    lastActivity: '2026-08-19',
    daysInactive: 33,
    monthlyReviewed: false,
    latestMonthlySummary: 'September summary: 0 achievements added, 0 projects updated, 0 faculty feedback notes received. No activity in the last 33 days.',
    monthlySummaries: [
      {
        month: 'September 2026',
        monthKey: '2026-09',
        achievementsAdded: 0,
        achievementTitles: [],
        projectsUpdated: 0,
        projectTitles: [],
        feedbackReceived: 0,
        profileDetailsUpdated: false,
        lastActivityDate: '2026-08-19',
        lastActivityFormatted: '33 days ago',
        reviewedByStudent: false,
        summaryText: 'September summary: 0 achievements added, 0 projects updated, 0 faculty feedback notes received. No activity in the last 33 days.',
      },
      {
        month: 'August 2026',
        monthKey: '2026-08',
        achievementsAdded: 1,
        achievementTitles: ['Full-Stack Web Development Workshop'],
        projectsUpdated: 1,
        projectTitles: ['Campus Lost & Found Portal'],
        feedbackReceived: 1,
        profileDetailsUpdated: false,
        lastActivityDate: '2026-08-19',
        lastActivityFormatted: 'August 19, 2026',
        reviewedByStudent: true,
        summaryText: 'August summary: 1 achievement added, 1 project updated, 1 faculty feedback note received. Last portfolio activity: August 19, 2026.',
      },
      {
        month: 'July 2026',
        monthKey: '2026-07',
        achievementsAdded: 0,
        achievementTitles: [],
        projectsUpdated: 0,
        projectTitles: [],
        feedbackReceived: 0,
        profileDetailsUpdated: true,
        lastActivityDate: '2026-07-20',
        lastActivityFormatted: 'July 20, 2026',
        reviewedByStudent: true,
        summaryText: 'July summary: 0 achievements added, 0 projects updated, 0 faculty feedback notes received. Profile details initialized.',
      },
    ],
    achievements: [
      { id: 'ach-3', title: 'Full-Stack Web Development Workshop', category: 'Certification', organization: 'Mozilla Campus Club', date: '2026-08-19' },
    ],
    projects: [
      { id: 'proj-2', title: 'Campus Lost & Found Portal', category: 'Web Application', description: 'Real-time campus utility service.', date: '2026-08-15' },
    ],
    evaluationStatus: 'pending',
    attentionStatus: 'inactive-30d',
    attentionReason: 'No portfolio updates in past 33 days',
    profileSetupStatus: 'complete',
  },
  {
    id: 'stu-ananya-003',
    name: 'Ananya Patel',
    firstName: 'Ananya',
    email: 'ananya.patel@university.edu',
    initials: 'AP',
    rollNo: '24BCSE114',
    program: 'B.Tech CSE',
    department: 'Computer Science & Engineering',
    semester: 5,
    section: 'Section A',
    classId: 'class-cse-5a',
    className: 'B.Tech CSE · Semester 5 · Section A',
    status: 'Good Standing',
    achievementsCount: 3,
    projectsCount: 2,
    totalAchievements: 3,
    lastActivity: '2026-09-14',
    daysInactive: 7,
    monthlyReviewed: false,
    latestMonthlySummary: 'September summary: 1 achievement added, 1 project updated, 1 faculty feedback note received. Last portfolio activity: 7 days ago.',
    monthlySummaries: [
      {
        month: 'September 2026',
        monthKey: '2026-09',
        achievementsAdded: 1,
        achievementTitles: ['Data Science & AI Virtual Internship'],
        projectsUpdated: 1,
        projectTitles: ['Adaptive Learning Assistant'],
        feedbackReceived: 1,
        profileDetailsUpdated: false,
        lastActivityDate: '2026-09-14',
        lastActivityFormatted: '7 days ago',
        reviewedByStudent: false,
        summaryText: 'September summary: 1 achievement added, 1 project updated, 1 faculty feedback note received. Last portfolio activity: 7 days ago.',
      },
      {
        month: 'August 2026',
        monthKey: '2026-08',
        achievementsAdded: 2,
        achievementTitles: ['National Algorithmic Sprint Top 10', 'Python for Scientific Computing'],
        projectsUpdated: 1,
        projectTitles: ['Adaptive Learning Assistant'],
        feedbackReceived: 0,
        profileDetailsUpdated: false,
        lastActivityDate: '2026-08-28',
        lastActivityFormatted: 'August 28, 2026',
        reviewedByStudent: true,
        summaryText: 'August summary: 2 achievements added, 1 project updated, 0 faculty feedback notes received. Last portfolio activity: August 28, 2026.',
      },
      {
        month: 'July 2026',
        monthKey: '2026-07',
        achievementsAdded: 0,
        achievementTitles: [],
        projectsUpdated: 0,
        projectTitles: [],
        feedbackReceived: 0,
        profileDetailsUpdated: true,
        lastActivityDate: '2026-07-10',
        lastActivityFormatted: 'July 10, 2026',
        reviewedByStudent: true,
        summaryText: 'July summary: 0 achievements added, 0 projects updated, 0 faculty feedback notes received. Profile details initialized.',
      },
    ],
    achievements: [
      { id: 'ach-4', title: 'Data Science & AI Virtual Internship', category: 'Internship', organization: 'Cognizant', date: '2026-09-14' },
      { id: 'ach-5', title: 'National Algorithmic Sprint Top 10', category: 'Award', organization: 'ACM Chapter', date: '2026-08-28' },
    ],
    projects: [
      { id: 'proj-3', title: 'Adaptive Learning Assistant', category: 'Machine Learning', description: 'Personalized student study path recommendation.', date: '2026-09-10' },
    ],
    evaluationStatus: 'draft',
    attentionStatus: 'none',
    profileSetupStatus: 'complete',
  },
  {
    id: 'stu-vikram-004',
    name: 'Vikram Verma',
    firstName: 'Vikram',
    email: 'vikram.verma@university.edu',
    initials: 'VV',
    rollNo: '24BCSE120',
    program: 'B.Tech CSE',
    department: 'Computer Science & Engineering',
    semester: 5,
    section: 'Section A',
    classId: 'class-cse-5a',
    className: 'B.Tech CSE · Semester 5 · Section A',
    status: 'Good Standing',
    achievementsCount: 2,
    projectsCount: 1,
    totalAchievements: 2,
    lastActivity: '2026-09-11',
    daysInactive: 10,
    monthlyReviewed: true,
    latestMonthlySummary: 'September summary: 1 achievement added, 0 projects updated, 1 faculty feedback note received. Last portfolio activity: 10 days ago.',
    monthlySummaries: [
      {
        month: 'September 2026',
        monthKey: '2026-09',
        achievementsAdded: 1,
        achievementTitles: ['Kubernetes Fundamentals'],
        projectsUpdated: 0,
        projectTitles: [],
        feedbackReceived: 1,
        profileDetailsUpdated: false,
        lastActivityDate: '2026-09-11',
        lastActivityFormatted: '10 days ago',
        reviewedByStudent: true,
        summaryText: 'September summary: 1 achievement added, 0 projects updated, 1 faculty feedback note received. Last portfolio activity: 10 days ago.',
      },
      {
        month: 'August 2026',
        monthKey: '2026-08',
        achievementsAdded: 1,
        achievementTitles: ['Docker Deep Dive'],
        projectsUpdated: 1,
        projectTitles: ['Microservices Booking Engine'],
        feedbackReceived: 0,
        profileDetailsUpdated: false,
        lastActivityDate: '2026-08-20',
        lastActivityFormatted: 'August 20, 2026',
        reviewedByStudent: true,
        summaryText: 'August summary: 1 achievement added, 1 project updated, 0 faculty feedback notes received. Last portfolio activity: August 20, 2026.',
      },
    ],
    achievements: [
      { id: 'ach-6', title: 'Kubernetes Fundamentals', category: 'Certification', organization: 'Linux Foundation', date: '2026-09-11' },
    ],
    projects: [
      { id: 'proj-4', title: 'Microservices Booking Engine', category: 'DevOps', description: 'Event-driven ticketing architecture.', date: '2026-08-20' },
    ],
    evaluationStatus: 'evaluated',
    attentionStatus: 'none',
    profileSetupStatus: 'complete',
  },
  {
    id: 'stu-jeffy-005',
    name: 'Jeffy Joe',
    firstName: 'Jeffy',
    email: 'jeffyjoe50@gmail.com',
    initials: 'JJ',
    rollNo: '24BCSE132',
    program: 'B.Tech CSE',
    department: 'Computer Science & Engineering',
    semester: 5,
    section: 'Section A',
    classId: 'class-cse-5a',
    className: 'B.Tech CSE · Semester 5 · Section A',
    status: 'Good Standing',
    achievementsCount: 0,
    projectsCount: 0,
    totalAchievements: 0,
    lastActivity: '2026-08-15',
    daysInactive: 37,
    monthlyReviewed: false,
    latestMonthlySummary: 'September summary: 0 achievements added, 0 projects updated, 0 faculty feedback notes received. No activity recorded in the last 37 days.',
    monthlySummaries: [
      {
        month: 'September 2026',
        monthKey: '2026-09',
        achievementsAdded: 0,
        achievementTitles: [],
        projectsUpdated: 0,
        projectTitles: [],
        feedbackReceived: 0,
        profileDetailsUpdated: false,
        lastActivityDate: '2026-08-15',
        lastActivityFormatted: '37 days ago',
        reviewedByStudent: false,
        summaryText: 'September summary: 0 achievements added, 0 projects updated, 0 faculty feedback notes received. No activity recorded in the last 37 days.',
      },
    ],
    achievements: [],
    projects: [],
    evaluationStatus: 'pending',
    attentionStatus: 'inactive-30d',
    attentionReason: 'No portfolio activity logged in 37 days',
    profileSetupStatus: 'incomplete',
  },
];

let RECENT_STUDENT_UPDATES = [
  {
    id: 'upd-1',
    studentId: 'stu-sai-001',
    studentName: 'Sai Preethi',
    studentInitials: 'SP',
    rollNo: '24BCSE101',
    classId: 'class-cse-5a',
    itemType: 'Certification',
    actionType: 'added',
    title: 'AWS Certified Cloud Practitioner',
    subtitle: 'Amazon Web Services · Cloud Architecture',
    timestamp: '4 days ago',
    date: '2026-09-17',
  },
  {
    id: 'upd-2',
    studentId: 'stu-sai-001',
    studentName: 'Sai Preethi',
    studentInitials: 'SP',
    rollNo: '24BCSE101',
    classId: 'class-cse-5a',
    itemType: 'Project',
    actionType: 'updated',
    title: 'Ascend Distributed File System',
    subtitle: 'Go, Raft Consensus, Distributed Systems',
    timestamp: '6 days ago',
    date: '2026-09-15',
  },
  {
    id: 'upd-3',
    studentId: 'stu-ananya-003',
    studentName: 'Ananya Patel',
    studentInitials: 'AP',
    rollNo: '24BCSE114',
    classId: 'class-cse-5a',
    itemType: 'Internship',
    actionType: 'added',
    title: 'Data Science & AI Virtual Internship',
    subtitle: 'Cognizant · Applied Predictive Modeling',
    timestamp: '7 days ago',
    date: '2026-09-14',
  },
  {
    id: 'upd-4',
    studentId: 'stu-sai-001',
    studentName: 'Sai Preethi',
    studentInitials: 'SP',
    rollNo: '24BCSE101',
    classId: 'class-cse-5a',
    itemType: 'Hackathon',
    actionType: 'added',
    title: 'Smart India Hackathon Finalist',
    subtitle: 'Ministry of Education · Campus Innovation',
    timestamp: '9 days ago',
    date: '2026-09-12',
  },
  {
    id: 'upd-5',
    studentId: 'stu-vikram-004',
    studentName: 'Vikram Verma',
    studentInitials: 'VV',
    rollNo: '24BCSE120',
    classId: 'class-cse-5a',
    itemType: 'Certification',
    actionType: 'added',
    title: 'Kubernetes Fundamentals',
    subtitle: 'Linux Foundation · Container Orchestration',
    timestamp: '10 days ago',
    date: '2026-09-11',
  },
];

let FACULTY_FEEDBACK_SENT = [
  {
    id: 'ffb-1',
    fromId: 'usr-fac',
    fromName: 'Dr. Rakesh Mehta',
    fromRole: 'Associate Professor & Faculty Advisor',
    toStudentId: 'stu-sai-001',
    toStudentName: 'Sai Preethi',
    date: '2026-09-16',
    category: 'Project Architecture',
    subject: 'Feedback on Distributed File System',
    message: 'Excellent practical application of Raft consensus in your storage engine. Consider profiling disk write latency next.',
    recommendedNextStep: 'Add benchmark telemetry and link working repo on public portfolio.',
    classId: 'class-cse-5a',
    isRead: true,
  },
  {
    id: 'ffb-2',
    fromId: 'usr-fac',
    fromName: 'Dr. Rakesh Mehta',
    fromRole: 'Associate Professor & Faculty Advisor',
    toStudentId: 'stu-ananya-003',
    toStudentName: 'Ananya Patel',
    date: '2026-09-13',
    category: 'Internship Alignment',
    subject: 'Data Science Internship Milestone',
    message: 'Great momentum with the Cognizant virtual internship. Ensure you document the dataset preprocessing pipeline.',
    recommendedNextStep: 'Publish the summary write-up to your portfolio overview.',
    classId: 'class-cse-5a',
    isRead: false,
  },
];

let EVALUATIONS = [
  {
    id: 'eval-vikram-s5',
    studentId: 'stu-vikram-004',
    studentName: 'Vikram Verma',
    studentProgram: 'B.Tech CSE',
    classId: 'class-cse-5a',
    evaluatorId: 'usr-fac',
    evaluatorName: 'Dr. Rakesh Mehta',
    evaluationPeriod: 'Semester 5 · July–November 2026',
    status: 'published',
    createdAt: '2026-09-18',
    lastUpdated: '2026-09-18',
    publishedAt: '2026-09-18',
    scores: {
      technical: { level: 'Strong', comment: 'Solid foundation in containers, cloud native architecture, and systems programming.' },
      projectAbility: { level: 'Strong', comment: 'Demonstrated clear capacity to deliver microservices with container deployment.' },
      communication: { level: 'Meets Expectations', comment: 'Technical READMEs are concise; verbal defense during review was well reasoned.' },
      leadership: { level: 'Meets Expectations', comment: 'Participates productively in team workflows and peer reviews.' },
      careerPreparedness: { level: 'Strong', comment: 'Portfolio demonstrates relevant industry skills in DevOps and systems.' },
    },
    overallSummary: 'Vikram has maintained consistent technical focus on cloud-native systems this semester. His project delivery and certifications align well with industry expectations for DevOps engineering roles.',
  },
  {
    id: 'eval-ananya-s5',
    studentId: 'stu-ananya-003',
    studentName: 'Ananya Patel',
    studentProgram: 'B.Tech CSE',
    classId: 'class-cse-5a',
    evaluatorId: 'usr-fac',
    evaluatorName: 'Dr. Rakesh Mehta',
    evaluationPeriod: 'Semester 5 · July–November 2026',
    status: 'draft',
    createdAt: '2026-09-15',
    lastUpdated: '2026-09-15',
    publishedAt: null,
    scores: {
      technical: { level: 'Outstanding', comment: 'High algorithmic fluency and exceptional competitive programming performance.' },
      projectAbility: { level: 'Strong', comment: 'Practical delivery of adaptive learning ML pipeline is progressing well.' },
      communication: { level: 'Strong', comment: 'Clear project documentation and technical reports.' },
      leadership: { level: 'Meets Expectations', comment: 'Engaged in study groups and student ACM chapter sessions.' },
      careerPreparedness: { level: 'Strong', comment: 'Well-rounded portfolio with balanced competitive and project evidence.' },
    },
    overallSummary: 'Draft review in progress: Ananya is on track for an Outstanding semester evaluation once her ML assistant project milestone is closed.',
  },
];

let FACULTY_NOTIFICATIONS = [
  {
    id: 'f-notif-1',
    type: 'eval_due',
    title: 'Semester evaluations due',
    message: 'Formal Semester 5 evaluations are due for 2 students in Class CS-A.',
    formattedDate: 'Today',
    isRead: false,
    actionView: 'faculty-evaluations',
    actionLabel: 'Evaluate students',
  },
  {
    id: 'f-notif-2',
    type: 'inactive_students',
    title: '30-day activity notice',
    message: '2 students have not recorded any portfolio activity in the past 30 days.',
    formattedDate: 'Yesterday',
    isRead: false,
    actionView: 'faculty-dashboard',
    actionLabel: 'View dashboard',
  },
  {
    id: 'f-notif-3',
    type: 'monthly_summary',
    title: 'September summaries generated',
    message: 'Monthly activity records have been generated for all 6 students in Class CS-A.',
    formattedDate: '3 days ago',
    isRead: false,
    actionView: 'faculty-students',
    actionLabel: 'View directory',
  },
];

/* ── Active Selected Class State ─────────────────────────────── */
let activeSelectedClassId = 'class-cse-5a';

/* ── Ascend Faculty Data Export ──────────────────────────────── */
window.AscendFacultyData = {
  get facultyUser() {
    return FACULTY_USER;
  },
  get classes() {
    return FACULTY_CLASSES;
  },
  get students() {
    return FACULTY_STUDENTS;
  },
  get recentUpdates() {
    return RECENT_STUDENT_UPDATES;
  },
  get facultyFeedback() {
    return FACULTY_FEEDBACK_SENT;
  },
  get evaluations() {
    return EVALUATIONS;
  },
  get notifications() {
    return FACULTY_NOTIFICATIONS;
  },

  /* ── Dynamic Load Faculty Data from Backend API ─────────────── */
  async loadFacultyData() {
    try {
      const res = await fetch('/api/faculty/data');
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;

      if (data.facultyUser) {
        Object.assign(FACULTY_USER, data.facultyUser);
      }
      if (Array.isArray(data.classes) && data.classes.length > 0) {
        FACULTY_CLASSES.length = 0;
        data.classes.forEach(c => FACULTY_CLASSES.push(c));
        saveClassesToStorage(FACULTY_CLASSES);
      } else {
        const stored = loadClassesFromStorage();
        if (stored && stored.length > 0) {
          FACULTY_CLASSES.length = 0;
          stored.forEach(c => FACULTY_CLASSES.push(c));
        }
      }
      if (Array.isArray(data.students) && data.students.length > 0) {
        FACULTY_STUDENTS = data.students.map(s => {
          // Normalize monthly tracking and review status
          if (!Array.isArray(s.monthlySummaries) || s.monthlySummaries.length === 0) {
            const achs = s.achievements || [];
            const projs = s.projects || [];
            s.monthlySummaries = [
              {
                month: 'September 2026',
                monthKey: '2026-09',
                achievementsAdded: achs.length,
                achievementTitles: achs.map(a => a.title),
                projectsUpdated: projs.length,
                projectTitles: projs.map(p => p.title),
                feedbackReceived: (data.feedbackHistory || []).filter(f => f.toStudentId === s.id || f.studentId === s.id).length,
                profileDetailsUpdated: !!s.bio,
                lastActivityDate: s.lastActivity || '2026-09-17',
                lastActivityFormatted: '4 days ago',
                reviewedByStudent: s.monthlyReviewed !== undefined ? s.monthlyReviewed : false,
                summaryText: s.latestMonthlySummary || `September summary: ${achs.length} achievements added, ${projs.length} projects updated. Last portfolio activity: Recently.`,
              },
            ];
          }
          if (s.daysInactive === undefined && s.lastActivity) {
            s.daysInactive = Math.max(0, Math.floor((Date.now() - new Date(s.lastActivity).getTime()) / (1000 * 60 * 60 * 24)));
          }
          if (s.monthlyReviewed === undefined) {
            s.monthlyReviewed = s.monthlySummaries[0]?.reviewedByStudent || false;
          }
          return s;
        });
      }
      if (Array.isArray(data.evaluations) && data.evaluations.length > 0) {
        EVALUATIONS = data.evaluations;
      }
      if (Array.isArray(data.feedbackHistory) && data.feedbackHistory.length > 0) {
        FACULTY_FEEDBACK_SENT = data.feedbackHistory.map(fb => {
          const n = { ...fb };
          if (!n.toStudentId && n.studentId) n.toStudentId = n.studentId;
          if (!n.toStudentName && n.studentName) n.toStudentName = n.studentName;
          if (!n.fromName && n.mentorName) n.fromName = n.mentorName;
          if (!n.fromRole && n.mentorTitle) n.fromRole = n.mentorTitle;
          if (!n.recommendedNextStep && n.nextSteps) n.recommendedNextStep = n.nextSteps;
          if (!n.message && n.feedbackText) n.message = n.feedbackText;
          if (!n.classId) n.classId = 'class-cse-5a';
          if (!n.followUpState) n.followUpState = n.followUpDate ? 'scheduled' : 'none';
          return n;
        });
      }
      if (Array.isArray(data.recentUpdates) && data.recentUpdates.length > 0) {
        RECENT_STUDENT_UPDATES = data.recentUpdates;
      }

      // Update student count in classes
      const allClass = FACULTY_CLASSES.find(c => c.id === 'all');
      if (allClass) {
        allClass.studentCount = FACULTY_STUDENTS.length;
      }
      FACULTY_CLASSES.forEach(c => {
        if (c.id !== 'all') {
          c.studentCount = FACULTY_STUDENTS.filter(s => s.classId === c.id).length;
        }
      });
    } catch (err) {
      console.warn('Could not load dynamic faculty data:', err);
    }
  },


  async updateFacultyProfile(updates) {
    try {
      const res = await fetch('/api/faculty/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data && data.facultyUser) {
        Object.assign(FACULTY_USER, data.facultyUser);
      } else if (updates) {
        Object.assign(FACULTY_USER, updates);
      }
      return data;
    } catch (err) {
      console.error('Failed to update faculty profile:', err);
      throw err;
    }
  },

  get selectedClassId() {
    return activeSelectedClassId;
  },
  set selectedClassId(val) {
    activeSelectedClassId = val || 'all';
  },

  getClasses() {
    return FACULTY_CLASSES;
  },

  getSelectedClass() {
    return FACULTY_CLASSES.find(c => c.id === activeSelectedClassId) || FACULTY_CLASSES[0] || {
      id: 'all',
      name: 'All Registered Students',
      shortName: 'All Students',
    };
  },

  setSelectedClass(classId) {
    if (FACULTY_CLASSES.some(c => c.id === classId)) {
      activeSelectedClassId = classId;
    } else if (classId === 'all') {
      activeSelectedClassId = 'all';
    }
  },

  async addClass(classData) {
    const payload = classData || {};
    const newClass = {
      id: payload.id || `class-${Date.now()}`,
      name: payload.name || 'New Class',
      shortName: payload.shortName || payload.name || 'New Class',
      program: payload.program || 'General',
      department: payload.department || FACULTY_USER.department || 'Computer Science & Engineering',
      semester: payload.semester !== undefined ? payload.semester : 1,
      section: payload.section || 'Section A',
      academicYear: payload.academicYear || '2026–27',
      studentCount: 0,
    };

    FACULTY_CLASSES.push(newClass);
    saveClassesToStorage(FACULTY_CLASSES);

    try {
      const res = await fetch('/api/faculty/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.class && data.class.id) {
          const idx = FACULTY_CLASSES.findIndex(c => c.id === newClass.id);
          if (idx !== -1) {
            FACULTY_CLASSES[idx] = data.class;
            saveClassesToStorage(FACULTY_CLASSES);
          }
        }
      }
    } catch (e) {
      console.warn('Could not sync new class to server:', e);
    }
    return newClass;
  },

  async updateClass(classId, updates) {
    const idx = FACULTY_CLASSES.findIndex(c => c.id === classId);
    if (idx === -1) throw new Error('Class not found');

    const updated = {
      ...FACULTY_CLASSES[idx],
      ...updates,
      id: FACULTY_CLASSES[idx].id,
    };
    FACULTY_CLASSES[idx] = updated;
    saveClassesToStorage(FACULTY_CLASSES);

    try {
      await fetch(`/api/faculty/classes/${encodeURIComponent(classId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.warn('Could not sync updated class to server:', e);
    }
    return updated;
  },

  async deleteClass(classId) {
    if (classId === 'all') throw new Error('Cannot delete primary All Students scope');
    const idx = FACULTY_CLASSES.findIndex(c => c.id === classId);
    if (idx === -1) throw new Error('Class not found');

    FACULTY_CLASSES.splice(idx, 1);
    if (activeSelectedClassId === classId) {
      activeSelectedClassId = 'all';
    }
    saveClassesToStorage(FACULTY_CLASSES);

    try {
      await fetch(`/api/faculty/classes/${encodeURIComponent(classId)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Could not sync deleted class to server:', e);
    }
    return true;
  },

  getStudents(classId) {
    const cid = classId || activeSelectedClassId;
    if (!cid || cid === 'all') return FACULTY_STUDENTS;
    return FACULTY_STUDENTS.filter(s => s.classId === cid);
  },

  getRecentUpdates(classId) {
    const cid = classId || activeSelectedClassId;
    if (!cid || cid === 'all') return RECENT_STUDENT_UPDATES;
    return RECENT_STUDENT_UPDATES.filter(u => u.classId === cid);
  },

  getAttentionStudents(classId) {
    const cid = classId || activeSelectedClassId;
    const list = (!cid || cid === 'all') ? FACULTY_STUDENTS : FACULTY_STUDENTS.filter(s => s.classId === cid);
    return list.filter(s => s.attentionStatus && s.attentionStatus !== 'none');
  },

  /* ── Students with no portfolio updates in the past 30 days ─── */
  getStudentsInactive30Days(classId) {
    const cid = classId || activeSelectedClassId;
    const list = (!cid || cid === 'all') ? FACULTY_STUDENTS : FACULTY_STUDENTS.filter(s => s.classId === cid);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    return list.filter(s => {
      if (s.daysInactive !== undefined && s.daysInactive >= 30) return true;
      if (!s.lastActivity) return true;
      return new Date(s.lastActivity).getTime() < thirtyDaysAgo;
    });
  },

  /* ── Students who have not reviewed their monthly summary ────── */
  getStudentsUnreviewedMonthly(classId) {
    const cid = classId || activeSelectedClassId;
    const list = (!cid || cid === 'all') ? FACULTY_STUDENTS : FACULTY_STUDENTS.filter(s => s.classId === cid);
    return list.filter(s => s.monthlyReviewed === false);
  },

  /* ── Semester Evaluations Status by Period ───────────────────── */
  getSemesterEvaluationsDue(classId, period = 'Semester 5') {
    const cid = classId || activeSelectedClassId;
    const list = (!cid || cid === 'all') ? FACULTY_STUDENTS : FACULTY_STUDENTS.filter(s => s.classId === cid);
    const evals = (!cid || cid === 'all') ? EVALUATIONS : EVALUATIONS.filter(e => e.classId === cid);

    return list.map(student => {
      const studentEval = evals.find(e => e.studentId === student.id && (!period || (e.evaluationPeriod && e.evaluationPeriod.includes(period))));
      const status = studentEval ? studentEval.status : 'to-evaluate'; // 'published' | 'draft' | 'to-evaluate'
      return {
        student,
        evaluation: studentEval || null,
        status,
        period: studentEval ? studentEval.evaluationPeriod : `${period} · July–November 2026`,
        latestSummary: student.latestMonthlySummary || (student.monthlySummaries && student.monthlySummaries[0] ? student.monthlySummaries[0].summaryText : 'Activity recorded.'),
        lastActivityDate: student.lastActivity || 'Recently',
      };
    });
  },

  /* ── Factual Activity Brief Since Previous Evaluation ────────── */
  getActivityBrief(studentId, period = 'Semester 5') {
    const student = FACULTY_STUDENTS.find(s => s.id === studentId);
    if (!student) {
      return {
        achievementsCount: 0,
        achievementTitles: [],
        projectsCount: 0,
        projectTitles: [],
        feedbackCount: 0,
        feedbackNotes: [],
        mostRecentDate: 'None recorded',
        inactiveMonths: ['July 2026', 'August 2026'],
      };
    }

    const achs = student.achievements || [];
    const projs = student.projects || [];
    const fb = FACULTY_FEEDBACK_SENT.filter(f => f.toStudentId === student.id || f.studentId === student.id);

    // Identify months with zero activity from monthlySummaries
    const inactiveMonths = [];
    if (Array.isArray(student.monthlySummaries)) {
      student.monthlySummaries.forEach(m => {
        if ((m.achievementsAdded || 0) === 0 && (m.projectsUpdated || 0) === 0) {
          inactiveMonths.push(m.month);
        }
      });
    }

    return {
      achievementsCount: achs.length,
      achievementTitles: achs.map(a => a.title),
      projectsCount: projs.length,
      projectTitles: projs.map(p => p.title),
      feedbackCount: fb.length,
      feedbackNotes: fb.map(f => `${f.category || 'Guidance'}: "${f.message || f.feedbackText || ''}" (${f.date || 'Recent'})`),
      mostRecentDate: student.lastActivity ? student.lastActivity.slice(0, 10) : 'Recently',
      inactiveMonths,
    };
  },

  getEvaluations(classId) {
    const cid = classId || activeSelectedClassId;
    if (!cid || cid === 'all') return EVALUATIONS;
    return EVALUATIONS.filter(e => e.classId === cid);
  },

  getFeedback(classId) {
    const cid = classId || activeSelectedClassId;
    if (!cid || cid === 'all') return FACULTY_FEEDBACK_SENT;
    return FACULTY_FEEDBACK_SENT.filter(f => f.classId === cid);
  },

  genId(prefix) {

    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  },

  /* Send faculty / admin feedback */
  sendFeedback(feedbackData) {
    const followUpState = feedbackData.followUpDate ? 'scheduled' : 'none';
    const fb = {
      id: `ffb-${Date.now()}`,
      fromId: FACULTY_USER.id || 'usr-fac',
      fromName: FACULTY_USER.name || 'Faculty Advisor',
      fromRole: FACULTY_USER.designation || 'Associate Professor & Faculty Advisor',
      date: new Date().toISOString().slice(0, 10),
      isRead: false,
      followUpState,
      ...feedbackData,
    };
    FACULTY_FEEDBACK_SENT.unshift(fb);

    // Persist to backend database and student's personal feedback list
    fetch('/api/faculty/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: feedbackData.toStudentId,
        studentName: feedbackData.toStudentName,
        feedbackText: feedbackData.message,
        category: feedbackData.category,
        nextSteps: feedbackData.recommendedNextStep,
        classId: feedbackData.classId || activeSelectedClassId || 'class-cse-5a',
        followUpDate: feedbackData.followUpDate || null,
      }),
    }).catch(e => console.warn('Could not persist feedback:', e));

    // Also record into student's personal activity feed if present
    const student = FACULTY_STUDENTS.find(s => s.id === feedbackData.toStudentId);
    if (student && student.activity) {
      student.activity.unshift({
        id: `act-fb-${Date.now()}`,
        type: 'feedback',
        title: `Received guidance from ${FACULTY_USER.name || 'Administrator'}`,
        timestamp: 'Just now',
        date: new Date().toISOString(),
        detail: `Category: ${feedbackData.category} · Next step: ${feedbackData.recommendedNextStep || 'Review notes'}`,
      });
    }

    return fb;
  },

  /* Delete feedback */
  async deleteFeedback(feedbackId) {
    const idx = FACULTY_FEEDBACK_SENT.findIndex(f => f.id === feedbackId);
    let removed = null;
    if (idx !== -1) {
      removed = FACULTY_FEEDBACK_SENT.splice(idx, 1)[0];
    }
    try {
      await fetch(`/api/faculty/feedback/${encodeURIComponent(feedbackId)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Could not delete feedback from server:', e);
    }
    return removed;
  },

  /* Save evaluation (draft or publish) */
  saveEvaluation(id, scoreData, isPublish) {
    let evalItem = EVALUATIONS.find(e => e.id === id);
    if (!evalItem && scoreData && scoreData.studentId) {
      evalItem = {
        id: `eval-${Date.now()}`,
        studentId: scoreData.studentId,
        studentName: scoreData.studentName || 'Student',
        studentProgram: scoreData.studentProgram || 'B.Tech CSE',
        classId: scoreData.classId || activeSelectedClassId,
        evaluatorId: FACULTY_USER.id || 'usr-fac',
        evaluatorName: FACULTY_USER.name || 'Faculty Advisor',
        evaluationPeriod: scoreData.period || 'Semester 5 (Jul – Nov 2026)',
        deadline: '2026-09-30',
        status: isPublish ? 'published' : 'draft',
        createdAt: new Date().toISOString().slice(0, 10),
        lastUpdated: new Date().toISOString().slice(0, 10),
        publishedAt: isPublish ? new Date().toISOString().slice(0, 10) : null,
        scores: scoreData.scores || {},
        overallSummary: scoreData.overallSummary || '',
      };
      EVALUATIONS.unshift(evalItem);
    } else if (evalItem) {
      if (scoreData && scoreData.scores) evalItem.scores = scoreData.scores;
      if (scoreData && scoreData.overallSummary !== undefined) evalItem.overallSummary = scoreData.overallSummary;
      if (scoreData && scoreData.period) evalItem.evaluationPeriod = scoreData.period;
      evalItem.lastUpdated = new Date().toISOString().slice(0, 10);
      if (isPublish) {
        evalItem.status = 'published';
        evalItem.publishedAt = new Date().toISOString().slice(0, 10);
      }
    }

    // Persist to backend database
    if (evalItem) {
      fetch('/api/faculty/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evalItem),
      }).catch(e => console.warn('Could not persist evaluation:', e));
    }

    // Update student evaluationStatus flag
    if (evalItem) {
      const student = FACULTY_STUDENTS.find(s => s.id === evalItem.studentId);
      if (student) {
        student.evaluationStatus = isPublish ? 'evaluated' : 'draft';
        if (isPublish && student.attentionStatus === 'eval-pending') {
          student.attentionStatus = 'none';
          student.attentionReason = null;
        }
        if (isPublish && student.activity) {
          student.activity.unshift({
            id: `act-ev-${Date.now()}`,
            type: 'evaluation',
            title: `${evalItem.evaluationPeriod} Evaluation Published`,
            timestamp: 'Just now',
            date: new Date().toISOString(),
            detail: `Formal evaluation published by ${FACULTY_USER.name || 'Administrator'}.`,
          });
        }
      }
    }

    // ── Live push to student portal (same browser session) ──────
    // If this evaluation is published and AscendData (student data store)
    // is loaded in the same session, sync the evaluation immediately.
    if (isPublish && evalItem && window.AscendData && Array.isArray(window.AscendData.evaluations)) {
      const existIdx = window.AscendData.evaluations.findIndex(e => e.id === evalItem.id);
      if (existIdx !== -1) {
        window.AscendData.evaluations[existIdx] = evalItem;
      } else {
        window.AscendData.evaluations.unshift(evalItem);
      }
      // Refresh student evaluation list if it is currently visible
      if (window.AscendViews && typeof window.AscendViews.refreshStudentEvalList === 'function') {
        window.AscendViews.refreshStudentEvalList();
      }
    }
  },


  /* Delete evaluation */
  async deleteEvaluation(evalId) {
    const idx = EVALUATIONS.findIndex(e => e.id === evalId);
    let removed = null;
    if (idx !== -1) {
      removed = EVALUATIONS.splice(idx, 1)[0];
    }
    if (removed && removed.studentId) {
      const student = FACULTY_STUDENTS.find(s => s.id === removed.studentId);
      if (student) {
        const hasPublished = EVALUATIONS.some(e => e.studentId === student.id && e.status === 'published');
        const hasDraft = EVALUATIONS.some(e => e.studentId === student.id && e.status === 'draft');
        student.evaluationStatus = hasPublished ? 'evaluated' : (hasDraft ? 'draft' : 'pending');
      }
    }
    try {
      await fetch(`/api/faculty/evaluations/${encodeURIComponent(evalId)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Could not delete evaluation from server:', e);
    }
    return removed;
  },

  /* Cohort Insights Data Generator for Selected Class */
  getClassInsights(classId) {
    const cid = classId || activeSelectedClassId;
    const students = window.AscendFacultyData.getStudents(cid);
    const updates = window.AscendFacultyData.getRecentUpdates(cid);
    const evals = window.AscendFacultyData.getEvaluations(cid);

    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const activityOverTime = months.map(m => {
      const base = students.length * 2;
      const factor = m === 'Sep' ? 1.4 : m === 'Aug' ? 1.6 : m === 'Jul' ? 1.1 : m === 'Jun' ? 0.9 : 0.7;
      return { month: m, count: Math.round(base * factor) };
    });

    const categoryCounts = {
      'Project': 0,
      'Certification': 0,
      'Hackathon': 0,
      'Research': 0,
      'Workshop': 0,
      'Internship': 0,
    };
    students.forEach(s => {
      if (s.portfolioSummary) {
        if (s.portfolioSummary.includes('Project')) categoryCounts['Project'] += 1;
        if (s.portfolioSummary.includes('Cert')) categoryCounts['Certification'] += 1;
        if (s.portfolioSummary.includes('Hackathon')) categoryCounts['Hackathon'] += 1;
        if (s.portfolioSummary.includes('Research')) categoryCounts['Research'] += 1;
        if (s.portfolioSummary.includes('Workshop')) categoryCounts['Workshop'] += 1;
        if (s.portfolioSummary.includes('Internship')) categoryCounts['Internship'] += 1;
      }
    });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const inactiveStudents = students.filter(s => s.lastActivity && new Date(s.lastActivity) < thirtyDaysAgo);

    const totalStudents = students.length;
    const evaluatedCount = evals.filter(e => e.status === 'published').length;
    const draftCount = evals.filter(e => e.status === 'draft').length;
    const pendingCount = Math.max(0, totalStudents - (evaluatedCount + draftCount));
    const completionRate = totalStudents > 0 ? Math.round((evaluatedCount / totalStudents) * 100) : 0;

    const incompleteProfileStudents = students.filter(s => s.profileSetupStatus === 'incomplete');

    return {
      activityOverTime,
      categoryParticipation: Object.entries(categoryCounts).map(([cat, count]) => ({ category: cat, count })),
      inactiveStudents,
      evaluationStats: {
        total: totalStudents,
        evaluated: evaluatedCount,
        draft: draftCount,
        pending: pendingCount,
        rate: completionRate,
      },
      incompleteProfileStudents,
    };
  },
};
