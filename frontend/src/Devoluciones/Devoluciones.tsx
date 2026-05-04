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
  X
} from 'lucide-react';

interface DevolucionesProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

const Devoluciones: React.FC<DevolucionesProps> = ({ onLogout, onNavigate }) => {
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>('PR-003');
  const [fechaDevolucion, setFechaDevolucion] = useState('09/03/2026');
  const [estadoAparato, setEstadoAparato] = useState('Bueno - Uso normal');
  const [requiereMantenimiento, setRequiereMantenimiento] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [fotografiasDanios, setFotografiasDanios] = useState<File[]>([]);
  const [previewFotos, setPreviewFotos] = useState<string[]>([]);

  const inputFotosRef = useRef<HTMLInputElement | null>(null);

  const activeLoans = [
    {
      id: 'PR-001',
      beneficiario: 'María González García',
      aparato: 'Silla de ruedas estándar',
      fechaPrestamo: '2026-03-01',
      fechaEsperada: '2026-04-01',
      cantidad: 1
    },
    {
      id: 'PR-002',
      beneficiario: 'José Luis Ramírez',
      aparato: 'Muletas de aluminio',
      fechaPrestamo: '2026-03-02',
      fechaEsperada: '2026-04-02',
      cantidad: 1
    },
    {
      id: 'PR-003',
      beneficiario: 'Carlos Méndez Pérez',
      aparato: 'Bastón de apoyo',
      fechaPrestamo: '2026-03-03',
      fechaEsperada: '2026-04-03',
      cantidad: 1
    }
  ];

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

    const datosDevolucion = {
      prestamo: selectedLoanId,
      fechaDevolucion,
      estadoAparato,
      requiereMantenimiento,
      observaciones,
      fotografias: fotografiasDanios.map((foto) => ({
        nombre: foto.name,
        tipo: foto.type,
        tamanio: foto.size
      }))
    };

    console.log('Datos de devolución:', datosDevolucion);
    console.log('Archivos de fotos:', fotografiasDanios);

    alert('Devolución registrada correctamente.');
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
                        type="text"
                        value={fechaDevolucion}
                        onChange={(e) => setFechaDevolucion(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/10 focus:border-[#5ba4c7] transition-all font-medium text-slate-800"
                      />
                    </div>

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
                        <option>Malo - Daños significativos</option>
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
        </div>
      </main>
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