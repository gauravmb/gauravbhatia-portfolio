/**
 * ProjectForm Component
 * 
 * Form component for creating and editing portfolio projects in the admin interface.
 * Provides comprehensive input fields for all project properties, image upload functionality,
 * and options to save as draft or publish immediately.
 * 
 * Key features:
 * - Create new projects or edit existing ones
 * - All project fields: title, description, fullDescription, technologies, category, URLs
 * - Image upload with preview (thumbnail and gallery images)
 * - Toggle controls for featured and published status
 * - Save as draft or publish buttons
 * - Form validation with error messages
 * - Loading states during submission
 * - Success/error feedback
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.5
 */

'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { collection, doc, addDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface ProjectFormProps {
  projectId?: string; // If provided, form is in edit mode
  onSuccess?: () => void; // Callback after successful save
  onCancel?: () => void; // Callback when user cancels
}

/**
 * Form data interface matching Project structure
 * Omits auto-generated fields (id, createdAt, updatedAt)
 */
interface ProjectFormData {
  title: string;
  description: string;
  fullDescription: string;
  thumbnail: string;
  images: string[];
  technologies: string[];
  category: string;
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
  published: boolean;
  order: number;
}

/**
 * Initial empty form state
 */
const initialFormData: ProjectFormData = {
  title: '',
  description: '',
  fullDescription: '',
  thumbnail: '',
  images: [],
  technologies: [],
  category: '',
  liveUrl: '',
  githubUrl: '',
  featured: false,
  published: false,
  order: 0,
};

/**
 * ProjectForm component for creating and editing projects
 * 
 * This component handles both create and edit modes based on whether a projectId is provided.
 * It manages form state, validation, image uploads, and submission to Firestore.
 * 
 * @param projectId - Optional project ID for edit mode
 * @param onSuccess - Optional callback after successful save
 * @param onCancel - Optional callback when user cancels
 */
export default function ProjectForm({ projectId, onSuccess, onCancel }: ProjectFormProps) {
  const router = useRouter();
  const isEditMode = !!projectId;

  // Form state
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [techInput, setTechInput] = useState(''); // Temporary input for adding technologies
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  /**
   * Load existing project data in edit mode
   */
  useEffect(() => {
    if (isEditMode && projectId) {
      loadProject(projectId);
    }
  }, [isEditMode, projectId]);

  /**
   * Fetches project data from Firestore for editing
   */
  const loadProject = async (id: string) => {
    try {
      setLoadingProject(true);
      setError(null);
      
      const projectRef = doc(db, 'projects', id);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        setError('Project not found');
        return;
      }
      
      const data = projectSnap.data();
      setFormData({
        title: data.title || '',
        description: data.description || '',
        fullDescription: data.fullDescription || '',
        thumbnail: data.thumbnail || '',
        images: data.images || [],
        technologies: data.technologies || [],
        category: data.category || '',
        liveUrl: data.liveUrl || '',
        githubUrl: data.githubUrl || '',
        featured: data.featured || false,
        published: data.published || false,
        order: data.order || 0,
      });
    } catch (err) {
      console.error('Error loading project:', err);
      setError('Failed to load project. Please try again.');
    } finally {
      setLoadingProject(false);
    }
  };

  /**
   * Handles text input changes
   */
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Handles checkbox changes
   */
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  /**
   * Adds a technology tag
   */
  const handleAddTechnology = () => {
    const tech = techInput.trim();
    if (tech && !formData.technologies.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, tech],
      }));
      setTechInput('');
    }
  };

  /**
   * Removes a technology tag
   */
  const handleRemoveTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech),
    }));
  };

  /**
   * Handles technology input key press (Enter to add)
   */
  const handleTechKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTechnology();
    }
  };

  /**
   * Uploads an image to Firebase Storage
   */
  const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  /**
   * Handles thumbnail image upload
   */
  const handleThumbnailUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const timestamp = Date.now();
      const path = `projects/${projectId || 'temp'}/thumbnail_${timestamp}.${file.name.split('.').pop()}`;
      const url = await uploadImage(file, path);
      
      setFormData(prev => ({ ...prev, thumbnail: url }));
      
      // Clear validation error
      if (validationErrors.thumbnail) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.thumbnail;
          return newErrors;
        });
      }
    } catch (err) {
      console.error('Error uploading thumbnail:', err);
      alert('Failed to upload thumbnail. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  /**
   * Handles gallery images upload
   */
  const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate file types and sizes
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is larger than 5MB`);
        return;
      }
    }

    try {
      setUploadingImage(true);
      const uploadPromises: Promise<string>[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = Date.now();
        const path = `projects/${projectId || 'temp'}/image_${timestamp}_${i}.${file.name.split('.').pop()}`;
        uploadPromises.push(uploadImage(file, path));
      }
      
      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...urls],
      }));
    } catch (err) {
      console.error('Error uploading gallery images:', err);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  /**
   * Removes a gallery image
   */
  const handleRemoveImage = (url: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== url),
    }));
  };

  /**
   * Validates form data
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.fullDescription.trim()) {
      errors.fullDescription = 'Full description is required';
    }

    if (!formData.thumbnail) {
      errors.thumbnail = 'Thumbnail image is required';
    }

    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }

    if (formData.technologies.length === 0) {
      errors.technologies = 'At least one technology is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: FormEvent, publishNow: boolean = false) => {
    e.preventDefault();

    // Prevent double submission
    if (loading) {
      return;
    }

    // Validate form
    if (!validateForm()) {
      setError('Please fix the validation errors');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare data for Firestore
      const projectData = {
        ...formData,
        published: publishNow ? true : formData.published,
        updatedAt: serverTimestamp(),
      };

      if (isEditMode && projectId) {
        // Update existing project
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, projectData);
      } else {
        // Create new project
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          createdAt: serverTimestamp(),
        });
      }

      // Success feedback
      alert(
        isEditMode
          ? 'Project updated successfully'
          : publishNow
          ? 'Project published successfully'
          : 'Project saved as draft'
      );

      // Call success callback or navigate
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/projects');
      }
    } catch (err) {
      console.error('Error saving project:', err);
      setError('Failed to save project. Please try again.');
      setLoading(false);
    }
  };

  /**
   * Handles cancel action
   */
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/admin/projects');
    }
  };

  // Loading state while fetching project data
  if (loadingProject) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              validationErrors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter project title"
          />
          {validationErrors.title && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Short Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              validationErrors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Brief description (150-200 characters)"
          />
          {validationErrors.description && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {formData.description.length} characters
          </p>
        </div>

        {/* Full Description */}
        <div>
          <label htmlFor="fullDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="fullDescription"
            name="fullDescription"
            value={formData.fullDescription}
            onChange={handleInputChange}
            rows={8}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              validationErrors.fullDescription ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Detailed project description (supports markdown)"
          />
          {validationErrors.fullDescription && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.fullDescription}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              validationErrors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a category</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile App">Mobile App</option>
            <option value="Desktop App">Desktop App</option>
            <option value="API/Backend">API/Backend</option>
            <option value="Data Science">Data Science</option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="DevOps">DevOps</option>
            <option value="Other">Other</option>
          </select>
          {validationErrors.category && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.category}</p>
          )}
        </div>

        {/* Technologies */}
        <div>
          <label htmlFor="techInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Technologies <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              id="techInput"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyPress={handleTechKeyPress}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter technology (e.g., React, Node.js)"
            />
            <button
              type="button"
              onClick={handleAddTechnology}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          
          {/* Technology Tags */}
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.technologies.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => handleRemoveTechnology(tech)}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  aria-label={`Remove ${tech}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          
          {validationErrors.technologies && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.technologies}</p>
          )}
        </div>

        {/* Thumbnail Image */}
        <div>
          <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Thumbnail Image <span className="text-red-500">*</span>
          </label>
          
          {formData.thumbnail && (
            <div className="mb-3">
              <img
                src={formData.thumbnail}
                alt="Thumbnail preview"
                className="w-48 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
              />
            </div>
          )}
          
          <input
            type="file"
            id="thumbnail"
            accept="image/*"
            onChange={handleThumbnailUpload}
            disabled={uploadingImage}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-blue-900/30 dark:file:text-blue-400
              dark:hover:file:bg-blue-900/50
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          {validationErrors.thumbnail && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.thumbnail}</p>
          )}
          
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Recommended size: 800x600px. Max size: 5MB
          </p>
        </div>

        {/* Gallery Images */}
        <div>
          <label htmlFor="gallery" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Gallery Images
          </label>
          
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-3">
              {formData.images.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(url)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <input
            type="file"
            id="gallery"
            accept="image/*"
            multiple
            onChange={handleGalleryUpload}
            disabled={uploadingImage}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              dark:file:bg-blue-900/30 dark:file:text-blue-400
              dark:hover:file:bg-blue-900/50
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Upload multiple images for the project gallery. Max size per image: 5MB
          </p>
        </div>

        {uploadingImage && (
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <LoadingSpinner />
            <span className="text-sm">Uploading image...</span>
          </div>
        )}

        {/* Live URL */}
        <div>
          <label htmlFor="liveUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Live Demo URL
          </label>
          <input
            type="url"
            id="liveUrl"
            name="liveUrl"
            value={formData.liveUrl}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="https://example.com"
          />
        </div>

        {/* GitHub URL */}
        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            GitHub Repository URL
          </label>
          <input
            type="url"
            id="githubUrl"
            name="githubUrl"
            value={formData.githubUrl}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="https://github.com/username/repo"
          />
        </div>

        {/* Order */}
        <div>
          <label htmlFor="order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Order
          </label>
          <input
            type="number"
            id="order"
            name="order"
            value={formData.order}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="0"
            min="0"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Lower numbers appear first
          </p>
        </div>

        {/* Featured Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={formData.featured}
            onChange={handleCheckboxChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Featured Project (show on homepage)
          </label>
        </div>

        {/* Published Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="published"
            name="published"
            checked={formData.published}
            onChange={handleCheckboxChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
          />
          <label htmlFor="published" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Published (visible to public)
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              'Save as Draft'
            )}
          </button>
          
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading || uploadingImage}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Publishing...</span>
              </>
            ) : (
              isEditMode ? 'Update & Publish' : 'Publish Project'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
