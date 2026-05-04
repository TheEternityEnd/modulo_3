import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';
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
  Download,
  TrendingUp,
  FileText,
  AlertTriangle,
  CalendarDays
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ReportesProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

const Reportes: React.FC<ReportesProps> = ({ onLogout, onNavigate }) => {
  const [resumen, setResumen] = useState({
    total_aparatos: 0,
    total_prestados: 0,
    devoluciones_atrasadas: 0,
    en_mantenimiento: 0
  });
  const [topAparatos, setTopAparatos] = useState<any[]>([]);
  const [prestamosMes, setPrestamosMes] = useState<any[]>([]);

  const [filtroTiempo, setFiltroTiempo] = useState('todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const handleFiltroRapido = (valor: string) => {
    setFiltroTiempo(valor);
    const hoy = new Date();
    
    if (valor === 'todos') {
      setFechaInicio('');
      setFechaFin('');
    } else if (valor === 'este_mes') {
      const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      setFechaInicio(primerDia.toISOString().split('T')[0]);
      setFechaFin(hoy.toISOString().split('T')[0]);
    } else if (valor === '3_meses') {
      const hace3 = new Date(hoy.getFullYear(), hoy.getMonth() - 3, hoy.getDate());
      setFechaInicio(hace3.toISOString().split('T')[0]);
      setFechaFin(hoy.toISOString().split('T')[0]);
    } else if (valor === 'este_anio') {
      const primerDiaAnio = new Date(hoy.getFullYear(), 0, 1);
      setFechaInicio(primerDiaAnio.toISOString().split('T')[0]);
      setFechaFin(hoy.toISOString().split('T')[0]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (fechaInicio && fechaFin) {
          queryParams.append('fechaInicio', fechaInicio);
          queryParams.append('fechaFin', fechaFin);
        }
        const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';

        const [resResumen, resTop, resMes] = await Promise.all([
          fetch(`http://localhost:3000/reportes/resumen${qs}`),
          fetch(`http://localhost:3000/reportes/top-aparatos${qs}`),
          fetch(`http://localhost:3000/reportes/prestamos-mes${qs}`)
        ]);

        if (resResumen.ok) setResumen(await resResumen.json());
        if (resTop.ok) setTopAparatos(await resTop.json());
        if (resMes.ok) setPrestamosMes(await resMes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [fechaInicio, fechaFin]);

  const pieData = [
    { name: 'Disponibles', value: Math.max(0, resumen.total_aparatos - resumen.total_prestados - resumen.en_mantenimiento), color: '#94d6c6' },
    { name: 'Prestados', value: resumen.total_prestados, color: '#ffe4c4' },
    { name: 'Mantenimiento', value: resumen.en_mantenimiento, color: '#ff8a71' }
  ];

  const handleExport = () => {
    const resumenGeneral = [
      { Métrica: 'Total Aparatos', Valor: resumen.total_aparatos },
      { Métrica: 'Total Prestados', Valor: resumen.total_prestados },
      { Métrica: 'Devoluciones Atrasadas', Valor: resumen.devoluciones_atrasadas },
      { Métrica: 'En Mantenimiento', Valor: resumen.en_mantenimiento },
    ];

    const actividadMensual = prestamosMes.map((item) => ({
      Mes: item.mes,
      Préstamos: item.total_prestamos,
    }));

    const masSolicitados = topAparatos.map((item) => ({
      Aparato: item.nombre,
      'Total Préstamos': item.total_prestamos,
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(resumenGeneral), 'Resumen');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(actividadMensual), 'Actividad Mensual');
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(masSolicitados), 'Más Solicitados');

    XLSX.writeFile(workbook, 'Reporte_Inventario.xlsx');
  };

  const componentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Reporte_Inventario_Palabras_de_Esperanza',
  });

  const handleExportarMorosidad = async () => {
    try {
      const response = await fetch('http://localhost:3000/reportes/morosidad');
      if (response.ok) {
        const data = await response.json();
        if (data.length === 0) {
          alert('No hay beneficiarios en mora en este momento.');
          return;
        }
        const morosidadExport = data.map((item: any) => ({
          'Beneficiario': item.beneficiario,
          'Teléfono': item.telefono,
          'Aparato': item.aparato,
          'Fecha Préstamo': new Date(item.fecha_prestamo).toLocaleDateString(),
          'Fecha Límite': new Date(item.fecha_limite_devolucion).toLocaleDateString(),
          'Días de Retraso': item.dias_retraso
        }));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(morosidadExport), 'Reporte de Morosidad');
        XLSX.writeFile(workbook, 'Reporte_Morosidad.xlsx');
      }
    } catch (error) {
      console.error('Error exportando morosidad:', error);
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
          <div className="flex items-center justify-center mb-8"></div>
        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => onNavigate('dashboard')} />
          <NavItem icon={<Package size={20} />} label="Inventario" onClick={() => onNavigate('inventario')} />
          <NavItem icon={<ArrowLeftRight size={20} />} label="Préstamos" onClick={() => onNavigate('prestamos')} />
          <NavItem icon={<RotateCcw size={20} />} label="Devoluciones" onClick={() => onNavigate('devoluciones')} />
          <NavItem icon={<Users size={20} />} label="Beneficiarios" onClick={() => onNavigate('beneficiarios')} />
          <NavItem icon={<BarChart3 size={20} />} label="Reportes" active onClick={() => onNavigate('reportes')} />
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

        <div ref={componentRef} className="p-10 space-y-6 print:p-0 print:m-4">
          {/* Cabecera exclusiva para impresión */}
          <div className="hidden print:flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
            <img src="/src/assets/logo.png" alt="Logo Palabras de Esperanza" className="h-16 object-contain" />
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-900">Reporte Estadístico de Inventario</h2>
              <p className="text-sm text-slate-500 font-medium">Fecha de generación: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Reportes y Estadísticas</h2>
              <p className="text-slate-500 font-medium mt-1">
                Análisis de inventario, préstamos y actividad
              </p>
            </div>

            <div className="flex gap-3 print:hidden">
              <button
                onClick={handleExportarMorosidad}
                className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-rose-500/30 transition-all active:scale-[0.98]"
              >
                <AlertTriangle size={18} />
                <span>Morosidad (CSV)</span>
              </button>

              <button
                onClick={handlePrint}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98]"
              >
                <FileText size={18} />
                <span>Exportar PDF</span>
              </button>

              <button
                onClick={handleExport}
                className="bg-[#5ba4c7] hover:bg-[#4a8ba9] text-white px-5 py-2.5 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-[#5ba4c7]/30 transition-all active:scale-[0.98]"
              >
                <Download size={18} />
                <span>Exportar Excel</span>
              </button>
            </div>
          </div>

          {/* Filtros de Fecha */}
          <div className="flex flex-col xl:flex-row items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-[#5ba4c7]" />
              <span className="text-sm font-bold text-slate-700">Rango de fechas:</span>
            </div>
            <select 
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-[#5ba4c7] focus:border-[#5ba4c7] block p-2.5 font-semibold outline-none cursor-pointer min-w-[180px] shadow-sm"
              value={filtroTiempo}
              onChange={(e) => handleFiltroRapido(e.target.value)}
            >
              <option value="todos">Todo el tiempo</option>
              <option value="este_mes">Este mes</option>
              <option value="3_meses">Últimos 3 meses</option>
              <option value="este_anio">Este año</option>
              <option value="personalizado">Personalizado...</option>
            </select>

            {filtroTiempo === 'personalizado' && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                <input type="date" className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg p-2.5 font-semibold outline-none focus:border-[#5ba4c7] shadow-sm" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                <span className="text-slate-400 font-bold uppercase text-xs">A</span>
                <input type="date" className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg p-2.5 font-semibold outline-none focus:border-[#5ba4c7] shadow-sm" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
            <MetricCard
              icon={<TrendingUp size={24} />}
              iconColor="bg-white/20"
              bgColor="bg-[#94d6c6]"
              value={resumen.total_aparatos.toString()}
              title="Total Aparatos"
              subtitle="En inventario global"
            />
            <MetricCard
              icon={<ArrowLeftRight size={24} />}
              iconColor="bg-white/20"
              bgColor="bg-[#ffe4c4]"
              value={resumen.total_prestados.toString()}
              title="Préstamos Activos"
              subtitle="Inventario ocupado"
            />
            <MetricCard
              icon={<AlertTriangle size={24} />}
              iconColor="bg-white/20"
              bgColor="bg-[#ffcc6f]"
              value={resumen.devoluciones_atrasadas.toString()}
              title="Préstamos Vencidos"
              subtitle="Requieren atención"
            />
            <MetricCard
              icon={<FileText size={24} />}
              iconColor="bg-white/20"
              bgColor="bg-[#ff8a71]"
              value={resumen.en_mantenimiento.toString()}
              title="Mantenimiento"
              subtitle="Reparación o baja"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">Tendencia de Préstamos (Últimos meses)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prestamosMes}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="total_prestamos" name="Préstamos" fill="#5ba4c7" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">Estado Global del Inventario</h3>
              <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-4 h-64">
                <div className="w-48 h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3 text-sm font-black uppercase tracking-wider">
                      <span
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: item.color }}
                      ></span>
                      <span style={{ color: item.color }}>
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
              <h3 className="text-xl font-black text-slate-900 mb-8">Top 5 Aparatos Más Solicitados</h3>
              <div className="space-y-6">
                {topAparatos.map((item, index) => {
                  const maxPrestamos = Math.max(...topAparatos.map(t => t.total_prestamos));
                  const percent = maxPrestamos > 0 ? (item.total_prestamos / maxPrestamos) * 100 : 0;
                  return (
                    <div key={item.nombre} className="grid grid-cols-[30px_1fr_50px] items-center gap-6">
                      <div className="w-8 h-8 rounded-full bg-[#5ba4c7]/10 text-[#5ba4c7] font-black text-sm flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <span className="text-sm text-slate-700 font-bold block mb-1">{item.nombre}</span>
                        <div className="w-full h-2 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                          <div
                            className="h-full bg-[#94d6c6] rounded-xl shadow-sm transition-all duration-1000"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm text-slate-900 font-black">{item.total_prestamos}</span>
                    </div>
                  );
                })}
                {topAparatos.length === 0 && (
                  <p className="text-slate-400 text-sm font-bold text-center py-4">No hay datos suficientes</p>
                )}
              </div>
            </section>
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

const MetricCard = ({
  icon,
  iconColor,
  value,
  title,
  subtitle,
  bgColor,
}: {
  icon: React.ReactNode;
  iconColor: string;
  value: string;
  title: string;
  subtitle: string;
  bgColor: string;
}) => (
  <div className={`${bgColor} p-8 rounded-[40px] shadow-sm space-y-4 group hover:shadow-md transition-all`}>
    <div className={`${iconColor} w-14 h-14 rounded-2xl flex items-center justify-center text-slate-900/80 shadow-sm group-hover:scale-110 transition-transform backdrop-blur-md`}>
      {icon}
    </div>
    <div>
      <h4 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</h4>
      <p className="mt-2 text-sm font-bold text-slate-900/60">{title}</p>
      <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-900/40">{subtitle}</p>
    </div>
  </div>
);

export default Reportes;