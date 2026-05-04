import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
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
  Download,
  CalendarDays,
  TrendingUp,
  FileText,
} from 'lucide-react';

interface ReportesProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

const Reportes: React.FC<ReportesProps> = ({ onLogout, onNavigate }) => {
  const [fechaInicio, setFechaInicio] = useState('2026-01-01');
  const [fechaFin, setFechaFin] = useState('2026-03-09');
  const [tipoReporte, setTipoReporte] = useState('General');
  const [categoria, setCategoria] = useState('Todas');

  const monthlyData = [
    { mes: 'Sep', prestamos: 12, devoluciones: 10 },
    { mes: 'Oct', prestamos: 15, devoluciones: 13 },
    { mes: 'Nov', prestamos: 18, devoluciones: 16 },
    { mes: 'Dic', prestamos: 14, devoluciones: 12 },
    { mes: 'Ene', prestamos: 20, devoluciones: 18 },
    { mes: 'Feb', prestamos: 17, devoluciones: 15 },
    { mes: 'Mar', prestamos: 22, devoluciones: 19 },
  ];

  const categoryData = [
    { name: 'Sillas de ruedas', value: 35, color: '#5ec2d1' },
    { name: 'Muletas', value: 28, color: '#ffb148' },
    { name: 'Andaderas', value: 22, color: '#ff2d37' },
    { name: 'Bastones', value: 15, color: '#4ca0d8' },
  ];

  const utilizationData = [
    { name: 'Silla ruedas estándar', value: 85 },
    { name: 'Muletas aluminio', value: 72 },
    { name: 'Andadera ruedas', value: 68 },
    { name: 'Bastón apoyo', value: 45 },
    { name: 'Silla eléctrica', value: 30 },
  ];

  const beneficiariesData = [
    { rank: 1, name: 'María González', detail: '8 préstamos, 12 aparatos', value: 100 },
    { rank: 2, name: 'José Ramírez', detail: '6 préstamos, 8 aparatos', value: 74 },
    { rank: 3, name: 'Ana Flores', detail: '5 préstamos, 7 aparatos', value: 62 },
    { rank: 4, name: 'Carlos Méndez', detail: '4 préstamos, 5 aparatos', value: 48 },
    { rank: 5, name: 'Rosa Torres', detail: '4 préstamos, 5 aparatos', value: 48 },
  ];

  const inventorySummary = [
    {
      aparato: 'Silla de ruedas estándar',
      total: 10,
      disponible: 8,
      prestamo: 2,
      mantenimiento: 0,
      utilizacion: 85,
    },
    {
      aparato: 'Muletas de aluminio',
      total: 15,
      disponible: 10,
      prestamo: 5,
      mantenimiento: 0,
      utilizacion: 72,
    },
    {
      aparato: 'Andadera con ruedas',
      total: 8,
      disponible: 5,
      prestamo: 3,
      mantenimiento: 0,
      utilizacion: 68,
    },
  ];

  const totalPrestamos = 124;
  const totalDevoluciones = 112;
  const mantenimientos = 18;
  const duracionPromedio = 22;

  const maxValue = Math.max(...monthlyData.map((d) => Math.max(d.prestamos, d.devoluciones)));

  const linePointsPrestamos = monthlyData
    .map((d, i) => {
      const x = (i / (monthlyData.length - 1)) * 100;
      const y = 100 - (d.prestamos / maxValue) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  const linePointsDevoluciones = monthlyData
    .map((d, i) => {
      const x = (i / (monthlyData.length - 1)) * 100;
      const y = 100 - (d.devoluciones / maxValue) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  const pieStyle = useMemo(() => {
    const total = categoryData.reduce((acc, item) => acc + item.value, 0);
    let current = 0;

    const segments = categoryData.map((item) => {
      const start = (current / total) * 360;
      current += item.value;
      const end = (current / total) * 360;
      return `${item.color} ${start}deg ${end}deg`;
    });

    return {
      background: `conic-gradient(${segments.join(', ')})`,
    };
  }, [categoryData]);

 const handleExport = () => {
  const resumenGeneral = [
    { Métrica: 'Total Préstamos', Valor: totalPrestamos },
    { Métrica: 'Devoluciones', Valor: totalDevoluciones },
    { Métrica: 'Mantenimientos', Valor: mantenimientos },
    { Métrica: 'Duración Promedio', Valor: `${duracionPromedio} días` },
    { Métrica: 'Fecha inicio', Valor: fechaInicio },
    { Métrica: 'Fecha fin', Valor: fechaFin },
    { Métrica: 'Tipo de reporte', Valor: tipoReporte },
    { Métrica: 'Categoría', Valor: categoria },
  ];

  const actividadMensual = monthlyData.map((item) => ({
    Mes: item.mes,
    Préstamos: item.prestamos,
    Devoluciones: item.devoluciones,
  }));

  const distribucionCategorias = categoryData.map((item) => ({
    Categoría: item.name,
    Porcentaje: `${item.value}%`,
  }));

  const utilizacionAparatos = utilizationData.map((item) => ({
    Aparato: item.name,
    Utilización: `${item.value}%`,
  }));

  const principalesBeneficiarios = beneficiariesData.map((item) => ({
    Ranking: item.rank,
    Beneficiario: item.name,
    Detalle: item.detail,
    Nivel: `${item.value}%`,
  }));

  const resumenInventario = inventorySummary.map((item) => ({
    Aparato: item.aparato,
    Total: item.total,
    Disponible: item.disponible,
    'En Préstamo': item.prestamo,
    Mantenimiento: item.mantenimiento,
    Utilización: `${item.utilizacion}%`,
  }));

  const workbook = XLSX.utils.book_new();

  const wsResumen = XLSX.utils.json_to_sheet(resumenGeneral);
  const wsActividad = XLSX.utils.json_to_sheet(actividadMensual);
  const wsCategorias = XLSX.utils.json_to_sheet(distribucionCategorias);
  const wsUtilizacion = XLSX.utils.json_to_sheet(utilizacionAparatos);
  const wsBeneficiarios = XLSX.utils.json_to_sheet(principalesBeneficiarios);
  const wsInventario = XLSX.utils.json_to_sheet(resumenInventario);

  XLSX.utils.book_append_sheet(workbook, wsResumen, 'Resumen');
  XLSX.utils.book_append_sheet(workbook, wsActividad, 'Actividad Mensual');
  XLSX.utils.book_append_sheet(workbook, wsCategorias, 'Categorías');
  XLSX.utils.book_append_sheet(workbook, wsUtilizacion, 'Utilización');
  XLSX.utils.book_append_sheet(workbook, wsBeneficiarios, 'Beneficiarios');
  XLSX.utils.book_append_sheet(workbook, wsInventario, 'Inventario');

  XLSX.writeFile(workbook, 'Reporte_Inventario.xlsx');
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

        <div className="p-10 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Reportes y Estadísticas</h2>
              <p className="text-slate-500 font-medium mt-1">
                Análisis de inventario, préstamos y actividad
              </p>
            </div>

            <button
              onClick={handleExport}
              className="bg-[#5ba4c7] hover:bg-[#4a8ba9] text-white px-5 py-2.5 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-[#5ba4c7]/30 transition-all active:scale-[0.98]"
            >
              <Download size={18} />
              <span>Exportar Reporte</span>
            </button>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <FilterField
              label="Fecha inicio"
              icon={<CalendarDays size={16} className="text-[#5ba4c7]" />}
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
            <FilterField
              label="Fecha fin"
              icon={<CalendarDays size={16} className="text-[#5ba4c7]" />}
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
            <SelectField
              label="Tipo de reporte"
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
              options={['General', 'Inventario', 'Préstamos', 'Mantenimiento']}
            />
            <SelectField
              label="Categoría"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              options={['Todas', 'Sillas de ruedas', 'Muletas', 'Andaderas', 'Bastones']}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
            <MetricCard
              icon={<TrendingUp size={24} />}
              iconColor="bg-white/20"
              bgColor="bg-[#94d6c6]"
              value="124"
              title="Total Préstamos"
              subtitle="↑ 15% vs mes anterior"
            />
            <MetricCard
              icon={<BarChart3 size={24} />}
              iconColor="bg-white/20"
              bgColor="bg-[#ffe4c4]"
              value="112"
              title="Devoluciones"
              subtitle="90% tasa de retorno"
            />
            <MetricCard
              icon={<FileText size={24} />}
              iconColor="bg-white/20"
              bgColor="bg-[#ff8a71]"
              value="18"
              title="Mantenimientos"
              subtitle="6 preventivos, 12 correctivos"
            />
            <MetricCard
              icon={<CalendarDays size={24} />}
              iconColor="bg-white/20"
              bgColor="bg-[#ffcc6f]"
              value="22 días"
              title="Duración Promedio"
              subtitle="Por préstamo"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">Actividad Mensual</h3>

              <div className="relative h-64 w-full">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                  {[0, 25, 50, 75, 100].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="100"
                      y2={y}
                      stroke="#f1f5f9"
                      strokeDasharray="2 2"
                      strokeWidth="0.4"
                    />
                  ))}

                  {monthlyData.map((_, i) => {
                    const x = (i / (monthlyData.length - 1)) * 100;
                    return (
                      <line
                        key={i}
                        x1={x}
                        y1="0"
                        x2={x}
                        y2="100"
                        stroke="#f1f5f9"
                        strokeDasharray="2 2"
                        strokeWidth="0.3"
                      />
                    );
                  })}

                  <polyline
                    fill="none"
                    stroke="#5ba4c7"
                    strokeWidth="1.5"
                    points={linePointsPrestamos}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    fill="none"
                    stroke="#94d6c6"
                    strokeWidth="1.5"
                    points={linePointsDevoluciones}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {monthlyData.map((d, i) => {
                    const x = (i / (monthlyData.length - 1)) * 100;
                    const yPrest = 100 - (d.prestamos / maxValue) * 100;
                    const yDev = 100 - (d.devoluciones / maxValue) * 100;

                    return (
                      <g key={i}>
                        <circle cx={x} cy={yPrest} r="1.5" fill="#5ba4c7" stroke="white" strokeWidth="0.5" />
                        <circle cx={x} cy={yDev} r="1.5" fill="#94d6c6" stroke="white" strokeWidth="0.5" />
                      </g>
                    );
                  })}
                </svg>

                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 mt-4">
                  {monthlyData.map((d) => (
                    <span key={d.mes}>{d.mes}</span>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-8 text-xs font-black uppercase tracking-widest">
                <div className="flex items-center gap-2 text-[#5ba4c7]">
                  <span className="w-4 h-1.5 bg-[#5ba4c7] rounded-full"></span>
                  <span>Préstamos</span>
                </div>
                <div className="flex items-center gap-2 text-[#94d6c6]">
                  <span className="w-4 h-1.5 bg-[#94d6c6] rounded-full"></span>
                  <span>Devoluciones</span>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">Distribución por Categoría</h3>

              <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-4">
                <div
                  className="w-48 h-48 rounded-full shadow-xl shadow-slate-200/50 border-8 border-slate-50"
                  style={pieStyle}
                ></div>

                <div className="space-y-4">
                  {categoryData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3 text-sm font-black uppercase tracking-wider">
                      <span
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: item.color }}
                      ></span>
                      <span style={{ color: item.color }}>
                        {item.name}: {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
              <h3 className="text-xl font-black text-slate-900 mb-8">Tasa de Utilización por Aparato</h3>

              <div className="space-y-6">
                {utilizationData.map((item) => (
                  <div key={item.name} className="grid grid-cols-[160px_1fr_50px] items-center gap-6">
                    <span className="text-sm text-slate-700 font-bold">{item.name}</span>
                    <div className="w-full h-10 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-1">
                      <div
                        className="h-full bg-[#5ba4c7] rounded-xl shadow-sm transition-all duration-1000"
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-slate-900 font-black">{item.value}%</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8">
              <h3 className="text-xl font-black text-slate-900 mb-8">Principales Beneficiarios</h3>

              <div className="space-y-6">
                {beneficiariesData.map((item) => (
                  <div key={item.rank} className="grid grid-cols-[48px_1fr_100px] items-center gap-6 group">
                      <div className="w-10 h-10 rounded-2xl bg-[#5ba4c7]/10 text-[#5ba4c7] font-black text-sm flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        {item.rank}
                      </div>

                      <div>
                        <p className="text-sm font-black text-slate-900 group-hover:text-[#5ba4c7] transition-colors">{item.name}</p>
                        <p className="text-xs text-slate-500 font-bold">{item.detail}</p>
                      </div>

                      <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <div
                          className="h-full bg-[#94d6c6] rounded-full transition-all duration-1000 shadow-sm"
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                    </div>
                ))}
              </div>
            </section>
          </div>

          <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-white">
              <h3 className="text-xl font-black text-slate-900">Resumen Detallado de Inventario</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50">
                  <tr className="border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aparato</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Disponible</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">En Préstamo</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Mantenimiento</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Utilización</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {inventorySummary.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-5 text-sm font-black text-slate-900 group-hover:text-[#5ba4c7] transition-colors">{item.aparato}</td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-600 text-center">{item.total}</td>
                      <td className="px-8 py-5 text-center">
                        <span className="bg-[#94d6c6]/10 text-[#94d6c6] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-[#94d6c6]/20">{item.disponible}</span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="bg-[#5ba4c7]/10 text-[#5ba4c7] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-[#5ba4c7]/20">{item.prestamo}</span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="bg-[#ff8a71]/10 text-[#ff8a71] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-[#ff8a71]/20">{item.mantenimiento}</span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#5ba4c7] rounded-full" style={{ width: `${item.utilizacion}%` }}></div>
                          </div>
                          <span className="text-xs font-black text-slate-900">{item.utilizacion}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
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

const FilterField = ({
  label,
  icon,
  type,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
      {icon}
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/5 focus:border-[#5ba4c7] transition-all text-slate-600 font-bold text-sm"
    />
  </div>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  options: string[];
}) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5ba4c7]/5 focus:border-[#5ba4c7] transition-all text-slate-600 font-bold text-sm cursor-pointer"
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  </div>
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