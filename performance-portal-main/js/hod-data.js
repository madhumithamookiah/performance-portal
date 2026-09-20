/**
 * ASCEND – HOD / Department Coordinator Data Store
 * Department-level oversight across classes, faculty mentors, portfolio activity,
 * and evaluation completion. Factual signals only (zero rankings or quality scores).
 */

(function () {
  /* ── HOD Profile & Department Identity ─────────────────────── */
  const HOD_USER = {
    id: 'usr-hod-001',
    name: 'Prof. Sunita Rao, Ph.D.',
    firstName: 'Sunita',
    title: 'Prof.',
    email: 'hod.cse@university.edu',
    role: 'hod',
    designation: 'Head of Department & Coordinator',
    department: 'Computer Science & Engineering',
    institution: 'Delhi Institute of Technology',
    officeLocation: 'Academic Block 3, Room 402',
    phoneExtension: 'x4102',
    initials: 'SR',
  };

  const ACADEMIC_PERIODS = [
    { id: '2026-27-odd', name: 'Academic Year 2026–27 · Fall / Odd Sem', current: true },
    { id: '2025-26-even', name: 'Academic Year 2025–26 · Spring / Even Sem', current: false },
    { id: '2025-26-odd', name: 'Academic Year 2025–26 · Fall / Odd Sem', current: false },
  ];

  /* ── Faculty Mentors (8 Faculty) ───────────────────────────── */
  let FACULTY_MENTORS = [
    {
      id: 'fac-001',
      name: 'Dr. Rakesh Mehta',
      title: 'Dr.',
      email: 'dr.mehta@university.edu',
      designation: 'Associate Professor',
      department: 'Computer Science & Engineering',
      assignedClassIds: ['class-cse-5a'],
      assignedStudentsCount: 48,
      status: 'Normal',
      officeHours: 'Mon, Wed 2:00 – 4:00 PM',
      avatarBg: '#E8F0FE',
      avatarText: '#1A73E8',
    },
    {
      id: 'fac-002',
      name: 'Dr. Ananya Sen',
      title: 'Dr.',
      email: 'ananya.sen@university.edu',
      designation: 'Assistant Professor',
      department: 'Computer Science & Engineering',
      assignedClassIds: ['class-cse-5b'],
      assignedStudentsCount: 46,
      status: 'Normal',
      officeHours: 'Tue, Thu 10:00 AM – 12:00 PM',
      avatarBg: '#F3E8FF',
      avatarText: '#6D28D9',
    },
    {
      id: 'fac-003',
      name: 'Prof. Vikram Malhotra',
      title: 'Prof.',
      email: 'v.malhotra@university.edu',
      designation: 'Professor',
      department: 'Computer Science & Engineering',
      assignedClassIds: ['class-cse-3a'],
      assignedStudentsCount: 52,
      status: 'Normal',
      officeHours: 'Wed, Fri 11:00 AM – 1:00 PM',
      avatarBg: '#DCFCE7',
      avatarText: '#166534',
    },
    {
      id: 'fac-004',
      name: 'Dr. Priya Nambiar',
      title: 'Dr.',
      email: 'priya.nambiar@university.edu',
      designation: 'Associate Professor',
      department: 'Computer Science & Engineering',
      assignedClassIds: ['class-cse-3b'],
      assignedStudentsCount: 50,
      status: 'Normal',
      officeHours: 'Mon, Thu 3:00 – 5:00 PM',
      avatarBg: '#FEF3C7',
      avatarText: '#92400E',
    },
    {
      id: 'fac-005',
      name: 'Dr. Rajesh Sharma',
      title: 'Dr.',
      email: 'rajesh.sharma@university.edu',
      designation: 'Assistant Professor',
      department: 'Computer Science & Engineering',
      assignedClassIds: ['class-cse-7a'],
      assignedStudentsCount: 44,
      status: 'Normal',
      officeHours: 'Tue, Fri 2:00 – 4:00 PM',
      avatarBg: '#FCE7F3',
      avatarText: '#9D174D',
    },
    {
      id: 'fac-006',
      name: 'Dr. Kavita Iyer',
      title: 'Dr.',
      email: 'kavita.iyer@university.edu',
      designation: 'Assistant Professor',
      department: 'Computer Science & Engineering',
      assignedClassIds: [],
      assignedStudentsCount: 0,
      status: 'Unassigned',
      officeHours: 'Available for Cohort Advising',
      avatarBg: '#E0F2FE',
      avatarText: '#0369A1',
    },
    {
      id: 'fac-007',
      name: 'Prof. Amit Deshmukh',
      title: 'Prof.',
      email: 'a.deshmukh@university.edu',
      designation: 'Professor',
      department: 'Computer Science & Engineering',
      assignedClassIds: [],
      assignedStudentsCount: 0,
      status: 'Unassigned',
      officeHours: 'Research Advising Only',
      avatarBg: '#F1F3F4',
      avatarText: '#3C4043',
    },
    {
      id: 'fac-008',
      name: 'Dr. Suresh Raina',
      title: 'Dr.',
      email: 'suresh.raina@university.edu',
      designation: 'Visiting Faculty',
      department: 'Computer Science & Engineering',
      assignedClassIds: [],
      assignedStudentsCount: 0,
      status: 'Unassigned',
      officeHours: 'By Appointment',
      avatarBg: '#FFEDD5',
      avatarText: '#9A3412',
    },
  ];

  /* ── Department Classes (6 Cohorts) ────────────────────────── */
  let DEPARTMENT_CLASSES = [
    {
      id: 'class-cse-5a',
      name: 'B.Tech CSE · Semester 5 · Section A',
      shortName: 'CSE 5A',
      programme: 'B.Tech CSE',
      semester: 5,
      section: 'Section A',
      academicYear: '2026–27',
      studentCount: 48,
      assignedFacultyId: 'fac-001',
      assignedFacultyName: 'Dr. Rakesh Mehta',
      recentUpdatesCount: 46,
      lastActivityDate: '2026-09-19',
      evaluationStats: { published: 42, draft: 4, notStarted: 2 },
      profileSetupRate: 94,
      inactiveStudentsCount: 3,
    },
    {
      id: 'class-cse-5b',
      name: 'B.Tech CSE · Semester 5 · Section B',
      shortName: 'CSE 5B',
      programme: 'B.Tech CSE',
      semester: 5,
      section: 'Section B',
      academicYear: '2026–27',
      studentCount: 46,
      assignedFacultyId: 'fac-002',
      assignedFacultyName: 'Dr. Ananya Sen',
      recentUpdatesCount: 38,
      lastActivityDate: '2026-09-18',
      evaluationStats: { published: 36, draft: 6, notStarted: 4 },
      profileSetupRate: 86,
      inactiveStudentsCount: 5,
    },
    {
      id: 'class-cse-3a',
      name: 'B.Tech CSE · Semester 3 · Section A',
      shortName: 'CSE 3A',
      programme: 'B.Tech CSE',
      semester: 3,
      section: 'Section A',
      academicYear: '2026–27',
      studentCount: 52,
      assignedFacultyId: 'fac-003',
      assignedFacultyName: 'Prof. Vikram Malhotra',
      recentUpdatesCount: 32,
      lastActivityDate: '2026-09-17',
      evaluationStats: { published: 32, draft: 12, notStarted: 8 },
      profileSetupRate: 90,
      inactiveStudentsCount: 6,
    },
    {
      id: 'class-cse-3b',
      name: 'B.Tech CSE · Semester 3 · Section B',
      shortName: 'CSE 3B',
      programme: 'B.Tech CSE',
      semester: 3,
      section: 'Section B',
      academicYear: '2026–27',
      studentCount: 50,
      assignedFacultyId: 'fac-004',
      assignedFacultyName: 'Dr. Priya Nambiar',
      recentUpdatesCount: 8,
      lastActivityDate: '2026-09-02',
      evaluationStats: { published: 30, draft: 10, notStarted: 10 },
      profileSetupRate: 82,
      inactiveStudentsCount: 14,
    },
    {
      id: 'class-cse-7a',
      name: 'B.Tech CSE · Semester 7 · Section A',
      shortName: 'CSE 7A',
      programme: 'B.Tech CSE',
      semester: 7,
      section: 'Section A',
      academicYear: '2026–27',
      studentCount: 44,
      assignedFacultyId: 'fac-005',
      assignedFacultyName: 'Dr. Rajesh Sharma',
      recentUpdatesCount: 52,
      lastActivityDate: '2026-09-19',
      evaluationStats: { published: 40, draft: 4, notStarted: 0 },
      profileSetupRate: 98,
      inactiveStudentsCount: 1,
    },
    {
      id: 'class-cse-7b',
      name: 'B.Tech CSE · Semester 7 · Section B',
      shortName: 'CSE 7B',
      programme: 'B.Tech CSE',
      semester: 7,
      section: 'Section B',
      academicYear: '2026–27',
      studentCount: 44,
      assignedFacultyId: null,
      assignedFacultyName: 'Unassigned',
      recentUpdatesCount: 14,
      lastActivityDate: '2026-09-12',
      evaluationStats: { published: 0, draft: 0, notStarted: 44 },
      profileSetupRate: 88,
      inactiveStudentsCount: 9,
    },
  ];

  /* ── Recent Department Activity Feed ──────────────────────── */
  let RECENT_DEPARTMENT_ACTIVITY = [
    {
      id: 'hact-001',
      studentName: 'Aarav Sharma',
      rollNo: '2024CSE1042',
      classId: 'class-cse-5a',
      className: 'CSE 5A',
      category: 'Project',
      title: 'Ascend Student Performance Portal',
      detail: 'Published complete full-stack web application with dynamic data storage.',
      date: '2026-09-19',
      relativeTime: 'Today',
      badgeColor: '#F3E8FF',
      badgeText: '#6D28D9',
    },
    {
      id: 'hact-002',
      studentName: 'Sneha Patel',
      rollNo: '2024CSE1089',
      classId: 'class-cse-5a',
      className: 'CSE 5A',
      category: 'Certification',
      title: 'AWS Certified Solutions Architect – Associate',
      detail: 'Amazon Web Services credential added to professional records.',
      date: '2026-09-18',
      relativeTime: 'Yesterday',
      badgeColor: '#E0F2FE',
      badgeText: '#0369A1',
    },
    {
      id: 'hact-003',
      studentName: 'Devika Menon',
      rollNo: '2022CSE1004',
      classId: 'class-cse-7a',
      className: 'CSE 7A',
      category: 'Research',
      title: 'Federated Edge Learning for Medical Image Segmentation',
      detail: 'Manuscript accepted for oral presentation at IEEE CloudCom 2026.',
      date: '2026-09-18',
      relativeTime: 'Yesterday',
      badgeColor: '#DCFCE7',
      badgeText: '#166534',
    },
    {
      id: 'hact-004',
      studentName: 'Rohan Deshmukh',
      rollNo: '2024CSE1012',
      classId: 'class-cse-5b',
      className: 'CSE 5B',
      category: 'Hackathon',
      title: 'Smart India Hackathon 2026 – 1st Runner Up',
      detail: 'Built an autonomous rural supply chain logistics optimizer.',
      date: '2026-09-17',
      relativeTime: '2 days ago',
      badgeColor: '#EEF2FF',
      badgeText: '#3730A3',
    },
    {
      id: 'hact-005',
      studentName: 'Karthik Raja',
      rollNo: '2025CSE1055',
      classId: 'class-cse-3a',
      className: 'CSE 3A',
      category: 'Project',
      title: 'Distributed Key-Value Store in Go',
      detail: 'Implemented Raft consensus algorithm with linearizable read/write semantics.',
      date: '2026-09-16',
      relativeTime: '3 days ago',
      badgeColor: '#F3E8FF',
      badgeText: '#6D28D9',
    },
    {
      id: 'hact-006',
      studentName: 'Ananya Reddy',
      rollNo: '2024CSE1028',
      classId: 'class-cse-5b',
      className: 'CSE 5B',
      category: 'Internship',
      title: 'Summer Software Engineering Intern · Microsoft',
      detail: '8-week engineering practicum completed in Azure Core Infrastructure.',
      date: '2026-09-15',
      relativeTime: '4 days ago',
      badgeColor: '#FCE7F3',
      badgeText: '#9D174D',
    },
    {
      id: 'hact-007',
      studentName: 'Aditya Sen',
      rollNo: '2025CSE1091',
      classId: 'class-cse-3a',
      className: 'CSE 3A',
      category: 'Workshop',
      title: 'Google Cloud Platform Kubernetes Immersion Bootcamp',
      detail: 'Completed 24-hour hands-on microservices containerization track.',
      date: '2026-09-14',
      relativeTime: '5 days ago',
      badgeColor: '#FFEDD5',
      badgeText: '#9A3412',
    },
    {
      id: 'hact-008',
      studentName: 'Meera Nambisan',
      rollNo: '2022CSE1033',
      classId: 'class-cse-7a',
      className: 'CSE 7A',
      category: 'Leadership',
      title: 'Chairperson · ACM Student Chapter',
      detail: 'Organized National CodeSprint 2026 with 850+ collegiate participants.',
      date: '2026-09-12',
      relativeTime: '1 week ago',
      badgeColor: '#FEF3C7',
      badgeText: '#92400E',
    },
  ];

  /* ── Inactive Students Directory (By Class) ────────────────── */
  const INACTIVE_STUDENTS = [
    { id: 'ist-1', name: 'Tanmay Saxena', rollNo: '2025CSE1062', classId: 'class-cse-3b', className: 'CSE 3B', semester: 3, lastActive: '2026-07-28', daysInactive: 53, profileSetup: 'Incomplete' },
    { id: 'ist-2', name: 'Megha Nair', rollNo: '2025CSE1070', classId: 'class-cse-3b', className: 'CSE 3B', semester: 3, lastActive: '2026-08-05', daysInactive: 45, profileSetup: 'Complete' },
    { id: 'ist-3', name: 'Varun Grover', rollNo: '2025CSE1078', classId: 'class-cse-3b', className: 'CSE 3B', semester: 3, lastActive: '2026-08-11', daysInactive: 39, profileSetup: 'Incomplete' },
    { id: 'ist-4', name: 'Sakshi Verma', rollNo: '2024CSE1066', classId: 'class-cse-5b', className: 'CSE 5B', semester: 5, lastActive: '2026-08-14', daysInactive: 36, profileSetup: 'Incomplete' },
    { id: 'ist-5', name: 'Abhinav Ghosh', rollNo: '2024CSE1071', classId: 'class-cse-5b', className: 'CSE 5B', semester: 5, lastActive: '2026-08-18', daysInactive: 32, profileSetup: 'Complete' },
    { id: 'ist-6', name: 'Preeti Chandra', rollNo: '2022CSE1048', classId: 'class-cse-7b', className: 'CSE 7B', semester: 7, lastActive: '2026-08-15', daysInactive: 35, profileSetup: 'Complete' },
    { id: 'ist-7', name: 'Rahul Chawla', rollNo: '2022CSE1055', classId: 'class-cse-7b', className: 'CSE 7B', semester: 7, lastActive: '2026-08-16', daysInactive: 34, profileSetup: 'Incomplete' },
  ];

  /* ── Students Sample Roster for Class Drill-Down ───────────── */
  const SAMPLE_STUDENTS_BY_CLASS = {
    'class-cse-5a': [
      { id: 'stu-001', name: 'Aarav Sharma', rollNo: '2024CSE1042', email: 'aarav.sharma@university.edu', achievementsCount: 5, projectsCount: 3, lastActive: '2026-09-19', status: 'Good Standing', profileStatus: 'Complete', evalStatus: 'Published' },
      { id: 'stu-002', name: 'Sneha Patel', rollNo: '2024CSE1089', email: 'sneha.patel@university.edu', achievementsCount: 4, projectsCount: 2, lastActive: '2026-09-18', status: 'Good Standing', profileStatus: 'Complete', evalStatus: 'Published' },
      { id: 'stu-003', name: 'Vikram Joshi', rollNo: '2024CSE1015', email: 'vikram.j@university.edu', achievementsCount: 3, projectsCount: 2, lastActive: '2026-09-14', status: 'Good Standing', profileStatus: 'Complete', evalStatus: 'Published' },
      { id: 'stu-004', name: 'Pooja Hegde', rollNo: '2024CSE1031', email: 'pooja.h@university.edu', achievementsCount: 2, projectsCount: 1, lastActive: '2026-09-10', status: 'Good Standing', profileStatus: 'Complete', evalStatus: 'Draft' },
      { id: 'stu-005', name: 'Adarsh Gupta', rollNo: '2024CSE1009', email: 'adarsh.g@university.edu', achievementsCount: 1, projectsCount: 1, lastActive: '2026-08-28', status: 'Needs Check-in', profileStatus: 'Incomplete', evalStatus: 'Not Started' },
    ],
    'class-cse-5b': [
      { id: 'stu-006', name: 'Rohan Deshmukh', rollNo: '2024CSE1012', email: 'rohan.d@university.edu', achievementsCount: 4, projectsCount: 2, lastActive: '2026-09-17', status: 'Good Standing', profileStatus: 'Complete', evalStatus: 'Published' },
      { id: 'stu-007', name: 'Ananya Reddy', rollNo: '2024CSE1028', email: 'ananya.r@university.edu', achievementsCount: 3, projectsCount: 2, lastActive: '2026-09-15', status: 'Good Standing', profileStatus: 'Complete', evalStatus: 'Published' },
      { id: 'stu-008', name: 'Sakshi Verma', rollNo: '2024CSE1066', email: 'sakshi.v@university.edu', achievementsCount: 1, projectsCount: 0, lastActive: '2026-08-14', status: 'Needs Check-in', profileStatus: 'Incomplete', evalStatus: 'Draft' },
    ],
    'class-cse-7b': [
      { id: 'stu-009', name: 'Preeti Chandra', rollNo: '2022CSE1048', email: 'preeti.c@university.edu', achievementsCount: 2, projectsCount: 1, lastActive: '2026-08-15', status: 'Unassigned Mentor', profileStatus: 'Complete', evalStatus: 'Not Started' },
      { id: 'stu-010', name: 'Rahul Chawla', rollNo: '2022CSE1055', email: 'rahul.c@university.edu', achievementsCount: 1, projectsCount: 1, lastActive: '2026-08-16', status: 'Unassigned Mentor', profileStatus: 'Incomplete', evalStatus: 'Not Started' },
    ],
  };

  /* ── Category Participation Metrics ────────────────────────── */
  const CATEGORY_STATS = [
    { key: 'Projects', label: 'Technical Projects', count: 131, pct: 46, color: '#6D28D9', bg: '#F3E8FF' },
    { key: 'Certifications', label: 'Industry Certifications', count: 74, pct: 26, color: '#0369A1', bg: '#E0F2FE' },
    { key: 'Hackathons', label: 'Hackathons & Sprints', count: 34, pct: 12, color: '#3730A3', bg: '#EEF2FF' },
    { key: 'Internships', label: 'Industry Internships', count: 23, pct: 8, color: '#9D174D', bg: '#FCE7F3' },
    { key: 'Research', label: 'Research & Publications', count: 14, pct: 5, color: '#166534', bg: '#DCFCE7' },
    { key: 'Workshops', label: 'Technical Workshops', count: 8, pct: 3, color: '#9A3412', bg: '#FFEDD5' },
  ];

  /* ── Settings State ────────────────────────────────────────── */
  let HOD_SETTINGS = {
    departmentName: 'Computer Science & Engineering',
    departmentCode: 'CSE-DEPT-01',
    institution: 'Delhi Institute of Technology',
    coordinatorName: 'Prof. Sunita Rao, Ph.D.',
    coordinatorRole: 'Head of Department',
    officeLocation: 'Academic Block 3, Room 402',
    email: 'hod.cse@university.edu',
    phone: '+91 (011) 2766-4102',
    programmes: [
      { code: 'BTECH-CSE', name: 'B.Tech in Computer Science & Engineering', active: true, cohorts: 4 },
      { code: 'BTECH-AIDS', name: 'B.Tech in AI & Data Science', active: true, cohorts: 2 },
      { code: 'MTECH-CSE', name: 'M.Tech in Advanced Computing', active: true, cohorts: 1 },
      { code: 'PHD-CS', name: 'Ph.D. in Computer Science', active: true, cohorts: 1 },
    ],
    academicPeriods: [
      { name: '2026–27 Odd Semester', start: '2026-07-15', end: '2026-11-30', evalDeadline: '2026-10-15', active: true },
      { name: '2025–26 Even Semester', start: '2026-01-10', end: '2026-05-20', evalDeadline: '2026-04-25', active: false },
    ],
    notifications: {
      weeklyDigest: true,
      lowActivityAlerts: true,
      unassignedClassAlerts: true,
      evaluationDeadlines: true,
      facultyAssignmentUpdates: true,
    },
    scope: {
      totalClasses: 6,
      totalStudents: 284,
      totalFaculty: 8,
      alliedOversightIT: false,
    },
  };

  /* ── Expose Window API ─────────────────────────────────────── */
  window.AscendHODData = {
    get hodUser() { return HOD_USER; },
    get academicPeriods() { return ACADEMIC_PERIODS; },
    get classes() { return DEPARTMENT_CLASSES; },
    get facultyMentors() { return FACULTY_MENTORS; },
    get recentActivity() { return RECENT_DEPARTMENT_ACTIVITY; },
    get inactiveStudents() { return INACTIVE_STUDENTS; },
    get categoryStats() { return CATEGORY_STATS; },
    get settings() { return HOD_SETTINGS; },

    getStudentsForClass(classId) {
      if (SAMPLE_STUDENTS_BY_CLASS[classId]) {
        return SAMPLE_STUDENTS_BY_CLASS[classId];
      }
      const c = DEPARTMENT_CLASSES.find(item => item.id === classId);
      if (!c) return [];
      return [
        { id: `stu-${classId}-1`, name: 'Class Representative', rollNo: `2024${c.shortName.replace(' ', '')}01`, email: `rep.${classId}@university.edu`, achievementsCount: 3, projectsCount: 2, lastActive: '2026-09-18', status: 'Good Standing', profileStatus: 'Complete', evalStatus: 'Published' },
        { id: `stu-${classId}-2`, name: 'Enrolled Student', rollNo: `2024${c.shortName.replace(' ', '')}02`, email: `std.${classId}@university.edu`, achievementsCount: 2, projectsCount: 1, lastActive: '2026-09-15', status: 'Good Standing', profileStatus: 'Complete', evalStatus: 'Draft' },
      ];
    },

    /* Assign Mentor to Class with instant local-state update */
    assignMentor(classId, facultyId) {
      const cls = DEPARTMENT_CLASSES.find(c => c.id === classId);
      if (!cls) return { success: false, error: 'Class not found' };

      const oldFacultyId = cls.assignedFacultyId;
      if (oldFacultyId) {
        const oldFac = FACULTY_MENTORS.find(f => f.id === oldFacultyId);
        if (oldFac) {
          oldFac.assignedClassIds = oldFac.assignedClassIds.filter(id => id !== classId);
          oldFac.assignedStudentsCount = Math.max(0, oldFac.assignedStudentsCount - cls.studentCount);
          oldFac.status = oldFac.assignedClassIds.length === 0 ? 'Unassigned' : (oldFac.assignedStudentsCount > 90 ? 'High Workload' : 'Normal');
        }
      }

      if (!facultyId || facultyId === 'unassigned') {
        cls.assignedFacultyId = null;
        cls.assignedFacultyName = 'Unassigned';
        return { success: true, message: `Class ${cls.shortName} marked unassigned.` };
      }

      const newFac = FACULTY_MENTORS.find(f => f.id === facultyId);
      if (!newFac) return { success: false, error: 'Faculty mentor not found' };

      if (!newFac.assignedClassIds.includes(classId)) {
        newFac.assignedClassIds.push(classId);
      }
      newFac.assignedStudentsCount = newFac.assignedClassIds.reduce((sum, cid) => {
        const cObj = DEPARTMENT_CLASSES.find(c => c.id === cid);
        return sum + (cObj ? cObj.studentCount : 0);
      }, 0);
      newFac.status = newFac.assignedStudentsCount > 90 ? 'High Workload' : 'Normal';

      cls.assignedFacultyId = newFac.id;
      cls.assignedFacultyName = newFac.name;

      return { success: true, facultyName: newFac.name, className: cls.shortName };
    },

    /* Update Settings */
    updateSettings(updated) {
      if (!updated || typeof updated !== 'object') return false;
      Object.assign(HOD_SETTINGS, updated);
      if (updated.notifications) Object.assign(HOD_SETTINGS.notifications, updated.notifications);
      return true;
    },
  };
})();
