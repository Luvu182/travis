const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await res.json();
  return data.user;
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include',
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

export async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}
