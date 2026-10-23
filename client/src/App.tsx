import { useEffect, useState } from 'react';
import { getUsers, type User } from './services/usersService';

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch {
        setError('No se pudieron cargar los usuarios.');
      } finally {
        setLoading(false);
      }
    }

    void loadUsers();
  }, []);

  if (loading) {
    return <p>Cargando usuarios...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <main>
      <h1>Usuarios de LANotes</h1>

      {users.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id_user}>
              {user.username}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default App;