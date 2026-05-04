import React, { useState, useEffect } from 'react';
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
  User,
  Calendar,
  Clock,
  UserPlus,
  Box,
  History,
  X,
  Printer,
  FileSpreadsheet
} from 'lucide-react';

interface PrestamosProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

const Prestamos: React.FC<PrestamosProps> = ({ onLogout, onNavigate }) => {
  const [isRecentLoansModalOpen, setIsRecentLoansModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    beneficiario: '',
    aparato: '',
    cantidad: 1,
    fechaPrestamo: new Date().toISOString().split('T')[0],
    fechaDevolucion: '',
    observaciones: ''
  });

  const [inventario, setInventario] = useState<any[]>([]);
  const [beneficiarios, setBeneficiarios] = useState<any[]>([]);
  const [prestamos, setPrestamos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isBeneficiaryModalOpen, setIsBeneficiaryModalOpen] = useState(false);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<number | null>(null);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const filteredPrestamos = prestamos.filter(p => {
    const matchSearch = p.nombre_beneficiario.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.nombre_articulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter ? p.estado_prestamo === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const handleCancelar = async (id: number) => {
    if (!confirm('¿Estás seguro de cancelar este préstamo? El artículo volverá a estar disponible en inventario.')) return;
    try {
      const res = await fetch(`http://localhost:3000/prestamos/${id}/cancelar`, { method: 'PUT' });
      if (res.ok) {
        alert('Préstamo cancelado exitosamente');
        fetchDatos();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión al cancelar');
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Beneficiario', 'Articulo', 'Fecha Prestamo', 'Fecha Limite Devolucion', 'Estado'],
      ...filteredPrestamos.map(p => [
        `"${p.nombre_beneficiario}"`,
        `"${p.nombre_articulo}"`,
        new Date(p.fecha_prestamo).toLocaleDateString(),
        new Date(p.fecha_limite_devolucion).toLocaleDateString(),
        p.estado_prestamo
      ])
    ].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `prestamos_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchDatos = async () => {
    try {
      const [invRes, benRes, presRes] = await Promise.all([
        fetch('http://localhost:3000/inventario'),
        fetch('http://localhost:3000/beneficiarios'),
        fetch('http://localhost:3000/prestamos')
      ]);
      if (invRes.ok) {
        const invData = await invRes.json();
        setInventario(invData.filter((item: any) => item.cantidad_disponible > 0));
      }
      if (benRes.ok) setBeneficiarios(await benRes.json());
      if (presRes.ok) setPrestamos(await presRes.json());
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.beneficiario || !formData.aparato || !formData.fechaDevolucion) {
      alert('Por favor, selecciona beneficiario, aparato y fecha estimada de devolución.');
      return;
    }

    const hoy = new Date().toISOString().split('T')[0];
    if (formData.fechaDevolucion < hoy) {
      alert('La fecha estimada de devolución no puede ser anterior a la fecha actual.');
      return;
    }

    const articulo = inventario.find(i => i.id_articulo === Number(formData.aparato));
    if (articulo && articulo.cantidad_disponible <= 0) {
      alert('El artículo seleccionado no tiene stock disponible.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/prestamos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_articulo: formData.aparato,
          id_beneficiario: formData.beneficiario,
          fecha_limite_devolucion: formData.fechaDevolucion,
          observaciones: formData.observaciones
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const benName = beneficiarios.find(b => b.id_beneficiario === Number(formData.beneficiario))?.nombre_completo;
        const artName = inventario.find(i => i.id_articulo === Number(formData.aparato))?.nombre;
        
        setReceiptData({
          id_prestamo: data.prestamo.id_prestamo,
          nombre_beneficiario: benName,
          nombre_articulo: artName,
          fecha_prestamo: data.prestamo.fecha_prestamo || new Date(),
          fecha_limite_devolucion: formData.fechaDevolucion
        });
        
        alert('Préstamo registrado exitosamente');
        handleClear();
        fetchDatos(); // Recargar datos
        setIsReceiptModalOpen(true);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
        // Refrescar datos porque quizás el error fue por falta de stock repentino
        fetchDatos();
      }
    } catch (error) {
      console.error('Error al registrar préstamo:', error);
      alert('Error de conexión al registrar préstamo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      beneficiario: '',
      aparato: '',
      cantidad: 1,
      fechaPrestamo: new Date().toISOString().split('T')[0],
      fechaDevolucion: '',
      observaciones: ''
    });
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
          <NavItem icon={<Package size={20} />} label="Inventario" onClick={() => onNavigate('inventario')} />
          <NavItem icon={<ArrowLeftRight size={20} />} label="Préstamos" active onClick={() => onNavigate('prestamos')} />
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
              <h2 className="text-2xl font-extrabold text-slate-900">Préstamos de Aparatos</h2>
              <p className="text-slate-500 font-medium mt-1">Registrar y consultar préstamos activos</p>
            </div>
            <button 
              onClick={() => setIsRecentLoansModalOpen(true)}
              className="flex items-center gap-2 text-sm font-black text-[#5ba4c7] hover:bg-[#5ba4c7]/10 py-3 px-6 rounded-2xl transition-all border-2 border-[#5ba4c7]/10 hover:border-[#5ba4c7]/20"
            >
              <History size={18} />
              <span>Préstamos Recientes</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8 items-start">
            {/* Form Section */}
            <div className="col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-lg font-bold text-slate-900 px-1">Registrar Nuevo Préstamo</h3>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Beneficiario */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1">
                    <User size={16} className="text-[#5ba4c7]" /> Beneficiario
                  </label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/5 focus:border-[#5ba4c7] transition-all cursor-pointer text-slate-600 font-medium"
                    value={formData.beneficiario}
                    onChange={(e) => setFormData({...formData, beneficiario: e.target.value})}
                  >
                    <option value="">Seleccionar beneficiario</option>
                    {beneficiarios.map((b: any) => (
                      <option key={b.id_beneficiario} value={b.id_beneficiario}>
                        {b.nombre_completo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Aparato */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1">
                    <Package size={16} className="text-[#5ba4c7]" /> Aparato a prestar
                  </label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/5 focus:border-[#5ba4c7] transition-all cursor-pointer text-slate-600 font-medium"
                    value={formData.aparato}
                    onChange={(e) => setFormData({...formData, aparato: e.target.value})}
                  >
                    <option value="">Seleccionar aparato</option>
                    {inventario.map((inv: any) => (
                      <option key={inv.id_articulo} value={inv.id_articulo}>
                        {inv.nombre} ({inv.cantidad_disponible} disp.)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Cantidad */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Cantidad</label>
                    <input 
                      type="number" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/5 focus:border-[#5ba4c7] transition-all text-slate-600 font-medium"
                      value={formData.cantidad}
                      min="1"
                      onChange={(e) => setFormData({...formData, cantidad: parseInt(e.target.value)})}
                    />
                  </div>
                  {/* Fecha Prestamo */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1">
                      <Calendar size={16} className="text-[#5ba4c7]" /> Fecha de préstamo
                    </label>
                    <input 
                      type="date" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/5 focus:border-[#5ba4c7] transition-all text-slate-600 font-medium"
                      value={formData.fechaPrestamo}
                      onChange={(e) => setFormData({...formData, fechaPrestamo: e.target.value})}
                    />
                  </div>
                </div>

                {/* Fecha Devolución */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1">
                    <Calendar size={16} className="text-[#5ba4c7]" /> Fecha estimada de devolución
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/5 focus:border-[#5ba4c7] transition-all text-slate-600 font-medium placeholder:text-slate-300"
                    placeholder="dd/mm/aaaa"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.fechaDevolucion}
                    onChange={(e) => setFormData({...formData, fechaDevolucion: e.target.value})}
                  />
                </div>

                {/* Observaciones */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Observaciones</label>
                  <textarea 
                    rows={4}
                    placeholder="Notas adicionales sobre el préstamo..." 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/5 focus:border-[#5ba4c7] transition-all placeholder:text-slate-400 resize-none text-slate-600 font-medium"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  ></textarea>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={handleClear}
                    className="px-8 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-all border border-transparent hover:border-slate-200"
                  >
                    Limpiar
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className={`px-8 py-3.5 text-sm font-black text-white rounded-2xl shadow-lg transition-all active:scale-[0.98] ${isLoading ? 'bg-slate-400' : 'bg-[#5ba4c7] hover:bg-[#4a8ba9] shadow-[#5ba4c7]/30'}`}
                  >
                    {isLoading ? 'Registrando...' : 'Registrar Préstamo'}
                  </button>
                </div>
              </form>
            </div>

            {/* Stats Section */}
            <div className="space-y-6">
              <StatMiniCard 
                icon={<Box size={24} />} 
                iconColor="bg-white/20"
                bgColor="bg-[#94d6c6]"
                title="Préstamos Activos"
                value={prestamos.filter(p => p.estado_prestamo === 'Activo').length.toString()}
                subtitle={`${prestamos.filter(p => p.estado_prestamo === 'Activo').length} aparatos en préstamo`}
              />
              <StatMiniCard 
                icon={<Clock size={24} />} 
                iconColor="bg-white/20"
                bgColor="bg-[#ff8a71]"
                title="Vencidos"
                value="3"
                subtitle="Requieren seguimiento"
              />
              <StatMiniCard 
                icon={<UserPlus size={24} />} 
                iconColor="bg-white/20"
                bgColor="bg-[#ffcc6f]"
                title="Este Mes"
                value="12"
                subtitle="Nuevos préstamos"
              />
            </div>
          </div>


        </div>
      </main>

      {/* Modal Préstamos Recientes */}
      {isRecentLoansModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsRecentLoansModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-[#5ba4c7]/10 p-2.5 rounded-2xl">
                  <History className="text-[#5ba4c7] w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Listado de Préstamos</h3>
                  <p className="text-sm text-slate-500 font-medium">Búsqueda y filtrado</p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <input 
                  type="text" 
                  placeholder="Buscar beneficiario o artículo..." 
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#5ba4c7]/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select 
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5ba4c7]/50"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="Activo">Activo</option>
                  <option value="Devuelto">Devuelto</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
                <button onClick={handleExportCSV} className="p-2 hover:bg-[#5ba4c7]/10 rounded-xl transition-colors text-[#5ba4c7] border border-[#5ba4c7]/20 flex items-center gap-2">
                  <FileSpreadsheet size={20} />
                  <span className="text-xs font-bold hidden sm:inline">CSV</span>
                </button>
                <button onClick={() => setIsRecentLoansModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Beneficiario</th>
                    <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Aparato</th>
                    <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Devolución</th>
                    <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPrestamos.map((p: any) => {
                    const isVencido = p.estado_prestamo === 'Activo' && new Date(p.fecha_limite_devolucion) < hoy;
                    return (
                    <tr key={p.id_prestamo} className={`hover:bg-slate-50/50 transition-colors group ${isVencido ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-4 font-bold text-slate-900 text-sm group-hover:text-[#5ba4c7] transition-colors cursor-pointer" onClick={() => { setSelectedBeneficiaryId(p.id_beneficiario); setIsBeneficiaryModalOpen(true); }}>
                        <span className="hover:underline">{p.nombre_beneficiario}</span>
                        {isVencido && <span className="ml-2 text-red-500 font-bold" title="Préstamo vencido">⚠️</span>}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500 font-medium">{p.nombre_articulo}</td>
                      <td className="px-4 py-4 text-sm text-slate-500 font-medium">{new Date(p.fecha_prestamo).toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-sm text-slate-500 font-medium">{new Date(p.fecha_limite_devolucion).toLocaleDateString()}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          p.estado_prestamo === 'Activo' 
                            ? isVencido ? 'bg-red-200 text-red-900 border-red-300' : 'bg-[#94d6c6] text-slate-900 border-[#94d6c6]/20' 
                            : p.estado_prestamo === 'Cancelado'
                            ? 'bg-orange-200 text-orange-900 border-orange-300'
                            : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}>
                          {p.estado_prestamo}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {p.estado_prestamo === 'Activo' && (
                          <button 
                            onClick={() => handleCancelar(p.id_prestamo)}
                            className="text-[10px] text-red-500 hover:text-white font-bold px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-500 transition-all uppercase tracking-wider"
                          >
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setIsRecentLoansModalOpen(false)} className="px-8 py-3 text-sm font-bold text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-2xl transition-all">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Comprobante / Ticket */}
      {isReceiptModalOpen && receiptData && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsReceiptModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-[#94d6c6]/20 text-[#4a8ba9] rounded-full flex items-center justify-center mb-4">
              <Package size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">Comprobante</h2>
            <p className="text-slate-500 text-sm font-medium mb-6">Préstamo #{receiptData.id_prestamo}</p>
            
            <div className="w-full bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 mb-6 text-sm">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Beneficiario:</span>
                <span className="font-bold text-slate-800 text-right">{receiptData.nombre_beneficiario}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Artículo:</span>
                <span className="font-bold text-slate-800 text-right">{receiptData.nombre_articulo}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Fecha Préstamo:</span>
                <span className="font-bold text-slate-800 text-right">{new Date(receiptData.fecha_prestamo).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Devolución:</span>
                <span className="font-bold text-slate-800 text-right">{new Date(receiptData.fecha_limite_devolucion).toLocaleDateString()}</span>
              </div>
              <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-300 text-center">
                <p className="text-slate-400 text-xs">Firma del Beneficiario</p>
              </div>
            </div>
            
            <div className="flex w-full gap-4">
              <button onClick={() => window.print()} className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                <Printer size={18} /> Imprimir
              </button>
              <button onClick={() => setIsReceiptModalOpen(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Historial por Beneficiario */}
      {isBeneficiaryModalOpen && selectedBeneficiaryId && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsBeneficiaryModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl p-8 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Historial del Beneficiario</h3>
                <p className="text-sm text-slate-500 font-medium">Todos los préstamos asociados</p>
              </div>
              <button onClick={() => setIsBeneficiaryModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Aparato</th>
                    <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Fechas</th>
                    <th className="px-4 py-3 font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prestamos.filter(p => p.id_beneficiario === selectedBeneficiaryId).map((p: any) => (
                    <tr key={p.id_prestamo} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-700">{p.nombre_articulo}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(p.fecha_prestamo).toLocaleDateString()} - {new Date(p.fecha_limite_devolucion).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          p.estado_prestamo === 'Activo' ? 'bg-[#94d6c6] text-slate-900 border-[#94d6c6]/20' 
                          : p.estado_prestamo === 'Cancelado' ? 'bg-orange-200 text-orange-900 border-orange-300'
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}>
                          {p.estado_prestamo}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {prestamos.filter(p => p.id_beneficiario === selectedBeneficiaryId).length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-500">No hay historial para este beneficiario.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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

const StatMiniCard = ({ icon, iconColor, title, value, subtitle, bgColor }: any) => (
  <div className={`${bgColor} p-8 rounded-[40px] shadow-sm flex items-center justify-between group hover:shadow-md transition-all`}>
    <div className="space-y-2">
      <p className="text-[10px] font-black text-slate-900/50 uppercase tracking-widest">{title}</p>
      <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h4>
      <p className="text-xs font-bold text-slate-900/40">{subtitle}</p>
    </div>
    <div className={`${iconColor} w-14 h-14 rounded-2xl flex items-center justify-center text-slate-900/80 shadow-sm group-hover:scale-110 transition-transform backdrop-blur-md`}>
      {icon}
    </div>
  </div>
);

export default Prestamos;
