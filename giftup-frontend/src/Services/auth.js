import api from "./API";

export function isLoggedIn() {
  const token = localStorage.getItem("token");
  if (!token) {
    return false;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (payload.exp && payload.exp < currentTime) {
      localStorage.removeItem("token");
      return false;
    }
    
    return true;
  } catch (error) {
    localStorage.removeItem("token");
    return false;
  }
}

