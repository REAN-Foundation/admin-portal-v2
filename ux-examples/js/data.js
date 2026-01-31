/**
 * REAN Admin Portal - Dummy Data
 * ================================
 */

// Current User
const currentUser = {
  id: 'usr-001',
  name: 'John Anderson',
  email: 'john.anderson@reanfoundation.org',
  role: 'System Admin',
  avatar: null,
  initials: 'JA'
};

// Dashboard Stats
const dashboardStats = {
  totalUsers: 24856,
  activeUsers: 18432,
  enrolledUsers: 15678,
  deletedUsers: 1245,
  notDeletedUsers: 23611,
  trends: {
    totalUsers: { value: 12.5, direction: 'up' },
    activeUsers: { value: 8.3, direction: 'up' },
    enrolledUsers: { value: 15.2, direction: 'up' },
    deletedUsers: { value: 2.1, direction: 'down' }
  },
  deviceStats: {
    android: 12456,
    ios: 8234,
    web: 4166
  }
};

// Tenants Data
const tenantsData = [
  {
    id: 'ten-001',
    name: 'REAN Health',
    code: 'REAN',
    email: 'admin@reanhealth.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    usersCount: 8543,
    createdAt: '2024-01-15'
  },
  {
    id: 'ten-002',
    name: 'AHA Foundation',
    code: 'AHA',
    email: 'contact@aha.org',
    phone: '+1 (555) 987-6543',
    status: 'active',
    usersCount: 5231,
    createdAt: '2024-02-20'
  },
  {
    id: 'ten-003',
    name: 'Sneha Healthcare',
    code: 'SNEHA',
    email: 'info@snehahc.in',
    phone: '+91 98765 43210',
    status: 'active',
    usersCount: 3456,
    createdAt: '2024-03-10'
  },
  {
    id: 'ten-004',
    name: 'GMU Wellness',
    code: 'GMU',
    email: 'wellness@gmu.edu',
    phone: '+1 (555) 456-7890',
    status: 'inactive',
    usersCount: 2134,
    createdAt: '2024-04-05'
  },
  {
    id: 'ten-005',
    name: 'Pacific Health Network',
    code: 'PHN',
    email: 'admin@phn.org',
    phone: '+1 (555) 234-5678',
    status: 'active',
    usersCount: 4521,
    createdAt: '2024-05-12'
  }
];

// Users Data
const usersData = [
  {
    id: 'usr-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'Tenant Admin',
    tenant: 'REAN Health',
    status: 'active',
    lastLogin: '2025-01-19T14:30:00'
  },
  {
    id: 'usr-002',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    role: 'System User',
    tenant: 'AHA Foundation',
    status: 'active',
    lastLogin: '2025-01-18T09:15:00'
  },
  {
    id: 'usr-003',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    role: 'Content Manager',
    tenant: 'Sneha Healthcare',
    status: 'active',
    lastLogin: '2025-01-17T16:45:00'
  },
  {
    id: 'usr-004',
    name: 'David Kim',
    email: 'david.kim@example.com',
    role: 'Analyst',
    tenant: 'GMU Wellness',
    status: 'inactive',
    lastLogin: '2025-01-10T11:20:00'
  },
  {
    id: 'usr-005',
    name: 'Amanda Foster',
    email: 'amanda.foster@example.com',
    role: 'Tenant Admin',
    tenant: 'Pacific Health Network',
    status: 'active',
    lastLogin: '2025-01-19T08:00:00'
  }
];

// Assessment Templates
const assessmentsData = [
  {
    id: 'ast-001',
    title: 'Diabetes Risk Assessment',
    type: 'Health Risk',
    tags: ['diabetes', 'screening', 'chronic'],
    provider: 'REAN Foundation',
    questionsCount: 25,
    status: 'published'
  },
  {
    id: 'ast-002',
    title: 'Mental Health Screening',
    type: 'Mental Health',
    tags: ['mental', 'screening', 'wellness'],
    provider: 'AHA Foundation',
    questionsCount: 18,
    status: 'published'
  },
  {
    id: 'ast-003',
    title: 'COVID-19 Symptom Checker',
    type: 'Symptom Assessment',
    tags: ['covid', 'symptoms', 'screening'],
    provider: 'REAN Foundation',
    questionsCount: 12,
    status: 'published'
  },
  {
    id: 'ast-004',
    title: 'Nutrition Habits Survey',
    type: 'Wellness',
    tags: ['nutrition', 'diet', 'wellness'],
    provider: 'Sneha Healthcare',
    questionsCount: 30,
    status: 'draft'
  },
  {
    id: 'ast-005',
    title: 'Cardiovascular Risk Score',
    type: 'Health Risk',
    tags: ['heart', 'cardiovascular', 'risk'],
    provider: 'REAN Foundation',
    questionsCount: 20,
    status: 'published'
  }
];

// Tenant Settings Configuration
const tenantSettingsConfig = {
  common: {
    clinical: {
      name: 'Clinical',
      icon: 'stethoscope',
      description: 'Manage clinical care and medical services',
      progress: 75,
      settings: [
        { key: 'vitals', name: 'Vitals', enabled: true, description: 'Monitor patient vital signs' },
        { key: 'labRecords', name: 'Lab Records', enabled: true, description: 'Laboratory test results' },
        { key: 'symptoms', name: 'Symptoms', enabled: true, description: 'Track patient symptoms' },
        { key: 'medications', name: 'Medications', enabled: false, description: 'Medication schedules' },
        { key: 'careplans', name: 'Careplans', enabled: true, description: 'Patient care plans' },
        { key: 'assessments', name: 'Assessments', enabled: true, description: 'Health assessments' },
        { key: 'appointments', name: 'Appointments', enabled: false, description: 'Appointment scheduling' },
        { key: 'documents', name: 'Documents', enabled: true, description: 'Medical documents' }
      ]
    },
    wellness: {
      name: 'Wellness',
      icon: 'leaf',
      description: 'Health and wellness features',
      progress: 60,
      settings: [
        { key: 'exercise', name: 'Exercise', enabled: true, description: 'Fitness tracking' },
        { key: 'nutrition', name: 'Nutrition', enabled: true, description: 'Diet monitoring' },
        { key: 'meditation', name: 'Meditation', enabled: false, description: 'Mindfulness tracking' },
        { key: 'goals', name: 'Goals', enabled: true, description: 'Health goals' },
        { key: 'deviceIntegration', name: 'Device Integration', enabled: false, description: 'Wearables connection' }
      ]
    },
    ehr: {
      name: 'EHR',
      icon: 'database',
      description: 'Electronic Health Records integration',
      progress: 33,
      settings: [
        { key: 'fhirStorage', name: 'FHIR Storage', enabled: true, description: 'FHIR-compliant storage' },
        { key: 'ehrIntegration', name: 'EHR Integration', enabled: false, description: 'External EHR systems' },
        { key: 'abdm', name: 'ABDM', enabled: false, description: 'Ayushman Bharat Digital Mission' }
      ]
    },
    affiliations: {
      name: 'Affiliations',
      icon: 'handshake',
      description: 'Healthcare partnerships',
      progress: 50,
      settings: [
        { key: 'healthCenters', name: 'Health Centers', enabled: true, description: 'Health center affiliations' },
        { key: 'healthSystems', name: 'Health Systems', enabled: false, description: 'Health system partnerships' }
      ]
    },
    community: {
      name: 'Community',
      icon: 'users',
      description: 'Community engagement features',
      progress: 100,
      settings: [
        { key: 'userGroups', name: 'User Groups', enabled: true, description: 'Community groups' },
        { key: 'chat', name: 'Chat', enabled: true, description: 'Messaging features' }
      ]
    },
    educational: {
      name: 'Educational',
      icon: 'book',
      description: 'Learning and educational content',
      progress: 66,
      settings: [
        { key: 'courses', name: 'Courses', enabled: true, description: 'Educational courses' },
        { key: 'learningJourney', name: 'Learning Journey', enabled: true, description: 'Learning paths' },
        { key: 'knowledgeNuggets', name: 'Knowledge Nuggets', enabled: false, description: 'Quick tips' }
      ]
    },
    miscellaneous: {
      name: 'Miscellaneous',
      icon: 'grid',
      description: 'Additional features',
      progress: 75,
      settings: [
        { key: 'gamification', name: 'Gamification', enabled: true, description: 'Rewards and badges' },
        { key: 'notifications', name: 'Notifications', enabled: true, description: 'Push notifications' },
        { key: 'newsfeeds', name: 'Newsfeeds', enabled: true, description: 'News updates' },
        { key: 'notices', name: 'Notices', enabled: false, description: 'Announcements' }
      ]
    },
    analysis: {
      name: 'Analysis',
      icon: 'chart',
      description: 'Analytics and reporting',
      progress: 50,
      settings: [
        { key: 'customQueries', name: 'Custom Queries', enabled: true, description: 'Custom data queries' },
        { key: 'quicksight', name: 'QuickSight', enabled: false, description: 'AWS QuickSight dashboards' }
      ]
    }
  },
  userInterfaces: {
    chatbot: { enabled: true, name: 'Chatbot', description: 'AI-powered chatbot' },
    patientApp: { enabled: true, name: 'Patient App', description: 'Mobile application' },
    patientPortal: { enabled: false, name: 'Patient Portal', description: 'Web portal' },
    forms: { enabled: true, name: 'Forms', description: 'Digital forms' },
    followup: { enabled: false, name: 'Follow-up', description: 'Automated follow-ups' }
  }
};

// Chatbot Settings
const chatbotSettings = {
  basic: {
    name: 'REAN HealthBot',
    description: 'Your personal health assistant powered by AI',
    defaultLanguage: 'English',
    timezone: '+05:30',
    organization: {
      name: 'REAN Foundation',
      website: 'https://reanfoundation.org',
      logo: null,
      favicon: null
    }
  },
  messageChannels: {
    whatsapp: { enabled: true, phoneNumber: '+1 555-REAN' },
    telegram: { enabled: false, botUsername: '@rean_health_bot' }
  },
  supportChannels: {
    clickup: { enabled: true, workspace: 'REAN Support' },
    slack: { enabled: false, channel: '#support' },
    email: { enabled: true, address: 'support@reanfoundation.org' }
  },
  features: {
    personalization: { enabled: true, description: 'Personalized responses' },
    localization: { enabled: true, description: 'Multi-language support' },
    locationContext: { enabled: false, description: 'Location-aware responses' },
    medicationReminders: { enabled: true, description: 'Medication alerts' },
    appointmentReminders: { enabled: true, description: 'Appointment alerts' },
    qna: { enabled: true, description: 'Q&A functionality' },
    consent: { enabled: true, description: 'User consent collection' },
    welcomeMessage: { enabled: true, description: 'Greeting messages' },
    feedback: { enabled: false, description: 'User feedback collection' },
    conversationHistory: { enabled: true, description: 'Chat history' },
    emojis: { enabled: true, description: 'Emoji support' },
    basicAssessment: { enabled: true, description: 'Health assessments' },
    basicCarePlan: { enabled: false, description: 'Care plan support' }
  },
  welcomeMessages: [
    { languageCode: 'en', content: 'Hello! I am REAN HealthBot. How can I help you today?', url: '' },
    { languageCode: 'es', content: '¡Hola! Soy REAN HealthBot. ¿Cómo puedo ayudarte hoy?', url: '' },
    { languageCode: 'hi', content: 'नमस्ते! मैं REAN HealthBot हूं। आज मैं आपकी कैसे मदद कर सकता हूं?', url: '' }
  ]
};

// Consent Settings
const consentSettings = {
  enabled: true,
  types: [
    { key: 'privacy', name: 'Privacy Policy', required: true, version: '2.1' },
    { key: 'terms', name: 'Terms of Service', required: true, version: '1.5' },
    { key: 'dataSharing', name: 'Data Sharing', required: false, version: '1.0' },
    { key: 'marketing', name: 'Marketing Communications', required: false, version: '1.0' }
  ]
};

// Forms Settings
const formsSettings = {
  enabled: true,
  forms: [
    { id: 'frm-001', name: 'Patient Registration', fields: 12, status: 'active' },
    { id: 'frm-002', name: 'Health Survey', fields: 25, status: 'active' },
    { id: 'frm-003', name: 'Feedback Form', fields: 8, status: 'draft' }
  ]
};

// Follow-up Settings
const followupSettings = {
  enabled: true,
  schedules: [
    { id: 'sch-001', name: 'Post-Visit Follow-up', triggerDays: 3, reminderCount: 2, status: 'active' },
    { id: 'sch-002', name: 'Medication Check-in', triggerDays: 7, reminderCount: 3, status: 'active' },
    { id: 'sch-003', name: 'Annual Health Review', triggerDays: 365, reminderCount: 1, status: 'inactive' }
  ]
};

// Navigation Menu
const navigationMenu = [
  {
    section: 'Main',
    items: [
      { name: 'Home', icon: 'home', href: 'dashboard.html', badge: null },
      { name: 'Analytics', icon: 'chart', href: 'analytics.html', badge: null }
    ]
  },
  {
    section: 'Administration',
    items: [
      { name: 'Tenants', icon: 'building', href: 'tenants.html', badge: null },
      { name: 'Users', icon: 'users', href: 'users.html', badge: '5' },
      { name: 'User Roles', icon: 'shield', href: 'user-roles.html', badge: null },
      { name: 'Settings', icon: 'settings', href: 'tenant-settings.html', badge: null }
    ]
  },
  {
    section: 'Clinical',
    items: [
      { name: 'Assessments', icon: 'clipboard', href: 'assessments.html', badge: null },
      { name: 'Lab Records', icon: 'flask', href: '#', badge: null },
      { name: 'Symptoms', icon: 'activity', href: '#', badge: null },
      { name: 'Drugs', icon: 'pill', href: '#', badge: null }
    ]
  },
  {
    section: 'Careplan',
    items: [
      { name: 'Dashboard', icon: 'layout', href: '#', badge: null },
      { name: 'Assets', icon: 'folder', href: '#', badge: null },
      { name: 'Categories', icon: 'tag', href: '#', badge: null },
      { name: 'Careplans', icon: 'heart', href: '#', badge: null },
      { name: 'Enrollments', icon: 'check-square', href: '#', badge: null }
    ]
  },
  {
    section: 'Content',
    items: [
      { name: 'Prompt Templates', icon: 'message-square', href: '#', badge: null },
      { name: 'Q&A Documents', icon: 'file-text', href: '#', badge: null },
      { name: 'Knowledge Nuggets', icon: 'lightbulb', href: '#', badge: null }
    ]
  }
];

// Languages
const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'hi', name: 'Hindi' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' }
];

// Timezones
const timezones = [
  { value: '-12:00', label: '(UTC-12:00) International Date Line West' },
  { value: '-08:00', label: '(UTC-08:00) Pacific Time (US & Canada)' },
  { value: '-05:00', label: '(UTC-05:00) Eastern Time (US & Canada)' },
  { value: '+00:00', label: '(UTC+00:00) London, Dublin, Lisbon' },
  { value: '+01:00', label: '(UTC+01:00) Paris, Berlin, Rome' },
  { value: '+05:30', label: '(UTC+05:30) Chennai, Kolkata, Mumbai' },
  { value: '+08:00', label: '(UTC+08:00) Beijing, Singapore, Hong Kong' },
  { value: '+09:00', label: '(UTC+09:00) Tokyo, Seoul' },
  { value: '+10:00', label: '(UTC+10:00) Sydney, Melbourne' }
];

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    currentUser,
    dashboardStats,
    tenantsData,
    usersData,
    assessmentsData,
    tenantSettingsConfig,
    chatbotSettings,
    consentSettings,
    formsSettings,
    followupSettings,
    navigationMenu,
    languages,
    timezones
  };
}
