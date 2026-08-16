import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  });

  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("access_token")
  );

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);

    try {
      const response = await api.post(
        "login/",
        {
          email,
          password,
        }
      );

      const data = response.data;

      localStorage.setItem(
        "access_token",
        data.access
      );

      localStorage.setItem(
        "refresh_token",
        data.refresh
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setAccessToken(data.access);
      setUser(data.user);

      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    setAccessToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common.Authorization =
        `Bearer ${accessToken}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        logout,
        isAuthenticated: !!accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};