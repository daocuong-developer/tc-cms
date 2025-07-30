import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/authApi";

interface Role {
    id: number;
    name: string;
    description: string;
    permissions: { id: number; codename: string }[];
    users: { id: number; full_name: string }[];
}

const RoleList: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // useEffect(() => {
    //     setLoading(true);
    //     axios
    //         .get("/api/auth/roles/")
    //         .then((res) => {
    //             console.log(res.data);
    //             setRoles(res.data);
    //         })

    //         .catch(() => setError("Failed to fetch roles"))
    //         .finally(() => setLoading(false));
    // }, []);

    useEffect(() => {
        setLoading(true);
        api.get("/auth/roles/")
            .then((res) => {
                console.log(res.data);
                setRoles(res.data);
            })
            .catch(() => setError("Failed to fetch roles"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Role List</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 border-b">ID</th>
                            <th className="py-2 px-4 border-b">Name</th>
                            <th className="py-2 px-4 border-b">Description</th>
                            <th className="py-2 px-4 border-b">Permissions</th>
                            <th className="py-2 px-4 border-b">Users</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((role) => (
                            <tr key={role.id} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-4">{role.id}</td>
                                <td className="py-2 px-4">{role.name}</td>
                                <td className="py-2 px-4">{role.description}</td>
                                <td className="py-2 px-4">{role.permissions.map((p) => p.codename).join(", ")}</td>
                                <td className="py-2 px-4">{role.users.map((u) => u.username).join(", ")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RoleList;
