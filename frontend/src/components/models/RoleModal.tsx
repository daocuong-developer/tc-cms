import React, { useState, useEffect } from "react";
import { X, Shield, Users, Lock, AlertCircle } from "lucide-react";
import { RoleDetail, PermissionDetail } from "@services/securityApi";

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    role?: RoleDetail | null;
    mode: "view" | "edit" | "create";
    permissions: PermissionDetail[];
    onSave: (roleData: any) => Promise<void>;
}

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, role, mode, permissions, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        permissions: [] as string[],
    });
    const [loading, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (role && (mode === "edit" || mode === "view")) {
            setFormData({
                name: role.name || "",
                description: role.description || "",
                permissions: role.permissions?.map((p) => p.id.toString()) || [],
            });
        } else if (mode === "create") {
            setFormData({
                name: "",
                description: "",
                permissions: [],
            });
        }
        setError(null);
    }, [role, mode, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === "view") return;

        setSaving(true);
        setError(null);

        try {
            await onSave({
                ...formData,
                permissions: formData.permissions.map((id) => parseInt(id)),
            });
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save role");
        } finally {
            setSaving(false);
        }
    };

    const handlePermissionToggle = (permissionId: string) => {
        if (mode === "view") return;

        setFormData((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(permissionId)
                ? prev.permissions.filter((id) => id !== permissionId)
                : [...prev.permissions, permissionId],
        }));
    };

    const filteredPermissions = permissions.filter(
        (permission) =>
            permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            permission.module.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
        const module = permission.module || "Other";
        if (!acc[module]) {
            acc[module] = [];
        }
        acc[module].push(permission);
        return acc;
    }, {} as Record<string, PermissionDetail[]>);

    const getPermissionTypeBadge = (type: string) => {
        const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
        switch (type) {
            case "admin":
                return `${baseClasses} bg-red-100 text-red-800`;
            case "write":
                return `${baseClasses} bg-blue-100 text-blue-800`;
            case "delete":
                return `${baseClasses} bg-orange-100 text-orange-800`;
            case "read":
                return `${baseClasses} bg-green-100 text-green-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Shield className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {mode === "create"
                                        ? "Create New Role"
                                        : mode === "edit"
                                        ? "Edit Role"
                                        : "Role Details"}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {mode === "create"
                                        ? "Define a new role with specific permissions"
                                        : mode === "edit"
                                        ? "Modify role information and permissions"
                                        : "View role information and assigned permissions"}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-green-100 rounded-lg transition-colors">
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-medium text-red-800">Error</h4>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Basic Information */}
                        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <Users className="h-5 w-5 mr-2 text-gray-600" />
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                        disabled={mode === "view"}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="Enter role name"
                                        required
                                    />
                                </div>

                                {role && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Users Count
                                        </label>
                                        <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                                            {role.user_count} users assigned
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                    disabled={mode === "view"}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Describe the role's purpose and responsibilities"
                                />
                            </div>
                        </div>

                        {/* Permissions */}
                        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Lock className="h-5 w-5 mr-2 text-gray-600" />
                                    Permissions ({formData.permissions.length} selected)
                                </h3>
                                {mode !== "view" && (
                                    <input
                                        type="text"
                                        placeholder="Search permissions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                )}
                            </div>

                            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                                {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                                    <div key={module} className="border-b border-gray-100 last:border-b-0">
                                        <div className="bg-gray-50 px-4 py-2 font-medium text-gray-700 text-sm uppercase tracking-wide">
                                            {module}
                                        </div>
                                        <div className="p-2 space-y-1">
                                            {modulePermissions.map((permission) => (
                                                <label
                                                    key={permission.id}
                                                    className={`flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                                                        mode === "view" ? "cursor-default" : ""
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.permissions.includes(
                                                            permission.id.toString()
                                                        )}
                                                        onChange={() =>
                                                            handlePermissionToggle(permission.id.toString())
                                                        }
                                                        disabled={mode === "view"}
                                                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded disabled:cursor-not-allowed"
                                                    />
                                                    <div className="ml-3 flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {permission.name}
                                                                </span>
                                                                <span
                                                                    className={getPermissionTypeBadge(permission.type)}
                                                                >
                                                                    {permission.type}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {permission.description && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {permission.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        {mode === "view" ? "Close" : "Cancel"}
                    </button>
                    {mode !== "view" && (
                        <button
                            type="submit"
                            disabled={loading}
                            onClick={handleSubmit}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Saving...
                                </>
                            ) : mode === "create" ? (
                                "Create Role"
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoleModal;
