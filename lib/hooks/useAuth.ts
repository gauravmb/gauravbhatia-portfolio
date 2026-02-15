/**
 * Custom hook for Firebase Authentication management
 * 
 * This hook manages Firebase Auth state and provides authentication functions
 * for the admin interface. It handles user login, logout, and authentication
 * state changes with automatic token management.
 * 
 * Key features:
 * - Real-time authentication state tracking
 * - Login/logout functions with error handling
 * - Automatic token refresh
 * - Loading state management during auth operations
 * 
 * Requirements: 11.4
 */

import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Authentication state interface
 */
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Authentication hook return type
 */
interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing Firebase Authentication state
 * 
 * Provides authentication state and functions for login/logout operations.
 * Automatically tracks authentication state changes and manages loading states.
 * 
 * The hook listens to Firebase Auth state changes and updates the user object
 * whenever the authentication state changes (login, logout, token refresh).
 * 
 * @returns Object containing:
 *   - user: Current authenticated user (null if not authenticated)
 *   - loading: Boolean indicating if auth state is being determined
 *   - error: Error message from login/logout operations (null if no error)
 *   - login: Function to authenticate with email/password
 *   - logout: Function to sign out the current user
 *   - clearError: Function to clear error state
 * 
 * @example
 * ```tsx
 * function LoginPage() {
 *   const { user, loading, error, login } = useAuth();
 *   const [email, setEmail] = useState('');
 *   const [password, setPassword] = useState('');
 * 
 *   if (loading) return <LoadingSpinner />;
 *   if (user) return <Navigate to="/admin/dashboard" />;
 * 
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     await login(email, password);
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {error && <ErrorMessage message={error} />}
 *       <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
 *       <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
 *       <button type="submit">Login</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setAuthState({
          user,
          loading: false,
          error: null,
        });
      },
      (error) => {
        console.error('Auth state change error:', error);
        setAuthState({
          user: null,
          loading: false,
          error: error.message,
        });
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Authenticates user with email and password
   * 
   * Uses Firebase signInWithEmailAndPassword to authenticate.
   * Updates auth state on success or sets error message on failure.
   * 
   * @param email - User's email address
   * @param password - User's password
   * @throws Error with user-friendly message if authentication fails
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      
      await signInWithEmailAndPassword(auth, email, password);
      
      // Auth state will be updated by onAuthStateChanged listener
    } catch (error: any) {
      // Map Firebase error codes to user-friendly messages
      let errorMessage = 'Failed to login. Please try again.';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      throw new Error(errorMessage);
    }
  };

  /**
   * Signs out the current user
   * 
   * Uses Firebase signOut to end the user's session.
   * Updates auth state on success or sets error message on failure.
   * 
   * @throws Error with user-friendly message if sign out fails
   */
  const logout = async (): Promise<void> => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      
      await signOut(auth);
      
      // Auth state will be updated by onAuthStateChanged listener
    } catch (error: any) {
      const errorMessage = 'Failed to logout. Please try again.';
      
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      
      throw new Error(errorMessage);
    }
  };

  /**
   * Clears the current error state
   * 
   * Useful for dismissing error messages after user acknowledges them.
   */
  const clearError = (): void => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    logout,
    clearError,
  };
}
