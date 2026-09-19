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


  // =========================================
  // Login
  // =========================================

  const login = async (email, password) => {

    setLoading(true);

    try {

      const response = await api.post(
        "auth/login/",
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


  // =========================================
  // Logout
  // =========================================

  const logout = async () => {

    const refreshToken =
      localStorage.getItem("refresh_token");


    try {

      // Call backend logout API
      if (refreshToken) {

        await api.post(
          "auth/logout/",
          {
            refresh: refreshToken,
          }
        );

      }

    } catch (error) {

      console.error(
        "Logout API failed:",
        error
      );

      // Even if backend logout fails,
      // we still clear the local session.

    } finally {

      // Clear local authentication data

      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "refresh_token"
      );

      localStorage.removeItem(
        "user"
      );


      // Clear axios authorization header

      delete api.defaults.headers.common.Authorization;


      // Clear React authentication state

      setAccessToken(null);
      setUser(null);

    }
  };


  // =========================================
  // Set Authorization Header
  // =========================================

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