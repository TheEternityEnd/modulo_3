import React, { useState, useMemo, useEffect } from 'react';
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
  Search,
  Plus,
  Phone,
  MapPin,
  History,
  X,
  Edit2,
  Trash2,
  Download
} from 'lucide-react';

interface BeneficiariosProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

interface Beneficiario {
  id_beneficiario: number;
  nombre_completo: string;
  identificacion: string;
  telefono: string;
  correo: string;
  direccion: string;
  fecha_registro: string;
}

const Beneficiarios: React.FC<BeneficiariosProps> = ({ onLogout, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiario | null>(null);
  const [beneficiariosData, setBeneficiariosData] = useState<Beneficiario[]>([]);
  const [prestamosData, setPrestamosData] = useState<any[]>([]);

  // Form states
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');

  const [userName, setUserName] = useState('');
  const [userRol, setUserRol] = useState('');

  const fetchBeneficiarios = async () => {
    try {
      const response = await fetch('http://localhost:3000/beneficiarios');
      const data = await response.json();
      setBeneficiariosData(data);
    } catch (error) {
      console.error('Error al obtener beneficiarios:', error);
    }
  };

  const fetchPrestamos = async () => {
    try {
      const response = await fetch('http://localhost:3000/prestamos');
      const data = await response.json();
      setPrestamosData(data);
    } catch (error) {
      console.error('Error al obtener préstamos:', error);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('usuario');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.nombre.split(' ')[0]);
        setUserRol(user.rol);
      } catch (e) {
        console.error("Error al parsear usuario:", e);
      }
    }
    fetchBeneficiarios();
    fetchPrestamos();
  }, []);

  const handleOpenNewModal = () => {
    setEditingId(null);
    setNombreCompleto('');
    setIdentificacion('');
    setTelefono('');
    setCorreo('');
    setDireccion('');
    setIsModalOpen(true);
  };

  const handleEdit = (beneficiario: Beneficiario, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(beneficiario.id_beneficiario);
    setNombreCompleto(beneficiario.nombre_completo || '');
    setIdentificacion(beneficiario.identificacion || '');
    setTelefono(beneficiario.telefono || '');
    setCorreo(beneficiario.correo || '');
    setDireccion(beneficiario.direccion || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de eliminar este beneficiario?')) return;
    
    try {
      const res = await fetch(`http://localhost:3000/beneficiarios/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBeneficiarios();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar');
      }
    } catch (error) {
      alert('Error de red al intentar eliminar.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nombre', 'Identificacion', 'Telefono', 'Correo', 'Direccion', 'Fecha de Registro'];
    const csvContent = [
      headers.join(','),
      ...beneficiariosData.map((b) => 
        [
          b.id_beneficiario,
          `"${b.nombre_completo || ''}"`,
          `"${b.identificacion || ''}"`,
          `"${b.telefono || ''}"`,
          `"${b.correo || ''}"`,
          `"${b.direccion || ''}"`,
          new Date(b.fecha_registro).toLocaleDateString('es-MX')
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `directorio_beneficiarios_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones de formato en Frontend
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (telefono && !phoneRegex.test(telefono)) {
      alert('El teléfono solo puede contener números y los símbolos + - ( )');
      return;
    }

    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      alert('Por favor, ingresa un correo electrónico válido con el símbolo "@" y un dominio');
      return;
    }

    try {
      const url = editingId 
        ? `http://localhost:3000/beneficiarios/${editingId}`
        : 'http://localhost:3000/beneficiarios';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_completo: nombreCompleto,
          identificacion,
          telefono,
          correo,
          direccion
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingId(null);
        setNombreCompleto('');
        setIdentificacion('');
        setTelefono('');
        setCorreo('');
        setDireccion('');
        fetchBeneficiarios();
      } else {
        const errorData = await res.json();
        alert('Error: ' + (errorData.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const filteredBeneficiarios = useMemo(() => {
    return beneficiariosData.filter((item) => {
      const term = searchTerm.toLowerCase();
      return (
        (item.nombre_completo && item.nombre_completo.toLowerCase().includes(term)) ||
        (item.telefono && item.telefono.toLowerCase().includes(term)) ||
        (item.direccion && item.direccion.toLowerCase().includes(term)) ||
        (item.identificacion && item.identificacion.toLowerCase().includes(term))
      );
    });
  }, [searchTerm, beneficiariosData]);

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
          <NavItem icon={<Users size={20} />} label="Beneficiarios" active onClick={() => onNavigate('beneficiarios')} />
          <NavItem icon={<BarChart3 size={20} />} label="Reportes" onClick={() => onNavigate('reportes')} />
          <NavItem icon={<UserCircle size={20} />} label="Usuarios" onClick={() => onNavigate('usuarios')} />
        </nav>

        <div className="mt-auto pt-8 border-t border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shadow-sm uppercase">
              {userName ? userName.charAt(0) : 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{userName || 'Usuario'}</p>
              <p className="text-[10px] text-white/70 font-medium capitalize">{userRol || 'Administrador'}</p>
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

        <div className="p-10 space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Beneficiarios</h2>
              <p className="text-slate-500 font-medium mt-1">
                Gestión de personas que reciben aparatos ortopédicos
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleExportCSV}
                className="bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 border border-slate-200 shadow-sm transition-all active:scale-[0.98]"
              >
                <Download size={20} strokeWidth={2.5} className="text-slate-400" />
                <span>Exportar CSV</span>
              </button>
              <button
                onClick={handleOpenNewModal}
                className="bg-[#5ba4c7] hover:bg-[#4a8ba9] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#5ba4c7]/30 transition-all active:scale-[0.98]"
              >
                <Plus size={20} strokeWidth={2.5} />
                <span>Nuevo Beneficiario</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar beneficiario por nombre o identificación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/5 focus:border-[#5ba4c7] transition-all"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 gap-6">
            {filteredBeneficiarios.length > 0 ? (
              filteredBeneficiarios.map((beneficiario) => {
                const iniciales = beneficiario.nombre_completo
                  ? beneficiario.nombre_completo.split(' ').map((n) => n[0]).slice(0, 2).join('')
                  : 'N/A';
                  
                const isMoroso = prestamosData.some(p => 
                  p.id_beneficiario === beneficiario.id_beneficiario && 
                  p.estado_prestamo === 'Activo' && 
                  new Date(p.fecha_limite_devolucion) < new Date()
                );

                return (
                  <div
                    key={beneficiario.id_beneficiario}
                    onClick={() => setSelectedBeneficiary(beneficiario)}
                    className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-11 h-11 rounded-full bg-[#5ba4c7]/10 flex items-center justify-center text-[#5ba4c7] font-bold text-sm">
                        {iniciales}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => handleEdit(beneficiario, e)}
                          className="p-1.5 text-slate-400 hover:text-[#5ba4c7] hover:bg-[#5ba4c7]/10 rounded-lg transition-colors"
                          title="Editar beneficiario"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(beneficiario.id_beneficiario, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar beneficiario"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-4 group-hover:text-[#5ba4c7] transition-colors flex items-center gap-2">
                      {beneficiario.nombre_completo}
                      {isMoroso && (
                        <span className="flex h-3 w-3 relative" title="Tiene un préstamo vencido">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                        </span>
                      )}
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                        <Phone size={16} className="text-[#5ba4c7]" />
                        <span>{beneficiario.telefono || 'Sin teléfono'}</span>
                      </div>

                      <div className="flex items-start gap-3 text-slate-500 text-sm font-medium">
                        <MapPin size={16} className="text-[#5ba4c7] mt-0.5" />
                        <span className="line-clamp-2">{beneficiario.direccion || 'Sin dirección'}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-400 font-medium">
                      Registrado: {new Date(beneficiario.fecha_registro).toLocaleDateString('es-MX')}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-white rounded-[32px] border border-slate-100 shadow-sm p-16 text-center">
                <p className="text-slate-900 font-bold text-lg">No se encontraron beneficiarios</p>
                <p className="text-slate-500 text-sm font-medium mt-2">
                  Intenta buscar con otro nombre o dato relacionado
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Nuevo Beneficiario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">{editingId ? 'Editar Beneficiario' : 'Nuevo Beneficiario'}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <form
              className="p-8 space-y-6"
              onSubmit={handleRegister}
            >
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nombre completo</label>
                <input
                  type="text"
                  placeholder="Ej: María González García"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all placeholder:text-slate-400"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Identificación</label>
                  <input
                    type="text"
                    placeholder="DNI / CURP / INE"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all placeholder:text-slate-400"
                    value={identificacion}
                    onChange={(e) => setIdentificacion(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="555-1234-5678"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all placeholder:text-slate-400"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    pattern="[0-9+\-\s()]+"
                    title="Solo se permiten números, espacios y los símbolos + - ( )"
                    required
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all placeholder:text-slate-400"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Dirección</label>
                <input
                  type="text"
                  placeholder="Calle, número, colonia, ciudad"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all placeholder:text-slate-400"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  required
                />
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
                  {editingId ? 'Actualizar Beneficiario' : 'Guardar Beneficiario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {selectedBeneficiary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedBeneficiary(null)}
          ></div>

          <div className="relative bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Detalle del Beneficiario</h3>
              <button
                onClick={() => setSelectedBeneficiary(null)}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-[#5ba4c7]/10 flex items-center justify-center text-[#5ba4c7] font-bold text-lg">
                  {selectedBeneficiary.nombre_completo
                    ? selectedBeneficiary.nombre_completo.split(' ').map((n) => n[0]).slice(0, 2).join('')
                    : 'N/A'}
                </div>

                <div>
                  <h4 className="text-2xl font-bold text-slate-900">{selectedBeneficiary.nombre_completo}</h4>
                  <p className="text-slate-500 text-sm mt-1">Identificación: {selectedBeneficiary.identificacion}</p>
                  <p className="text-slate-500 text-sm mt-1">Correo: {selectedBeneficiary.correo || 'N/A'}</p>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <Phone size={16} className="text-[#5ba4c7]" />
                      <span>{selectedBeneficiary.telefono || 'N/A'}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-500 text-sm font-medium">
                      <MapPin size={16} className="text-[#5ba4c7] mt-0.5" />
                      <span>{selectedBeneficiary.direccion || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-lg font-bold text-slate-900 mb-4">Información de Registro</h5>

                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <p className="text-sm font-medium text-slate-600">
                      Fecha de alta: <span className="font-bold text-slate-900">{new Date(selectedBeneficiary.fecha_registro).toLocaleString('es-MX')}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-lg font-bold text-slate-900 mb-4">Historial de Préstamos</h5>
                <div className="space-y-3">
                  {(() => {
                    const historial = prestamosData.filter(p => p.id_beneficiario === selectedBeneficiary.id_beneficiario);
                    if (historial.length === 0) {
                      return <p className="text-sm text-slate-500 font-medium">No tiene préstamos registrados.</p>;
                    }
                    return historial.map((prestamo, index) => (
                      <div key={index} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900">{prestamo.nombre_articulo}</span>
                          <span className={`text-xs font-black uppercase tracking-wider ${prestamo.estado_prestamo === 'Activo' ? 'text-[#94d6c6]' : 'text-slate-500'}`}>
                            {prestamo.estado_prestamo}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Préstamo: {new Date(prestamo.fecha_prestamo).toLocaleDateString('es-MX')} - Devolución: {new Date(prestamo.fecha_limite_devolucion).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBeneficiary(null)}
                className="px-8 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
              >
                Cerrar
              </button>
            </div>
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
  onClick
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

export default Beneficiarios;