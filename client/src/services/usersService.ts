export interface User {
  id_user: number;
  username: string;
  role_id: number;
  bio: string | null;
  registered_at: string;
}

export async function getUsers(): Promise<User[]> {
  const response = await fetch('/users');

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return (await response.json()) as User[];
}