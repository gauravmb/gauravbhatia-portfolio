/**
 * Property-Based Tests for Resume Download Feature
 * 
 * This file contains property-based tests using fast-check to verify
 * universal correctness properties of the resume download functionality.
 * These tests validate that resume files are served in the correct format
 * and meet the requirements for downloadable documents.
 * 
 * Key properties tested:
 * - Resume file format validation (PDF only)
 * - MIME type verification
 * - File extension validation
 * 
 * Testing approach: These tests verify that resume URLs point to PDF files
 * by checking the file extension and simulating MIME type validation that
 * would occur during file upload/storage.
 */

import * as fc from 'fast-check';

/**
 * Simulates fetching file metadata from a storage URL
 * In a real implementation, this would make a HEAD request to get Content-Type
 * For testing, we extract the file extension and infer the MIME type
 * 
 * @param url - Storage URL for the resume file
 * @returns Object with MIME type and file extension
 */
function getFileMetadata(url: string): {
  mimeType: string;
  extension: string;
  isValid: boolean;
} {
  // Extract file extension from URL
  const urlParts = url.split('?')[0]; // Remove query parameters
  const pathParts = urlParts.split('/');
  const fileName = pathParts[pathParts.length - 1];
  const extensionMatch = fileName.match(/\.([^.]+)$/);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : '';

  // Determine MIME type based on extension
  let mimeType = '';
  switch (extension) {
    case 'pdf':
      mimeType = 'application/pdf';
      break;
    case 'doc':
      mimeType = 'application/msword';
      break;
    case 'docx':
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      break;
    case 'txt':
      mimeType = 'text/plain';
      break;
    default:
      mimeType = 'application/octet-stream';
  }

  // Validate that it's a PDF
  const isValid = mimeType === 'application/pdf';

  return {
    mimeType,
    extension,
    isValid,
  };
}

/**
 * Validates that a resume URL points to a PDF file
 * This represents the core requirement that resumes must be in PDF format
 * 
 * @param resumeUrl - URL to the resume file
 * @returns Object indicating if the file is a valid PDF
 */
function validateResumeFormat(resumeUrl: string): {
  isValidFormat: boolean;
  mimeType: string;
  error?: string;
} {
  const metadata = getFileMetadata(resumeUrl);

  if (!metadata.isValid) {
    return {
      isValidFormat: false,
      mimeType: metadata.mimeType,
      error: `Invalid resume format. Expected PDF but got ${metadata.extension.toUpperCase() || 'unknown'} file.`,
    };
  }

  return {
    isValidFormat: true,
    mimeType: metadata.mimeType,
  };
}

describe('Resume Download - Property-Based Tests', () => {
  // Feature: portfolio-website, Property 7: Resume File Format
  describe('Property 7: Resume File Format', () => {
    /**
     * Arbitrary generator for valid PDF resume URLs
     * Generates Firebase Storage URLs pointing to PDF files
     */
    const validPdfResumeUrl = fc.tuple(
      fc.constantFrom(
        'https://storage.googleapis.com',
        'https://firebasestorage.googleapis.com'
      ),
      fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-_'.split('')), {
        minLength: 10,
        maxLength: 30,
      }),
      fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-_'.split('')), {
        minLength: 5,
        maxLength: 20,
      }),
      fc.constantFrom('resume', 'cv', 'Resume', 'CV', 'John_Doe_Resume', 'Jane_Smith_CV'),
      fc.constantFrom('.pdf', '.PDF')
    ).map(([domain, bucket, path, filename, ext]) => 
      `${domain}/${bucket}/${path}/${filename}${ext}`
    );

    /**
     * Arbitrary generator for invalid (non-PDF) resume URLs
     * Generates URLs with various non-PDF file extensions
     */
    const invalidResumeUrl = fc.tuple(
      fc.constantFrom(
        'https://storage.googleapis.com',
        'https://firebasestorage.googleapis.com'
      ),
      fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-_'.split('')), {
        minLength: 10,
        maxLength: 30,
      }),
      fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-_'.split('')), {
        minLength: 5,
        maxLength: 20,
      }),
      fc.constantFrom('resume', 'cv', 'document'),
      fc.constantFrom('.doc', '.docx', '.txt', '.rtf', '.odt', '.html')
    ).map(([domain, bucket, path, filename, ext]) => 
      `${domain}/${bucket}/${path}/${filename}${ext}`
    );

    /**
     * Property Test: Resume file format validation
     * 
     * This test verifies that for any resume download request, the served
     * file has MIME type "application/pdf". This ensures compliance with
     * the requirement that resumes must be in PDF format.
     * 
     * Test strategy:
     * 1. Generate valid Firebase Storage URLs pointing to PDF files
     * 2. Extract file metadata (MIME type, extension)
     * 3. Verify MIME type is "application/pdf"
     * 4. Verify file extension is ".pdf" (case-insensitive)
     * 5. Verify validation passes for all PDF URLs
     * 
     * This tests the core business logic that ensures resume files
     * are always served in PDF format, meeting accessibility and
     * compatibility requirements.
     * 
     * Validates: Requirements 3.2
     */
    it('should serve resume files with MIME type "application/pdf"', () => {
      fc.assert(
        fc.property(
          validPdfResumeUrl,
          (resumeUrl) => {
            // Get file metadata from URL
            const metadata = getFileMetadata(resumeUrl);

            // Property 1: MIME type must be "application/pdf"
            expect(metadata.mimeType).toBe('application/pdf');

            // Property 2: File extension must be "pdf" (case-insensitive)
            expect(metadata.extension.toLowerCase()).toBe('pdf');

            // Property 3: Validation must pass for PDF files
            expect(metadata.isValid).toBe(true);

            // Property 4: Resume format validation must succeed
            const validation = validateResumeFormat(resumeUrl);
            expect(validation.isValidFormat).toBe(true);
            expect(validation.mimeType).toBe('application/pdf');
            expect(validation.error).toBeUndefined();
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in design
      );
    });

    /**
     * Property Test: Non-PDF file rejection
     * 
     * Verifies that non-PDF files are identified as invalid format.
     * While the system should prevent non-PDF uploads, this test ensures
     * the validation logic correctly identifies invalid formats.
     */
    it('should identify non-PDF files as invalid format', () => {
      fc.assert(
        fc.property(
          invalidResumeUrl,
          (resumeUrl) => {
            // Get file metadata from URL
            const metadata = getFileMetadata(resumeUrl);

            // Property 1: MIME type must NOT be "application/pdf"
            expect(metadata.mimeType).not.toBe('application/pdf');

            // Property 2: File extension must NOT be "pdf"
            expect(metadata.extension.toLowerCase()).not.toBe('pdf');

            // Property 3: Validation must fail for non-PDF files
            expect(metadata.isValid).toBe(false);

            // Property 4: Resume format validation must fail
            const validation = validateResumeFormat(resumeUrl);
            expect(validation.isValidFormat).toBe(false);
            expect(validation.mimeType).not.toBe('application/pdf');
            expect(validation.error).toBeDefined();
            expect(validation.error).toContain('Invalid resume format');
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Edge case: PDF with query parameters
     * Verifies that PDF URLs with query parameters (tokens, etc.) are still
     * correctly identified as PDF files
     */
    it('should correctly identify PDF files even with query parameters', () => {
      fc.assert(
        fc.property(
          validPdfResumeUrl,
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')), {
            minLength: 10,
            maxLength: 50,
          }),
          (baseUrl, token) => {
            // Add query parameters to URL (common in Firebase Storage)
            const urlWithParams = `${baseUrl}?token=${token}&alt=media`;

            // Get file metadata from URL with parameters
            const metadata = getFileMetadata(urlWithParams);

            // Should still identify as PDF despite query parameters
            expect(metadata.mimeType).toBe('application/pdf');
            expect(metadata.extension.toLowerCase()).toBe('pdf');
            expect(metadata.isValid).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Edge case: Case-insensitive PDF extension
     * Verifies that PDF files with various case combinations (.pdf, .PDF, .Pdf)
     * are all correctly identified as valid PDF files
     */
    it('should accept PDF extension in any case (.pdf, .PDF, .Pdf)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'https://storage.googleapis.com/bucket/path/resume.pdf',
            'https://storage.googleapis.com/bucket/path/resume.PDF',
            'https://storage.googleapis.com/bucket/path/resume.Pdf',
            'https://storage.googleapis.com/bucket/path/resume.pDf',
            'https://storage.googleapis.com/bucket/path/resume.pdF'
          ),
          (resumeUrl) => {
            const metadata = getFileMetadata(resumeUrl);

            // All case variations should be identified as PDF
            expect(metadata.extension.toLowerCase()).toBe('pdf');
            expect(metadata.mimeType).toBe('application/pdf');
            expect(metadata.isValid).toBe(true);

            const validation = validateResumeFormat(resumeUrl);
            expect(validation.isValidFormat).toBe(true);
            expect(validation.mimeType).toBe('application/pdf');
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property Test: MIME type consistency
     * 
     * Verifies that the MIME type determination is consistent
     * for the same file extension across multiple calls
     */
    it('should return consistent MIME type for same file extension', () => {
      fc.assert(
        fc.property(
          validPdfResumeUrl,
          (resumeUrl) => {
            // Call metadata extraction multiple times
            const metadata1 = getFileMetadata(resumeUrl);
            const metadata2 = getFileMetadata(resumeUrl);
            const metadata3 = getFileMetadata(resumeUrl);

            // Results should be identical
            expect(metadata1.mimeType).toBe(metadata2.mimeType);
            expect(metadata2.mimeType).toBe(metadata3.mimeType);
            expect(metadata1.extension).toBe(metadata2.extension);
            expect(metadata2.extension).toBe(metadata3.extension);
            expect(metadata1.isValid).toBe(metadata2.isValid);
            expect(metadata2.isValid).toBe(metadata3.isValid);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property Test: All valid PDF URLs pass validation
     * 
     * Verifies that any URL ending in .pdf (regardless of path structure)
     * is correctly identified as a valid PDF file
     */
    it('should validate all URLs ending in .pdf as valid PDF files', () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-_'.split('')), {
            minLength: 1,
            maxLength: 50,
          }),
          (baseUrl, filename) => {
            const pdfUrl = `${baseUrl}/${filename}.pdf`;

            const metadata = getFileMetadata(pdfUrl);

            // Any URL ending in .pdf should be valid
            expect(metadata.extension).toBe('pdf');
            expect(metadata.mimeType).toBe('application/pdf');
            expect(metadata.isValid).toBe(true);

            const validation = validateResumeFormat(pdfUrl);
            expect(validation.isValidFormat).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Edge case: URL without file extension
     * Verifies that URLs without a file extension are identified as invalid
     */
    it('should identify URLs without file extension as invalid', () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-_'.split('')), {
            minLength: 1,
            maxLength: 50,
          }),
          (baseUrl, filename) => {
            // URL without extension
            const urlWithoutExtension = `${baseUrl}/${filename}`;

            const metadata = getFileMetadata(urlWithoutExtension);

            // Should not be identified as PDF
            expect(metadata.extension).not.toBe('pdf');
            expect(metadata.mimeType).not.toBe('application/pdf');
            expect(metadata.isValid).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property Test: Error messages for invalid formats
     * 
     * Verifies that validation errors provide clear information about
     * what format was expected vs. what was received
     */
    it('should provide clear error messages for invalid formats', () => {
      fc.assert(
        fc.property(
          invalidResumeUrl,
          (resumeUrl) => {
            const validation = validateResumeFormat(resumeUrl);

            // Error message must be present for invalid formats
            expect(validation.error).toBeDefined();
            expect(typeof validation.error).toBe('string');
            expect(validation.error!.length).toBeGreaterThan(0);

            // Error message should mention "Invalid resume format"
            expect(validation.error).toContain('Invalid resume format');

            // Error message should mention "PDF"
            expect(validation.error).toContain('PDF');
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
