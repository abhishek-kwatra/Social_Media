import { createContext, useContext, useReducer, useEffect } from "react";
import axios from 'axios';

const AuthContext = createContext(undefined);

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload, isAuthenticated: true };
    case "LOGOUT":
      return { user: null, isAuthenticated: false };
    case "UPDATE_PROFILE":
      return state.user
        ? { ...state, user: { ...state.user, ...action.payload } }
        : state;
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      dispatch({ type: "LOGIN", payload: JSON.parse(savedUser) });
    }
  }, []);
  const login = async (email, password) => {
  try {
    const response = await axios.post(
      "https://social-media-backend-wlpj.onrender.com", 
      { email, password },
    );

    if (response.status === 200) {
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("currentUser", JSON.stringify(response.data.user));

      dispatch({ type: "LOGIN", payload: response.data.user });

      return ;
    } else {
      throw new Error("Login failed. Please try again.");
    }
  } catch (error) {
    console.error("Login error:", error);
    return ;
  }
};

const signup = async (email, password, name, profile_pic) => {
  try {
    // Call backend API using axios
    const response = await axios.post(
      "https://social-media-backend-wlpj.onrender.com", 
      { email, password, name, profile_pic},
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, 
      }
    );

    if (response.status === 201) {
      const { accessToken, user } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("currentUser", JSON.stringify(user));

      dispatch({ type: "LOGIN", payload: user });

      return ;
    } else {
      console.error("Signup failed:", response.data.message || "Registration error");
      return ;
    }
  } catch (error) {
    console.error("Signup error:", error.response?.data?.message || error.message);
    return ;
  }
};


  const logout = () => {
    dispatch({ type: "LOGOUT" });
    localStorage.removeItem("currentUser");
  };

  const updateProfile = (updates) => {
    if (!state.user) return;

    const updatedUser = { ...state.user, ...updates };
    dispatch({ type: "UPDATE_PROFILE", payload: updates });

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u) => u.id === state.user?.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
