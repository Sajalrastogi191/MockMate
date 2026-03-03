import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewInterview from './pages/NewInterview';
import Analysis from './pages/Analysis';
import InterviewQuestion from './pages/InterviewQuestion';
import EvaluationResult from './pages/EvaluationResult';
import Summary from './pages/Summary';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function ProtectedRoute({ children }) {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <div className="min-h-screen">
            <Navbar />
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/interview/new" element={<ProtectedRoute><NewInterview /></ProtectedRoute>} />
                <Route path="/interview/:sessionId/analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
                <Route path="/interview/:sessionId/question/:qIndex" element={<ProtectedRoute><InterviewQuestion /></ProtectedRoute>} />
                <Route path="/interview/:sessionId/result/:qIndex" element={<ProtectedRoute><EvaluationResult /></ProtectedRoute>} />
                <Route path="/interview/:sessionId/summary" element={<ProtectedRoute><Summary /></ProtectedRoute>} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}
