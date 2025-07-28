import { useForm } from '@mantine/form';
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  Text,
  Stack,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { LoginCredentials } from '../../types/auth.types';

export const LoginForm = () => {
  const { login, isLoading } = useAuth();

  const form = useForm<LoginCredentials>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length < 1 ? 'Password is required' : null),
    },
  });

  const handleSubmit = async (values: LoginCredentials) => {
    try {
      await login(values);
    } catch (error) {
      form.setErrors({
        email: 'Invalid credentials',
        password: 'Invalid credentials',
      });
    }
  };

  return (
    <Container size={420} my={40}>
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} ta="center" mt="md" mb={50}>
          Welcome back
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email address"
              placeholder="hello@email.com"
              size="md"
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              size="md"
              {...form.getInputProps('password')}
            />

            <Button
              fullWidth
              mt="xl"
              size="md"
              type="submit"
              loading={isLoading}
            >
              Sign in
            </Button>

            <Text ta="center" size="sm">
              Don&apos;t have an account?{' '}
              <Link to="/register" style={{ textDecoration: 'none' }}>
                Register
              </Link>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};
