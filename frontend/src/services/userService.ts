import { RegisterPayload, User } from '../stores/userTypes';
import { API_URL } from '../utils/api';

// Cadastro de usuário
export async function registerUser(payload: RegisterPayload): Promise<User> {
  const res = await fetch(`${API_URL}/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
}

// Buscar perfil do usuário autenticado
export async function getUserProfile(token: string): Promise<User> {
  const res = await fetch(`${API_URL}/user/profile`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

// Atualizar usuário
export async function updateUser(id: string, payload: Partial<RegisterPayload>, token: string): Promise<User> {
  const res = await fetch(`${API_URL}/user/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Update failed');
  return res.json();
}

// Deletar usuário
export async function deleteUser(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/user/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Delete failed');
}