export function isAuthenticated(): boolean { // Added return type annotation
  return !!localStorage.getItem("token");
}