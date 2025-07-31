export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    isAdmin: boolean;
  } | null;
}

export const getStoredAuth = (): AuthState => {
  try {
    const stored = localStorage.getItem("taste-of-pi-user");
    if (stored) {
      const user = JSON.parse(stored);
      return {
        isAuthenticated: true,
        user
      };
    }
  } catch (error) {
    localStorage.removeItem("taste-of-pi-user");
  }
  
  return {
    isAuthenticated: false,
    user: null
  };
};

export const setStoredAuth = (user: AuthState['user']) => {
  if (user) {
    localStorage.setItem("taste-of-pi-user", JSON.stringify(user));
  } else {
    localStorage.removeItem("taste-of-pi-user");
  }
};

export const clearStoredAuth = () => {  
  localStorage.removeItem("taste-of-pi-user");
  localStorage.removeItem("customer-info");
};

export const isAdminUser = (user?: AuthState['user'] | null): boolean => {
  return user?.isAdmin === true;
};

// Phone number validation
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone.trim());
};

// OTP validation
export const validateOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

// Generate mock OTP for demonstration
export const generateMockOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
