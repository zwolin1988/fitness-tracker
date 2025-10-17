/**
 * Unit tests for navigation utilities
 * Tests cover auth state management and user profile handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getUserSession,
  getUserProfile,
  isUserAdmin,
  getNavigationState,
  getMobileMenuId,
  getNavigationClass,
  type UserProfile,
} from "./navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

// Mock Supabase client factory
const createMockSupabaseClient = () => {
  return {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  } as unknown as SupabaseClient;
};

describe("Navigation Utilities", () => {
  describe("getUserSession", () => {
    let mockSupabase: SupabaseClient;

    beforeEach(() => {
      mockSupabase = createMockSupabaseClient();
    });

    it("should return user when session exists", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        aud: "authenticated",
        role: "authenticated",
      };

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await getUserSession(mockSupabase);

      expect(result).toEqual(mockUser);
      expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1);
    });

    it("should return null when no user is logged in", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getUserSession(mockSupabase);

      expect(result).toBeNull();
    });

    it("should return null and log error in dev mode when auth fails", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Mock DEV environment
      vi.stubGlobal("import", {
        meta: {
          env: {
            DEV: true,
          },
        },
      });

      const mockError = new Error("Auth error");
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const result = await getUserSession(mockSupabase);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error getting user session:", mockError);

      consoleErrorSpy.mockRestore();
    });

    it("should handle network errors gracefully", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockRejectedValue(new Error("Network error"));

      const result = await getUserSession(mockSupabase);

      expect(result).toBeNull();
    });
  });

  describe("getUserProfile", () => {
    let mockSupabase: SupabaseClient;

    beforeEach(() => {
      mockSupabase = createMockSupabaseClient();
    });

    it("should return user profile with admin role", async () => {
      const mockProfile: UserProfile = {
        name: "John Doe",
        role: "admin",
      };

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockFrom as any);

      const result = await getUserProfile(mockSupabase, "user-123");

      expect(result).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
      expect(mockFrom.select).toHaveBeenCalledWith("name, role");
      expect(mockFrom.eq).toHaveBeenCalledWith("user_id", "user-123");
      expect(mockFrom.single).toHaveBeenCalledTimes(1);
    });

    it("should return user profile with regular user role", async () => {
      const mockProfile: UserProfile = {
        name: "Jane Smith",
        role: "user",
      };

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockFrom as any);

      const result = await getUserProfile(mockSupabase, "user-456");

      expect(result).toEqual(mockProfile);
      expect(result?.role).toBe("user");
    });

    it("should return null when profile not found", async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Profile not found" },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockFrom as any);

      const result = await getUserProfile(mockSupabase, "non-existent-user");

      expect(result).toBeNull();
    });

    it("should handle database errors gracefully", async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(new Error("Database connection error")),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockFrom as any);

      const result = await getUserProfile(mockSupabase, "user-123");

      expect(result).toBeNull();
    });

    it("should return profile with null name", async () => {
      const mockProfile: UserProfile = {
        name: null,
        role: "user",
      };

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockFrom as any);

      const result = await getUserProfile(mockSupabase, "user-123");

      expect(result).toEqual(mockProfile);
      expect(result?.name).toBeNull();
    });
  });

  describe("isUserAdmin", () => {
    it("should return true for admin role", () => {
      const adminProfile: UserProfile = {
        name: "Admin User",
        role: "admin",
      };

      expect(isUserAdmin(adminProfile)).toBe(true);
    });

    it("should return false for regular user role", () => {
      const userProfile: UserProfile = {
        name: "Regular User",
        role: "user",
      };

      expect(isUserAdmin(userProfile)).toBe(false);
    });

    it("should return false for null profile", () => {
      expect(isUserAdmin(null)).toBe(false);
    });

    it("should return false for undefined profile", () => {
      expect(isUserAdmin(undefined as any)).toBe(false);
    });
  });

  describe("getNavigationState", () => {
    let mockSupabase: SupabaseClient;

    beforeEach(() => {
      mockSupabase = createMockSupabaseClient();
    });

    it("should return logged-in state with admin role", async () => {
      const mockUser = {
        id: "admin-123",
        email: "admin@example.com",
        aud: "authenticated",
        role: "authenticated",
      };

      const mockProfile: UserProfile = {
        name: "Admin User",
        role: "admin",
      };

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockFrom as any);

      const result = await getNavigationState(mockSupabase);

      expect(result).toEqual({
        user: {
          id: "admin-123",
          email: "admin@example.com",
        },
        profile: mockProfile,
        isAdmin: true,
        isLoggedIn: true,
      });
    });

    it("should return logged-in state with regular user role", async () => {
      const mockUser = {
        id: "user-123",
        email: "user@example.com",
        aud: "authenticated",
        role: "authenticated",
      };

      const mockProfile: UserProfile = {
        name: "Regular User",
        role: "user",
      };

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockFrom as any);

      const result = await getNavigationState(mockSupabase);

      expect(result).toEqual({
        user: {
          id: "user-123",
          email: "user@example.com",
        },
        profile: mockProfile,
        isAdmin: false,
        isLoggedIn: true,
      });
    });

    it("should return logged-out state when no user", async () => {
      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getNavigationState(mockSupabase);

      expect(result).toEqual({
        user: null,
        profile: null,
        isAdmin: false,
        isLoggedIn: false,
      });
    });

    it("should return logged-out state when supabase is null", async () => {
      const result = await getNavigationState(null);

      expect(result).toEqual({
        user: null,
        profile: null,
        isAdmin: false,
        isLoggedIn: false,
      });
    });

    it("should handle partial profile data", async () => {
      const mockUser = {
        id: "user-123",
        email: "user@example.com",
        aud: "authenticated",
        role: "authenticated",
      };

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Profile fetch fails
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Profile not found" },
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockFrom as any);

      const result = await getNavigationState(mockSupabase);

      expect(result).toEqual({
        user: {
          id: "user-123",
          email: "user@example.com",
        },
        profile: null,
        isAdmin: false,
        isLoggedIn: true,
      });
    });

    it("should handle user without email", async () => {
      const mockUser = {
        id: "user-123",
        aud: "authenticated",
        role: "authenticated",
      };

      const mockProfile: UserProfile = {
        name: "User",
        role: "user",
      };

      vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      };

      vi.mocked(mockSupabase.from).mockReturnValue(mockFrom as any);

      const result = await getNavigationState(mockSupabase);

      expect(result.user?.email).toBeUndefined();
      expect(result.isLoggedIn).toBe(true);
    });
  });

  describe("getMobileMenuId", () => {
    it("should return mobile-menu id when logged in", () => {
      expect(getMobileMenuId(true)).toBe("mobile-menu");
    });

    it("should return empty string when not logged in", () => {
      expect(getMobileMenuId(false)).toBe("");
    });
  });

  describe("getNavigationClass", () => {
    it("should return admin gradient classes for admin users", () => {
      const result = getNavigationClass(true);

      expect(result).toContain("border-b border-border sticky top-0 z-50");
      expect(result).toContain("bg-gradient-to-r from-primary/10 to-primary/5");
      expect(result).not.toContain("bg-background");
    });

    it("should return regular background for non-admin users", () => {
      const result = getNavigationClass(false);

      expect(result).toContain("border-b border-border sticky top-0 z-50");
      expect(result).toContain("bg-background");
      expect(result).not.toContain("bg-gradient-to-r");
    });

    it("should always include base navigation classes", () => {
      expect(getNavigationClass(true)).toContain("sticky top-0 z-50");
      expect(getNavigationClass(false)).toContain("sticky top-0 z-50");
    });
  });
});

describe("Navigation Utilities - Integration", () => {
  it("should correctly determine admin state through full flow", async () => {
    const mockSupabase = createMockSupabaseClient();

    const mockUser = {
      id: "admin-123",
      email: "admin@example.com",
      aud: "authenticated",
      role: "authenticated",
    };

    const mockProfile: UserProfile = {
      name: "Super Admin",
      role: "admin",
    };

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    vi.mocked(mockSupabase.from).mockReturnValue(mockFrom as any);

    // Get navigation state
    const navState = await getNavigationState(mockSupabase);

    // Verify admin detection
    expect(navState.isAdmin).toBe(true);
    expect(isUserAdmin(navState.profile)).toBe(true);

    // Verify UI classes
    const navClass = getNavigationClass(navState.isAdmin);
    expect(navClass).toContain("bg-gradient-to-r");

    // Verify mobile menu
    const menuId = getMobileMenuId(navState.isLoggedIn);
    expect(menuId).toBe("mobile-menu");
  });

  it("should correctly determine regular user state through full flow", async () => {
    const mockSupabase = createMockSupabaseClient();

    const mockUser = {
      id: "user-123",
      email: "user@example.com",
      aud: "authenticated",
      role: "authenticated",
    };

    const mockProfile: UserProfile = {
      name: "Regular User",
      role: "user",
    };

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: mockProfile,
        error: null,
      }),
    };

    vi.mocked(mockSupabase.from).mockReturnValue(mockFrom as any);

    // Get navigation state
    const navState = await getNavigationState(mockSupabase);

    // Verify regular user detection
    expect(navState.isAdmin).toBe(false);
    expect(isUserAdmin(navState.profile)).toBe(false);

    // Verify UI classes
    const navClass = getNavigationClass(navState.isAdmin);
    expect(navClass).toContain("bg-background");

    // Verify mobile menu
    const menuId = getMobileMenuId(navState.isLoggedIn);
    expect(menuId).toBe("mobile-menu");
  });

  it("should handle logged-out state correctly", async () => {
    const mockSupabase = createMockSupabaseClient();

    vi.mocked(mockSupabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const navState = await getNavigationState(mockSupabase);

    expect(navState.isLoggedIn).toBe(false);
    expect(navState.isAdmin).toBe(false);
    expect(getMobileMenuId(navState.isLoggedIn)).toBe("");
  });
});
