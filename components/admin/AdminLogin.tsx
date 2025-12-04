import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@merlano.com') {
      onLogin();
    } else {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div className="min-h-screen bg-black pt-4 pb-12 flex items-center justify-center">
      <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 p-8">
        <h1 className="text-2xl font-light text-white mb-6 text-center uppercase tracking-widest">
          Panel de Administración
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-white text-black py-3 uppercase tracking-widest text-sm font-medium hover:bg-zinc-200 transition-colors"
          >
            Iniciar Sesión
          </button>
        </form>
        <button
          onClick={onBack}
          className="w-full mt-4 text-zinc-500 hover:text-white transition-colors text-sm"
        >
          ← Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
