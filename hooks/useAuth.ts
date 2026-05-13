// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
// }

// interface AuthState {
//   user: User | null;
//   token: string | null;
//   isLoading: boolean;
//   isAuthenticated: boolean;
// }

// export function useAuth() {
//   const router = useRouter();
//   const [authState, setAuthState] = useState<AuthState>({
//     user: null,
//     token: null,
//     isLoading: true,
//     isAuthenticated: false,
//   });

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     const userStr = localStorage.getItem('user');

//     if (token && userStr) {
//       try {
//         const user = JSON.parse(userStr);
//         setAuthState({
//           user,
//           token,
//           isLoading: false,
//           isAuthenticated: true,
//         });
//       } catch {
//         setAuthState({
//           user: null,
//           token: null,
//           isLoading: false,
//           isAuthenticated: false,
//         });
//       }
//     } else {
//       setAuthState({
//         user: null,
//         token: null,
//         isLoading: false,
//         isAuthenticated: false,
//       });
//     }
//   }, []);

//   const login = useCallback(
//     async (email: string, password: string) => {
//       const response = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         localStorage.setItem('token', data.data.token);
//         localStorage.setItem('user', JSON.stringify(data.data.user));
//         document.cookie = `token=${data.data.token}; path=/`;

//         setAuthState({
//           user: data.data.user,
//           token: data.data.token,
//           isLoading: false,
//           isAuthenticated: true,
//         });

//         router.push('/dashboard');
//         return { success: true };
//       }

//       return { success: false, error: data.error };
//     },
//     [router]
//   );

//   const logout = useCallback(() => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

//     setAuthState({
//       user: null,
//       token: null,
//       isLoading: false,
//       isAuthenticated: false,
//     });

//     router.push('/login');
//   }, [router]);

//   const getAuthHeaders = useCallback(() => {
//     return {
//       Authorization: authState.token ? `Bearer ${authState.token}` : '',
//       'Content-Type': 'application/json',
//     };
//   }, [authState.token]);

//   return {
//     ...authState,
//     login,
//     logout,
//     getAuthHeaders,
//   };
// }
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // ✅ Token sirf cookie mein hoga (HttpOnly) — user info localStorage mein
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({ user, isLoading: false, isAuthenticated: true });
      } catch {
        setAuthState({ user: null, isLoading: false, isAuthenticated: false });
      }
    } else {
      setAuthState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ HttpOnly cookie receive karne ke liye
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // ✅ Token backend cookie mein set hoga — yahan sirf user info save karo
        localStorage.setItem('user', JSON.stringify(data.data.user));

        setAuthState({
          user: data.data.user,
          isLoading: false,
          isAuthenticated: true,
        });

        router.push('/dashboard');
        router.refresh();
        return { success: true };
      }

      return { success: false, error: data.message || 'Login failed' };
    },
    [router]
  );

  const logout = useCallback(async () => {
    // ✅ Server se cookie delete karwao
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    localStorage.removeItem('user');

    setAuthState({ user: null, isLoading: false, isAuthenticated: false });
    router.push('/login');
  }, [router]);

  const getAuthHeaders = useCallback(() => {
    return { 'Content-Type': 'application/json' };
    // ✅ Token header mein bhejne ki zaroorat nahi — cookie automatically jayegi
  }, []);

  return {
    ...authState,
    login,
    logout,
    getAuthHeaders,
  };
}