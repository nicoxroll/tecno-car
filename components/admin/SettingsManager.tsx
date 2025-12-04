import React from 'react';
import { X } from 'lucide-react';

const SettingsManager: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-light text-white uppercase tracking-tight">Configuración</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* General Settings */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-white text-base sm:text-lg mb-4 sm:mb-6 uppercase tracking-widest">Configuración General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Nombre de la Empresa</label>
              <input
                type="text"
                defaultValue="Merlano Tecnología Vehicular"
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Email de Contacto</label>
              <input
                type="email"
                defaultValue="info@merlanotecnologiavehicular.com"
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Teléfono</label>
              <input
                type="tel"
                defaultValue="+54 221 333 4444"
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Dirección</label>
              <input
                type="text"
                defaultValue="Calle 7 #4143 e 163 y 164, Berisso"
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-white text-base sm:text-lg mb-4 sm:mb-6 uppercase tracking-widest">Horarios de Atención</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Lunes</label>
                <input
                  type="text"
                  defaultValue="09:00 - 18:00"
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Martes</label>
                <input
                  type="text"
                  defaultValue="09:00 - 18:00"
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Miércoles</label>
                <input
                  type="text"
                  defaultValue="09:00 - 18:00"
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Jueves</label>
                <input
                  type="text"
                  defaultValue="09:00 - 18:00"
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Viernes</label>
                <input
                  type="text"
                  defaultValue="09:00 - 18:00"
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Sábado</label>
                <input
                  type="text"
                  defaultValue="Cerrado"
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-white text-base sm:text-lg mb-4 sm:mb-6 uppercase tracking-widest">Redes Sociales</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Instagram</label>
              <input
                type="url"
                defaultValue="https://instagram.com/merlanotecnologiavehicular"
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Facebook</label>
              <input
                type="url"
                defaultValue="https://facebook.com/merlanotecnologiavehicular"
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">WhatsApp</label>
              <input
                type="url"
                defaultValue="https://wa.me/5492213334444"
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-white text-base sm:text-lg mb-4 sm:mb-6 uppercase tracking-widest">Configuración del Sistema</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs sm:text-sm">Modo Mantenimiento</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-9 h-5 sm:w-11 sm:h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-white"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs sm:text-sm">Notificaciones por Email</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 sm:w-11 sm:h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-white"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs sm:text-sm">Backup Automático</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 sm:w-11 sm:h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-white"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6 sm:mt-8">
        <button className="bg-white text-black px-4 sm:px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors">
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default SettingsManager;
