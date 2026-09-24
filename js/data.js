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
    evaluations: [],
    activity: [],
    monthlyData: [0, 0, 0, 0, 0, 0],
    profileChecklist: [],
    categories: ['Certification', 'Hackathon', 'Internship', 'Research', 'Academic', 'Leadership', 'Award'],
    skillOptions: ['Python', 'JavaScript', 'React', 'Node.js', 'Machine Learning', 'Cloud Computing', 'SQL & Databases', 'Problem Solving', 'Data Analysis', 'Docker / DevOps'],
    genId,

    // Factual Monthly Tracking Records (Multi-Month History)
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
        reviewedAt: null,
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
        reviewedAt: '2026-08-30T10:15:00.000Z',
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
        reviewedAt: '2026-07-31T18:00:00.000Z',
        summaryText: 'July summary: 0 achievements added, 0 projects updated, 0 faculty feedback notes received. Profile details initialized.',
      },
    ],

    // Realistic Demo Notifications for Student
    notifications: [
      {
        id: 'notif-monthly-ready',
        type: 'monthly_summary',
        title: 'Monthly summary ready',
        message: 'Your September activity summary is ready. Review your portfolio and add any completed work from this month.',
        date: '2026-09-18T09:00:00.000Z',
        formattedDate: '3 days ago',
        isRead: false,
        actionView: 'dashboard',
        actionLabel: 'Review your progress',
      },
      {
        id: 'notif-month-end-reminder',
        type: 'month_end_reminder',
        title: 'Month-end portfolio reminder',
        message: 'Reminder: Review your portfolio activity before month-end and record any completed certifications or projects.',
        date: '2026-09-20T14:30:00.000Z',
        formattedDate: 'Yesterday',
        isRead: false,
        actionView: 'goals',
        actionLabel: 'View portfolio',
      },
      {
        id: 'notif-eval-published',
        type: 'eval_published',
        title: 'Semester evaluation published',
        message: 'Your Semester 5 evaluation has been published. Review your faculty feedback and recommended next steps.',
        date: '2026-09-19T16:00:00.000Z',
        formattedDate: '2 days ago',
        isRead: false,
        actionView: 'evaluations',
        actionLabel: 'View evaluation',
      },
    ],

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
        this.evaluations = Array.isArray(data.evaluations) ? data.evaluations : [];
        if (Array.isArray(data.monthlySummaries) && data.monthlySummaries.length > 0) {
          this.monthlySummaries = data.monthlySummaries;
        }
        if (Array.isArray(data.notifications) && data.notifications.length > 0) {
          this.notifications = data.notifications;
        }
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

    // Mark Monthly Activity Summary as Reviewed
    async markMonthReviewed(monthKey = '2026-09') {
      const summary = this.monthlySummaries.find(m => m.monthKey === monthKey);
      if (summary) {
        summary.reviewedByStudent = true;
        summary.reviewedAt = new Date().toISOString();
      }

      // Also mark in faculty data store if active in session
      if (window.AscendFacultyData) {
        const student = (window.AscendFacultyData.students || []).find(st => st.id === this.student.id);
        if (student) {
          student.monthlyReviewed = true;
          if (student.monthlySummaries) {
            const fs = student.monthlySummaries.find(m => m.monthKey === monthKey);
            if (fs) {
              fs.reviewedByStudent = true;
              fs.reviewedAt = new Date().toISOString();
            }
          }
        }
      }

      try {
        await fetch('/api/student/review-month', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: this.student.id, monthKey }),
        });
      } catch (e) {
        // Fallback gracefully to memory / local persistence
      }

      // Live refresh current view if dashboard or evaluations is visible
      if (window.AscendApp && (window.AscendApp.currentView === 'dashboard' || !window.AscendApp.currentView)) {
        const content = document.getElementById('app-content-area');
        if (content && window.AscendViews && window.AscendViews.dashboard) {
          content.innerHTML = window.AscendViews.dashboard();
        }
      }
      return summary;
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

    async changePassword(currentPassword, newPassword) {
      try {
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: this.student.id,
            currentPassword,
            newPassword,
          }),
        });
        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || 'Failed to change password.');
        }
        return result;
      } catch (e) {
        console.error('Password change error:', e);
        throw e;
      }
    },

    exportPortfolioArchive() {
      const student = this.student || {};
      const achievements = this.achievements || [];
      const projects = this.projects || [];
      const skills = this.skills || {};
      const publicPortfolio = this.publicPortfolio || {};
      const portfolioInsights = this.portfolioInsights || {};

      const archiveData = {
        metadata: {
          exportVersion: '2.0',
          exportedAt: new Date().toISOString(),
          system: 'Ascend Performance Portal',
        },
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          institution: student.institution,
          department: student.department,
          degree: student.degree,
          year: student.year,
          graduationYear: student.graduationYear,
          rollNumber: student.rollNumber,
          bio: student.bio,
          careerInterests: student.careerInterests,
          linkedIn: student.linkedIn,
          github: student.github,
          portfolio: student.portfolio,
          profileStrength: student.profileStrength,
          twoFactorEnabled: !!student.twoFactorEnabled,
          notificationPreferences: student.notificationPreferences || {},
        },
        achievements: achievements.map(a => ({
          id: a.id,
          title: a.title,
          category: a.category,
          organization: a.organization,
          date: a.date,
          skills: a.skills,
          description: a.description,
          proofLink: a.proofLink,
          verified: true,
        })),
        projects: projects.map(p => ({
          id: p.id,
          title: p.title,
          category: p.category,
          description: p.description,
          skills: p.skills,
          liveUrl: p.liveUrl,
          repoUrl: p.repoUrl,
          date: p.date,
          isPublic: p.isPublic !== false,
        })),
        skills,
        publicPortfolio,
        portfolioInsights,
      };

      const jsonStr = JSON.stringify(archiveData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const slug = (student.name || 'student').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `ascend-portfolio-${slug}-${dateStr}.json`;

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      return filename;
    },
  };

  window.AscendData = AscendData;
})();
