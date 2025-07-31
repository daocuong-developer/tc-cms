import React, { useState, useEffect } from "react";
import { Card, Title, TextInput, Button, Group, Alert, MultiSelect, Loader, Text } from "@mantine/core"; // Thêm Text cho lỗi form
import { useForm } from "@mantine/form"; 
import axios from "axios";
import Cookies from "js-cookie";

interface Permission {
    id: number;
    name: string;
    codename: string;
}

interface RoleCreateFormProps {
    onRoleCreated: () => void;
    onClose?: () => void; 
}

const RoleCreateForm = ({ onRoleCreated, onClose }: RoleCreateFormProps) => {
    const [permissionOptions, setPermissionOptions] = useState<Permission[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [permissionsLoading, setPermissionsLoading] = useState(true);

    const token = Cookies.get("access_token");

    const form = useForm({
        initialValues: {
            name: "",
            description: "",
            permissions: [] as string[], 
        },
        validate: {
            name: (value) => (value.trim().length > 0 ? null : "Role name is required"),
            permissions: (value) => (value.length > 0 ? null : "At least one permission must be selected"),
        },
    });

    useEffect(() => {
        setPermissionsLoading(true);
        axios
            .get("http://localhost:8000/api/auth/permissions/", {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            })
            .then((res) => {
                setPermissionOptions(res.data);
            })
            .catch((err) => {
                console.error("❌ Error loading permissions:", err);
                setError("Failed to load permissions.");
            })
            .finally(() => setPermissionsLoading(false));
    }, [token]);

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const permissionIds = values.permissions
                .map((codename) => permissionOptions.find((p) => p.codename === codename)?.id)
                .filter((id): id is number => id !== undefined);

            await axios.post(
                "http://localhost:8000/api/auth/roles/",
                {
                    name: values.name,
                    description: values.description,
                    permission_ids: permissionIds,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );
            setSuccess("Role created successfully!");
            form.reset(); 
            onRoleCreated(); 
            if (onClose) {
                onClose();
            }
        } catch (err) {
            console.error("❌ Error creating role:", err);
            if (axios.isAxiosError(err) && err.response) {
                if (err.response.data && typeof err.response.data === "object") {
                    const backendErrors: Record<string, string> = {};
                    for (const key in err.response.data) {
                        if (Array.isArray(err.response.data[key]) && err.response.data[key].length > 0) {
                            const formKey = key === "permission_ids" ? "permissions" : key;
                            backendErrors[formKey] = err.response.data[key].join(", ");
                        }
                    }
                    form.setErrors(backendErrors);
                    setError("Please fix the errors below.");
                } else {
                    setError(err.response.data.detail || "Failed to create role.");
                }
            } else {
                setError("Failed to create role.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (permissionsLoading) {
        return <Loader />;
    }

    return (
        <Card withBorder={false} p="md">
            <Title order={3} mb="md">
                Create New Role
            </Title>
            {error && (
                <Alert color="red" mb="md">
                    {error}
                </Alert>
            )}
            {success && (
                <Alert color="green" mb="md">
                    {success}
                </Alert>
            )}
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <TextInput
                    label="Role Name"
                    placeholder="Enter role name"
                    required
                    mb="md"
                    {...form.getInputProps("name")}
                />
                <TextInput
                    label="Description"
                    placeholder="Enter role description"
                    mb="md"
                    {...form.getInputProps("description")}
                />
                <MultiSelect
                    label="Permissions"
                    placeholder="Select permissions"
                    required
                    data={permissionOptions.map((p) => ({
                        value: p.codename,
                        label: `${p.name ?? p.codename} (${p.codename})`,
                    }))}
                    searchable
                    clearable
                    mb="md"
                    {...form.getInputProps("permissions")}
                />
                <Group justify="flex-end" mt="md">
                    <Button type="submit" loading={loading}>
                        Create Role
                    </Button>
                </Group>
            </form>
        </Card>
    );
};

export default RoleCreateForm;
