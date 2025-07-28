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
import type { RegisterData } from '../../types/auth.types';

export const RegisterForm = () => {
  const { register, isLoading } = useAuth();

  const form = useForm<RegisterData>({
    initialValues: {
      email: '',
      full_name: '',
      password: '',
      password_confirm: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      full_name: (value) => (value.length < 2 ? 'Name is too short' : null),
      password: (value) => {
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain uppercase letter';
        if (!/[a-z]/.test(value)) return 'Password must contain lowercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain number';
        return null;
      },
      password_confirm: (value, values) =>
        value !== values.password ? 'Passwords did not match' : null,
    },
  });

  const handleSubmit = async (values: RegisterData) => {
    try {
      await register(values);
    } catch (error) {
      // Handle different types of errors (e.g., email already exists)
      form.setErrors({
        email: 'Email already exists',
      });
    }
  };

  return (
    <Container size={420} my={40}>
      <Paper radius="md" p="xl" withBorder>
        <Title order={2} ta="center" mt="md" mb={50}>
          Create account
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email address"
              placeholder="hello@email.com"
              size="md"
              {...form.getInputProps('email')}
            />

            <TextInput
              label="Full name"
              placeholder="Your name"
              size="md"
              {...form.getInputProps('full_name')}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              size="md"
              {...form.getInputProps('password')}
            />

            <PasswordInput
              label="Confirm password"
              placeholder="Confirm your password"
              size="md"
              {...form.getInputProps('password_confirm')}
            />

            <Button
              fullWidth
              mt="xl"
              size="md"
              type="submit"
              loading={isLoading}
            >
              Register
            </Button>

            <Text ta="center" size="sm">
              Already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none' }}>
                Login
              </Link>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};
