import React, { useState, useRef } from 'react';
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
  Search,
  Calendar,
  Package2,
  User,
  Hash,
  AlertCircle,
  Camera,
  Upload,
  X,
  Download,
  Printer,
  FileText
} from 'lucide-react';

interface DevolucionesProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

const Devoluciones: React.FC<DevolucionesProps> = ({ onLogout, onNavigate }) => {
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [fechaDevolucion, setFechaDevolucion] = useState(new Date().toISOString().split('T')[0]);
  const [estadoAparato, setEstadoAparato] = useState('Bueno - Uso normal');
  const [requiereMantenimiento, setRequiereMantenimiento] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [multaOCargo, setMultaOCargo] = useState('0');
  const [busquedaHistorial, setBusquedaHistorial] = useState('');
  const [ticketModal, setTicketModal] = useState<any>(null);

  const [fotografiasDanios, setFotografiasDanios] = useState<File[]>([]);
  const [previewFotos, setPreviewFotos] = useState<string[]>([]);

  const inputFotosRef = useRef<HTMLInputElement | null>(null);

  const [activeLoans, setActiveLoans] = useState<any[]>([]);
  const [historialDevoluciones, setHistorialDevoluciones] = useState<any[]>([]);

  const [userName, setUserName] = useState('');
  const [userRol, setUserRol] = useState('');

  const fetchPrestamos = async () => {
    try {
      const response = await fetch('http://localhost:3000/prestamos');
      const data = await response.json();
      const activos = data.filter((p: any) => p.estado_prestamo === 'Activo');
      setActiveLoans(activos.map((p: any) => ({
        id: p.id_prestamo.toString(),
        beneficiario: p.nombre_beneficiario,
        aparato: p.nombre_articulo,
        fechaPrestamo: p.fecha_prestamo,
        fechaEsperada: p.fecha_limite_devolucion,
        cantidad: 1
      })));
    } catch (error) {
      console.error('Error fetching prestamos:', error);
    }
  };

  const fetchDevoluciones = async () => {
    try {
      const response = await fetch('http://localhost:3000/devoluciones');
      const data = await response.json();
      setHistorialDevoluciones(data);
    } catch (error) {
      console.error('Error fetching devoluciones:', error);
    }
  };

  React.useEffect(() => {
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
    fetchPrestamos();
    fetchDevoluciones();
  }, []);

  const historialFiltrado = historialDevoluciones.filter(dev => {
    const texto = busquedaHistorial.toLowerCase();
    const fechaStr = new Date(dev.fecha_devolucion).toLocaleDateString('es-MX');
    return (
      (dev.nombre_beneficiario?.toLowerCase() || '').includes(texto) ||
      (dev.nombre_articulo?.toLowerCase() || '').includes(texto) ||
      fechaStr.includes(texto)
    );
  });

  const handleExportCSV = () => {
    const encabezados = ['ID Devolución', 'ID Préstamo', 'Beneficiario', 'Artículo', 'Fecha', 'Estado Físico', 'Multa o Cargo', 'Observaciones'];
    const filas = historialFiltrado.map(dev => [
      dev.id_devolucion,
      dev.id_prestamo,
      `"${dev.nombre_beneficiario}"`,
      `"${dev.nombre_articulo}"`,
      new Date(dev.fecha_devolucion).toLocaleDateString('es-MX'),
      dev.estado_fisico_recibido,
      dev.multa_o_cargo,
      `"${dev.observaciones_devolucion || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + encabezados.join(",") + "\n" 
      + filas.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historial_devoluciones_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const prestamosFiltrados = activeLoans.filter((loan) => {
    const texto = busqueda.toLowerCase();
    return (
      loan.id.toLowerCase().includes(texto) ||
      loan.beneficiario.toLowerCase().includes(texto) ||
      loan.aparato.toLowerCase().includes(texto)
    );
  });

  const selectedLoan = activeLoans.find((loan) => loan.id === selectedLoanId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const hayDanios =
    estadoAparato.includes('Malo') ||
    estadoAparato.includes('Inutilizable') ||
    requiereMantenimiento;

  const limpiarPreviews = () => {
    previewFotos.forEach((url) => URL.revokeObjectURL(url));
  };

  const handleFotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const archivos = Array.from(files);
    const imagenesValidas = archivos.filter((file) => file.type.startsWith('image/'));

    if (imagenesValidas.length === 0) {
      alert('Solo puedes seleccionar imágenes.');
      return;
    }

    limpiarPreviews();

    setFotografiasDanios(imagenesValidas);
    setPreviewFotos(imagenesValidas.map((file) => URL.createObjectURL(file)));
  };

  const eliminarFoto = (index: number) => {
    const nuevasFotos = [...fotografiasDanios];
    const nuevasPreviews = [...previewFotos];

    URL.revokeObjectURL(nuevasPreviews[index]);

    nuevasFotos.splice(index, 1);
    nuevasPreviews.splice(index, 1);

    setFotografiasDanios(nuevasFotos);
    setPreviewFotos(nuevasPreviews);
  };

  const handleRegistrarDevolucion = async () => {
    if (!selectedLoanId) {
      alert('Selecciona un préstamo.');
      return;
    }

    if (hayDanios && fotografiasDanios.length === 0) {
      alert('Debes agregar al menos una fotografía cuando el aparato tenga daños o requiera mantenimiento.');
      return;
    }

    const estadoFisicoDB = estadoAparato.split(' - ')[0];

    if (estadoFisicoDB === 'Dañado' || estadoFisicoDB === 'Inutilizable') {
      const valorMulta = parseFloat(multaOCargo) || 0;
      if (valorMulta === 0 && observaciones.trim() === '') {
        alert('Si el aparato se devuelve con daños, debes registrar una multa/cargo o proporcionar una justificación en observaciones.');
        return;
      }
    }

    const datosDevolucion = {
      id_prestamo: parseInt(selectedLoanId, 10),
      id_usuario_recibe: 1,
      estado_fisico_recibido: estadoFisicoDB,
      multa_o_cargo: parseFloat(multaOCargo) || 0,
      observaciones: observaciones + (requiereMantenimiento ? ' [Requiere mantenimiento]' : '')
    };

    try {
      const response = await fetch('http://localhost:3000/devoluciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosDevolucion)
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Error al registrar la devolución');
      }

      alert('Devolución registrada correctamente.');
      
      const ticketInfo = {
        id_devolucion: result.devolucion?.id_devolucion || 'N/A',
        beneficiario: selectedLoan.beneficiario,
        aparato: selectedLoan.aparato,
        fecha: new Date().toLocaleDateString('es-MX'),
        estadoFisico: estadoFisicoDB,
        multaOCargo: parseFloat(multaOCargo) || 0,
        observaciones: observaciones + (requiereMantenimiento ? ' [Requiere mantenimiento]' : '')
      };

      setTicketModal(ticketInfo);
      
      setSelectedLoanId(null);
      setEstadoAparato('Bueno - Uso normal');
      setRequiereMantenimiento(false);
      setObservaciones('');
      setMultaOCargo('0');
      limpiarPreviews();
      setFotografiasDanios([]);
      setPreviewFotos([]);
      
      fetchPrestamos();
      fetchDevoluciones();
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans relative overflow-hidden text-slate-900">
      <aside className="w-64 bg-[#5ba4c7] flex flex-col p-6 h-full text-white shadow-xl">
        <div className="flex flex-col items-center mb-10 px-2">
          <img 
            src="/src/assets/logo.png" 
            alt="Palabras de Esperanza Logo" 
            className="w-full h-auto object-contain mb-2 drop-shadow-md"
          />
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            onClick={() => onNavigate('dashboard')}
          />
          <NavItem
            icon={<Package size={20} />}
            label="Inventario"
            onClick={() => onNavigate('inventario')}
          />
          <NavItem
            icon={<ArrowLeftRight size={20} />}
            label="Préstamos"
            onClick={() => onNavigate('prestamos')}
          />
          <NavItem
            icon={<RotateCcw size={20} />}
            label="Devoluciones"
            active
            onClick={() => onNavigate('devoluciones')}
          />
          <NavItem
            icon={<Users size={20} />}
            label="Beneficiarios"
            onClick={() => onNavigate('beneficiarios')}
          />
          <NavItem
            icon={<BarChart3 size={20} />}
            label="Reportes"
            onClick={() => onNavigate('reportes')}
          />
          <NavItem
            icon={<UserCircle size={20} />}
            label="Usuarios"
            onClick={() => onNavigate('usuarios')}
          />
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
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Devoluciones de Aparatos
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Registrar devolución de aparatos prestados
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 items-start">
            <div className="col-span-1 bg-sky-50/50 p-6 rounded-[40px] border border-sky-100/50 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-slate-900 px-2 tracking-tight">Préstamos Activos</h3>

              <div className="relative">
                <Search
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar préstamo..."
                  className="w-full pl-12 pr-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7]/50 transition-all text-sm font-medium"
                />
              </div>

              <div className="space-y-4 h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 pr-2">
                {prestamosFiltrados.map((loan, index) => {
                  const colors = [
                    { bg: 'bg-[#94d6c6]', shadow: 'shadow-[#94d6c6]/20' },
                    { bg: 'bg-[#ffe4c4]', shadow: 'shadow-[#ffe4c4]/20' },
                    { bg: 'bg-[#ff8a71]', shadow: 'shadow-[#ff8a71]/20' },
                    { bg: 'bg-[#ffcc6f]', shadow: 'shadow-[#ffcc6f]/20' }
                  ];
                  const color = colors[index % colors.length];
                  const isSelected = selectedLoanId === loan.id;

                  return (
                    <button
                      key={loan.id}
                      onClick={() => setSelectedLoanId(loan.id)}
                      className={`w-full text-left p-6 rounded-[32px] border transition-all shadow-lg ${color.bg} ${color.shadow} ${
                        isSelected
                          ? 'ring-4 ring-slate-900/10 border-slate-900/20 scale-[1.02]'
                          : 'border-transparent hover:scale-[1.01] hover:shadow-xl'
                      }`}
                    >
                      <p className="font-black text-lg text-slate-900 mb-1">{loan.id}</p>
                      <p className="text-sm text-slate-900/80 font-bold mb-2">{loan.beneficiario}</p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-white/30 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-900/60 backdrop-blur-sm">
                          {loan.aparato}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedLoan ? (
              <div className="col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-6">
                    Información del Préstamo
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <Hash className="w-5 h-5 text-[#5ba4c7] mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                            ID Préstamo
                          </p>
                          <p className="text-base font-bold text-slate-800">{selectedLoan.id}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Package2 className="w-5 h-5 text-[#5ba4c7] mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                            Aparato
                          </p>
                          <p className="text-base font-bold text-slate-800">
                            {selectedLoan.aparato}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-[#5ba4c7] mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                            Fecha de préstamo
                          </p>
                          <p className="text-base font-bold text-slate-800">
                            {formatDate(selectedLoan.fechaPrestamo)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-[#5ba4c7] mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                            Beneficiario
                          </p>
                          <p className="text-base font-bold text-slate-800">
                            {selectedLoan.beneficiario}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Package2 className="w-5 h-5 text-[#5ba4c7] mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                            Cantidad
                          </p>
                          <p className="text-base font-bold text-slate-800">
                            {selectedLoan.cantidad}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-[#5ba4c7] mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                            Fecha esperada
                          </p>
                          <p className="text-base font-bold text-slate-800">
                            {formatDate(selectedLoan.fechaEsperada)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-6">
                    Registrar Devolución
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Fecha de devolución
                      </label>
                      <input
                        type="date"
                        value={fechaDevolucion}
                        onChange={(e) => setFechaDevolucion(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all font-medium text-slate-800"
                      />
                    </div>

                    {selectedLoan && (() => {
                      let diasRetraso = 0;
                      if (selectedLoan.fechaEsperada) {
                        const devolucionD = new Date(fechaDevolucion + "T00:00:00");
                        const esperadaD = new Date(selectedLoan.fechaEsperada);
                        // Reset time to compare only dates
                        esperadaD.setHours(0, 0, 0, 0);
                        if (devolucionD > esperadaD) {
                          const diffTime = Math.abs(devolucionD.getTime() - esperadaD.getTime());
                          diasRetraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        }
                      }
                      
                      if (diasRetraso > 0) {
                        return (
                          <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 text-orange-700 p-4 rounded-xl">
                            <AlertCircle size={20} className="text-orange-500" />
                            <div>
                              <p className="font-bold text-sm">Devolución con {diasRetraso} {diasRetraso === 1 ? 'día' : 'días'} de retraso</p>
                              <p className="text-xs opacity-80">La fecha límite esperada era el {formatDate(selectedLoan.fechaEsperada)}.</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Estado del aparato
                      </label>
                      <select
                        value={estadoAparato}
                        onChange={(e) => setEstadoAparato(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all font-medium text-slate-800"
                      >
                        <option>Bueno - Uso normal</option>
                        <option>Regular - Desgaste visible</option>
                        <option>Dañado - Daños significativos</option>
                        <option>Inutilizable - No apto para préstamo</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={requiereMantenimiento}
                            onChange={(e) => setRequiereMantenimiento(e.target.checked)}
                            className="w-5 h-5 text-[#5ba4c7] rounded-lg focus:ring-[#5ba4c7]/20 focus:ring-4 border-slate-300 transition-all cursor-pointer"
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-[#5ba4c7] transition-colors">
                          Requiere mantenimiento o reparación
                        </span>
                      </label>

                      {requiereMantenimiento && (
                        <div className="flex items-center gap-2 text-[#ff8a71] bg-[#ff8a71]/10 p-4 rounded-2xl border border-[#ff8a71]/20">
                          <AlertCircle size={18} />
                          <p className="text-xs font-black uppercase tracking-wider">
                            El aparato será marcado para revisión técnica
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Multa o Cargo (Opcional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={multaOCargo}
                        onChange={(e) => setMultaOCargo(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all font-medium text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Observaciones
                      </label>
                      <textarea
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="Notas sobre el estado del aparato, daños encontrados, o comentarios adicionales..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all font-medium text-slate-800 min-h-[100px] resize-none"
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Fotografías de daños
                        </label>

                        <p className="text-xs text-slate-500 mb-3">
                          Puedes agregar imágenes como evidencia del estado del aparato.
                        </p>

                        <input
                          ref={inputFotosRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFotosChange}
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={() => inputFotosRef.current?.click()}
                          className="w-full border-2 border-dashed border-[#5ba4c7]/20 rounded-3xl p-8 bg-[#5ba4c7]/5 hover:bg-[#5ba4c7]/10 transition-all flex flex-col items-center justify-center gap-3 group"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-[#5ba4c7]/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                            <Upload className="text-[#5ba4c7]" size={28} />
                          </div>
                          <div className="text-center">
                            <p className="font-black text-[#5ba4c7]">Subir fotografías</p>
                            <p className="text-xs text-slate-500 font-medium">PNG, JPG o JPEG</p>
                          </div>
                        </button>
                      </div>

                      {previewFotos.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {previewFotos.map((foto, index) => (
                            <div
                              key={index}
                              className="relative rounded-[28px] overflow-hidden border border-slate-100 bg-white shadow-sm group"
                            >
                              <img
                                src={foto}
                                alt={`Daño ${index + 1}`}
                                className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                              />

                              <button
                                type="button"
                                onClick={() => eliminarFoto(index)}
                                className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-xl shadow-lg backdrop-blur-sm transition-all hover:scale-110"
                              >
                                <X size={16} className="text-[#ff8a71]" />
                              </button>

                              <div className="p-3 flex items-center gap-2 bg-white/80 backdrop-blur-sm absolute bottom-0 left-0 right-0">
                                <Camera size={14} className="text-[#5ba4c7]" />
                                <p className="text-[10px] font-bold text-slate-600 truncate">
                                  {fotografiasDanios[index]?.name}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={handleRegistrarDevolucion}
                        className="w-full bg-[#5ba4c7] hover:bg-[#4a8ba9] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-[#5ba4c7]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                      >
                        <RotateCcw size={22} />
                        <span>Registrar Devolución</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center justify-center p-20 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                  <Package2 className="text-slate-200" size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Selecciona un préstamo
                </h3>
                <p className="text-slate-500 font-medium max-w-xs">
                  Elige un préstamo de la lista de la izquierda para registrar su devolución
                </p>
              </div>
            )}
          </div>

          {/* Historial de Devoluciones */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm mt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl font-black text-slate-900">Historial de Devoluciones</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar registro..."
                    value={busquedaHistorial}
                    onChange={(e) => setBusquedaHistorial(e.target.value)}
                    className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all text-sm font-medium w-64"
                  />
                </div>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 bg-[#5ba4c7] hover:bg-[#4a8ba9] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all"
                >
                  <Download size={18} />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-sm text-slate-500">
                    <th className="pb-4 font-bold">ID Devolución</th>
                    <th className="pb-4 font-bold">Préstamo Ref.</th>
                    <th className="pb-4 font-bold">Beneficiario</th>
                    <th className="pb-4 font-bold">Artículo</th>
                    <th className="pb-4 font-bold">Fecha</th>
                    <th className="pb-4 font-bold">Estado Físico</th>
                    <th className="pb-4 font-bold">Multa/Cargo</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {historialFiltrado.map((dev, index) => (
                    <tr key={index} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 font-bold text-slate-800">{dev.id_devolucion}</td>
                      <td className="py-4 text-slate-600">{dev.id_prestamo}</td>
                      <td className="py-4 font-medium text-slate-800">{dev.nombre_beneficiario}</td>
                      <td className="py-4 text-slate-600">{dev.nombre_articulo}</td>
                      <td className="py-4 text-slate-600">{new Date(dev.fecha_devolucion).toLocaleDateString('es-MX')}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          dev.estado_fisico_recibido === 'Bueno' ? 'bg-emerald-100 text-emerald-700' :
                          dev.estado_fisico_recibido === 'Regular' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {dev.estado_fisico_recibido}
                        </span>
                      </td>
                      <td className="py-4 font-medium text-slate-700">${parseFloat(dev.multa_o_cargo || '0').toFixed(2)}</td>
                    </tr>
                  ))}
                  {historialFiltrado.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">No se encontraron devoluciones</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {ticketModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setTicketModal(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#5ba4c7]/10 text-[#5ba4c7] rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Ticket de Devolución</h3>
              <p className="text-slate-500 font-medium mt-1">Comprobante de recepción</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 space-y-4 mb-8">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 text-sm font-bold">ID Devolución</span>
                <span className="text-slate-900 font-black">{ticketModal.id_devolucion}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 text-sm font-bold">Fecha</span>
                <span className="text-slate-900 font-black">{ticketModal.fecha}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 text-sm font-bold">Beneficiario</span>
                <span className="text-slate-900 font-black text-right">{ticketModal.beneficiario}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 text-sm font-bold">Artículo</span>
                <span className="text-slate-900 font-black text-right">{ticketModal.aparato}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 text-sm font-bold">Estado</span>
                <span className={`font-black ${
                  ticketModal.estadoFisico === 'Bueno' ? 'text-emerald-600' : 
                  ticketModal.estadoFisico === 'Regular' ? 'text-amber-600' : 'text-rose-600'
                }`}>{ticketModal.estadoFisico}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm font-bold">Multa/Cargo</span>
                <span className="text-slate-900 font-black">${ticketModal.multaOCargo.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/20"
              >
                <Printer size={20} />
                <span>Imprimir</span>
              </button>
              <button 
                onClick={() => setTicketModal(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3.5 rounded-xl font-bold transition-all"
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

export default Devoluciones;