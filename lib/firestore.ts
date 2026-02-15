/**
 * Firestore Data Access Layer
 * 
 * This module provides typed functions for interacting with Firestore collections.
 * It handles data fetching, creation, and type conversions between Firestore
 * documents and application types.
 * 
 * Key responsibilities:
 * - Query projects collection with filtering and ordering
 * - Fetch profile information
 * - Create inquiry records
 * - Convert Firestore Timestamps to JavaScript Dates
 */

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  addDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Project, Profile, ContactFormData } from '../types';

/**
 * Checks if Firebase is properly configured
 * Used to provide helpful error messages during development
 */
function checkFirebaseConfig() {
  if (!db) {
    throw new Error(
      'Firebase is not configured. Please set up your .env.local file with valid Firebase credentials.'
    );
  }
}

/**
 * Converts Firestore Timestamp to JavaScript Date
 * Handles both Timestamp objects and already-converted Dates
 */
function convertTimestamp(timestamp: any): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  // Fallback for unexpected formats
  return new Date(timestamp);
}

/**
 * Fetches all published projects from Firestore
 * 
 * Queries the projects collection filtering for published=true
 * and orders results by creation date (newest first).
 * 
 * @returns Promise resolving to array of published Project objects
 * @throws Error if Firestore query fails
 * 
 * Requirements: 2.1, 6.1
 */
export async function fetchAllProjects(): Promise<Project[]> {
  try {
    checkFirebaseConfig();
    
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    const projects: Project[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        fullDescription: data.fullDescription,
        thumbnail: data.thumbnail,
        images: data.images || [],
        technologies: data.technologies || [],
        category: data.category,
        liveUrl: data.liveUrl,
        githubUrl: data.githubUrl,
        featured: data.featured || false,
        published: data.published,
        order: data.order || 0,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as Project;
    });

    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects');
  }
}

/**
 * Fetches a single project by its document ID
 * 
 * Retrieves a specific project from Firestore. Returns null if the
 * project doesn't exist or is not published.
 * 
 * @param projectId - The Firestore document ID of the project
 * @returns Promise resolving to Project object or null if not found
 * @throws Error if Firestore query fails
 * 
 * Requirements: 2.3, 6.2
 */
export async function fetchProjectById(projectId: string): Promise<Project | null> {
  try {
    checkFirebaseConfig();
    
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists()) {
      return null;
    }

    const data = projectDoc.data();
    
    // Return null if project is not published
    if (!data.published) {
      return null;
    }

    return {
      id: projectDoc.id,
      title: data.title,
      description: data.description,
      fullDescription: data.fullDescription,
      thumbnail: data.thumbnail,
      images: data.images || [],
      technologies: data.technologies || [],
      category: data.category,
      liveUrl: data.liveUrl,
      githubUrl: data.githubUrl,
      featured: data.featured || false,
      published: data.published,
      order: data.order || 0,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    } as Project;
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    throw new Error('Failed to fetch project');
  }
}

/**
 * Fetches the portfolio owner's profile information
 * 
 * Retrieves the main profile document from the profile collection.
 * This contains the portfolio owner's personal information, bio,
 * social links, and skills.
 * 
 * @returns Promise resolving to Profile object
 * @throws Error if profile document doesn't exist or query fails
 * 
 * Requirements: 1.2, 6.3
 */
export async function fetchProfile(): Promise<Profile> {
  try {
    checkFirebaseConfig();
    
    const profileRef = doc(db, 'profile', 'main');
    const profileDoc = await getDoc(profileRef);

    if (!profileDoc.exists()) {
      throw new Error('Profile not found');
    }

    const data = profileDoc.data();

    return {
      name: data.name,
      title: data.title,
      bio: data.bio,
      email: data.email,
      linkedin: data.linkedin,
      github: data.github,
      twitter: data.twitter,
      resumeUrl: data.resumeUrl,
      avatar: data.avatar,
      skills: data.skills || [],
      experience: data.experience,
      updatedAt: convertTimestamp(data.updatedAt),
    } as Profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw new Error('Failed to fetch profile');
  }
}

/**
 * Creates a new inquiry in the Firestore inquiries collection
 * 
 * Stores contact form submissions with timestamp and metadata.
 * The inquiry is marked as unread and unreplied by default.
 * 
 * @param formData - Contact form data (name, email, subject, message)
 * @param ip - Client IP address for rate limiting
 * @returns Promise resolving to the created inquiry's document ID
 * @throws Error if document creation fails
 * 
 * Requirements: 4.2, 4.8
 */
export async function createInquiry(
  formData: ContactFormData,
  ip: string
): Promise<string> {
  try {
    checkFirebaseConfig();
    
    const inquiriesRef = collection(db, 'inquiries');
    
    const inquiryData = {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      timestamp: serverTimestamp(),
      ip: ip,
      read: false,
      replied: false,
    };

    const docRef = await addDoc(inquiriesRef, inquiryData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating inquiry:', error);
    throw new Error('Failed to create inquiry');
  }
}
