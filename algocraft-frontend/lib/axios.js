// src/lib/axios.js
import axios from 'axios';
import { getCookie, deleteCookie } from 'cookies-next'; // Import deleteCookie for global 401 handling

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api', // Use environment variable
});

// Request interceptor to attach the JWT token
api.interceptors.request.use(
    (config) => {
        const token = getCookie('jwtToken'); // Get token from cookie

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: Response interceptor for handling 401 errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized, e.g., redirect to login, clear cookies
            if (typeof window !== 'undefined') { // Ensure this runs only on client-side
                console.warn('Unauthorized API call, logging out...');
                // Clear the token and user data from cookies
                deleteCookie('jwtToken');
                deleteCookie('currentUser');
                // You might also want to trigger a logout function from your AuthContext here
                // if it's accessible globally or via a custom event.
                // For now, relying on AuthProvider's useEffect to detect missing token
                // and potentially redirect, or for a component to call logout from useAuth().
            }
        }
        return Promise.reject(error);
    }
);

export default api;