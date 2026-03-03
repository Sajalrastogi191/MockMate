import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#1f2937',
                            color: '#fff',
                            border: '1px solid #374151',
                            borderRadius: '12px',
                            fontFamily: 'Inter, sans-serif',
                        },
                        success: { iconTheme: { primary: '#8b5cf6', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                    }}
                />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
