import { useEffect, useState } from 'react';
import { Card, Title, Table, Container, Loader, Alert } from '@mantine/core';
import { useHasPermission } from '../../hooks/useHasPermission';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  full_name: string;
  roles: { id: number; name: string }[];
}

export const UsersList = () => {
  const canListUsers = useHasPermission('user:list');
  const { isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canListUsers) return;
    setLoading(true);
    axios.get('/api/auth/users/')
      .then(res => setUsers(res.data))
      .catch(() => setError('Failed to fetch users'))
      .finally(() => setLoading(false));
  }, [canListUsers]);

  if (authLoading || loading) return <Loader />;
  if (!canListUsers) return <Alert color="red">You do not have permission to view users.</Alert>;
  if (error) return <Alert color="red">{error}</Alert>;

  return (
    <Container size="lg" py="xl">
      <Card withBorder p="md">
        <Title order={2} mb="md">Users</Title>
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Roles</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.roles.map(r => r.name).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
}; 