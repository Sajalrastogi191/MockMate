import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('mm_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            api.get('/auth/me')
                .then(res => setUser(res.data.user))
                .catch(() => logout())
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = ({ token: t, user: u }) => {
        localStorage.setItem('mm_token', t);
        api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
        setToken(t);
        setUser(u);
    };

    const logout = () => {
        localStorage.removeItem('mm_token');
        delete api.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
