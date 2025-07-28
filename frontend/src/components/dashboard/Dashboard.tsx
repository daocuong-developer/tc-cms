import { Container, Title, Card, Text, Button, Group, Stack } from '@mantine/core';
import { useHasPermission, useHasAnyPermission } from '../../hooks/useHasPermission';
import { useAuth } from '../../contexts/AuthContext';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const canListUsers = useHasPermission('user:list');
  const canManageRoles = useHasAnyPermission(['role:create', 'role:edit', 'role:delete']);

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={1}>Dashboard</Title>
          <Button onClick={logout} color="red">
            Logout
          </Button>
        </Group>

        <Card withBorder p="md">
          <Title order={3} mb="md">
            User Information
          </Title>
          <Text><strong>Name:</strong> {user?.full_name}</Text>
          <Text><strong>Email:</strong> {user?.email}</Text>
          <Text><strong>Roles:</strong> {user?.roles.map(role => role.name).join(', ')}</Text>
        </Card>

        {canListUsers && (
          <Card withBorder p="md">
            <Title order={3} mb="md">
              User Management
            </Title>
            <Text color="dimmed" mb="md">
              You have access to view and manage users.
            </Text>
            <Button component="a" href="/users">
              View Users
            </Button>
          </Card>
        )}

        {canManageRoles && (
          <Card withBorder p="md">
            <Title order={3} mb="md">
              Role Management
            </Title>
            <Text color="dimmed" mb="md">
              You have access to manage roles and permissions.
            </Text>
            <Button component="a" href="/roles">
              Manage Roles
            </Button>
          </Card>
        )}

        <Card withBorder p="md">
          <Title order={3} mb="md">
            Your Permissions
          </Title>
          <Stack style={{ gap: '0.5rem' }}>
            {user?.roles.map(role => (
              <div key={role.id}>
                <Text fw={500}>{role.name}</Text>
                <Text color="dimmed" size="sm">
                  {role.permissions.map(perm => perm.codename).join(', ')}
                </Text>
              </div>
            ))}
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};
