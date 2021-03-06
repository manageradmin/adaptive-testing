import React, { useState, useCallback } from 'react';

import { AuthData, LoginData } from 'types';
import { login as loginRequest, register as registerRequest } from 'api/auth';

const getAuthDataFromStorage = (): AuthData | undefined => {
  try {
    const string = localStorage.getItem('authData');
    if (string === null) return;
    return JSON.parse(string);
  } catch (err) {
    return;
  }
};

interface AuthContextValues {
  authorized: boolean;
  authData?: AuthData;
  setAuthData: React.Dispatch<React.SetStateAction<AuthData | undefined>>;
  login: (data: LoginData) => Promise<void>;
  register: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext({} as AuthContextValues);

export const AuthContextWrapper = ({ children }) => {
  const [authData, setAuthData] = useState<AuthData | undefined>(getAuthDataFromStorage());
  const authorized = Boolean(authData);

  const login = async (data: LoginData) => {
    const authData = await loginRequest(data);
    setAuthData(authData);
    localStorage.setItem('authData', JSON.stringify(authData));
    localStorage.setItem('authToken', `Bearer ${authData.token}`);
  };

  const register = async (data: LoginData) => {
    const authData = await registerRequest(data);
    setAuthData(authData);
    localStorage.setItem('authData', JSON.stringify(authData));
    localStorage.setItem('authToken', `Bearer ${authData.token}`);
  };

  const logout = useCallback(async () => {
    setAuthData(undefined);
    localStorage.clear();
  }, []);

  const values: AuthContextValues = {
    authorized,
    authData,
    setAuthData,
    login,
    register,
    logout
  };
  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

export default AuthContext;
