import React, { useState, useMemo } from 'react';
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
  HeartPulse,
  X
} from 'lucide-react';

interface BeneficiariosProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

interface Beneficiario {
  id: number;
  nombre: string;
  telefono: string;
  direccion: string;
  totalPrestamos: number;
  prestamosActivos: number;
  ultimoPrestamo: string;
}

const Beneficiarios: React.FC<BeneficiariosProps> = ({ onLogout, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiario | null>(null);

  const beneficiariosData: Beneficiario[] = [
    {
      id: 1,
      nombre: 'María González García',
      telefono: '555-1234-5678',
      direccion: 'Calle Principal #123, Col. Centro',
      totalPrestamos: 5,
      prestamosActivos: 1,
      ultimoPrestamo: '2026-03-01',
    },
    {
      id: 2,
      nombre: 'José Luis Ramírez',
      telefono: '555-2345-6789',
      direccion: 'Av. Juárez #456, Col. Norte',
      totalPrestamos: 3,
      prestamosActivos: 1,
      ultimoPrestamo: '2026-03-05',
    },
    {
      id: 3,
      nombre: 'Ana Patricia Flores',
      telefono: '555-3456-7890',
      direccion: 'Calle 5 de Mayo #789, Col. Sur',
      totalPrestamos: 8,
      prestamosActivos: 0,
      ultimoPrestamo: '2026-02-28',
    },
    {
      id: 4,
      nombre: 'Carlos Méndez Pérez',
      telefono: '555-4567-8901',
      direccion: 'Blvd. Libertad #321, Col. Este',
      totalPrestamos: 2,
      prestamosActivos: 1,
      ultimoPrestamo: '2026-03-07',
    },
    {
      id: 5,
      nombre: 'Rosa Elena Torres',
      telefono: '555-5678-9012',
      direccion: 'Calle Hidalgo #654, Col. Oeste',
      totalPrestamos: 4,
      prestamosActivos: 1,
      ultimoPrestamo: '2026-03-08',
    },
  ];

  const filteredBeneficiarios = useMemo(() => {
    return beneficiariosData.filter((item) =>
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.telefono.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.direccion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

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

        <div className="p-10 space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Beneficiarios</h2>
              <p className="text-slate-500 font-medium mt-1">
                Gestión de personas que reciben aparatos ortopédicos
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#5ba4c7] hover:bg-[#4a8ba9] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#5ba4c7]/30 transition-all active:scale-[0.98]"
            >
              <Plus size={20} strokeWidth={2.5} />
              <span>Nuevo Beneficiario</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar beneficiario por nombre..."
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
                const iniciales = beneficiario.nombre
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('');

                return (
                  <div
                    key={beneficiario.id}
                    onClick={() => setSelectedBeneficiary(beneficiario)}
                    className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div className="w-11 h-11 rounded-full bg-[#5ba4c7]/10 flex items-center justify-center text-[#5ba4c7] font-bold text-sm">
                        {iniciales}
                      </div>

                      {beneficiario.prestamosActivos > 0 && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border bg-[#94d6c6] text-slate-900 border-[#94d6c6]/20 shadow-sm">
                          {beneficiario.prestamosActivos} activo
                          {beneficiario.prestamosActivos > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-4 group-hover:text-[#5ba4c7] transition-colors">
                      {beneficiario.nombre}
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                        <Phone size={16} className="text-[#5ba4c7]" />
                        <span>{beneficiario.telefono}</span>
                      </div>

                      <div className="flex items-start gap-3 text-slate-500 text-sm font-medium">
                        <MapPin size={16} className="text-[#5ba4c7] mt-0.5" />
                        <span>{beneficiario.direccion}</span>
                      </div>

                      <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                        <History size={16} className="text-[#5ba4c7]" />
                        <span>{beneficiario.totalPrestamos} préstamos totales</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-400 font-medium">
                      Último préstamo: {new Date(beneficiario.ultimoPrestamo).toLocaleDateString('es-MX')}
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
              <h3 className="text-xl font-bold text-slate-900">Nuevo Beneficiario</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
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
                  placeholder="Ej: María González García"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="555-1234-5678"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Correo electrónico</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Dirección</label>
                <input
                  type="text"
                  placeholder="Calle, número, colonia, ciudad"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Observaciones</label>
                <textarea
                  rows={3}
                  placeholder="Notas adicionales del beneficiario..."
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all placeholder:text-slate-400 resize-none"
                ></textarea>
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
                  Guardar Beneficiario
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
                  {selectedBeneficiary.nombre
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>

                <div>
                  <h4 className="text-2xl font-bold text-slate-900">{selectedBeneficiary.nombre}</h4>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <Phone size={16} className="text-[#5ba4c7]" />
                      <span>{selectedBeneficiary.telefono}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-500 text-sm font-medium">
                      <MapPin size={16} className="text-[#5ba4c7] mt-0.5" />
                      <span>{selectedBeneficiary.direccion}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                  <p className="text-sm text-slate-500 font-medium">Préstamos Totales</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {selectedBeneficiary.totalPrestamos}
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                  <p className="text-sm text-slate-500 font-medium">Préstamos Activos</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {selectedBeneficiary.prestamosActivos}
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                  <p className="text-sm text-slate-500 font-medium">Último Préstamo</p>
                  <p className="text-sm font-bold text-slate-900 mt-3">
                    {new Date(selectedBeneficiary.ultimoPrestamo).toLocaleDateString('es-MX')}
                  </p>
                </div>
              </div>

              <div>
                <h5 className="text-lg font-bold text-slate-900 mb-4">Historial de Préstamos</h5>

                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">Silla de ruedas estándar</span>
                      <span className="text-xs font-black uppercase tracking-wider text-[#94d6c6]">Activo</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Préstamo: 01/03/2026 - Devolución: 01/04/2026
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">Muletas de aluminio</span>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500">Devuelto</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Préstamo: 15/02/2026 - Devolución: 28/02/2026
                    </p>
                  </div>
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