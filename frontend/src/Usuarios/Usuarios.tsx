import React, { useMemo, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  RotateCcw,
  Users,
  BarChart3,
  UserCircle,
  LogOut,
  Bell,
  HeartPulse,
  Plus,
  Search,
  Shield,
  UserCog,
  CheckCircle2,
  Pencil,
  Trash2,
  CircleOff,
} from 'lucide-react';

interface UsuariosProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: 'Administrador' | 'Encargado';
  estado: 'Activo' | 'Inactivo';
  ultimoAcceso: string;
}

const Usuarios: React.FC<UsuariosProps> = ({ onLogout, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const usuariosData: Usuario[] = [
    {
      id: 1,
      nombre: 'Juan Delgado Rodríguez',
      correo: 'juan.delgado@ejemplo.com',
      rol: 'Administrador',
      estado: 'Activo',
      ultimoAcceso: '8/3/2026',
    },
    {
      id: 2,
      nombre: 'María López Sánchez',
      correo: 'maria.lopez@ejemplo.com',
      rol: 'Encargado',
      estado: 'Activo',
      ultimoAcceso: '7/3/2026',
    },
    {
      id: 3,
      nombre: 'Pedro García Martínez',
      correo: 'pedro.garcia@ejemplo.com',
      rol: 'Encargado',
      estado: 'Activo',
      ultimoAcceso: '6/3/2026',
    },
    {
      id: 4,
      nombre: 'Laura Torres Méndez',
      correo: 'laura.torres@ejemplo.com',
      rol: 'Encargado',
      estado: 'Inactivo',
      ultimoAcceso: '14/2/2026',
    },
  ];

  const filteredUsers = useMemo(() => {
    return usuariosData.filter(
      (user) =>
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.correo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const activos = usuariosData.filter((u) => u.estado === 'Activo').length;
  const total = usuariosData.length;

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans relative overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-[#5ba4c7] flex flex-col p-6 h-full text-white shadow-xl">
        <div className="flex flex-col items-center mb-10 px-2">
          <img 
            src="/src/assets/logo.png" 
            alt="Palabras de Esperanza Logo" 
            className="w-full h-auto object-contain mb-2 drop-shadow-md"
          />
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => onNavigate('dashboard')} />
          <NavItem icon={<Package size={20} />} label="Inventario" onClick={() => onNavigate('inventario')} />
          <NavItem icon={<ArrowLeftRight size={20} />} label="Préstamos" onClick={() => onNavigate('prestamos')} />
          <NavItem icon={<RotateCcw size={20} />} label="Devoluciones" onClick={() => onNavigate('devoluciones')} />
          <NavItem icon={<Users size={20} />} label="Beneficiarios" onClick={() => onNavigate('beneficiarios')} />
          <NavItem icon={<BarChart3 size={20} />} label="Reportes" onClick={() => onNavigate('reportes')} />
          <NavItem icon={<UserCircle size={20} />} label="Usuarios" active onClick={() => onNavigate('usuarios')} />
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              JD
            </div>
            <div>
              <p className="text-sm font-bold text-white">Juan Delgado</p>
              <p className="text-[10px] text-white/70 font-medium">Administrador</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 text-white font-black text-sm px-2 transition-all w-full text-left hover:opacity-70"
          >
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">
            Sistema de Control de Inventarios
          </h1>
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        <div className="p-10 space-y-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Gestión de Usuarios</h2>
              <p className="text-slate-500 font-medium mt-1">
                Administrar usuarios y permisos del sistema
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#5ba4c7] hover:bg-[#4a8ba9] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#5ba4c7]/30 transition-all active:scale-[0.98]"
            >
              <Plus size={18} />
              <span>Nuevo Usuario</span>
            </button>
          </div>

          {/* Search + Active Users */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center">
              <div className="relative w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o correo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/5 focus:border-[#5ba4c7]/50 transition-all text-base"
                />
              </div>
            </div>

            <div className="bg-[#94d6c6] rounded-[32px] border border-[#94d6c6]/20 shadow-sm p-6 flex flex-col justify-between group hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-slate-900/70 uppercase tracking-widest">Usuarios Activos</p>
                <div className="w-10 h-10 rounded-xl bg-white/20 text-slate-900 flex items-center justify-center shadow-sm backdrop-blur-sm">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter">{activos}</h3>
                <p className="text-xs font-bold text-slate-900/50 mt-2">De {total} totales</p>
              </div>
            </div>
          </div>

          {/* Roles Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-[#ffe4c4] rounded-[40px] border border-[#ffe4c4]/20 shadow-sm p-8 group hover:shadow-md transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/20 text-slate-900 flex items-center justify-center shadow-sm backdrop-blur-sm">
                  <Shield size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Administrador</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <RolePermission text="Acceso completo al sistema" color="text-slate-900/70" iconColor="text-slate-900/80" />
                <RolePermission text="Gestión de usuarios y permisos" color="text-slate-900/70" iconColor="text-slate-900/80" />
                <RolePermission text="Configuración del sistema" color="text-slate-900/70" iconColor="text-slate-900/80" />
                <RolePermission text="Reportes y exportación de datos" color="text-slate-900/70" iconColor="text-slate-900/80" />
              </div>
            </div>

            <div className="bg-[#ff8a71] rounded-[40px] border border-[#ff8a71]/20 shadow-sm p-8 group hover:shadow-md transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/20 text-slate-900 flex items-center justify-center shadow-sm backdrop-blur-sm">
                  <UserCog size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Encargado</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <RolePermission text="Gestión de inventario" color="text-slate-900/70" iconColor="text-[#008080]" />
                <RolePermission text="Registro de préstamos y devoluciones" color="text-slate-900/70" iconColor="text-[#008080]" />
                <RolePermission text="Gestión de beneficiarios" color="text-slate-900/70" iconColor="text-[#008080]" />
                <RolePermission text="Consulta de reportes básicos" color="text-slate-900/70" iconColor="text-[#008080]" />
              </div>
            </div>
          </div>

          {/* Table */}
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Correo</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Último Acceso</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const initials = user.nombre
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('');

                    return (
                      <tr key={user.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#5ba4c7]/10 text-[#5ba4c7] font-bold text-xs flex items-center justify-center">
                              {initials}
                            </div>
                            <span className="text-sm font-medium text-slate-900">{user.nombre}</span>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">{user.correo}</td>

                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              user.rol === 'Administrador'
                                ? 'bg-[#ffe4c4] text-slate-900 border-[#ffe4c4]/50'
                                : 'bg-[#ff8a71] text-white border-[#ff8a71]/50'
                            }`}
                          >
                            {user.rol}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              user.estado === 'Activo'
                                ? 'bg-[#94d6c6] text-slate-900 border-[#94d6c6]/50'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {user.estado}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">{user.ultimoAcceso}</td>

                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-3">
                            <button className="text-[#5ba4c7] hover:bg-[#5ba4c7]/10 p-2 rounded-lg transition-colors" title="Editar">
                              <Pencil size={16} />
                            </button>

                            {user.estado === 'Activo' ? (
                              <button className="text-[#ffcc6f] hover:bg-[#ffcc6f]/10 p-2 rounded-lg transition-colors" title="Desactivar">
                                <CircleOff size={16} />
                              </button>
                            ) : (
                              <button className="text-[#94d6c6] hover:bg-[#94d6c6]/10 p-2 rounded-lg transition-colors" title="Activar">
                                <CheckCircle2 size={16} />
                              </button>
                            )}

                            <button className="text-[#ff8a71] hover:bg-[#ff8a71]/10 p-2 rounded-lg transition-colors" title="Eliminar">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* Modal Nuevo Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Nuevo Usuario</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Registra un nuevo usuario dentro del sistema
              </p>
            </div>

            <form
              className="p-8 space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                setIsModalOpen(false);
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nombre completo</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Delgado Rodríguez"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Contraseña</label>
                  <input
                    type="password"
                    placeholder="********"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Rol</label>
                  <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all">
                    <option>Administrador</option>
                    <option>Encargado</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Estado</label>
                  <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all">
                    <option>Activo</option>
                    <option>Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-8 py-3.5 text-sm font-bold text-white bg-[#5ba4c7] hover:bg-[#4a8ba9] rounded-2xl shadow-lg shadow-[#5ba4c7]/30 transition-all active:scale-[0.98]"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-black text-sm text-left ${active ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
  >
    <div className={`${active ? 'opacity-100' : 'opacity-60'}`}>
      {icon}
    </div>
    <span className="tracking-wide">{label}</span>
  </button>
);

const RolePermission = ({ 
  text, 
  color = "text-slate-900/70", 
  iconColor = "text-[#008080]" 
}: { 
  text: string; 
  color?: string; 
  iconColor?: string; 
}) => (
  <div className="flex items-center gap-2">
    <CheckCircle2 size={16} className={`${iconColor}`} />
    <span className={`${color}`}>{text}</span>
  </div>
);

export default Usuarios;