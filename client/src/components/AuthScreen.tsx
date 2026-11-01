import { useState, type FormEvent } from 'react';
import { ApiError } from '../services/api';
import { login, register, type User } from '../services/authService';
import ThemeToggle from './ThemeToggle';

interface Props {
  guestRegister: boolean;
  onAuthenticated: (user: User) => void;
}

type Mode = 'login' | 'register';

function AuthScreen({ guestRegister, onAuthenticated }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';

  function changeMode(next: Mode) {
    setMode(next);
    setPassword('');
    setConfirm('');
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    // Solo comodidad: el servidor vuelve a validar todo
    if (isRegister && password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setBusy(true);

    try {
      const user = isRegister
        ? await register(username, password)
        : await login(username, password);
      onAuthenticated(user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Algo salió mal. Inténtalo de nuevo.');
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-theme">
        <ThemeToggle />
      </div>
      <section className="auth-card">
        <h1 className="wordmark">LANotes</h1>
        <p className="auth-tagline">Notas que se quedan en tu red local.</p>

        {guestRegister && (
          <div className="mode-switch">
            <button
              type="button"
              aria-pressed={!isRegister}
              onClick={() => changeMode('login')}
            >
              Entrar
            </button>
            <button
              type="button"
              aria-pressed={isRegister}
              onClick={() => changeMode('register')}
            >
              Crear cuenta
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={30}
              required
            />
            {isRegister && (
              <p className="field-hint">3 a 30 caracteres: letras, números, punto, guion o guion bajo.</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              maxLength={72}
              minLength={isRegister ? 8 : undefined}
              required
            />
            {isRegister && <p className="field-hint">Mínimo 8 caracteres.</p>}
          </div>

          {isRegister && (
            <div className="field">
              <label htmlFor="confirm">Repite la contraseña</label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                autoComplete="new-password"
                maxLength={72}
                required
              />
            </div>
          )}

          <p className="form-error" role="alert">
            {error}
          </p>

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Un momento…' : isRegister ? 'Crear cuenta' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AuthScreen;
