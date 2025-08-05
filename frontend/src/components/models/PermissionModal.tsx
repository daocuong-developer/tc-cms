import React, { useState, useEffect } from "react";
import { X, Lock, Shield, AlertCircle } from "lucide-react";
import { PermissionDetail } from "@services/securityApi";

interface PermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    permission?: PermissionDetail | null;
    mode: "view" | "edit" | "create";
    onSave: (permissionData: any) => Promise<void>;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ isOpen, onClose, permission, mode, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        codename: "",
        module: "",
        description: "",
        type: "read" as "read" | "write" | "delete" | "admin",
    });
    const [loading, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const permissionTypes = [
        { value: "read", label: "Read", color: "bg-green-100 text-green-800" },
        { value: "write", label: "Write", color: "bg-blue-100 text-blue-800" },
        { value: "delete", label: "Delete", color: "bg-orange-100 text-orange-800" },
        { value: "change", label: "Change", color: "bg-indigo-100 text-indigo-800" },
        { value: "admin", label: "Admin", color: "bg-red-100 text-red-800" },
    ];

    const modules = ["auth", "documents", "reports", "settings", "users", "roles", "departments", "permissions"];

    useEffect(() => {
        if (permission && (mode === "edit" || mode === "view")) {
            setFormData({
                name: permission.name || "",
                codename: permission.codename || "",
                module: permission.module || "",
                description: permission.description || "",
                type: permission.type || "read",
            });
        } else if (mode === "create") {
            setFormData({
                name: "",
                codename: "",
                module: "",
                description: "",
                type: "read",
            });
        }
        setError(null);
    }, [permission, mode, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === "view") return;

        setSaving(true);
        setError(null);

        try {
            await onSave(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save permission");
        } finally {
            setSaving(false);
        }
    };

    const getPermissionTypeBadge = (type: string) => {
        const typeConfig = permissionTypes.find((t) => t.value === type);
        return typeConfig ? typeConfig.color : "bg-gray-100 text-gray-800";
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Lock className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {mode === "create"
                                        ? "Create New Permission"
                                        : mode === "edit"
                                        ? "Edit Permission"
                                        : "Permission Details"}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {mode === "create"
                                        ? "Define a new permission for the system"
                                        : mode === "edit"
                                        ? "Modify permission information"
                                        : "View permission details"}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-orange-100 rounded-lg transition-colors">
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
                                <Shield className="h-5 w-5 mr-2 text-gray-600" />
                                Permission Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Permission Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                        disabled={mode === "view"}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="Enter permission name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Codename *</label>
                                    <input
                                        type="text"
                                        value={formData.codename}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, codename: e.target.value }))}
                                        disabled={mode === "view"}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="e.g., view_user, edit_document"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Module *</label>
                                    <select
                                        value={formData.module}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, module: e.target.value }))}
                                        disabled={mode === "view"}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        required
                                    >
                                        <option value="">Select module</option>
                                        {modules.map((module) => (
                                            <option key={module} value={module}>
                                                {module.charAt(0).toUpperCase() + module.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Permission Type *
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, type: e.target.value as any }))
                                        }
                                        disabled={mode === "view"}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        required
                                    >
                                        {permissionTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    {formData.type && (
                                        <div className="mt-2">
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${getPermissionTypeBadge(
                                                    formData.type
                                                )}`}
                                            >
                                                {permissionTypes.find((t) => t.value === formData.type)?.label}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                    disabled={mode === "view"}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    placeholder="Describe what this permission allows users to do"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                    >
                        <X className="h-4 w-4 mr-2" />
                        {mode === "view" ? "Close" : "Cancel"}
                    </button>
                    {mode !== "view" && (
                        <button
                            type="submit"
                            disabled={loading}
                            onClick={handleSubmit}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    {mode === "create" ? (
                                        <>
                                            <Lock className="h-4 w-4 mr-2" />
                                            Create Permission
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PermissionModal;
