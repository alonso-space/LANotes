import { useCallback, useEffect, useState } from 'react';
import AuthScreen from './components/AuthScreen';
import NotesScreen from './components/NotesScreen';
import { ApiError } from './services/api';
import { getAuthConfig, getCurrentUser, logout, type User } from './services/authService';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [guestRegister, setGuestRegister] = useState(true);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const config = await getAuthConfig();
        setGuestRegister(config.guestRegister);

        try {
          setUser(await getCurrentUser());
        } catch (error) {
          // 401 solo significa "no hay sesión": se muestra el login
          if (!(error instanceof ApiError && error.status === 401)) {
            throw error;
          }
        }
      } catch {
        setLoadError('No se pudo conectar con el servidor.');
      } finally {
        setReady(true);
      }
    }

    void init();
  }, []);

  // Estable entre renders: NotesScreen lo usa como dependencia de un efecto
  const handleSessionExpired = useCallback(() => setUser(null), []);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setUser(null);
    }
  }

  if (!ready) {
    return <p className="status-message">Abriendo tu cuaderno…</p>;
  }

  if (loadError) {
    return (
      <p className="status-message" role="alert">
        {loadError}
      </p>
    );
  }

  if (!user) {
    return <AuthScreen guestRegister={guestRegister} onAuthenticated={setUser} />;
  }

  return <NotesScreen user={user} onLogout={handleLogout} onSessionExpired={handleSessionExpired} />;
}

export default App;
