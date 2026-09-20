const fs = require('fs');

const mockStorage = {};
const window = {
  location: { hash: '' },
  addEventListener: () => {},
  scrollTo: () => {},
  sessionStorage: {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = v; },
    removeItem: (k) => { delete mockStorage[k]; }
  },
  AscendData: {},
  AscendFacultyData: {},
  AscendUI: {},
  AscendViews: {},
  AscendApp: {}
};
global.window = window;
global.document = {
  readyState: 'complete',
  addEventListener: () => {},
  getElementById: (id) => ({
    innerHTML: '',
    style: {},
    dataset: {},
    appendChild: () => {},
    classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
    querySelectorAll: () => []
  }),
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: (tag) => ({
    className: '',
    innerHTML: '',
    style: {},
    appendChild: () => {},
    remove: () => {}
  })
};
global.sessionStorage = window.sessionStorage;
global.location = window.location;

eval(fs.readFileSync('js/data.js', 'utf8'));
eval(fs.readFileSync('js/faculty-data.js', 'utf8'));
eval(fs.readFileSync('js/utils.js', 'utf8'));
eval(fs.readFileSync('js/views/dashboard.js', 'utf8'));
eval(fs.readFileSync('js/views/profile.js', 'utf8'));
eval(fs.readFileSync('js/views/achievements.js', 'utf8'));
eval(fs.readFileSync('js/views/goals.js', 'utf8'));
eval(fs.readFileSync('js/views/feedback.js', 'utf8'));
eval(fs.readFileSync('js/views/settings.js', 'utf8'));
eval(fs.readFileSync('js/app.js', 'utf8'));

console.log('=== TEST 1: ROUTE REGISTRATION & TITLES ===');
const routes = window.AscendApp.routes;
console.log('Registered student/all routes:', Object.keys(routes).filter(r => routes[r].role === 'student' || routes[r].role === 'all'));
console.log('  public-portfolio route exists:', Boolean(routes['public-portfolio']));
console.log('  public-portfolio route title:', routes['public-portfolio']?.title);
console.log('  profile route title:', routes.profile?.title);
console.log('  goals route title:', routes.goals?.title);
console.log('  portfolio route alias exists:', Boolean(routes.portfolio));

console.log('\n=== TEST 2: ZERO-EMOJI AUDIT ACROSS ALL STUDENT-FACING VIEWS ===');
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const studentViews = [
  { name: 'dashboard', fn: () => routes.dashboard.render() },
  { name: 'profile', fn: () => routes.profile.render() },
  { name: 'achievements', fn: () => routes.achievements.render() },
  { name: 'goals', fn: () => routes.goals.render() },
  { name: 'portfolio', fn: () => routes.portfolio.render() },
  { name: 'feedback', fn: () => routes.feedback.render() },
  { name: 'settings', fn: () => routes.settings.render() },
  { name: 'public-portfolio', fn: () => routes['public-portfolio'].render() }
];

let emojiFails = 0;
studentViews.forEach(v => {
  const html = v.fn();
  const hasEmoji = emojiRegex.test(html);
  if (hasEmoji) emojiFails++;
  console.log(`  View ${v.name.padEnd(16)}: ${html.length} chars | Emojis: ${hasEmoji ? 'FAIL (Found emoji)' : '0 (PASS)'}`);
});
console.log('Total emoji violations:', emojiFails === 0 ? '0 (ALL PASS)' : `${emojiFails} FAIL`);

console.log('\n=== TEST 3: COMPACT PUBLIC PORTFOLIO CARD ON STUDENT PROFILE ===');
const profHtml = routes.profile.render();
const hasPublicCard = profHtml.includes('public-portfolio-card');
const hasDemoLink = profHtml.includes('ascend.app/p/aarav-sharma');
const hasPreviewBtn = profHtml.includes('Preview');
const hasCopyLinkBtn = profHtml.includes('Copy link');
const hasPublishControl = profHtml.includes('portfolio-publish-toggle-btn');
const hasManageItemsBtn = profHtml.includes('Manage items');

console.log('  Has compact public-portfolio-card:', hasPublicCard);
console.log('  Auto-generates demo link ascend.app/p/aarav-sharma:', hasDemoLink);
console.log('  Has Preview action:', hasPreviewBtn);
console.log('  Has Copy link action:', hasCopyLinkBtn);
console.log('  Has Publish / Unpublish control:', hasPublishControl);
console.log('  Has Manage items action:', hasManageItemsBtn);

console.log('\n=== TEST 4: CONDITIONAL "VERIFIED STUDENT" BADGE ===');
// Test 4a: With institution verification = true
const profWithVerification = window.AscendViews.profile();
const hasBadgeWhenTrue = profWithVerification.includes('Verified student');
console.log('  Badge present when isInstitutionVerified is true:', hasBadgeWhenTrue);

// Test 4b: Set isInstitutionVerified = false
window.AscendData.student.isInstitutionVerified = false;
window.AscendData.student.institutionVerification.verified = false;
const profWithoutVerification = window.AscendViews.profile();
const hasBadgeWhenFalse = profWithoutVerification.includes('Verified student');
console.log('  Badge absent when isInstitutionVerified is false:', !hasBadgeWhenFalse);

// Restore true for demo
window.AscendData.student.isInstitutionVerified = true;
window.AscendData.student.institutionVerification.verified = true;

console.log('\n=== TEST 5: STRICT CERTIFICATE & EVIDENCE PRIVACY ON PUBLIC PREVIEW ===');
const publicHtml = routes['public-portfolio'].render();
console.log('  Shows student name Aarav Sharma:', publicHtml.includes('Aarav Sharma'));
console.log('  Shows approved achievement AWS Certified Cloud Practitioner:', publicHtml.includes('AWS Certified Cloud Practitioner'));
console.log('  Shows approved achievement Google Data Analytics:', publicHtml.includes('Google Data Analytics'));
console.log('  Shows privacy safeguard banner:', publicHtml.includes('Privacy safeguard') && publicHtml.includes('strictly private'));

// Check that sensitive proof links, feedback, and certificates are NOT in public view:
const hasPrivateProofLinks = publicHtml.includes('https://aws.amazon.com/certification/verify') ||
  publicHtml.includes('https://coursera.org/verify/google-data-analytics');
const hasPrivateFeedback = publicHtml.includes('Consider pursuing the Solutions Architect Associate next') ||
  publicHtml.includes('Good initiative in broadening your analytics skillset');

console.log('  Private proof URLs NOT exposed in public HTML:', !hasPrivateProofLinks);
console.log('  Faculty internal feedback NOT exposed in public HTML:', !hasPrivateFeedback);
console.log('  Has "Certificate private" indicator:', publicHtml.includes('Certificate private'));

console.log('\n=== TEST 6: PROJECTS TAB FUNCTIONALITY ===');
console.log('  Projects tab includes EcoVision project:', profHtml.includes('EcoVision'));
console.log('  Projects tab includes CloudCost Sentinel:', profHtml.includes('CloudCost Sentinel'));
console.log('  Projects tab has "Add project" button:', profHtml.includes('Add project'));

console.log('\n=== ALL AUDITS & TESTS COMPLETED ===');
