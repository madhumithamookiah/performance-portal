require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]:', reason);
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ── SMTP Setup ────────────────────────────────────────────────
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = (process.env.SMTP_USER || '').trim();
const SMTP_PASS = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
const SMTP_FROM = process.env.SMTP_FROM || (SMTP_USER ? `"Ascend Portal" <${SMTP_USER}>` : '"Ascend Portal" <no-reply@ascend.edu>');

let transporter = null;
if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  console.log(`[SMTP] Active transporter initialized for ${SMTP_HOST}:${SMTP_PORT} (${SMTP_USER})`);
} else {
  console.log('[SMTP] Note: SMTP_USER or SMTP_PASS not set in .env. Outgoing emails will be logged to console in simulated mode.');
}

async function sendEmail({ to, subject, html, text }) {
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: SMTP_FROM,
        to,
        subject,
        text,
        html,
      });
      console.log(`[SMTP] Email delivered to ${to}: "${subject}" (ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[SMTP Error] Failed sending to ${to}:`, err.message);
      return { success: false, error: err.message };
    }
  } else {
    console.log(`\n================= [SIMULATED SMTP EMAIL] =================`);
    console.log(`To: ${to}`);
    console.log(`From: ${SMTP_FROM}`);
    console.log(`Subject: ${subject}`);
    console.log(`Date: ${new Date().toISOString()}`);
    console.log(`Preview:\n${text || (html ? html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ') : '')}`);
    console.log(`===========================================================\n`);
    return { success: true, simulated: true };
  }
}

// ── DB Access ─────────────────────────────────────────────────
function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { users: [], studentData: {}, facultyData: {}, categories: [], skillOptions: [] };
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (err) {
    console.error('[DB Read Error]:', err);
    return { users: [], studentData: {}, facultyData: {}, categories: [], skillOptions: [] };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[DB Write Error]:', err);
    return false;
  }
}

// ── Database Initializer (Ensure Admin & Base Data) ───────────
function initDatabase() {
  const db = readDB();
  let changed = false;

  // 1. Ensure faculty account exists
  let faculty = db.users.find(u => u.email && u.email.toLowerCase() === 'dr.mehta@university.edu');
  if (!faculty) {
    faculty = {
      id: 'usr-fac-001',
      name: 'Dr. Rakesh Mehta',
      email: 'dr.mehta@university.edu',
      password: 'faculty123',
      role: 'faculty',
      isVerified: true,
      createdAt: new Date().toISOString(),
    };
    db.users.push(faculty);
    changed = true;
    console.log('[Init] Faculty account seeded: dr.mehta@university.edu / faculty123');
  }

  // 2. Ensure HOD account exists
  let hod = db.users.find(u => u.email && u.email.toLowerCase() === 'hod.cse@university.edu');
  if (!hod) {
    hod = {
      id: 'usr-hod-001',
      name: 'Prof. Sunita Rao',
      email: 'hod.cse@university.edu',
      password: 'hod12345',
      role: 'hod',
      isVerified: true,
      createdAt: new Date().toISOString(),
    };
    db.users.push(hod);
    changed = true;
    console.log('[Init] HOD account seeded: hod.cse@university.edu / hod12345');
  }

  // 3. Ensure facultyData structure exists with Dr. Rakesh Mehta
  if (!db.facultyData || typeof db.facultyData !== 'object') {
    db.facultyData = {
      facultyUser: {
        id: 'usr-fac-001',
        name: 'Dr. Rakesh Mehta',
        title: 'Dr.',
        email: 'dr.mehta@university.edu',
        role: 'faculty',
        designation: 'Associate Professor & Faculty Advisor',
        department: 'Computer Science & Engineering',
        institution: 'Delhi Institute of Technology',
      },
      classes: [
        { id: 'class-cse-5a', name: 'B.Tech CSE · Semester 5 · Section A', shortName: 'CSE · Sem 5 · Sec A', program: 'B.Tech CSE', department: 'Computer Science & Engineering', semester: 5, section: 'Section A' },
        { id: 'class-cse-5b', name: 'B.Tech CSE · Semester 5 · Section B', shortName: 'CSE · Sem 5 · Sec B', program: 'B.Tech CSE', department: 'Computer Science & Engineering', semester: 5, section: 'Section B' },
        { id: 'class-it-5a', name: 'B.Tech IT · Semester 5 · Section A', shortName: 'IT · Sem 5 · Sec A', program: 'B.Tech IT', department: 'Information Technology', semester: 5, section: 'Section A' },
        { id: 'all', name: 'All Assigned Classes', shortName: 'All Classes', program: 'All Programmes', department: 'All Departments', semester: 'All', section: 'All' },
      ],
      evaluations: [],
      feedbackHistory: [],
    };
    changed = true;
  } else if (!db.facultyData.facultyUser || db.facultyData.facultyUser.id === 'usr-admin-001' || db.facultyData.facultyUser.role === 'admin') {
    db.facultyData.facultyUser = {
      id: 'usr-fac-001',
      name: 'Dr. Rakesh Mehta',
      title: 'Dr.',
      email: 'dr.mehta@university.edu',
      role: 'faculty',
      designation: 'Associate Professor & Faculty Advisor',
      department: 'Computer Science & Engineering',
      institution: 'Delhi Institute of Technology',
    };
    changed = true;
  }

  if (changed) {
    writeDB(db);
  }
}
initDatabase();

// ── Auth API ──────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      fullname,
      email,
      password,
      role = 'student',
      degree,
      designation,
      department,
      institution,
      year,
      graduationYear,
      rollNumber,
    } = req.body;
    if (!fullname || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const db = readDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const userId = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const initials = fullname.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'ST';
    const cleanEmail = email.trim();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = Date.now() + 24 * 60 * 60 * 1000;
    const verificationToken = crypto.randomBytes(24).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    const cleanRole = (role || 'student').toLowerCase();
    const defaultDesignation = cleanRole === 'hod' ? 'Head of Department' : (cleanRole === 'faculty' ? 'Faculty Advisor' : 'Student');

    const newUser = {
      id: userId,
      name: fullname.trim(),
      email: cleanEmail,
      password: password,
      role: cleanRole,
      designation: (designation && designation.trim()) || defaultDesignation,
      department: (department && department.trim()) || 'Computer Science & Engineering',
      institution: (institution && institution.trim()) || 'Delhi Institute of Technology',
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
      verificationToken,
      verificationTokenExpires,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    if (newUser.role === 'student') {
      const studentDegree = (degree && degree.trim()) || 'B.Tech in Computer Science';
      const studentDept = (department && department.trim()) || 'Computer Science & Engineering';
      const studentInst = (institution && institution.trim()) || 'Delhi Institute of Technology';
      const studentYear = year ? parseInt(year, 10) : 1;
      const studentGradYear = graduationYear ? parseInt(graduationYear, 10) : (new Date().getFullYear() + 4);
      const studentRoll = (rollNumber && rollNumber.trim()) || `2026CSE${Math.floor(1000 + Math.random() * 9000)}`;

      db.studentData[userId] = {
        student: {
          id: userId,
          name: newUser.name,
          firstName: newUser.name.split(' ')[0],
          email: cleanEmail,
          password: password,
          initials,
          institution: studentInst,
          department: studentDept,
          degree: studentDegree,
          year: studentYear,
          graduationYear: studentGradYear,
          rollNumber: studentRoll,
          profileStrength: 45,
          bio: '',
          careerInterests: [],
          linkedIn: '',
          github: '',
          portfolio: '',
          skillsCount: 0,
        },
        skills: {
          Technical: [
            { name: 'Python', level: 60 },
            { name: 'JavaScript', level: 50 },
            { name: 'Problem Solving', level: 65 },
          ],
          Communication: [{ name: 'Presentation Skills', level: 60 }],
          Leadership: [{ name: 'Team Collaboration', level: 65 }],
          Innovation: [{ name: 'Critical Thinking', level: 70 }],
          'Career Readiness': [{ name: 'Resume Building', level: 50 }],
        },
        achievements: [],
        projects: [],
        publicPortfolio: {
          isPublished: true,
          slug: newUser.name.toLowerCase().replace(/\s+/g, '-'),
          customHeadline: `${newUser.name} · Student Portfolio`,
          showBio: false,
          showCareerInterests: false,
          showLinks: true,
          showSkills: true,
          showProjects: true,
          showAchievements: true,
          publicAchievementIds: [],
          keepEvidencePrivate: true,
        },
        portfolioInsights: {
          views: 1,
          downloads: 0,
          shares: 0,
          primaryCategories: (db.studentData['usr-stu-001'] && db.studentData['usr-stu-001'].portfolioInsights && db.studentData['usr-stu-001'].portfolioInsights.primaryCategories) || [
            { key: 'Certification', name: 'Certification', label: 'Certifications', iconKey: 'award', isPrimary: true, description: 'Industry-recognized credentials and certifications' },
            { key: 'Hackathon', name: 'Hackathon', label: 'Hackathons', iconKey: 'lightbulb', isPrimary: true, description: 'Development sprints, hackathons, and design challenges' },
            { key: 'Internship', name: 'Internship', label: 'Internships', iconKey: 'briefcase', isPrimary: true, description: 'Industry internships and professional work experience' },
            { key: 'Workshop', name: 'Workshop', label: 'Workshops', iconKey: 'graduationCap', isPrimary: true, description: 'Technical workshops, seminars, and intensive training' },
          ],
          additionalCategories: (db.studentData['usr-stu-001'] && db.studentData['usr-stu-001'].portfolioInsights && db.studentData['usr-stu-001'].portfolioInsights.additionalCategories) || [
            { key: 'Leadership', name: 'Leadership', label: 'Leadership & Volunteering', iconKey: 'star', description: 'Student leadership, club initiatives, and community volunteering' },
            { key: 'Research', name: 'Research', label: 'Research & Publications', iconKey: 'fileText', description: 'Academic papers, lab research, and publications' },
            { key: 'Award', name: 'Award', label: 'Awards', iconKey: 'trophy', description: 'Merit recognitions, honors, and competitive awards' },
          ],
          categories: (db.studentData['usr-stu-001'] && db.studentData['usr-stu-001'].portfolioInsights && db.studentData['usr-stu-001'].portfolioInsights.categories) || [
            { name: 'Certification', label: 'Certifications', iconKey: 'award', max: 5 },
            { name: 'Hackathon', label: 'Hackathons', iconKey: 'lightbulb', max: 4 },
            { name: 'Internship', label: 'Internships', iconKey: 'briefcase', max: 3 },
            { name: 'Project', label: 'Projects', iconKey: 'tool', max: 5 },
            { name: 'Research', label: 'Research', iconKey: 'microscope', max: 3 },
            { name: 'Academic', label: 'Academic', iconKey: 'graduationCap', max: 4 },
            { name: 'Leadership', label: 'Leadership', iconKey: 'star', max: 3 },
            { name: 'Award', label: 'Honors & Awards', iconKey: 'trophy', max: 4 },
          ],
        },
        goals: [],
        feedback: [],
        activity: [
          {
            id: `act-${Date.now()}`,
            type: 'profile_updated',
            title: 'Account Registered',
            subtitle: 'Profile created',
            desc: 'Welcome to Ascend! Complete your profile to start showcasing achievements.',
            status: 'completed',
            iconKey: 'user',
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            relativeTime: 'Just now',
          },
        ],
        monthlyData: [0, 0, 0, 0, 0, 0],
        profileChecklist: [
          { id: 'bio', label: 'Add professional bio', done: false, detail: 'Introduce your academic background and focus' },
          { id: 'resume', label: 'Upload current résumé', done: false, detail: 'Attach an up-to-date PDF résumé' },
          { id: 'linkedin', label: 'Connect LinkedIn profile', done: false, detail: 'Link your public professional network' },
          { id: 'portfolio', label: 'Add GitHub or portfolio website link', done: false, detail: 'Showcase code repositories and live work' },
          { id: 'interests', label: 'Select career interests', done: false, detail: 'Highlight target roles and industries' },
        ],
        categories: db.categories || [],
        skillOptions: db.skillOptions || [],
      };

      if (db.facultyData && Array.isArray(db.facultyData.students)) {
        db.facultyData.students.unshift({
          id: userId,
          name: newUser.name,
          email: cleanEmail,
          rollNumber: studentRoll,
          program: studentDegree,
          department: studentDept,
          semester: studentYear * 2 - 1,
          section: 'Section A',
          classId: 'class-cse-5a',
          status: 'Good Standing',
          achievementsCount: 0,
          skillsCount: 3,
          cgpa: '8.00',
          recentAchievement: 'Registered new account',
          recentAchievementDate: new Date().toISOString().split('T')[0],
          avatarBg: '#E8F0FE',
          avatarText: '#1A73E8',
          attentionFlag: null,
          skills: { Technical: 50, Communication: 50, Leadership: 50, Innovation: 50 },
        });
      }
    }

    writeDB(db);

    console.log(`[Auth] Verification code for ${cleanEmail}: ${verificationCode}`);

    const emailSubject = `Your Ascend Verification Code: ${verificationCode}`;
    const emailHtml = `
      <div style="font-family:'Google Sans',Roboto,Arial,sans-serif;max-width:540px;margin:0 auto;padding:28px 24px;border:1px solid #dadce0;border-radius:16px;background:#ffffff;box-shadow:0 1px 3px rgba(60,64,67,0.08);">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;padding:6px 14px;background:#e8f0fe;border-radius:20px;color:#1a73e8;font-size:12px;font-weight:600;margin-bottom:12px;">Ascend Performance Portal</div>
          <h2 style="color:#202124;margin:0 0 8px;font-size:22px;font-weight:700;">Your Verification Code</h2>
          <p style="color:#5f6368;margin:0;font-size:14px;line-height:1.5;">Welcome to Ascend! Enter this 6-digit code on the verification screen to activate your account.</p>
        </div>

        <div style="padding:24px 20px;background:#f8fafd;border-radius:12px;border:1px solid #e8eaed;margin-bottom:24px;text-align:center;">
          <p style="margin-top:0;color:#202124;font-size:15px;font-weight:500;text-align:left;">Hello ${newUser.name},</p>
          <p style="color:#3c4043;font-size:14px;line-height:1.6;margin-bottom:20px;text-align:left;">
            Thank you for creating an account with Ascend. To activate your account and start building your student performance portfolio, please enter the following 6-digit verification code:
          </p>

          <div style="margin:24px auto;display:inline-block;background:#ffffff;border:2px dashed #1a73e8;border-radius:12px;padding:16px 36px;">
            <div style="font-size:36px;font-weight:800;letter-spacing:10px;color:#1a73e8;font-family:'Roboto Mono',Consolas,monospace;">
              ${verificationCode}
            </div>
          </div>

          <p style="color:#5f6368;font-size:13px;line-height:1.5;margin-bottom:0;">
            Enter this code on the verification screen in your browser.
          </p>
        </div>

        <div style="padding:16px 20px;background:#ffffff;border:1px solid #e8eaed;border-radius:12px;margin-bottom:20px;">
          <div style="font-size:13px;font-weight:600;color:#202124;margin-bottom:8px;">Your Sign-In Credentials (save for login):</div>
          <table style="width:100%;font-size:13px;border-collapse:collapse;">
            <tr>
              <td style="padding:4px 0;color:#5f6368;width:110px;">Email / Login:</td>
              <td style="padding:4px 0;color:#202124;font-weight:600;">${cleanEmail}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#5f6368;">Role:</td>
              <td style="padding:4px 0;color:#1a73e8;font-weight:600;text-transform:capitalize;">${newUser.role}</td>
            </tr>
          </table>
        </div>

        <div style="border-top:1px solid #e8eaed;padding-top:16px;text-align:center;font-size:12px;color:#70757a;line-height:1.5;">
          This verification code will expire in 24 hours.<br>
          If you did not sign up for an Ascend account, please ignore this email.
        </div>
      </div>
    `;

    const emailText = `Welcome to Ascend!\n\nYour 6-digit verification code is:\n\n${verificationCode}\n\nEnter this code on the sign-up verification screen to activate your account.\n\nCredentials:\nEmail: ${cleanEmail}\nRole: ${newUser.role}\n\nNote: This code expires in 24 hours.`;

    const mailResult = await sendEmail({
      to: cleanEmail,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
    });

    res.status(201).json({
      success: true,
      requiresVerification: true,
      email: cleanEmail,
      smtpStatus: mailResult.success ? (mailResult.simulated ? 'simulated' : 'sent') : 'failed',
      message: 'Account created! A 6-digit verification code has been sent to your email. Please enter the code to verify your account.',
    });
  } catch (err) {
    console.error('[Register Error]:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = readDB();
    const cleanEmail = email.trim().toLowerCase();
    const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.isVerified === false) {
      return res.status(403).json({
        error: 'Please verify your email address before signing in. Enter the 6-digit verification code sent to your email.',
        unverified: true,
        email: user.email,
      });
    }

    const loginTime = new Date().toLocaleString();
    const emailSubject = 'Ascend Security Alert – Successful Sign-In';
    const emailHtml = `
      <div style="font-family:'Google Sans',Roboto,Arial,sans-serif;max-width:540px;margin:0 auto;padding:24px;border:1px solid #dadce0;border-radius:12px;background:#ffffff;">
        <h3 style="color:#1a73e8;margin:0 0 8px;">Ascend Security Notification</h3>
        <p style="color:#202124;font-size:14px;line-height:1.6;">
          Hello <strong>${user.name}</strong>,<br>
          A successful sign-in to your Ascend account was recorded at <strong>${loginTime}</strong>.
        </p>
        <div style="background:#f8fafd;padding:12px 16px;border-radius:8px;border:1px solid #e8eaed;font-size:13px;color:#3c4043;margin:16px 0;">
          <div><strong>Account:</strong> ${user.email}</div>
          <div><strong>Role:</strong> ${user.role}</div>
        </div>
      </div>
    `;

    const mailResult = await sendEmail({
      to: user.email,
      subject: emailSubject,
      html: emailHtml,
      text: `Hello ${user.name},\nA successful sign-in was recorded for ${user.email} on ${loginTime}.`,
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      smtpStatus: mailResult.success ? (mailResult.simulated ? 'simulated' : 'sent') : 'failed',
    });
  } catch (err) {
    console.error('[Login Error]:', err);
    res.status(500).json({ error: 'Server error during sign in.' });
  }
});

// ── Verification Code Endpoint ──────────────────────────────
app.post('/api/auth/verify-code', (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim().replace(/\s+/g, '');

    const db = readDB();
    const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(404).json({ error: 'No account registered with this email address.' });
    }

    if (user.isVerified) {
      return res.json({
        success: true,
        alreadyVerified: true,
        message: 'Account is already verified. You can sign in directly.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }

    if (user.verificationCodeExpires && Date.now() > user.verificationCodeExpires) {
      return res.status(400).json({
        error: 'Verification code has expired. Please request a new code.',
        expired: true,
      });
    }

    if (!user.verificationCode || user.verificationCode !== cleanCode) {
      return res.status(400).json({
        error: 'Invalid verification code. Please check your email and try again.',
      });
    }

    user.isVerified = true;
    delete user.verificationCode;
    delete user.verificationCodeExpires;
    delete user.verificationToken;
    delete user.verificationTokenExpires;
    writeDB(db);

    console.log(`[Auth] User ${user.email} successfully verified with code.`);

    res.json({
      success: true,
      message: 'Account verified successfully! You can now sign in.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[Verify Code Error]:', err);
    res.status(500).json({ error: 'Server error during code verification.' });
  }
});

// ── Legacy Email Verification Link Endpoint (Fallback) ───────
app.get(['/verify', '/api/auth/verify'], (req, res) => {
  try {
    const token = (req.query.token || '').trim();
    if (!token) {
      return res.redirect('/auth.html?verificationError=missing_token');
    }
    const db = readDB();
    const user = db.users.find(u => u.verificationToken === token);
    if (!user) {
      return res.redirect('/auth.html?verificationError=invalid_token');
    }
    if (user.verificationTokenExpires && Date.now() > user.verificationTokenExpires) {
      return res.redirect(`/auth.html?verificationError=expired_token&email=${encodeURIComponent(user.email)}`);
    }

    user.isVerified = true;
    delete user.verificationCode;
    delete user.verificationCodeExpires;
    delete user.verificationToken;
    delete user.verificationTokenExpires;
    writeDB(db);
    console.log(`[Auth] User ${user.email} successfully verified email via link.`);
    res.redirect(`/auth.html?verified=true&email=${encodeURIComponent(user.email)}`);
  } catch (err) {
    console.error('[Verification Error]:', err);
    res.redirect('/auth.html?verificationError=server_error');
  }
});

// ── Resend Verification Code Endpoint ────────────────────────
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }
    const db = readDB();
    const cleanEmail = email.trim().toLowerCase();
    const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(404).json({ error: 'No account registered with this email address.' });
    }
    if (user.isVerified) {
      return res.status(400).json({ error: 'This account is already verified. You can sign in directly.', alreadyVerified: true });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = Date.now() + 24 * 60 * 60 * 1000;
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    writeDB(db);

    console.log(`[Auth] Resent verification code for ${user.email}: ${verificationCode}`);

    const emailSubject = `Your Ascend Verification Code: ${verificationCode}`;
    const emailHtml = `
      <div style="font-family:'Google Sans',Roboto,Arial,sans-serif;max-width:540px;margin:0 auto;padding:28px 24px;border:1px solid #dadce0;border-radius:16px;background:#ffffff;box-shadow:0 1px 3px rgba(60,64,67,0.08);">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;padding:6px 14px;background:#e8f0fe;border-radius:20px;color:#1a73e8;font-size:12px;font-weight:600;margin-bottom:12px;">Ascend Performance Portal</div>
          <h2 style="color:#202124;margin:0 0 8px;font-size:22px;font-weight:700;">New Verification Code</h2>
          <p style="color:#5f6368;margin:0;font-size:14px;">Enter this 6-digit code on the sign-up verification screen to activate your account.</p>
        </div>
        <div style="padding:24px 20px;background:#f8fafd;border-radius:12px;border:1px solid #e8eaed;margin-bottom:24px;text-align:center;">
          <p style="margin-top:0;color:#202124;font-size:15px;font-weight:500;text-align:left;">Hello ${user.name},</p>
          <p style="color:#3c4043;font-size:14px;line-height:1.6;margin-bottom:20px;text-align:left;">
            Here is your requested verification code for your Ascend account:
          </p>
          <div style="margin:24px auto;display:inline-block;background:#ffffff;border:2px dashed #1a73e8;border-radius:12px;padding:16px 36px;">
            <div style="font-size:36px;font-weight:800;letter-spacing:10px;color:#1a73e8;font-family:'Roboto Mono',Consolas,monospace;">
              ${verificationCode}
            </div>
          </div>
          <p style="color:#5f6368;font-size:13px;line-height:1.5;margin-bottom:0;">
            This code expires in 24 hours.
          </p>
        </div>
      </div>
    `;
    const emailText = `Your new Ascend verification code is:\n\n${verificationCode}\n\nEnter this code on the sign-up verification screen to activate your account.\n\nExpires in 24 hours.`;

    const mailResult = await sendEmail({
      to: user.email,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
    });

    res.json({
      success: true,
      smtpStatus: mailResult.success ? (mailResult.simulated ? 'simulated' : 'sent') : 'failed',
      message: `A new verification code has been sent to ${user.email}.`,
    });
  } catch (err) {
    console.error('[Resend Error]:', err);
    res.status(500).json({ error: 'Failed to resend verification email.' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const email = (req.query.email || '').trim().toLowerCase();
  const userId = (req.query.userId || '').trim();
  const db = readDB();

  let user = null;
  if (userId) {
    user = db.users.find(u => u.id === userId);
  } else if (email) {
    user = db.users.find(u => u.email.toLowerCase() === email);
  } else {
    user = db.users[0];
  }

  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

app.post('/api/auth/change-password', (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password must be different from current password.' });
    }

    const db = readDB();
    let targetUserId = userId;
    if (!targetUserId) {
      const studentUser = db.users.find(u => u.role === 'student');
      targetUserId = studentUser ? studentUser.id : Object.keys(db.studentData || {})[0];
    }

    const user = (db.users || []).find(u => u.id === targetUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (user.password !== currentPassword) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    if (db.studentData && db.studentData[targetUserId] && db.studentData[targetUserId].student) {
      db.studentData[targetUserId].student.password = newPassword;
    }

    writeDB(db);
    res.json({ success: true, message: 'Password updated successfully!' });
  } catch (err) {
    console.error('[Change Password Error]:', err);
    res.status(500).json({ error: 'Failed to update password.' });
  }
});

// ── Student Data API ──────────────────────────────────────────
app.get('/api/student/data', (req, res) => {
  const db = readDB();
  let userId = req.query.userId;
  if (!userId) {
    const studentUser = db.users.find(u => u.role === 'student');
    userId = studentUser ? studentUser.id : Object.keys(db.studentData || {})[0];
  }

  let data = db.studentData ? db.studentData[userId] : null;
  if (!data) {
    const userObj = (db.users || []).find(u => u.id === userId);
    data = {
      student: {
        id: userId || 'usr-default',
        name: userObj ? userObj.name : 'User',
        firstName: userObj ? userObj.name.split(' ')[0] : 'User',
        email: userObj ? userObj.email : '',
        initials: userObj ? userObj.name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase() : 'US',
        institution: 'Delhi Institute of Technology',
        department: '',
        degree: '',
        year: 1,
        graduationYear: new Date().getFullYear(),
        profileStrength: 50,
        bio: '',
        careerInterests: [],
        linkedIn: '',
        github: '',
        portfolio: '',
        skillsCount: 0,
      },
      skills: { Technical: [], Communication: [], Leadership: [], Innovation: [], 'Career Readiness': [] },
      achievements: [],
      projects: [],
      publicPortfolio: {
        isPublished: false,
        slug: userObj ? userObj.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'portfolio',
        customHeadline: 'Portfolio',
        showBio: false,
        showCareerInterests: false,
        showLinks: false,
        showSkills: false,
        showProjects: false,
        showAchievements: false,
        publicAchievementIds: [],
        keepEvidencePrivate: true,
      },
      portfolioInsights: { views: 0, downloads: 0, shares: 0 },
      goals: [],
      feedback: [],
      activity: [],
      monthlyData: [0, 0, 0, 0, 0, 0],
      profileChecklist: [],
      categories: (db.categories || ['Certification', 'Hackathon', 'Internship', 'Research', 'Academic', 'Leadership', 'Award']).filter(c => c !== 'Project'),
      skillOptions: db.skillOptions || [],
    };
  } else if (data && data.categories) {
    data.categories = data.categories.filter(c => c !== 'Project');
  }

  res.json(data);
});

app.post('/api/student/achievements', (req, res) => {
  try {
    const db = readDB();
    const userId = req.body.userId || Object.keys(db.studentData)[0];
    if (!db.studentData[userId]) return res.status(404).json({ error: 'Student not found.' });

    const newAch = {
      id: req.body.id || `ach-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: req.body.title || 'Untitled Achievement',
      category: req.body.category || 'Certification',
      organization: req.body.organization || '',
      date: req.body.date || new Date().toISOString().split('T')[0],
      skills: Array.isArray(req.body.skills) ? req.body.skills : [],
      description: req.body.description || '',
      proofLink: req.body.proofLink || '',
      proofData: req.body.proofData || null,
      proofFileName: req.body.proofFileName || null,
      iconKey: req.body.iconKey || 'award',
      color: req.body.color || '#1A73E8',
      createdAt: req.body.createdAt || new Date().toISOString(),
    };

    if (!Array.isArray(db.studentData[userId].achievements)) {
      db.studentData[userId].achievements = [];
    }

    const existingIndex = db.studentData[userId].achievements.findIndex(a => a.id === newAch.id);
    if (existingIndex !== -1) {
      db.studentData[userId].achievements[existingIndex] = {
        ...db.studentData[userId].achievements[existingIndex],
        ...newAch,
        updatedAt: new Date().toISOString()
      };
    } else {
      db.studentData[userId].achievements.unshift(newAch);
      if (!Array.isArray(db.studentData[userId].activity)) {
        db.studentData[userId].activity = [];
      }
      db.studentData[userId].activity.unshift({
        id: `act-${Date.now()}`,
        type: 'achievement_added',
        title: `Added "${newAch.title}"`,
        desc: `${newAch.category} · ${newAch.organization || 'Self'}`,
        timestamp: new Date().toISOString(),
        relativeTime: 'Just now',
      });
    }

    writeDB(db);
    res.status(201).json({ success: true, achievement: newAch });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add achievement.' });
  }
});

app.delete('/api/student/achievements/:id', (req, res) => {
  try {
    const db = readDB();
    const achId = req.params.id;
    const userId = req.query.userId || Object.keys(db.studentData)[0];
    if (!db.studentData[userId]) return res.status(404).json({ error: 'Student not found.' });

    db.studentData[userId].achievements = db.studentData[userId].achievements.filter(a => a.id !== achId);
    writeDB(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete achievement.' });
  }
});

app.post('/api/student/projects', (req, res) => {
  try {
    const db = readDB();
    const userId = req.body.userId || Object.keys(db.studentData)[0];
    if (!db.studentData[userId]) return res.status(404).json({ error: 'Student not found.' });

    const newProj = {
      id: req.body.id || `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: req.body.title || 'Untitled Project',
      role: req.body.role || 'Lead Developer',
      description: req.body.description || '',
      technologies: Array.isArray(req.body.technologies) ? req.body.technologies : [],
      githubUrl: req.body.githubUrl || '',
      liveUrl: req.body.liveUrl || '',
      status: req.body.status || 'Active',
      isPublic: req.body.isPublic !== false,
      date: req.body.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    if (!Array.isArray(db.studentData[userId].projects)) db.studentData[userId].projects = [];
    db.studentData[userId].projects.unshift(newProj);
    writeDB(db);
    res.status(201).json({ success: true, project: newProj });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save project.' });
  }
});

app.delete('/api/student/projects/:id', (req, res) => {
  try {
    const db = readDB();
    const projId = req.params.id;
    const userId = req.query.userId || Object.keys(db.studentData)[0];
    if (!db.studentData[userId]) return res.status(404).json({ error: 'Student not found.' });

    db.studentData[userId].projects = (db.studentData[userId].projects || []).filter(p => p.id !== projId);
    writeDB(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project.' });
  }
});

app.put('/api/student/profile', (req, res) => {
  try {
    const db = readDB();
    const userId = req.body.userId || Object.keys(db.studentData)[0];
    if (!db.studentData[userId]) return res.status(404).json({ error: 'Student not found.' });

    const {
      name,
      degree,
      department,
      institution,
      year,
      graduationYear,
      rollNumber,
      bio,
      careerInterests,
      linkedIn,
      github,
      portfolio,
      customHeadline,
      resume,
      skills,
      notificationPreferences,
      twoFactorEnabled,
      accountStatus,
    } = req.body;
    const student = db.studentData[userId].student;

    if (name !== undefined && name.trim()) {
      student.name = name.trim();
      student.firstName = name.trim().split(' ')[0];
      student.initials = name.trim().split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase() || 'ST';
      const user = (db.users || []).find(u => u.id === userId);
      if (user) user.name = name.trim();
    }
    if (degree !== undefined) student.degree = degree.trim();
    if (department !== undefined) student.department = department.trim();
    if (institution !== undefined) student.institution = institution.trim();
    if (year !== undefined) student.year = parseInt(year, 10) || student.year;
    if (graduationYear !== undefined) student.graduationYear = parseInt(graduationYear, 10) || student.graduationYear;
    if (rollNumber !== undefined) student.rollNumber = rollNumber.trim();

    if (bio !== undefined) student.bio = bio;
    if (careerInterests !== undefined) student.careerInterests = Array.isArray(careerInterests) ? careerInterests : [];
    if (linkedIn !== undefined) student.linkedIn = linkedIn;
    if (github !== undefined) student.github = github;
    if (portfolio !== undefined) student.portfolio = portfolio;
    if (resume !== undefined) student.resume = resume;
    if (skills !== undefined && typeof skills === 'object') {
      db.studentData[userId].skills = skills;
    }
    if (notificationPreferences !== undefined && typeof notificationPreferences === 'object') {
      student.notificationPreferences = Object.assign({}, student.notificationPreferences || {}, notificationPreferences);
    }
    if (twoFactorEnabled !== undefined) {
      student.twoFactorEnabled = !!twoFactorEnabled;
    }
    if (accountStatus !== undefined) {
      student.accountStatus = accountStatus;
    }

    // Synchronize profile checklist items
    const cl = db.studentData[userId].profileChecklist;
    if (Array.isArray(cl)) {
      const setDone = (id, val) => {
        const item = cl.find(c => c.id === id || (id === 'bio' && c.id === 'chk-3'));
        if (item) item.done = val;
      };
      if (bio !== undefined) setDone('bio', !!(student.bio && student.bio.trim()));
      if (resume !== undefined) setDone('resume', !!(student.resume && (student.resume.name || student.resume.dataUrl)));
      if (linkedIn !== undefined) setDone('linkedin', !!(student.linkedIn && student.linkedIn.trim()));
      if (portfolio !== undefined || github !== undefined) setDone('portfolio', !!((student.portfolio && student.portfolio.trim()) || (student.github && student.github.trim())));
      if (careerInterests !== undefined) setDone('interests', Array.isArray(student.careerInterests) && student.careerInterests.length > 0);
    }

    if (customHeadline !== undefined && db.studentData[userId].publicPortfolio) {
      db.studentData[userId].publicPortfolio.customHeadline = customHeadline;
    }

    // Synchronize matching student in db.facultyData.students if present
    if (db.facultyData && Array.isArray(db.facultyData.students)) {
      const fStu = db.facultyData.students.find(s => s.id === userId || (student.email && s.email === student.email));
      if (fStu) {
        if (student.name) fStu.name = student.name;
        if (student.degree) fStu.program = student.degree;
        if (student.department) fStu.department = student.department;
        if (student.rollNumber) fStu.rollNumber = student.rollNumber;
        if (student.year) fStu.semester = student.year * 2 - 1;
      }
    }

    writeDB(db);
    res.json({
      success: true,
      student,
      skills: db.studentData[userId].skills,
      profileChecklist: db.studentData[userId].profileChecklist
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ── Faculty Data API ──────────────────────────────────────────
app.get('/api/faculty/data', (req, res) => {
  try {
    const db = readDB();
    const facultyData = db.facultyData || {};

    // Dynamic students generation from users and real studentData
    const studentUsers = (db.users || []).filter(u => u.role === 'student');

    const dynamicStudents = studentUsers.map((user, idx) => {
      const sData = db.studentData && db.studentData[user.id] ? db.studentData[user.id] : {};
      const sInfo = sData.student || {};
      const achs = Array.isArray(sData.achievements) ? sData.achievements : [];
      const projs = Array.isArray(sData.projects) ? sData.projects : [];
      const acts = Array.isArray(sData.activity) ? sData.activity : [];

      const latestAch = achs[0];
      const initials = user.name
        ? user.name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase()
        : 'ST';
      const classId = user.classId || 'class-cse-5a';

      return {
        id: user.id,
        name: user.name || 'Student',
        firstName: user.name ? user.name.split(' ')[0] : 'Student',
        email: user.email,
        initials: initials,
        rollNo: sInfo.rollNumber || `STU-${1000 + idx + 1}`,
        program: sInfo.degree || 'B.Tech in Computer Science',
        department: sInfo.department || 'Computer Science & Engineering',
        semester: sInfo.year ? sInfo.year * 2 - 1 : 5,
        section: 'Section A',
        classId: classId,
        className: 'B.Tech CSE · Semester 5 · Section A',
        status: user.isVerified ? 'Good Standing' : 'Pending Verification',
        achievementsCount: achs.length,
        skillsCount: Object.values(sData.skills || {}).flat().length || 0,
        projectsCount: projs.length,
        cgpa: sInfo.cgpa || '',
        totalAchievements: achs.length,
        portfolioSummary: `${achs.length} achievement${achs.length !== 1 ? 's' : ''} · ${projs.length} project${projs.length !== 1 ? 's' : ''}`,
        latestUpdate: latestAch ? {
          title: latestAch.title,
          type: latestAch.category || 'Certification',
          date: latestAch.date || latestAch.createdAt || new Date().toISOString().split('T')[0],
          formattedDate: 'Recent',
        } : (projs[0] ? {
          title: projs[0].title,
          type: 'Project',
          date: projs[0].date || new Date().toISOString().split('T')[0],
          formattedDate: 'Recent',
        } : null),
        lastActivity: latestAch ? (latestAch.date || latestAch.createdAt) : (user.createdAt || new Date().toISOString()),
        avatarBg: '#E8F0FE',
        avatarText: '#1A73E8',
        attentionStatus: !user.isVerified ? 'pending-verify' : (achs.length === 0 ? 'no-activity' : 'none'),
        attentionReason: !user.isVerified ? 'Email verification pending' : (achs.length === 0 ? 'No achievements recorded yet' : null),
        profileSetupStatus: achs.length > 0 || projs.length > 0 ? 'complete' : 'incomplete',
        missingProfileFields: (!sInfo.bio ? ['Bio'] : []).concat(!sInfo.careerInterests || !sInfo.careerInterests.length ? ['Interests'] : []).concat(!sInfo.github ? ['GitHub'] : []),
        evaluationStatus: (facultyData.evaluations || []).some(e => e.studentId === user.id && e.status === 'published') ? 'evaluated' : 'pending',
        activity: acts,
        achievements: achs,
        projects: projs,
        skills: sData.skills || {},
        bio: sInfo.bio || '',
        careerInterests: sInfo.careerInterests || [],
        github: sInfo.github || '',
        linkedIn: sInfo.linkedIn || '',
        portfolioUrl: sInfo.portfolio || '',
      };
    });

    // Build real recent updates from achievements and projects across real students
    const recentUpdates = [];
    studentUsers.forEach(u => {
      const sData = db.studentData && db.studentData[u.id] ? db.studentData[u.id] : {};
      const achs = Array.isArray(sData.achievements) ? sData.achievements : [];
      achs.forEach(a => {
        recentUpdates.push({
          id: `upd-${a.id}`,
          studentId: u.id,
          studentName: u.name,
          studentInitials: u.name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase(),
          rollNo: `STU-${u.id.slice(-4)}`,
          classId: 'class-cse-5a',
          itemType: a.category || 'Certification',
          actionType: 'added',
          title: a.title,
          subtitle: a.organization || a.description || 'Achievement submitted',
          timestamp: a.date || 'Recent',
          date: a.date || a.createdAt || new Date().toISOString(),
        });
      });
      const projs = Array.isArray(sData.projects) ? sData.projects : [];
      projs.forEach(p => {
        recentUpdates.push({
          id: `upd-${p.id}`,
          studentId: u.id,
          studentName: u.name,
          studentInitials: u.name.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase(),
          rollNo: `STU-${u.id.slice(-4)}`,
          classId: 'class-cse-5a',
          itemType: 'Project',
          actionType: 'added',
          title: p.title,
          subtitle: p.description || 'Project build',
          timestamp: p.date || 'Recent',
          date: p.date || new Date().toISOString(),
        });
      });
    });

    recentUpdates.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    res.json({
      facultyUser: facultyData.facultyUser || {
        id: 'usr-fac-001',
        name: 'Dr. Rakesh Mehta',
        title: 'Dr.',
        email: 'dr.mehta@university.edu',
        role: 'faculty',
        designation: 'Associate Professor & Faculty Advisor',
        department: 'Computer Science & Engineering',
        institution: 'Delhi Institute of Technology',
      },
      classes: [
        { id: 'class-cse-5a', name: 'B.Tech CSE · Semester 5 · Section A', shortName: 'CSE · Sem 5 · Sec A', program: 'B.Tech CSE', department: 'Computer Science & Engineering', semester: 5, section: 'Section A', academicYear: '2026–27', studentCount: dynamicStudents.length },
        { id: 'all', name: 'All Assigned Classes', shortName: 'All Classes', program: 'All Programmes', department: 'All Departments', semester: 'All', section: 'All', academicYear: '2026–27', studentCount: dynamicStudents.length },
      ],
      students: dynamicStudents,
      recentUpdates: recentUpdates,
      evaluations: facultyData.evaluations || [],
      feedbackHistory: facultyData.feedbackHistory || [],
    });
  } catch (err) {
    console.error('[Faculty Data API Error]:', err);
    res.status(500).json({ error: 'Failed to retrieve faculty data' });
  }
});

app.post('/api/faculty/evaluations', (req, res) => {
  try {
    const db = readDB();
    const evalData = req.body;
    evalData.id = evalData.id || `eval-${Date.now()}`;
    evalData.submittedAt = new Date().toISOString();

    if (!Array.isArray(db.facultyData.evaluations)) db.facultyData.evaluations = [];
    db.facultyData.evaluations.unshift(evalData);
    writeDB(db);
    res.status(201).json({ success: true, evaluation: evalData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save evaluation.' });
  }
});

app.post('/api/faculty/feedback', (req, res) => {
  try {
    const db = readDB();
    const { studentId, feedbackText, category, nextSteps } = req.body;

    const newFb = {
      id: `fb-${Date.now()}`,
      studentId,
      studentName: req.body.studentName || 'Student',
      mentorName: db.facultyData.facultyUser?.name || 'Dr. Rakesh Mehta',
      mentorTitle: db.facultyData.facultyUser?.designation || 'Faculty Advisor',
      category: category || 'Academic',
      message: feedbackText,
      nextSteps: nextSteps || '',
      date: new Date().toISOString().split('T')[0],
      isRead: false,
    };

    if (!Array.isArray(db.facultyData.feedbackHistory)) db.facultyData.feedbackHistory = [];
    db.facultyData.feedbackHistory.unshift(newFb);

    if (studentId && db.studentData[studentId]) {
      if (!Array.isArray(db.studentData[studentId].feedback)) db.studentData[studentId].feedback = [];
      db.studentData[studentId].feedback.unshift(newFb);
    }

    writeDB(db);
    res.status(201).json({ success: true, feedback: newFb });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save feedback.' });
  }
});

app.put('/api/faculty/profile', (req, res) => {
  try {
    const db = readDB();
    if (!db.facultyData) db.facultyData = {};
    if (!db.facultyData.facultyUser) db.facultyData.facultyUser = {};

    const updates = req.body || {};
    Object.assign(db.facultyData.facultyUser, updates);

    // Sync matching user record if name or email changed
    if (updates.name || updates.email) {
      const facId = db.facultyData.facultyUser.id || 'usr-fac-001';
      const u = (db.users || []).find(it => it.id === facId || it.role === 'faculty');
      if (u) {
        if (updates.name) u.name = updates.name;
        if (updates.email) u.email = updates.email;
      }
    }

    writeDB(db);
    res.json({ success: true, facultyUser: db.facultyData.facultyUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update faculty profile.' });
  }
});

// ── Admin APIs ────────────────────────────────────────────────
app.get('/api/admin/stats', (req, res) => {
  try {
    const db = readDB();
    const users = db.users || [];
    const students = users.filter(u => (u.role || 'student').toLowerCase() === 'student');
    const faculty = users.filter(u => (u.role || '').toLowerCase() === 'faculty');
    const admins = users.filter(u => (u.role || '').toLowerCase() === 'admin');

    const verified = users.filter(u => u.isVerified === true).length;
    const pending = users.length - verified;

    let totalAchievements = 0;
    let totalProjects = 0;
    Object.values(db.studentData || {}).forEach(sd => {
      if (Array.isArray(sd.achievements)) totalAchievements += sd.achievements.length;
      if (Array.isArray(sd.projects)) totalProjects += sd.projects.length;
    });

    const totalFeedback = (db.facultyData?.feedbackHistory || []).length;
    const totalEvaluations = (db.facultyData?.evaluations || []).length;

    res.json({
      totalUsers: users.length,
      studentCount: students.length,
      facultyCount: faculty.length,
      adminCount: admins.length,
      verifiedCount: verified,
      pendingCount: pending,
      verificationRate: users.length > 0 ? Math.round((verified / users.length) * 100) : 100,
      totalAchievements,
      totalProjects,
      totalFeedback,
      totalEvaluations,
      smtp: {
        host: SMTP_HOST,
        port: SMTP_PORT,
        user: SMTP_USER,
        status: (SMTP_USER && SMTP_PASS) ? 'connected' : 'simulated',
      },
      uptime: process.uptime(),
    });
  } catch (err) {
    console.error('[Admin Stats Error]:', err);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

app.get('/api/admin/users', (req, res) => {
  try {
    const db = readDB();
    const userList = (db.users || []).map(u => {
      const sData = db.studentData && db.studentData[u.id] ? db.studentData[u.id] : null;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || 'student',
        isVerified: u.isVerified === true,
        createdAt: u.createdAt,
        achievementsCount: sData && Array.isArray(sData.achievements) ? sData.achievements.length : 0,
        projectsCount: sData && Array.isArray(sData.projects) ? sData.projects.length : 0,
      };
    });
    res.json({ users: userList });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users list' });
  }
});

app.post('/api/admin/verify-user', (req, res) => {
  try {
    const { email, userId } = req.body;
    const db = readDB();
    const user = db.users.find(u => (email && u.email.toLowerCase() === email.toLowerCase().trim()) || (userId && u.id === userId));
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isVerified = true;
    delete user.verificationCode;
    delete user.verificationCodeExpires;
    delete user.verificationToken;
    delete user.verificationTokenExpires;
    writeDB(db);
    res.json({ success: true, message: `User ${user.email} is now marked verified.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify user' });
  }
});

app.delete('/api/admin/users/:id', (req, res) => {
  try {
    const userId = req.params.id;
    const db = readDB();
    const target = db.users.find(u => u.id === userId);
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (target.email.toLowerCase() === 'admin@ascend.com') {
      return res.status(403).json({ error: 'Primary system administrator account cannot be deleted.' });
    }

    db.users = db.users.filter(u => u.id !== userId);
    if (db.studentData && db.studentData[userId]) delete db.studentData[userId];
    writeDB(db);
    res.json({ success: true, message: `User account deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.get('/api/admin/system', (req, res) => {
  try {
    const db = readDB();
    const memUsage = process.memoryUsage();
    res.json({
      nodeVersion: process.version,
      platform: process.platform,
      uptimeSeconds: Math.floor(process.uptime()),
      dbPath: DB_PATH,
      totalUsers: (db.users || []).length,
      memory: {
        rssMb: Math.round(memUsage.rss / 1024 / 1024),
        heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
      },
      smtp: {
        host: SMTP_HOST,
        port: SMTP_PORT,
        user: SMTP_USER,
        status: (SMTP_USER && SMTP_PASS) ? 'active' : 'simulated',
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get system info' });
  }
});

// ── Friendly Clean Routes ─────────────────────────────────────
app.get(['/auth', '/login', '/signin', '/sign-in'], (req, res) => {
  res.sendFile(path.join(__dirname, 'auth.html'));
});

app.get(['/register', '/create-account', '/signup', '/sign-up'], (req, res) => {
  res.redirect('/auth.html?tab=register');
});

app.get(['/admin', '/admin-dashboard'], (req, res) => {
  res.redirect('/app.html#hod-dashboard');
});

app.get(['/app', '/dashboard', '/profile', '/achievements', '/goals', '/feedback', '/settings', '/faculty-dashboard', '/hod-dashboard', '/hod-cohort-insights', '/hod-classes', '/hod-faculty-assignments', '/hod-evaluation-monitoring', '/hod-settings'], (req, res) => {
  res.sendFile(path.join(__dirname, 'app.html'));
});

// ── Static Files & Root Route ─────────────────────────────────
app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// ── Graceful HTML Fallback (Never show Cannot GET error page) ──
app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    return res.redirect('/');
  }
  res.status(404).json({ error: 'Resource not found' });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` Ascend Performance Portal Server Running!`);
  console.log(` Port:    http://localhost:${PORT}`);
  console.log(` Mode:    Full-Stack (Dynamic DB + SMTP Auth)`);
  console.log(` SMTP:    ${SMTP_HOST}:${SMTP_PORT} (${SMTP_USER ? 'Active User: ' + SMTP_USER : 'Waiting for SMTP_USER/SMTP_PASS in .env'})`);
  console.log(`======================================================\n`);
});
