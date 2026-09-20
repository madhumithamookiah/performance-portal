/**
 * ASCEND – Dynamic Student Data Store
 * All records are dynamically retrieved and synchronized with the backend database.
 */

(function () {
  const defaultStudent = {
    id: '',
    name: 'Student',
    firstName: 'Student',
    email: '',
    initials: 'ST',
    institution: 'Delhi Institute of Technology',
    department: 'Computer Science & Engineering',
    degree: 'B.Tech in Computer Science',
    year: 1,
    graduationYear: 2028,
    profileStrength: 45,
    bio: '',
    careerInterests: [],
    linkedIn: '',
    github: '',
    portfolio: '',
    skillsCount: 0,
  };

  function genId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  const AscendData = {
    isLoaded: false,
    student: { ...defaultStudent },
    skills: { Technical: [], Communication: [], Leadership: [], Innovation: [], 'Career Readiness': [] },
    achievements: [],
    projects: [],
    publicPortfolio: {
      isPublished: true,
      slug: 'student-portfolio',
      customHeadline: 'Student Portfolio',
      showBio: true,
      showCareerInterests: true,
      showLinks: true,
      showSkills: true,
      showProjects: true,
      showAchievements: true,
      publicAchievementIds: [],
      keepEvidencePrivate: true,
    },
    portfolioInsights: { views: 0, downloads: 0, shares: 0 },
    goals: [],
    feedback: [],
    activity: [],
    monthlyData: [0, 0, 0, 0, 0, 0],
    profileChecklist: [],
    categories: ['Certification', 'Hackathon', 'Internship', 'Research', 'Academic', 'Leadership', 'Award'],
    skillOptions: ['Python', 'JavaScript', 'React', 'Node.js', 'Machine Learning', 'Cloud Computing', 'SQL & Databases', 'Problem Solving', 'Data Analysis', 'Docker / DevOps'],
    genId,

    // Dynamic Server Loader
    async loadStudentData(userId) {
      try {
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
        const res = await fetch(`/api/student/data${query}`);
        if (!res.ok) throw new Error('Failed to load student data');
        const data = await res.json();
        
        this.student = data.student || this.student;
        this.skills = data.skills || this.skills;
        this.achievements = Array.isArray(data.achievements) ? data.achievements : [];
        this.projects = Array.isArray(data.projects) ? data.projects : [];
        this.publicPortfolio = data.publicPortfolio || this.publicPortfolio;
        this.portfolioInsights = data.portfolioInsights || this.portfolioInsights;
        this.goals = Array.isArray(data.goals) ? data.goals : [];
        this.feedback = Array.isArray(data.feedback) ? data.feedback : [];
        this.activity = Array.isArray(data.activity) ? data.activity : [];
        this.monthlyData = Array.isArray(data.monthlyData) ? data.monthlyData : [0, 0, 0, 0, 0, 0];
        this.profileChecklist = Array.isArray(data.profileChecklist) ? data.profileChecklist : [];
        if (data.categories) this.categories = data.categories.filter(c => c !== 'Project');
        if (data.skillOptions) this.skillOptions = data.skillOptions;
        this.isLoaded = true;
        return this;
      } catch (err) {
        console.warn('[AscendData] Dynamic load error:', err);
        return this;
      }
    },

    // Dynamic Persistence APIs
    async saveAchievement(ach) {
      try {
        const res = await fetch('/api/student/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...ach, userId: this.student.id }),
        });
        const result = await res.json();
        return result.achievement || ach;
      } catch (e) {
        console.error('Failed to sync achievement to server:', e);
        return ach;
      }
    },

    async deleteAchievement(id) {
      try {
        await fetch(`/api/student/achievements/${encodeURIComponent(id)}?userId=${encodeURIComponent(this.student.id)}`, {
          method: 'DELETE',
        });
      } catch (e) {
        console.error('Failed to delete achievement on server:', e);
      }
    },

    async saveProject(proj) {
      try {
        const res = await fetch('/api/student/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...proj, userId: this.student.id }),
        });
        const result = await res.json();
        return result.project || proj;
      } catch (e) {
        console.error('Failed to sync project to server:', e);
        return proj;
      }
    },

    async deleteProject(id) {
      try {
        await fetch(`/api/student/projects/${encodeURIComponent(id)}?userId=${encodeURIComponent(this.student.id)}`, {
          method: 'DELETE',
        });
      } catch (e) {
        console.error('Failed to delete project on server:', e);
      }
    },

    async updateProfile(updates) {
      try {
        const res = await fetch('/api/student/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...updates, userId: this.student.id }),
        });
        const result = await res.json();
        if (result.student) Object.assign(this.student, result.student);
        if (result.skills) this.skills = result.skills;
        if (result.profileChecklist) this.profileChecklist = result.profileChecklist;
        return result;
      } catch (e) {
        console.error('Failed to sync profile update to server:', e);
      }
    },
  };

  window.AscendData = AscendData;
})();
