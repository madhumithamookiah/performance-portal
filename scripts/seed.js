const fs = require('fs');
const vm = require('vm');

const context = { window: {}, console: console, Math: Math, Date: Date };
vm.createContext(context);

const dataCode = fs.readFileSync('./js/data.js', 'utf8');
vm.runInContext(dataCode, context);

const facultyCode = fs.readFileSync('./js/faculty-data.js', 'utf8');
vm.runInContext(facultyCode, context);

const defaultCategories = context.window.AscendData.categories || [
  'Certification', 'Hackathon', 'Internship', 'Project', 'Research', 'Academic', 'Leadership', 'Award'
];

const defaultSkillOptions = context.window.AscendData.skillOptions || [
  'Python', 'JavaScript', 'React', 'Node.js', 'Machine Learning', 'Cloud Computing', 'SQL & Databases',
  'Problem Solving', 'Data Analysis', 'Docker / DevOps', 'Communication', 'Teamwork', 'Cybersecurity'
];

const db = {
  users: [
    {
      id: 'usr-stu-001',
      name: context.window.AscendData.student.name,
      email: context.window.AscendData.student.email,
      password: context.window.AscendData.student.password || 'demo1234',
      role: 'student',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-fac-001',
      name: (context.window.AscendFacultyData && context.window.AscendFacultyData.facultyUser && context.window.AscendFacultyData.facultyUser.name) || 'Faculty Advisor',
      email: (context.window.AscendFacultyData && context.window.AscendFacultyData.facultyUser && context.window.AscendFacultyData.facultyUser.email) || 'faculty@university.edu',
      password: (context.window.AscendFacultyData && context.window.AscendFacultyData.facultyUser && context.window.AscendFacultyData.facultyUser.password) || 'faculty123',
      role: 'faculty',
      createdAt: new Date().toISOString()
    }
  ],
  studentData: {
    'usr-stu-001': {
      student: context.window.AscendData.student,
      skills: context.window.AscendData.skills,
      achievements: context.window.AscendData.achievements,
      projects: context.window.AscendData.projects,
      publicPortfolio: context.window.AscendData.publicPortfolio,
      portfolioInsights: context.window.AscendData.portfolioInsights,
      goals: context.window.AscendData.goals || [],
      feedback: context.window.AscendData.feedback,
      activity: context.window.AscendData.activity,
      monthlyData: context.window.AscendData.monthlyData,
      profileChecklist: context.window.AscendData.profileChecklist,
      categories: defaultCategories,
      skillOptions: defaultSkillOptions
    }
  },
  facultyData: {
    facultyUser: context.window.AscendFacultyData.facultyUser,
    classes: context.window.AscendFacultyData.classes,
    students: context.window.AscendFacultyData.students,
    evaluations: context.window.AscendFacultyData.evaluations,
    feedbackHistory: context.window.AscendFacultyData.feedbackHistory,
    evaluationCriteria: context.window.AscendFacultyData.evaluationCriteria,
    cohortStats: context.window.AscendFacultyData.cohortStats,
    recentActivity: context.window.AscendFacultyData.recentActivity,
    distribution: context.window.AscendFacultyData.distribution,
  },
  categories: defaultCategories,
  skillOptions: defaultSkillOptions,
};

fs.writeFileSync('./data/db.json', JSON.stringify(db, null, 2), 'utf8');
console.log('Seeded data/db.json successfully! Users:', db.users.length);
