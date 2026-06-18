"use client";

import { useState, useEffect, useCallback } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth");
      const data = await res.json();
      setIsAuthenticated(data.authenticated === true);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (password: string): Promise<boolean> => {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        const data = await res.json();
        if (data.success) {
          setIsAuthenticated(true);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { isAuthenticated, loading, login, logout };
}
