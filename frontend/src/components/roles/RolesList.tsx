import { useEffect, useState } from 'react';
import { Card, Title, Table, Container, Loader, Alert, Text } from '@mantine/core';
import { useHasAnyPermission } from '../../hooks/useHasPermission';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: { id: number; codename: string }[];
  users: { id: number; full_name: string }[];
}

export const RolesList = () => {
  const canManageRoles = useHasAnyPermission(['role:create', 'role:edit', 'role:delete']);
  const { isLoading: authLoading } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canManageRoles) return;
    setLoading(true);
    axios.get('/api/auth/roles/')
      .then(res => setRoles(res.data))
      .catch(() => setError('Failed to fetch roles'))
      .finally(() => setLoading(false));
  }, [canManageRoles]);

  if (authLoading || loading) return <Loader />;
  if (!canManageRoles) return <Alert color="red">You do not have permission to view roles.</Alert>;
  if (error) return <Alert color="red">{error}</Alert>;

  return (
    <Container size="lg" py="xl">
      <Card withBorder p="md">
        <Title order={2} mb="md">Roles</Title>
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Permissions</th>
              <th>Users</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id}>
                <td>{role.id}</td>
                <td>{role.name}</td>
                <td>{role.description}</td>
                <td>{role.permissions.map(p => p.codename).join(', ')}</td>
                <td>{role.users.map(u => u.full_name).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
}; 