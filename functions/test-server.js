/**
 * Simple Test Server for Firebase Functions
 * 
 * This server allows you to test Firebase Functions locally without
 * the full Firebase Emulator (which requires Java).
 * 
 * Usage: node test-server.js
 * Then open http://localhost:3001 in your browser
 */

const express = require('express');
const cors = require('cors');

// Mock Firebase Admin
const mockFirestore = {
  collection: (name) => ({
    doc: (id) => ({
      get: async () => {
        if (name === 'profile' && id === 'main') {
          return {
            exists: true,
            data: () => ({
              name: 'Gaurav Bhatia',
              title: 'Technical Lead & Mobile Architect',
              bio: 'Passionate mobile architect with 13+ years of experience...',
              email: 'gauravmbhatia@icloud.com',
              linkedin: 'https://www.linkedin.com/in/gauravmbhatia/',
              github: 'https://github.com/gauravmbhatia',
              resumeUrl: '/resume/Gaurav-Bhatia-CV.pdf',
              avatar: '/profile/avatar.jpg',
              skills: ['iOS Development', 'Swift', 'React Native'],
              updatedAt: new Date()
            })
          };
        }
        return { exists: false };
      },
      set: async (data) => ({ id: id })
    }),
    where: () => ({
      orderBy: () => ({
        get: async () => ({
          docs: [
            {
              id: 'project1',
              data: () => ({
                title: 'My Flight - Delta Airlines Crew App',
                description: 'Enterprise iOS application for Delta Airlines',
                fullDescription: 'Detailed description...',
                thumbnail: '', // Empty thumbnail will use gradient placeholder
                images: [],
                technologies: ['iOS', 'Swift', 'SwiftUI'],
                category: 'Enterprise Mobile',
                featured: true,
                published: true,
                order: 1,
                createdAt: new Date(),
                updatedAt: new Date()
              })
            },
            {
              id: 'project2',
              data: () => ({
                title: 'Kitaboo SDK',
                description: 'Multi-platform eBook SDK',
                fullDescription: 'Detailed description...',
                thumbnail: '', // Empty thumbnail will use gradient placeholder
                images: [],
                technologies: ['iOS', 'Android', 'React Native'],
                category: 'SDK/Framework',
                featured: true,
                published: true,
                order: 2,
                createdAt: new Date(),
                updatedAt: new Date()
              })
            }
          ]
        })
      })
    }),
    add: async (data) => ({ id: 'new-inquiry-id' })
  })
};

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Mock data for testing
// Note: Projects use gradient placeholders instead of images
const mockProjects = [
  {
    id: 'project1',
    title: 'My Flight - Delta Airlines Crew App',
    description: 'Enterprise iOS application empowering 25,000+ Delta Airlines flight attendants and pilots',
    fullDescription: 'Detailed description of the My Flight app...',
    thumbnail: '',
    images: [],
    technologies: ['iOS', 'Swift', 'SwiftUI', 'Combine'],
    category: 'Enterprise Mobile',
    liveUrl: '',
    githubUrl: '',
    featured: true,
    published: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'project2',
    title: 'Kitaboo - Multi-Platform eBook SDK',
    description: 'Revolutionary SDK powering digital reading experiences for 10M+ users',
    fullDescription: 'Detailed description of Kitaboo SDK...',
    thumbnail: '',
    images: [],
    technologies: ['iOS', 'Android', 'React Native', 'Flutter'],
    category: 'SDK/Framework',
    liveUrl: 'https://kitaboo.com',
    githubUrl: '',
    featured: true,
    published: true,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockProfile = {
  name: 'Gaurav Bhatia',
  title: 'Technical Lead & Mobile Architect | iOS • React Native • Flutter',
  bio: 'Passionate mobile architect with 13+ years of experience crafting scalable, high-performance applications.',
  email: 'gauravmbhatia@icloud.com',
  linkedin: 'https://www.linkedin.com/in/gauravmbhatia/',
  github: 'https://github.com/gauravmbhatia',
  twitter: '',
  resumeUrl: '/resume/Gaurav-Bhatia-CV.pdf',
  avatar: '/profile/avatar.jpg',
  skills: ['iOS Development', 'Swift', 'SwiftUI', 'React Native', 'Flutter'],
  updatedAt: new Date().toISOString()
};

// Store inquiries in memory for testing
const inquiries = [];

// GET /api/v1/projects
app.get('/api/v1/projects', (req, res) => {
  res.json({ projects: mockProjects });
});

// GET /api/v1/projects/:id
app.get('/api/v1/projects/:id', (req, res) => {
  const project = mockProjects.find(p => p.id === req.params.id);
  if (project) {
    res.json({ project });
  } else {
    res.status(404).json({
      error: 'Project not found',
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/v1/profile
app.get('/api/v1/profile', (req, res) => {
  res.json({ profile: mockProfile });
});

// POST /api/v1/contact
app.post('/api/v1/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  
  // Validation
  const errors = {};
  if (!name || name.trim().length === 0) errors.name = 'Please enter your name';
  if (!email || email.trim().length === 0) {
    errors.email = 'Please enter your email address';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!subject || subject.trim().length === 0) errors.subject = 'Please enter a subject';
  if (!message || message.trim().length === 0) errors.message = 'Please enter a message';
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors,
      timestamp: new Date().toISOString()
    });
  }
  
  // Check rate limiting (simplified - just check count)
  const clientIP = req.ip;
  const recentSubmissions = inquiries.filter(
    i => i.ip === clientIP && (Date.now() - i.timestamp) < 3600000
  );
  
  if (recentSubmissions.length >= 3) {
    return res.status(429).json({
      error: 'Too many submissions. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString()
    });
  }
  
  // Store inquiry
  inquiries.push({
    name,
    email,
    subject,
    message,
    timestamp: Date.now(),
    ip: clientIP
  });
  
  res.json({
    success: true,
    message: 'Inquiry submitted successfully'
  });
});

// Home page with links to test endpoints
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Firebase Functions Test Server</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #333; }
        .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .endpoint h3 { margin-top: 0; color: #0066cc; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
        code { background: #e0e0e0; padding: 2px 6px; border-radius: 3px; }
        .method { display: inline-block; padding: 2px 8px; border-radius: 3px; font-weight: bold; margin-right: 10px; }
        .get { background: #61affe; color: white; }
        .post { background: #49cc90; color: white; }
      </style>
    </head>
    <body>
      <h1>🔥 Firebase Functions Test Server</h1>
      <p>Click the links below to test the API endpoints in your browser:</p>
      
      <div class="endpoint">
        <h3><span class="method get">GET</span> Get All Projects</h3>
        <p><a href="/api/v1/projects" target="_blank">/api/v1/projects</a></p>
        <p>Returns all published projects</p>
      </div>
      
      <div class="endpoint">
        <h3><span class="method get">GET</span> Get Project by ID</h3>
        <p><a href="/api/v1/projects/project1" target="_blank">/api/v1/projects/project1</a></p>
        <p><a href="/api/v1/projects/project2" target="_blank">/api/v1/projects/project2</a></p>
        <p>Returns a specific project by ID</p>
      </div>
      
      <div class="endpoint">
        <h3><span class="method get">GET</span> Get Profile</h3>
        <p><a href="/api/v1/profile" target="_blank">/api/v1/profile</a></p>
        <p>Returns portfolio owner profile information</p>
      </div>
      
      <div class="endpoint">
        <h3><span class="method post">POST</span> Submit Contact Form</h3>
        <p><code>/api/v1/contact</code></p>
        <p>Use curl or Postman to test:</p>
        <pre style="background: #2d2d2d; color: #f8f8f2; padding: 10px; border-radius: 5px; overflow-x: auto;">curl -X POST http://localhost:3003/api/v1/contact \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Test Inquiry",
    "message": "This is a test message"
  }'</pre>
      </div>
      
      <hr style="margin: 30px 0;">
      <p><strong>Server Status:</strong> ✅ Running on port 3003</p>
      <p><strong>Total Inquiries:</strong> ${inquiries.length}</p>
    </body>
    </html>
  `);
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`\n🚀 Test server running at http://localhost:${PORT}`);
  console.log(`\n📝 Open http://localhost:${PORT} in your browser to test the endpoints\n`);
});
