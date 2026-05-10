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
  Download,
  Upload,
  FileText,
  Image as ImageIcon
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
  identificacion_archivo_nombre?: string;
  identificacion_archivo_tipo?: string;
  identificacion_archivo_url?: string;
}
interface ArchivoIdentificacion {
  nombre: string;
  tipo: string;
  url: string;
  
}
const TEMP_IDENTIFICACION_URL = '/src/assets/logo.png';
const TEMP_IDENTIFICACION_NOMBRE = 'identificacion-temporal.png';
const TEMP_IDENTIFICACION_TIPO = 'image/png';

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
  const [archivoIdentificacion, setArchivoIdentificacion] = useState<ArchivoIdentificacion | null>(null);

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
    setArchivoIdentificacion(null);
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

  setArchivoIdentificacion(
    beneficiario.identificacion_archivo_url
      ? {
          nombre: beneficiario.identificacion_archivo_nombre || 'Identificación oficial',
          tipo: beneficiario.identificacion_archivo_tipo || 'application/pdf',
          url: beneficiario.identificacion_archivo_url
        }
      : null
  );

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
  const handleIdentificacionFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];

  if (!file) return;

  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

  if (!allowedTypes.includes(file.type)) {
    alert('Solo se permiten archivos PDF, PNG, JPG o JPEG.');
    return;
  }

  const maxSizeMB = 5;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    alert(`El archivo no debe pesar más de ${maxSizeMB} MB.`);
    return;
  }

  const reader = new FileReader();

  reader.onloadend = () => {
    setArchivoIdentificacion({
      nombre: file.name,
      tipo: file.type,
      url: reader.result as string
    });
  };

  reader.readAsDataURL(file);
};

const handleRemoveIdentificacionFile = () => {
  setArchivoIdentificacion(null);
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
setArchivoIdentificacion(null);
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

  const getIdentificacionPreview = (beneficiario: Beneficiario) => {
  return beneficiario.identificacion_archivo_url || TEMP_IDENTIFICACION_URL;
};

const getIdentificacionNombre = (beneficiario: Beneficiario) => {
  return beneficiario.identificacion_archivo_nombre || TEMP_IDENTIFICACION_NOMBRE;
};

const getIdentificacionTipo = (beneficiario: Beneficiario) => {
  return beneficiario.identificacion_archivo_tipo || TEMP_IDENTIFICACION_TIPO;
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
  <div className="space-y-3">
    <label className="text-sm font-bold text-slate-700 ml-1">
      Identificación
    </label>

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
    <label className="text-sm font-bold text-slate-700 ml-1">
      Teléfono
    </label>

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

  <div className="space-y-3 col-span-2">
    <label className="text-sm font-bold text-slate-700 ml-1">
      Archivo de identificación oficial
    </label>

    <label className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-2 border-dashed border-[#5ba4c7]/40 rounded-2xl cursor-pointer hover:bg-[#e9f8fb] hover:border-[#5ba4c7] transition-all">
      <div className="w-10 h-10 rounded-xl bg-[#5ba4c7]/10 text-[#5ba4c7] flex items-center justify-center shrink-0">
        <Upload size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800">
          Cargar identificación
        </p>
        <p className="text-xs text-slate-500 font-medium">
          PDF, PNG, JPG o JPEG
        </p>
      </div>

      <input
        type="file"
        accept="application/pdf,image/png,image/jpeg,image/jpg"
        onChange={handleIdentificacionFileUpload}
        className="hidden"
      />
    </label>

    {archivoIdentificacion && (
      <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#5ba4c7]/10 text-[#5ba4c7] flex items-center justify-center shrink-0">
            {archivoIdentificacion.tipo === 'application/pdf' ? (
              <FileText size={20} />
            ) : (
              <ImageIcon size={20} />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">
              {archivoIdentificacion.nombre}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {archivoIdentificacion.tipo === 'application/pdf'
                ? 'Documento PDF'
                : 'Imagen'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRemoveIdentificacionFile}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
          title="Quitar archivo"
        >
          <X size={18} />
        </button>
      </div>
    )}
  </div>

  <div className="space-y-2 col-span-2">
    <label className="text-sm font-bold text-slate-700 ml-1">
      Correo electrónico
    </label>

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
{/* Modal Detalle */}
{selectedBeneficiary && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm p-6">
    <div
      className="absolute inset-0"
      onClick={() => setSelectedBeneficiary(null)}
    ></div>

    <div className="relative bg-white w-full max-w-6xl h-[86vh] rounded-[34px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
      
      {/* Header */}
      <div className="shrink-0 px-8 py-6 border-b border-[#9bd8ea]/50 flex items-center justify-between bg-[#effcff]">
        <div>
          <h3 className="text-2xl font-black text-slate-900">
            Detalle del Beneficiario
          </h3>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Información general, identificación oficial e historial de préstamos
          </p>
        </div>

        <button
          onClick={() => setSelectedBeneficiary(null)}
          className="w-11 h-11 rounded-2xl bg-white border border-slate-100 text-slate-500 hover:text-[#5ba4c7] hover:border-[#5ba4c7]/40 hover:bg-[#f8fdfe] transition-all flex items-center justify-center shadow-sm"
          title="Cerrar"
        >
          <X size={24} />
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 min-h-0 overflow-hidden p-7 bg-[#f8fdfe]">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-7 h-full min-h-0">
          
          {/* Columna izquierda */}
          <div className="space-y-6 overflow-y-auto pr-2">
            
            {/* Tarjeta del beneficiario */}
            <div className="bg-white border border-[#9bd8ea]/70 rounded-[30px] p-6 shadow-md shadow-[#5ba4c7]/10">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-[#5ba4c7]/15 flex items-center justify-center text-[#5ba4c7] font-black text-xl shrink-0">
                  {selectedBeneficiary.nombre_completo
                    ? selectedBeneficiary.nombre_completo.split(' ').map((n) => n[0]).slice(0, 2).join('')
                    : 'N/A'}
                </div>

                <div className="min-w-0 pt-1">
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">
                    {selectedBeneficiary.nombre_completo}
                  </h4>

                  <p className="text-xs text-slate-500 font-bold mt-2 break-all">
                    ID: {selectedBeneficiary.identificacion}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-slate-700 text-sm font-bold">
                  <div className="w-9 h-9 rounded-xl bg-[#5ba4c7]/10 flex items-center justify-center">
                    <Phone size={17} className="text-[#5ba4c7]" />
                  </div>
                  <span>{selectedBeneficiary.telefono || 'N/A'}</span>
                </div>

                <div className="flex items-start gap-3 text-slate-700 text-sm font-bold">
                  <div className="w-9 h-9 rounded-xl bg-[#5ba4c7]/10 flex items-center justify-center shrink-0">
                    <MapPin size={17} className="text-[#5ba4c7]" />
                  </div>
                  <span className="leading-relaxed">{selectedBeneficiary.direccion || 'N/A'}</span>
                </div>

                <div className="bg-[#f1fbfe] border border-[#9bd8ea]/60 rounded-2xl p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-[#5ba4c7] mb-2">
                    Correo electrónico
                  </p>
                  <p className="text-sm font-bold text-slate-800 break-all">
                    {selectedBeneficiary.correo || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Identificación oficial */}
            <div className="bg-white border border-[#9bd8ea]/70 rounded-[30px] p-6 shadow-md shadow-[#5ba4c7]/10">
              <div className="flex items-center justify-between mb-5">
                <h5 className="text-xl font-black text-slate-900">
                  Identificación Oficial
                </h5>
              </div>

              <div className="bg-[#f1fbfe] border border-[#9bd8ea]/70 rounded-3xl h-60 flex items-center justify-center overflow-hidden mb-5">
                {getIdentificacionTipo(selectedBeneficiary) === 'application/pdf' ? (
                  <div className="flex flex-col items-center justify-center text-[#5ba4c7] gap-3">
                    <FileText size={58} />
                    <span className="text-sm font-black text-slate-500">
                      Vista previa PDF
                    </span>
                  </div>
                ) : (
                  <img
                    src={getIdentificacionPreview(selectedBeneficiary)}
                    alt="Vista previa de identificación oficial"
                    className="w-full h-full object-contain p-4"
                  />
                )}
              </div>

              <div className="flex items-center gap-3 bg-[#f8fdfe] border border-[#9bd8ea]/60 rounded-2xl p-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#5ba4c7]/10 text-[#5ba4c7] flex items-center justify-center shrink-0">
                  {getIdentificacionTipo(selectedBeneficiary) === 'application/pdf' ? (
                    <FileText size={24} />
                  ) : (
                    <ImageIcon size={24} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">
                    {getIdentificacionNombre(selectedBeneficiary)}
                  </p>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">
                    {getIdentificacionTipo(selectedBeneficiary) === 'application/pdf'
                      ? 'Documento PDF'
                      : 'Imagen de identificación'}
                  </p>
                </div>
              </div>

              {!selectedBeneficiary.identificacion_archivo_url && (
                <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
                  Vista previa temporal usando el logotipo del sistema. Después se reemplazará por el archivo real desde la base de datos.
                </p>
              )}

              <a
                href={getIdentificacionPreview(selectedBeneficiary)}
                download={getIdentificacionNombre(selectedBeneficiary)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#5ba4c7] hover:bg-[#4a8ba9] text-white text-sm font-black shadow-lg shadow-[#5ba4c7]/30 transition-all active:scale-[0.98]"
              >
                <Download size={19} />
                Descargar identificación
              </a>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-6 min-h-0 overflow-hidden">
            
            {/* Información de registro */}
            <div className="bg-white border border-[#9bd8ea]/70 rounded-[30px] p-6 shadow-md shadow-[#5ba4c7]/10">
              <h5 className="text-xl font-black text-slate-900 mb-5">
                Información de Registro
              </h5>

              <div className="bg-[#f1fbfe] border border-[#9bd8ea]/60 rounded-2xl p-5">
                <p className="text-sm font-bold text-slate-600">
                  Fecha de alta:
                  <span className="font-black text-slate-900 ml-1">
                    {new Date(selectedBeneficiary.fecha_registro).toLocaleString('es-MX')}
                  </span>
                </p>
              </div>
            </div>

            {/* Historial de préstamos */}
            <div className="bg-white border border-[#9bd8ea]/70 rounded-[30px] p-6 shadow-md shadow-[#5ba4c7]/10">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h5 className="text-xl font-black text-slate-900">
                    Historial de Préstamos
                  </h5>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    Se muestran hasta 3 registros visibles; el resto queda en desplazamiento interno.
                  </p>
                </div>

                <span className="px-3 py-1.5 rounded-full bg-[#5ba4c7]/10 text-[#5ba4c7] text-xs font-black">
                  {
                    prestamosData.filter(
                      p => p.id_beneficiario === selectedBeneficiary.id_beneficiario
                    ).length
                  } registros
                </span>
              </div>

              <div className="max-h-[315px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-[#9bd8ea] scrollbar-track-transparent">
                {(() => {
                  const historial = prestamosData.filter(
                    p => p.id_beneficiario === selectedBeneficiary.id_beneficiario
                  );

                  if (historial.length === 0) {
                    return (
                      <div className="bg-[#f1fbfe] border border-[#9bd8ea]/60 rounded-2xl p-8 text-center">
                        <p className="text-sm text-slate-500 font-bold">
                          No tiene préstamos registrados.
                        </p>
                      </div>
                    );
                  }

                  return historial.map((prestamo, index) => (
                    <div
                      key={index}
                      className="bg-[#f1fbfe] border border-[#9bd8ea]/60 rounded-2xl p-5 hover:border-[#5ba4c7] hover:bg-white transition-all"
                    >
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <span className="font-black text-slate-900 text-base">
                          {prestamo.nombre_articulo}
                        </span>

                        <span
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            prestamo.estado_prestamo === 'Activo'
                              ? 'bg-[#94d6c6]/30 text-[#21a78a]'
                              : 'bg-[#9bd8ea]/50 text-[#0f6f8b]'
                          }`}
                        >
                          {prestamo.estado_prestamo}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white/80 rounded-xl px-3 py-2 border border-white">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Préstamo
                          </p>
                          <p className="text-xs font-bold text-slate-700 mt-0.5">
                            {new Date(prestamo.fecha_prestamo).toLocaleDateString('es-MX')}
                          </p>
                        </div>

                        <div className="bg-white/80 rounded-xl px-3 py-2 border border-white">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Devolución
                          </p>
                          <p className="text-xs font-bold text-slate-700 mt-0.5">
                            {new Date(prestamo.fecha_limite_devolucion).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
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