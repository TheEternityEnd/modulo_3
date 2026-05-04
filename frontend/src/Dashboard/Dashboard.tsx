import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  RotateCcw, 
  Users, 
  BarChart3, 
  UserCircle, 
  LogOut, 
  Box,
  Wrench,
  AlertTriangle,
  TrendingUp,
  X,
  AlertCircle,
  PhoneCall,
  UserPlus
} from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, onNavigate }) => {
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [resumen, setResumen] = useState({
    total_aparatos: 0,
    total_prestados: 0,
    en_mantenimiento: 0,
    devoluciones_atrasadas: 0
  });
  const [actividades, setActividades] = useState<any[]>([]);
  const [stockCritico, setStockCritico] = useState<any[]>([]);
  const [morosidad, setMorosidad] = useState<any[]>([]);
  const [userName, setUserName] = useState('');
  const [userRol, setUserRol] = useState('');
  const [actividadMensual, setActividadMensual] = useState<any[]>([]);
  const [inventarioCategoria, setInventarioCategoria] = useState<any[]>([]);

  useEffect(() => {
    // Cargar datos de usuario del localStorage
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
    fetch('http://localhost:3000/reportes/resumen')
      .then(res => res.json())
      .then(data => setResumen(data))
      .catch(err => console.error("Error fetching resumen:", err));

    fetch('http://localhost:3000/dashboard/actividad')
      .then(res => res.json())
      .then(data => setActividades(data))
      .catch(err => console.error("Error fetching actividad:", err));

    fetch('http://localhost:3000/dashboard/stock-critico')
      .then(res => res.json())
      .then(data => setStockCritico(data))
      .catch(err => console.error("Error fetching stock critico:", err));

    fetch('http://localhost:3000/reportes/morosidad')
      .then(res => res.json())
      .then(data => setMorosidad(data))
      .catch(err => console.error("Error fetching morosidad:", err));

    fetch('http://localhost:3000/reportes/prestamos-mes')
      .then(res => res.json())
      .then(data => {
        // Formatear meses de YYYY-MM a un nombre corto
        const formattedData = data.map((d: any) => {
          const date = new Date(d.mes + '-01T00:00:00');
          return {
            mes: date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase(),
            total: d.total_prestamos
          };
        });
        setActividadMensual(formattedData);
      })
      .catch(err => console.error("Error fetching actividad mensual:", err));

    fetch('http://localhost:3000/dashboard/inventario-categoria')
      .then(res => res.json())
      .then(data => setInventarioCategoria(data))
      .catch(err => console.error("Error fetching inventario categoria:", err));
  }, []);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
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
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active onClick={() => onNavigate('dashboard')} />
          <NavItem icon={<Package size={20} />} label="Inventario" onClick={() => onNavigate('inventario')} />
          <NavItem icon={<ArrowLeftRight size={20} />} label="Préstamos" onClick={() => onNavigate('prestamos')} />
          <NavItem icon={<RotateCcw size={20} />} label="Devoluciones" onClick={() => onNavigate('devoluciones')} />
          <NavItem icon={<Users size={20} />} label="Beneficiarios" onClick={() => onNavigate('beneficiarios')} />
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-full scroll-smooth">
        <header className="h-24 bg-[#f3f4f6]/80 backdrop-blur-md flex items-center justify-between px-12 sticky top-0 z-20">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hola de nuevo, {userName || 'Usuario'}</h1>
              <p className="text-sm font-bold text-slate-500 mt-1">Aquí tienes el resumen de hoy.</p>
            </div>
            {/* Minigráfica Sparkline */}
            <div className="hidden lg:flex flex-col gap-1 items-start justify-center pl-8 border-l border-slate-200 h-10">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Actividad Semanal</span>
              <svg width="60" height="16" viewBox="0 0 60 16" className="overflow-visible mt-0.5">
                <path d="M0,12 Q10,14 15,8 T30,10 T45,4 T60,2" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="60" cy="2" r="2.5" fill="#10b981" className="animate-pulse" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar transacciones, clientes, reportes..."
                className="w-96 pl-12 pr-4 py-3 rounded-full border-none bg-black text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-rose-400 border-2 border-white shadow-sm flex items-center justify-center text-white">
                <UserCircle size={24} />
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </div>
          </div>
        </header>

        <div className="px-12 pb-12 space-y-8">
          {/* Accesos Rápidos */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('prestamos')} 
              className="flex items-center gap-3 px-6 py-5 bg-[#5ba4c7] hover:bg-[#4a8eb0] text-white rounded-[24px] shadow-lg shadow-[#5ba4c7]/30 transition-all font-black text-sm flex-1 justify-center hover:-translate-y-1"
            >
              <ArrowLeftRight size={22} />
              Registrar Préstamo
            </button>
            <button 
              onClick={() => onNavigate('devoluciones')} 
              className="flex items-center gap-3 px-6 py-5 bg-[#94d6c6] hover:bg-[#7bc2b1] text-slate-800 rounded-[24px] shadow-lg shadow-[#94d6c6]/30 transition-all font-black text-sm flex-1 justify-center hover:-translate-y-1"
            >
              <RotateCcw size={22} />
              Recibir Devolución
            </button>
            <button 
              onClick={() => onNavigate('beneficiarios')} 
              className="flex items-center gap-3 px-6 py-5 bg-[#ff8a71] hover:bg-[#e6755e] text-white rounded-[24px] shadow-lg shadow-[#ff8a71]/30 transition-all font-black text-sm flex-1 justify-center hover:-translate-y-1"
            >
              <UserPlus size={22} />
              Nuevo Beneficiario
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-8">
            <StatCard icon={<Box size={24} />} iconColor="bg-white/20" value={resumen.total_aparatos.toString()} label="Total Aparatos" trend="En inventario" bgColor="bg-[#94d6c6]" />
            <StatCard icon={<ArrowLeftRight size={24} />} iconColor="bg-white/20" value={resumen.total_prestados.toString()} label="Préstamos Activos" trend="En uso actualmente" bgColor="bg-[#ffe4c4]" />
            <StatCard icon={<Wrench size={24} />} iconColor="bg-white/20" value={resumen.en_mantenimiento.toString()} label="En Mantenimiento" trend="En reparación" bgColor="bg-[#ff8a71]" />
            <StatCard icon={<AlertTriangle size={24} />} iconColor="bg-white/20" value={resumen.devoluciones_atrasadas.toString()} label="Devoluciones Atrasadas" trend="Requieren atención" bgColor="bg-[#ffcc6f]" />
          </div>

          {/* Alertas Operativas */}
          <div className="grid grid-cols-2 gap-8">
            {/* Stock Crítico */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm space-y-6 border border-rose-100 relative overflow-hidden z-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -z-10"></div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Stock Crítico</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Aparatos por agotarse</p>
                </div>
                <div className="p-2 bg-rose-100 rounded-xl">
                  <AlertCircle size={18} className="text-rose-500" />
                </div>
              </div>
              
              <div className="space-y-4">
                {stockCritico.length > 0 ? stockCritico.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <p className="text-sm font-bold text-slate-800">{item.nombre}</p>
                    <div className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${item.cantidad_disponible === 0 ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-orange-600'}`}>
                      {item.cantidad_disponible} disp.
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 font-medium">No hay aparatos con stock crítico.</p>
                )}
              </div>
            </div>

            {/* Morosidad Inmediata */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm space-y-6 border border-amber-100 relative overflow-hidden z-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10"></div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Aviso de Morosidad</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Devoluciones vencidas</p>
                </div>
                <div className="p-2 bg-amber-100 rounded-xl">
                  <PhoneCall size={18} className="text-amber-500" />
                </div>
              </div>
              
              <div className="space-y-4">
                {morosidad.length > 0 ? morosidad.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.beneficiario}</p>
                      <p className="text-xs text-slate-500 font-medium">{item.aparato}</p>
                    </div>
                    <div className="text-right">
                      <div className="px-3 py-1 bg-rose-100 text-rose-600 rounded-md text-[10px] font-black uppercase tracking-widest mb-1">
                        -{item.dias_retraso} días
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold">{item.telefono}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 font-medium">No hay devoluciones vencidas.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Actividad Mensual (Line Chart) */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm space-y-6 border border-slate-50 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Actividad Mensual</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Préstamos vs Devoluciones</p>
                </div>
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <TrendingUp size={18} className="text-emerald-500" />
                </div>
              </div>
              
              <div className="h-48 relative mt-2 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={actividadMensual.length > 0 ? actividadMensual : [{ mes: 'Sin datos', total: 0 }]} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="emerald-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} dy={10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: '#64748b', fontWeight: 'bold', fontSize: '12px' }}
                      itemStyle={{ color: '#10b981', fontWeight: 'black' }}
                    />
                    <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#emerald-gradient)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inventario por Categoría */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm space-y-6 border border-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Inventario por Categoría</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Distribución actual</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Box size={18} className="text-blue-500" />
                </div>
              </div>
              
              <div className="h-48 flex items-end justify-between gap-4 px-2">
                {inventarioCategoria.length > 0 ? (() => {
                  const maxTotal = Math.max(...inventarioCategoria.map(i => i.total));
                  const colors = ['bg-[#5ba4c7]', 'bg-[#94d6c6]', 'bg-[#ffe4c4]', 'bg-[#ff8a71]', 'bg-[#ffcc6f]'];
                  
                  return inventarioCategoria.slice(0, 5).map((item, i) => {
                    const heightPercent = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                        <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{item.total}</span>
                        <div 
                          className={`w-full ${colors[i % colors.length]} rounded-xl shadow-lg shadow-black/5 transition-all group-hover:opacity-80`} 
                          style={{ height: `${Math.max(heightPercent, 10)}%` }}
                        ></div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center leading-tight h-8 flex items-center line-clamp-2" title={item.categoria}>
                          {item.categoria}
                        </span>
                      </div>
                    );
                  });
                })() : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-sm font-medium text-slate-400">Sin datos de categorías</p>
                  </div>
                )}
              </div>
            </div>
<link rel="icon" type="image/png" href="/src/assets/logo.png" />          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Support Tickets (Activity) */}
            <div className="col-span-2 bg-white p-8 rounded-[40px] shadow-sm space-y-8 border border-slate-50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">Actividad Reciente</h3>
                <div className="px-6 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full">Hoy</div>
              </div>

              <div className="flex gap-4">
                <button className="px-6 py-2 bg-rose-400 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Todo</button>
                <button className="px-6 py-2 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100">Préstamos</button>
                <button className="px-6 py-2 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100">Devoluciones</button>
                <button className="px-6 py-2 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100">Mantenimiento</button>
              </div>

              <div className="space-y-4">
                {actividades.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${activity.tipo === 'prestamo' ? 'bg-blue-400' : 'bg-emerald-400'}`}></div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{activity.usuario}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900 flex-1 px-12">
                      {activity.tipo === 'prestamo' ? 'Préstamo: ' : 'Devolución: '} {activity.aparato}
                    </p>
                    <div className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md border ${
                      activity.tipo === 'prestamo' 
                        ? 'bg-blue-50 text-blue-600 border-blue-100' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {formatTime(activity.fecha)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm space-y-8 border border-slate-50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">Transacciones</h3>
              </div>
              
              <div className="space-y-6">
                {actividades.slice(0, 7).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-slate-900 truncate w-32">{activity.usuario}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-2 py-1 text-[8px] font-black uppercase tracking-widest rounded ${
                        activity.tipo === 'prestamo' ? 'bg-blue-100 text-blue-500' : 'bg-emerald-100 text-emerald-500'
                      }`}>
                        {activity.tipo === 'prestamo' ? 'PRE' : 'DEV'}
                      </div>
                      <p className="text-sm font-black text-slate-900 truncate w-32 text-right" title={activity.aparato}>{activity.aparato}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full py-4 bg-[#94d6c6] text-slate-700 text-sm font-black rounded-2xl hover:opacity-90 transition-all">
                Ver todas las transacciones
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Activity Modal */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsActivityModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">Historial</h3>
              <button onClick={() => setIsActivityModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto">
              <div className="space-y-4">
                {actividades.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-[24px] hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white ${
                        activity.tipo === 'prestamo' ? 'bg-blue-400' : 'bg-emerald-400'
                      }`}>
                        {activity.tipo === 'prestamo' ? 'P' : 'D'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          {activity.tipo === 'prestamo' ? 'Préstamo' : 'Devolución'}
                        </p>
                        <p className="text-xs text-slate-500 font-bold">{activity.usuario} - {activity.aparato}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 font-bold">{formatTime(activity.fecha)}</p>
                  </div>
                ))}
              </div>
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

const StatCard = ({ value, label, icon, iconColor, trend, bgColor }: any) => (
  <div className={`${bgColor} p-8 rounded-[40px] shadow-sm space-y-4 group hover:shadow-md transition-all`}>
    <div className={`${iconColor} w-12 h-12 rounded-2xl flex items-center justify-center text-slate-900/80 shadow-sm group-hover:scale-110 transition-transform backdrop-blur-md`}>
      {icon}
    </div>
    <div>
      <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
      <p className="text-sm font-bold text-slate-900/60 mt-1">{label}</p>
      <p className="text-[10px] font-black mt-3 uppercase tracking-widest text-slate-900/40">{trend}</p>
    </div>
  </div>
);

export default Dashboard;
