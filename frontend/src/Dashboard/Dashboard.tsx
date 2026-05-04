import React, { useState } from 'react';
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
  Box,
  Wrench,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  X,
  History
} from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, onNavigate }) => {
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  const activities = [
    { icon: <ArrowLeftRight size={18} />, title: "Préstamo registrado", subtitle: "Silla de ruedas estándar", user: "María González", time: "Hace 2 horas", iconColor: "bg-blue-50 text-blue-600" },
    { icon: <RotateCcw size={18} />, title: "Devolución completada", subtitle: "Muletas de aluminio", user: "José Ramírez", time: "Hace 5 horas", iconColor: "bg-emerald-50 text-emerald-600" },
    { icon: <Package size={18} />, title: "Nuevo aparato", subtitle: "Andadera con ruedas", user: "Admin", time: "Hace 1 día", iconColor: "bg-purple-50 text-purple-600" },
    { icon: <Wrench size={18} />, title: "Mantenimiento", subtitle: "Silla eléctrica", user: "Taller", time: "Hace 2 días", iconColor: "bg-amber-50 text-amber-600" },
    { icon: <ArrowLeftRight size={18} />, title: "Préstamo registrado", subtitle: "Bastón de apoyo", user: "Ana López", time: "Hace 3 días", iconColor: "bg-blue-50 text-blue-600" },
  ];

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
      <main className="flex-1 overflow-y-auto h-full scroll-smooth">
        <header className="h-24 bg-transparent flex items-center justify-between px-12 sticky top-0 z-20">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
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
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-8">
            <StatCard icon={<Box size={24} />} iconColor="bg-white/20" value="42" label="Aparatos Disponibles" trend="+5 este mes" bgColor="bg-[#94d6c6]" />
            <StatCard icon={<ArrowLeftRight size={24} />} iconColor="bg-white/20" value="28" label="Aparatos Prestados" trend="15 activos" bgColor="bg-[#ffe4c4]" />
            <StatCard icon={<Wrench size={24} />} iconColor="bg-white/20" value="7" label="En Mantenimiento" trend="3 por reparar" bgColor="bg-[#ff8a71]" />
            <StatCard icon={<AlertTriangle size={24} />} iconColor="bg-white/20" value="3" label="Préstamos Vencidos" trend="Requiere atención" bgColor="bg-[#ffcc6f]" />
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
              
              <div className="h-48 relative mt-2">
                {/* SVG for Line Chart matching the requested design */}
                <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0, 50, 100, 150, 200].map((y) => (
                    <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                  ))}
                  
                  {/* Area Fill */}
                  <path 
                    d="M0,150 C100,130 150,100 200,100 C300,100 350,140 400,140 C450,140 500,80 600,80 V200 H0 Z" 
                    fill="url(#emerald-gradient)" 
                    fillOpacity="0.1"
                  />
                  
                  {/* Line (Spline) */}
                  <path 
                    d="M0,150 C100,130 150,100 200,100 C300,100 350,140 400,140 C450,140 500,80 600,80" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                  />
                  
                  <defs>
                    <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  
                  {/* Points (Circles) */}
                  {[
                    { x: 0, y: 150 },
                    { x: 120, y: 130 },
                    { x: 240, y: 100 },
                    { x: 360, y: 140 },
                    { x: 480, y: 80 },
                    { x: 600, y: 100 }
                  ].map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="5" fill="white" stroke="#10b981" strokeWidth="3" />
                  ))}
                </svg>
                
                {/* Labels */}
                <div className="flex justify-between mt-4 px-2">
                  {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'].map((m, i) => (
                    <span key={i} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m}</span>
                  ))}
                </div>
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
                {[
                  { h: 15, label: 'Sillas de ruedas', color: 'bg-[#5ba4c7]' },
                  { h: 22, label: 'Muletas', color: 'bg-[#94d6c6]' },
                  { h: 18, label: 'Andaderas', color: 'bg-[#ffe4c4]' },
                  { h: 30, label: 'Bastones', color: 'bg-[#ff8a71]' },
                  { h: 12, label: 'Otros', color: 'bg-[#ffcc6f]' }
                ].map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                    <div className={`w-full ${item.color} rounded-xl shadow-lg shadow-black/5 transition-all group-hover:opacity-80`} style={{ height: `${item.h * 4.5}px` }}></div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center leading-tight h-6 flex items-center">{item.label}</span>
                  </div>
                ))}
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
                {activities.slice(0, 4).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${index % 2 === 0 ? 'bg-rose-400' : 'bg-slate-300'}`}></div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{activity.user.toLowerCase()}@fundacion.org</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-900 flex-1 px-12">{activity.title}</p>
                    <div className="px-4 py-1.5 bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest rounded-md border border-amber-100">Abierto</div>
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
                {activities.slice(0, 7).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-slate-900 truncate w-32">{activity.user}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="px-2 py-1 bg-rose-100 text-rose-500 text-[8px] font-black uppercase tracking-widest rounded">PRO</div>
                      <p className="text-sm font-black text-slate-900">+$49</p>
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
                {activities.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
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

const ActivityItem = ({ title, user, time }: any) => (
  <div className="flex items-center justify-between p-4 rounded-[24px] hover:bg-slate-50 transition-colors">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
        {user.charAt(0)}
      </div>
      <div>
        <p className="text-sm font-black text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 font-bold">{user}</p>
      </div>
    </div>
    <p className="text-xs text-slate-400 font-bold">{time}</p>
  </div>
);

export default Dashboard;
