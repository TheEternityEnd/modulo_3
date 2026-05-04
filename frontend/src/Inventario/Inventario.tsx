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
  Eye,
  Edit,
  Trash2,
  HeartPulse,
  FilterX
} from 'lucide-react';

interface InventarioProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
}



const Inventario: React.FC<InventarioProps> = ({ onLogout, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas las categorías');
  const [statusFilter, setStatusFilter] = useState('Todos los estados');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  const img = 'https://dummyimage.com/800x800/000/fff';

  const inventoryData = [
    { 
      nombre: 'Silla de ruedas estándar', 
      categoria: 'Silla de ruedas', 
      estado: 'Disponible', 
      cantidad: 8, 
      ubicacion: 'Almacén A', 
      observaciones: 'Buen estado',
      imagen: img
    },
    { 
      nombre: 'Muletas de aluminio', 
      categoria: 'Muletas', 
      estado: 'Disponible', 
      cantidad: 15, 
      ubicacion: 'Almacén B', 
      observaciones: 'Ajustables en altura',
      imagen: img
    },
    { 
      nombre: 'Andadera con ruedas', 
      categoria: 'Andadera', 
      estado: 'Prestado', 
      cantidad: 3, 
      ubicacion: 'Almacén A', 
      observaciones: 'Con frenos',
      imagen: img
    },
    { 
      nombre: 'Bastón de apoyo', 
      categoria: 'Bastón', 
      estado: 'Disponible', 
      cantidad: 20, 
      ubicacion: 'Almacén C', 
      observaciones: 'Varios tamaños',
      imagen: img
    },
    { 
      nombre: 'Silla de ruedas eléctrica', 
      categoria: 'Silla de ruedas', 
      estado: 'Mantenimiento', 
      cantidad: 1, 
      ubicacion: 'Taller', 
      observaciones: 'Batería en revisión',
      imagen: img
    },
    { 
      nombre: 'Muletas canadienses', 
      categoria: 'Muletas', 
      estado: 'Disponible', 
      cantidad: 10, 
      ubicacion: 'Almacén B', 
      observaciones: 'Con soporte de antebrazo',
      imagen: img
    },
    { 
      nombre: 'Andadera sin ruedas', 
      categoria: 'Andadera', 
      estado: 'Disponible', 
      cantidad: 5, 
      ubicacion: 'Almacén A', 
      observaciones: 'Para interiores',
      imagen: img
    },
    { 
      nombre: 'Bastón con cuatro puntos', 
      categoria: 'Bastón', 
      estado: 'Prestado', 
      cantidad: 2, 
      ubicacion: 'Almacén C', 
      observaciones: 'Mayor estabilidad',
      imagen: img
    },
  ];

  const filteredData = useMemo(() => {
    return inventoryData.filter(item => {
      const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.observaciones.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'Todas las categorías' || item.categoria === categoryFilter;
      const matchesStatus = statusFilter === 'Todos los estados' || item.estado === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, categoryFilter, statusFilter]);

  const handleMouseEnter = (e: React.MouseEvent, imagen: string) => {
    setHoveredImage(imagen);
    setImagePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredImage) {
      setImagePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredImage(null);
  };

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
          <NavItem icon={<Package size={20} />} label="Inventario" active onClick={() => onNavigate('inventario')} />
          <NavItem icon={<ArrowLeftRight size={20} />} label="Préstamos" onClick={() => onNavigate('prestamos')} />
          <NavItem icon={<RotateCcw size={20} />} label="Devoluciones" onClick={() => onNavigate('devoluciones')} />
          <NavItem icon={<Users size={20} />} label="Beneficiarios" onClick={() => onNavigate('beneficiarios')} />
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Sistema de Control de Inventarios</h1>
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Bell size={22} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        <div className="p-10 space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Inventario de Aparatos</h2>
              <p className="text-slate-500 font-medium mt-1">Gestión y control de aparatos ortopédicos</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#5ba4c7] hover:bg-[#4a8ba9] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#5ba4c7]/30 transition-all active:scale-[0.98]"
            >
              <Plus size={20} strokeWidth={2.5} />
              <span>Agregar Aparato</span>
            </button>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar aparato..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/5 focus:border-[#5ba4c7] transition-all"
              />
            </div>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl text-slate-600 font-medium focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/5 focus:border-[#5ba4c7] transition-all cursor-pointer min-w-[200px]"
            >
              <option>Todas las categorías</option>
              <option>Silla de ruedas</option>
              <option>Muletas</option>
              <option>Andadera</option>
              <option>Bastón</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-2xl text-slate-600 font-medium focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/5 focus:border-[#5ba4c7] transition-all cursor-pointer min-w-[200px]"
            >
              <option>Todos los estados</option>
              <option>Disponible</option>
              <option>Prestado</option>
              <option>Mantenimiento</option>
            </select>
          </div>

          {/* Inventory Table Container with Scroll */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300 transition-all">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-sm">
                  <tr className="border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Categoría</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Estado</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Cantidad</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Ubicación</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Observaciones</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-8 py-5 font-bold text-slate-900 text-sm group-hover:text-[#5ba4c7] transition-colors">{item.nombre}</td>
                        <td className="px-8 py-5 text-sm text-slate-500 font-medium">{item.categoria}</td>
                        <td className="px-8 py-5 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm border ${
                            item.estado === 'Disponible' ? 'bg-[#94d6c6] text-slate-900 border-[#94d6c6]/20' :
                            item.estado === 'Prestado' ? 'bg-[#5ba4c7] text-white border-[#5ba4c7]/20' :
                            'bg-[#ffcc6f] text-slate-900 border-[#ffcc6f]/20'
                          }`}>
                            {item.estado}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-center font-bold text-slate-900 text-sm">{item.cantidad}</td>
                        <td className="px-8 py-5 text-sm text-slate-500 font-medium">{item.ubicacion}</td>
                        <td className="px-8 py-5 text-sm text-slate-500 font-medium">{item.observaciones}</td>
                        <td className="px-8 py-5">
                          <div className="flex items-center justify-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button 
                              className="p-2 text-[#5ba4c7] hover:bg-[#5ba4c7]/10 rounded-xl transition-all hover:scale-110 relative"
                              title="Ver detalle"
                              onMouseEnter={(e) => handleMouseEnter(e, item.imagen)}
                              onMouseMove={handleMouseMove}
                              onMouseLeave={handleMouseLeave}
                            >
                              <Eye size={18} />
                            </button>
                            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all hover:scale-110" title="Editar">
                              <Edit size={18} />
                            </button>
                            <button className="p-2 text-[#ff8a71] hover:bg-[#ff8a71]/10 rounded-xl transition-all hover:scale-110" title="Eliminar">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="bg-slate-50 p-6 rounded-full">
                            <FilterX className="text-slate-300 w-12 h-12" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-900 font-bold text-lg">No se encontraron resultados</p>
                            <p className="text-slate-500 text-sm font-medium">Intenta ajustar los filtros para encontrar lo que buscas</p>
                          </div>
                          <button 
                            onClick={() => {
                              setSearchTerm('');
                              setCategoryFilter('Todas las categorías');
                              setStatusFilter('Todos los estados');
                            }}
                            className="text-[#5ba4c7] font-bold text-sm hover:underline underline-offset-4 mt-2"
                          >
                            Limpiar todos los filtros
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Image Preview Tooltip */}
      {hoveredImage && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${imagePosition.x + -260}px`,
            top: `${imagePosition.y + -220}px`,
            transform: 'translate(0, 0)'
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
            <img 
              src={hoveredImage} 
              alt="Vista previa" 
              className="w-64 h-auto max-h-48 object-cover"
            />
            <div className="px-3 py-2 bg-slate-50 border-t border-slate-100">
              <p className="text-xs text-slate-600 font-medium">Vista previa del aparato</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar Aparato */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Agregar Nuevo Aparato</h3>
            </div>

            <form className="p-8 space-y-6" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
              {/* Nombre */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nombre del aparato</label>
                <input 
                  type="text" 
                  placeholder="Ej: Silla de ruedas estándar" 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Categoría */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Categoría</label>
                  <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all cursor-pointer">
                    <option>Silla de ruedas</option>
                    <option>Muletas</option>
                    <option>Andadera</option>
                    <option>Bastón</option>
                  </select>
                </div>
                {/* Cantidad */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Cantidad</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    min="0"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Estado */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Estado</label>
                  <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all cursor-pointer">
                    <option>Disponible</option>
                    <option>Prestado</option>
                    <option>Mantenimiento</option>
                  </select>
                </div>
                {/* Ubicación */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Ubicación</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Almacén A" 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Imagen */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">URL de la imagen</label>
                <input 
                  type="url" 
                  placeholder="https://ejemplo.com/imagen.jpg" 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Observaciones */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Observaciones</label>
                <textarea 
                  rows={3}
                  placeholder="Detalles adicionales del aparato..." 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all placeholder:text-slate-400 resize-none"
                ></textarea>
              </div>

              {/* Botones de acción */}
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
                  Guardar Aparato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
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

export default Inventario;