import { apiRequest } from "./api";
import { setAuthToken, clearAuthToken, getAuthToken } from "@/lib/auth-token";
import type { User } from "@/types";

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface BackendUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  created_at: string;
}

function mapUser(u: BackendUser): User {
  return { id: u.id, name: u.name, email: u.email };
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const res = await apiRequest<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.access_token);
    return authService.me();
  },

  async signup(name: string, email: string, password: string): Promise<User> {
    const res = await apiRequest<TokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setAuthToken(res.access_token);
    return authService.me();
  },

  async me(): Promise<User> {
    const u = await apiRequest<BackendUser>("/auth/me");
    return mapUser(u);
  },

  isAuthenticated(): boolean {
    return !!getAuthToken();
  },

  logout(): void {
    // Backend has no /auth/logout route (stateless JWT) - just drop the local token.
    clearAuthToken();
  },
};
