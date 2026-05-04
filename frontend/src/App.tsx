import { useState } from 'react';
import Login from './Inicio de sesión/Login';
import Dashboard from './Dashboard/Dashboard';
import Inventario from './Inventario/Inventario';
import Prestamos from './Prestamos/Prestamos';
import Devoluciones from './Devoluciones/Devoluciones';
import Beneficiarios from './Beneficiarios/Beneficiarios';
import Reportes from './Reportes/Reportes';
import Usuarios from './Usuarios/Usuarios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Función que envuelve setCurrentView para que tenga la firma (view: string) => void
  const handleNavigate = (view: string) => {
    setCurrentView(view);
  };

  const renderView = () => {
  switch (currentView) {
    case 'dashboard':
      return <Dashboard onLogout={handleLogout} onNavigate={handleNavigate} />;
    case 'inventario':
      return <Inventario onLogout={handleLogout} onNavigate={handleNavigate} />;
    case 'prestamos':
      return <Prestamos onLogout={handleLogout} onNavigate={handleNavigate} />;
    case 'devoluciones':
      return <Devoluciones onLogout={handleLogout} onNavigate={handleNavigate} />;
    case 'beneficiarios':
      return <Beneficiarios onLogout={handleLogout} onNavigate={handleNavigate} />;
    case 'reportes':
      return <Reportes onLogout={handleLogout} onNavigate={handleNavigate} />;
    case 'usuarios':
      return <Usuarios onLogout={handleLogout} onNavigate={handleNavigate} />;
    default:
      return <Dashboard onLogout={handleLogout} onNavigate={handleNavigate} />;
  }
};

  return (
    <>
      {isAuthenticated ? renderView() : <Login onLogin={handleLogin} />}
    </>
  );
}

export default App;