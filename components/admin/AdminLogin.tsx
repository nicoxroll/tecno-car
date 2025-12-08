import React, { useState } from "react";
import { supabase } from "../../services/supabase";

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-4 pb-12 flex items-center justify-center">
      <div className="max-w-md w-full bg-black border border-zinc-800 p-8">
        <h1 className="text-2xl font-light text-white mb-6 text-center uppercase tracking-widest">
          Panel de Administración
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500"
              required
            />
          </div>
          <div>
            <label className="block text-zinc-400 text-sm mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-3 uppercase tracking-widest text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
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
