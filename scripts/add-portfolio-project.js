/**
 * Add Portfolio Website Project
 * 
 * This script adds the portfolio website itself as a project entry in Firestore.
 * Showcases the meta nature of the portfolio - the website displaying itself as a project.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✓ Initialized with service account key');
} else {
  admin.initializeApp();
  console.log('✓ Initialized with application default credentials');
}

const db = admin.firestore();

const portfolioProject = {
  title: 'Professional Portfolio Website',
  description: 'A modern, full-stack portfolio website built with Next.js 14, TypeScript, and Firebase, featuring dynamic content management, REST APIs, and comprehensive testing.',
  fullDescription: `A sophisticated portfolio website that showcases professional work through an elegant, responsive interface. Built with modern web technologies and best practices, this project demonstrates full-stack development capabilities from frontend design to backend API implementation.

**Key Features:**
• Dynamic content management with Firebase Firestore
• RESTful API endpoints for portfolio data access
• Server-side rendering (SSR) and Static Site Generation (SSG) with Next.js 14
• Responsive design with dark mode support
• Admin dashboard for content management
• Contact form with Firebase Functions backend
• Property-based testing with fast-check
• Comprehensive test coverage with Jest
• SEO optimization with structured data
• Performance optimization (Lighthouse score 90+)
• Firebase Authentication for admin access
• Image optimization and lazy loading
• Progressive Web App (PWA) features

**Technical Highlights:**
• Type-safe development with TypeScript
• Component-based architecture with React 18
• Tailwind CSS for utility-first styling
• Firebase Functions for serverless API endpoints
• Firestore security rules for data protection
• Automated deployment with Firebase Hosting
• Git-based version control and CI/CD ready
• Mobile-first responsive design (320px to 2560px)
• Accessibility compliance (WCAG 2.1)

**Architecture:**
The project follows a modern JAMstack architecture with Next.js handling the frontend, Firebase Functions providing the API layer, and Firestore serving as the database. The admin interface allows for easy content updates without code changes, while the public-facing site delivers optimized, cached content for fast load times.

**Development Practices:**
• Comprehensive documentation with setup guides
• Property-based testing for robust validation
• Error handling and user feedback systems
• Performance monitoring and optimization
• Security best practices with Firebase rules
• Modular code structure for maintainability`,
  thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
  images: [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1547658719-da2b51169166?w=1200&h=800&fit=crop'
  ],
  technologies: [
    'Next.js 14',
    'TypeScript',
    'React 18',
    'Tailwind CSS',
    'Firebase',
    'Firestore',
    'Firebase Functions',
    'Firebase Auth',
    'Firebase Hosting',
    'Jest',
    'React Testing Library',
    'fast-check',
    'SWR',
    'React Hook Form',
    'Node.js',
    'Git'
  ],
  category: 'Full-Stack Web Development',
  liveUrl: 'https://mindcruit.web.app',
  githubUrl: 'https://github.com/gauravmb/gauravbhatia-portfolio',
  featured: true,
  published: true,
  order: 0,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

async function addPortfolioProject() {
  try {
    console.log('Adding portfolio project to Firestore...');
    
    const docRef = await db.collection('projects').add(portfolioProject);
    
    console.log('✓ Portfolio project added successfully!');
    console.log(`  Project ID: ${docRef.id}`);
    console.log(`  Title: ${portfolioProject.title}`);
    console.log(`  Category: ${portfolioProject.category}`);
    console.log(`  Technologies: ${portfolioProject.technologies.length} listed`);
    console.log(`  Featured: ${portfolioProject.featured}`);
    console.log(`  Published: ${portfolioProject.published}`);
    console.log(`  Live URL: ${portfolioProject.liveUrl}`);
    console.log(`  GitHub: ${portfolioProject.githubUrl}`);
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error adding portfolio project:', error);
    process.exit(1);
  }
}

addPortfolioProject();
