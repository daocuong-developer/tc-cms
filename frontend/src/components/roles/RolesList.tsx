import { useEffect, useState, useCallback } from "react";
import { Card, Title, Table, Container, Loader, Alert, Text, Button, Group, Modal } from "@mantine/core"; // Thêm Button, Group, Modal
import { useDisclosure } from "@mantine/hooks";
import { useHasAnyPermission } from "@hooks/useHasPermission";
import { useAuth } from "@contexts/AuthContext";
import axios from "axios";
import Cookies from "js-cookie";
import RoleCreateForm from "./RoleCreateForm";

interface Role {
    id: number;
    name: string;
    description: string;
    permissions: { id: number; codename: string }[];
    users: { id: number; full_name: string }[];
}

export const RolesList = () => {
    const canManageRoles = useHasAnyPermission(["role:create", "role:edit", "role:delete"]);
    const { isLoading: authLoading } = useAuth();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [opened, { open, close }] = useDisclosure(false);

    const token = Cookies.get("access_token");

    const fetchRoles = useCallback(() => {
        if (!canManageRoles) return;
        setLoading(true);
        axios
            .get("/api/auth/roles/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            })
            .then((res) => {
                setRoles(res.data);
            })
            .catch((err) => {
                console.error("❌ Error fetching roles:", err);
                setError("Failed to fetch roles");
            })
            .finally(() => setLoading(false));
    }, [canManageRoles, token]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleRoleCreated = () => {
        fetchRoles();
        close();
    };

    if (authLoading || loading) return <Loader />;
    if (!canManageRoles) return <Alert color="red">You do not have permission to view roles.</Alert>;
    if (error) return <Alert color="red">{error}</Alert>;

    return (
        <Container size="lg" py="xl">
            <Group justify="flex-end" mb="md">
                <Button onClick={open}>Create New Role</Button>
            </Group>

            <Modal opened={opened} onClose={close} title="Create New Role" centered size={"xl"}>
                <RoleCreateForm onRoleCreated={handleRoleCreated} onClose={close} />
            </Modal>

            <Card withBorder p="md">
                <Title order={2} mb="md">
                    Roles
                </Title>
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
                        {roles.map((role) => (
                            <tr key={role.id}>
                                <td>{role.id}</td>
                                <td>{role.name}</td>
                                <td>{role.description}</td>
                                <td>{role.permissions.map((p) => p.codename).join(", ")}</td>
                                <td>{role.users.map((u) => u.full_name || u.username || "N/A").join(", ")}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </Container>
    );
};
