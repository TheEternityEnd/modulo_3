import React, { useMemo, useState, useEffect } from 'react';
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
  KeyRound,
  Activity
} from 'lucide-react';

interface UsuariosProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: string;
  activo: boolean;
  ultimoAcceso?: string;
}

const Usuarios: React.FC<UsuariosProps> = ({ onLogout, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [usuariosData, setUsuariosData] = useState<Usuario[]>([]);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('operador');
  
  const [filterRol, setFilterRol] = useState('Todos');
  const [filterEstado, setFilterEstado] = useState('Todos');

  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');
  
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityData, setActivityData] = useState<{prestamos_mes: number, devoluciones_mes: number} | null>(null);

  const currentUserString = localStorage.getItem('usuario');
  const currentUser = currentUserString ? JSON.parse(currentUserString) : null;
  const isOperador = currentUser?.rol === 'operador';

  const toggleEstado = async (id: number, currentActivo: boolean) => {
    try {
      const res = await fetch(`http://localhost:3000/usuarios/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !currentActivo }),
      });
      if (res.ok) {
        fetchUsuarios();
      } else {
        alert('Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await fetch('http://localhost:3000/usuarios');
      if (res.ok) {
        const data = await res.json();
        setUsuariosData(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditing ? `http://localhost:3000/usuarios/${editingUserId}` : 'http://localhost:3000/registro';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing 
        ? { nombre, correo, rol } 
        : { nombre, correo, password, rol };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchUsuarios();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const openNewUserModal = () => {
    setIsEditing(false);
    setEditingUserId(null);
    setNombre('');
    setCorreo('');
    setPassword('');
    setRol('operador');
    setIsModalOpen(true);
  };

  const openEditModal = (user: Usuario) => {
    setIsEditing(true);
    setEditingUserId(user.id_usuario);
    setNombre(user.nombre);
    setCorreo(user.correo);
    setPassword('');
    setRol(user.rol);
    setIsModalOpen(true);
  };

  const openPasswordReset = (user: Usuario) => {
    setEditingUserId(user.id_usuario);
    setSelectedUserName(user.nombre);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3000/usuarios/${editingUserId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        setIsPasswordModalOpen(false);
        alert('Contraseña actualizada exitosamente');
      } else {
        alert('Error al actualizar la contraseña');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openActivityLog = async (user: Usuario) => {
    setSelectedUserName(user.nombre);
    try {
      const res = await fetch(`http://localhost:3000/usuarios/${user.id_usuario}/actividad`);
      if (res.ok) {
        const data = await res.json();
        setActivityData(data);
        setIsActivityModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const filteredUsers = useMemo(() => {
    return usuariosData.filter(
      (user) => {
        const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              user.correo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRol = filterRol === 'Todos' || user.rol === filterRol;
        const matchesEstado = filterEstado === 'Todos' 
          ? true 
          : (filterEstado === 'Activos' ? user.activo : !user.activo);
          
        return matchesSearch && matchesRol && matchesEstado;
      }
    );
  }, [searchTerm, usuariosData, filterRol, filterEstado]);

  const activos = usuariosData.filter((u) => u.activo).length;
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
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shadow-sm uppercase">
              {currentUser?.nombre ? currentUser.nombre.split(' ')[0].charAt(0) : 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{currentUser?.nombre ? currentUser.nombre.split(' ')[0] : 'Usuario'}</p>
              <p className="text-[10px] text-white/70 font-medium capitalize">{currentUser?.rol || 'Administrador'}</p>
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

            {!isOperador && (
              <button
                onClick={openNewUserModal}
                className="bg-[#5ba4c7] hover:bg-[#4a8ba9] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#5ba4c7]/30 transition-all active:scale-[0.98]"
              >
                <Plus size={18} />
                <span>Nuevo Usuario</span>
              </button>
            )}
          </div>

          {/* Search + Active Users */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
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
              <div className="flex w-full md:w-auto gap-4">
                <select 
                  value={filterRol} 
                  onChange={(e) => setFilterRol(e.target.value)}
                  className="w-full md:w-auto px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5ba4c7]/50 font-medium text-slate-600"
                >
                  <option value="Todos">Todos los Roles</option>
                  <option value="admin">Administradores</option>
                  <option value="operador">Operadores</option>
                </select>
                <select 
                  value={filterEstado} 
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="w-full md:w-auto px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5ba4c7]/50 font-medium text-slate-600"
                >
                  <option value="Todos">Todos los Estados</option>
                  <option value="Activos">Activos</option>
                  <option value="Inactivos">Inactivos</option>
                </select>
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
                    {!isOperador && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Acciones</th>}
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
                      <tr key={user.id_usuario} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
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
                              user.rol === 'admin'
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
                              user.activo
                                ? 'bg-[#94d6c6] text-slate-900 border-[#94d6c6]/50'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {user.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">{user.ultimoAcceso || 'N/A'}</td>

                        {!isOperador && (
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-3">
                              <button onClick={() => openEditModal(user)} className="text-[#5ba4c7] hover:bg-[#5ba4c7]/10 p-2 rounded-lg transition-colors" title="Editar">
                                <Pencil size={16} />
                              </button>
                              
                              <button onClick={() => openActivityLog(user)} className="text-[#94d6c6] hover:bg-[#94d6c6]/10 p-2 rounded-lg transition-colors" title="Bitácora de Actividad">
                                <Activity size={16} />
                              </button>
                              
                              <button onClick={() => openPasswordReset(user)} className="text-[#ff8a71] hover:bg-[#ff8a71]/10 p-2 rounded-lg transition-colors" title="Restablecer Contraseña">
                                <KeyRound size={16} />
                              </button>

                              {user.activo ? (
                                <button onClick={() => toggleEstado(user.id_usuario, user.activo)} className="text-[#ffcc6f] hover:bg-[#ffcc6f]/10 p-2 rounded-lg transition-colors" title="Desactivar">
                                  <CircleOff size={16} />
                                </button>
                              ) : (
                                <button onClick={() => toggleEstado(user.id_usuario, user.activo)} className="text-[#94d6c6] hover:bg-[#94d6c6]/10 p-2 rounded-lg transition-colors" title="Activar">
                                  <CheckCircle2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
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
              <h3 className="text-xl font-bold text-slate-900">{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">
                {isEditing ? 'Actualiza los datos del usuario en el sistema' : 'Registra un nuevo usuario dentro del sistema'}
              </p>
            </div>

              <form
              className="p-8 space-y-6"
              onSubmit={handleSubmit}
            >
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nombre completo</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Delgado Rodríguez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all"
                  required
                />
              </div>

              <div className={`grid ${!isEditing ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all"
                    required
                  />
                </div>

                {!isEditing && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Contraseña</label>
                    <input
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Rol</label>
                  <select 
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all"
                  >
                    <option value="admin">Administrador (admin)</option>
                    <option value="operador">Operador (operador)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Estado</label>
                  <select 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all"
                    disabled
                  >
                    <option>Activo</option>
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

      {/* Modal Restablecer Contraseña */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden p-8">
            <h3 className="text-xl font-bold text-slate-900">Restablecer Contraseña</h3>
            <p className="text-sm text-slate-500 font-medium mt-1 mb-6">
              Nueva contraseña para {selectedUserName}
            </p>
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="********"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-all">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-3 text-sm font-bold text-white bg-[#ff8a71] hover:bg-[#e0755f] rounded-2xl shadow-lg shadow-[#ff8a71]/30 transition-all active:scale-[0.98]">
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Bitácora */}
      {isActivityModalOpen && activityData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsActivityModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden p-8 text-center">
            <div className="w-16 h-16 bg-[#94d6c6]/20 text-[#008080] rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Bitácora de {selectedUserName}</h3>
            <p className="text-sm text-slate-500 font-medium mt-1 mb-6">
              Actividad del mes en curso
            </p>
            <div className="bg-slate-50 p-6 rounded-2xl mb-6 flex justify-around">
              <div>
                <p className="text-3xl font-black text-[#5ba4c7]">{activityData.prestamos_mes}</p>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1">Préstamos</p>
              </div>
              <div className="w-px bg-slate-200"></div>
              <div>
                <p className="text-3xl font-black text-[#94d6c6]">{activityData.devoluciones_mes}</p>
                <p className="text-xs font-bold text-slate-500 uppercase mt-1">Devoluciones</p>
              </div>
            </div>
            <button onClick={() => setIsActivityModalOpen(false)} className="w-full px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all">
              Cerrar
            </button>
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