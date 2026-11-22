import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sql, isNeonConfigured } from '../services/neonClient';
import { useAudio } from './AudioContext';

const AuthContext = createContext(null);

const AUTH_USER_KEY = 'ubh_auth_user';
const USERS_DB_KEY = 'ubh_registered_users';

// Pre-seeded users for standalone testing & evaluation
const SEED_USERS = [
  {
    id: 'user-admin-01',
    email: 'admin@ubanharkalla.com',
    password: 'admin123',
    full_name: 'UBAN HARKALLA Super Admin',
    phone_number: '08123456789',
    role: 'super_admin',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-customer-01',
    email: 'customer@ubanharkalla.com',
    password: 'customer123',
    full_name: 'Musa Abdullahi',
    phone_number: '08098765432',
    role: 'customer',
    is_active: true,
    created_at: '2026-01-02T00:00:00Z',
  },
  {
    id: 'user-cust-a',
    email: 'abubakar@test.ng',
    password: 'Password123!',
    full_name: 'Abubakar Garba',
    phone_number: '08031234567',
    role: 'customer',
    is_active: true,
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'user-cust-b',
    email: 'chidi@test.ng',
    password: 'Password123!',
    full_name: 'Chidi Eze',
    phone_number: '08129876543',
    role: 'customer',
    is_active: true,
    created_at: '2026-02-10T00:00:00Z',
  },
  {
    id: 'user-cust-s',
    email: 'suspended@test.ng',
    password: 'Password123!',
    full_name: 'Suspended Account',
    phone_number: '07011223344',
    role: 'customer',
    is_active: false,
    created_at: '2026-03-01T00:00:00Z',
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { triggerAuthWelcomePlayback } = useAudio();

  // Load existing session on initial mount
  useEffect(() => {
    async function initAuth() {
      try {
        const stored = localStorage.getItem(AUTH_USER_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setProfile(parsed);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  // Customer Sign Up
  const signUp = useCallback(async ({ fullName, email, phone, password }) => {
    // Basic validations
    if (!fullName?.trim()) throw new Error('Full Name is required.');
    if (!email || !/\S+@\S+\.\S+/.test(email)) throw new Error('Valid email address is required.');
    if (!phone || phone.length < 10) throw new Error('Valid Nigerian phone number is required.');
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');

    if (isNeonConfigured && sql) {
      try {
        const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
        if (existing && existing.length > 0) {
          throw new Error('An account with this email address already exists. Please login.');
        }
        const createdUsers = await sql`
          INSERT INTO users (full_name, email, phone_number, password_hash, role, is_active)
          VALUES (${fullName}, ${email.toLowerCase()}, ${phone}, ${password}, 'customer', true)
          RETURNING id, full_name, email, phone_number, role, is_active, created_at
        `;
        if (createdUsers && createdUsers.length > 0) {
          const created = createdUsers[0];
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(created));
          setUser(created);
          setProfile(created);

          // Sync into local CUSTOMERS storage immediately
          try {
            const rawCust = localStorage.getItem('ubh_customers');
            const currentCust = rawCust ? JSON.parse(rawCust) : [];
            const cleanCust = currentCust.filter(
              (c) =>
                c.id !== 'cust-1' &&
                c.id !== 'cust-2' &&
                c.email !== 'aliyu.haruna@example.com' &&
                c.email !== 'fatima.bello@example.com' &&
                c.email?.toLowerCase() !== created.email.toLowerCase()
            );
            const newCustEntry = {
              id: created.id,
              full_name: created.full_name,
              email: created.email,
              phone_number: created.phone_number,
              role: created.role || 'customer',
              total_orders: 0,
              total_spent: 0,
              is_active: true,
              created_at: created.created_at || new Date().toISOString(),
            };
            localStorage.setItem('ubh_customers', JSON.stringify([newCustEntry, ...cleanCust]));
          } catch (e) {
            console.warn('Sync customer cache error:', e);
          }

          triggerAuthWelcomePlayback(`signup-${Date.now()}`);
          return true;
        }
      } catch (err) {
        if (err.message?.includes('already exists')) throw err;
        console.warn('Neon signup warning, using local mode:', err);
      }
    }

    // Local fallback
    const registered = JSON.parse(localStorage.getItem(USERS_DB_KEY) || JSON.stringify(SEED_USERS));
    const existing = registered.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists. Please login.');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      password,
      full_name: fullName,
      phone_number: phone,
      role: 'customer',
      is_active: true,
      created_at: new Date().toISOString(),
    };
    registered.push(newUser);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(registered));
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));

    // Also sync into local CUSTOMERS storage
    try {
      const rawCust = localStorage.getItem('ubh_customers');
      const currentCust = rawCust ? JSON.parse(rawCust) : [];
      const cleanCust = currentCust.filter(
        (c) =>
          c.id !== 'cust-1' &&
          c.id !== 'cust-2' &&
          c.email !== 'aliyu.haruna@example.com' &&
          c.email !== 'fatima.bello@example.com' &&
          c.email?.toLowerCase() !== newUser.email.toLowerCase()
      );
      const newCustEntry = {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        phone_number: newUser.phone_number,
        role: 'customer',
        total_orders: 0,
        total_spent: 0,
        is_active: true,
        created_at: newUser.created_at,
      };
      localStorage.setItem('ubh_customers', JSON.stringify([newCustEntry, ...cleanCust]));
    } catch (e) {
      console.warn('Sync customer cache error:', e);
    }

    setUser(newUser);
    setProfile(newUser);

    // Trigger one-time brand audio welcome on successful sign-up
    triggerAuthWelcomePlayback(`signup-${Date.now()}`);
    return true;
  }, [triggerAuthWelcomePlayback]);

  // Login
  const login = useCallback(async ({ email, password }) => {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail || !password) throw new Error('Please enter both email and password.');

    if (isNeonConfigured && sql) {
      try {
        const rows = await sql`
          SELECT id, full_name, email, phone_number, role, COALESCE(is_active, true) as is_active, created_at
          FROM users
          WHERE LOWER(TRIM(email)) = ${cleanEmail} AND password_hash = ${password}
        `;
        if (rows && rows.length > 0) {
          const userFound = rows[0];
          if (userFound.is_active === false) {
            throw new Error('Your customer account has been suspended. Please contact customer support.');
          }
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userFound));
          setUser(userFound);
          setProfile(userFound);
          triggerAuthWelcomePlayback(`login-${Date.now()}`);
          return true;
        }
      } catch (err) {
        if (err.message?.includes('suspended')) throw err;
        console.warn('Neon login warning, using local mode:', err);
      }
    }

    const registered = JSON.parse(localStorage.getItem(USERS_DB_KEY) || JSON.stringify(SEED_USERS));
    const matched = registered.find(
      (u) => u.email.trim().toLowerCase() === cleanEmail && u.password === password
    );
    if (!matched) {
      throw new Error('Invalid email or password. Please try again.');
    }
    if (matched.is_active === false) {
      throw new Error('Your customer account has been suspended. Please contact customer support.');
    }
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(matched));
    setUser(matched);
    setProfile(matched);

    // Trigger one-time brand audio welcome on successful login
    triggerAuthWelcomePlayback(`login-${Date.now()}`);
    return true;
  }, [triggerAuthWelcomePlayback]);

  // Logout (MUST NOT TRIGGER AUDIO)
  const logout = useCallback(async () => {
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
    setProfile(null);
  }, []);

  // Admin Dedicated Login
  const adminLogin = useCallback(async ({ email, password }) => {
    await login({ email, password });
    // Verify admin role
    const current = JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null');
    if (current && current.role !== 'admin' && current.role !== 'super_admin') {
      logout();
      throw new Error('Access denied: You do not have administrative privileges.');
    }
    return true;
  }, [login, logout]);

  // Update Profile
  const updateProfile = useCallback(async (updates) => {
    if (!user) throw new Error('Not authenticated');

    const updated = { ...profile, ...updates };
    setProfile(updated);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));

    if (isNeonConfigured && sql) {
      try {
        await sql`
          UPDATE users
          SET full_name = ${updated.full_name || ''}, phone_number = ${updated.phone_number || ''}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${user.id}
        `;
      } catch (err) {
        console.warn('Neon update profile warning:', err);
      }
    } else {
      const registered = JSON.parse(localStorage.getItem(USERS_DB_KEY) || JSON.stringify(SEED_USERS));
      const idx = registered.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        registered[idx] = { ...registered[idx], ...updates };
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(registered));
      }
    }
    return updated;
  }, [user, profile]);

  // Password reset request
  const requestPasswordReset = useCallback(async (email) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      throw new Error('Please enter a valid email address.');
    }
    return true;
  }, []);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isSuperAdmin = profile?.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        isSuperAdmin,
        signUp,
        login,
        adminLogin,
        logout,
        updateProfile,
        requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
