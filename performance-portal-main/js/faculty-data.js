/**
 * ASCEND – Faculty / Mentor / Admin Data Store
 * Connected directly to backend API (/api/faculty/data) with zero static mock students.
 */

/* ── Faculty User Default ────────────────────────────────────── */
let FACULTY_USER = {
  id: 'usr-fac-001',
  name: 'Dr. Rakesh Mehta',
  firstName: 'Rakesh',
  title: 'Dr.',
  email: 'dr.mehta@university.edu',
  password: '',
  initials: 'RM',
  role: 'faculty',
  designation: 'Associate Professor & Faculty Advisor',
  department: 'Computer Science & Engineering',
  institution: 'Delhi Institute of Technology',
  assignedCohort: 'B.Tech CSE · Semester 5 · Section A',
  assignedStudents: 48,
  expertise: ['Software Engineering', 'Algorithms', 'Capstones'],
};

/* ── Classes / Cohorts Model ─────────────────────────────────── */
let FACULTY_CLASSES = [
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
let FACULTY_STUDENTS = [];
let RECENT_STUDENT_UPDATES = [];
let FACULTY_FEEDBACK_SENT = [];
let EVALUATIONS = [];

/* ── Active Selected Class State ─────────────────────────────── */
let activeSelectedClassId = 'all';

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
      if (Array.isArray(data.classes)) {
        FACULTY_CLASSES.length = 0;
        data.classes.forEach(c => FACULTY_CLASSES.push(c));
      }
      if (Array.isArray(data.students)) {
        FACULTY_STUDENTS = data.students;
      }
      if (Array.isArray(data.evaluations)) {
        EVALUATIONS = data.evaluations;
      }
      if (Array.isArray(data.feedbackHistory)) {
        FACULTY_FEEDBACK_SENT = data.feedbackHistory;
      }
      if (Array.isArray(data.recentUpdates)) {
        RECENT_STUDENT_UPDATES = data.recentUpdates;
      }

      // Update student count in classes
      const allClass = FACULTY_CLASSES.find(c => c.id === 'all');
      if (allClass) {
        allClass.studentCount = FACULTY_STUDENTS.length;
      }
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
      fromId: FACULTY_USER.id || 'usr-fac-001',
      fromName: FACULTY_USER.name || 'Dr. Rakesh Mehta',
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
        evaluatorId: FACULTY_USER.id || 'usr-fac-001',
        evaluatorName: FACULTY_USER.name || 'Dr. Rakesh Mehta',
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
