import React, { useState, useEffect } from "react";
import { X, Building2, Users, AlertCircle } from "lucide-react";
import { DepartmentDetail, RoleDetail, securityService, OrganizationDetail } from "@services/securityApi";

interface DepartmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    department?: DepartmentDetail | null;
    mode: "view" | "edit" | "create";
    roles: RoleDetail[];
    onSave: (departmentData: any) => Promise<void>;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({ isOpen, onClose, department, mode, roles, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        roles: [] as string[],
        organizationId: "",
    });
    const [organizations, setOrganizations] = useState<OrganizationDetail[]>([]);
    const [loading, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            const fetchOrganizations = async () => {
                try {
                    const fetchedOrgs = await securityService.getOrganizations();
                    setOrganizations(fetchedOrgs);
                } catch (err) {
                    console.error("Failed to fetch organizations:", err);
                }
            };
            fetchOrganizations();
        }
    }, [isOpen]);

    useEffect(() => {
        if (department && (mode === "edit" || mode === "view")) {
            setFormData({
                name: department.name || "",
                description: department.description || "",
                roles: department.roles?.map((r) => r.id.toString()) || [],
                organizationId: department.organization?.id?.toString() || "",
            });
        } else if (mode === "create") {
            setFormData({
                name: "",
                description: "",
                roles: [],
                organizationId: "",
            });
        }
        setError(null);
    }, [department, mode, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === "view") return;

        setSaving(true);
        setError(null);

        try {
            await onSave({
                ...formData,
                organization_id: parseInt(formData.organizationId),
                roles: formData.roles.map((id) => parseInt(id)),
            });
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save department");
        } finally {
            setSaving(false);
        }
    };

    const handleRoleToggle = (roleId: string) => {
        if (mode === "view") return;

        setFormData((prev) => ({
            ...prev,
            roles: prev.roles.includes(roleId) ? prev.roles.filter((id) => id !== roleId) : [...prev.roles, roleId],
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Building2 className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {mode === "create"
                                        ? "Create New Department"
                                        : mode === "edit"
                                        ? "Edit Department"
                                        : "Department Details"}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {mode === "create"
                                        ? "Create a new department with assigned roles"
                                        : mode === "edit"
                                        ? "Modify department information and roles"
                                        : "View department information and assigned roles"}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-purple-100 rounded-lg transition-colors">
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto max-h-[calc(90vh-200px)]">
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
                                <Building2 className="h-5 w-5 mr-2 text-gray-600" />
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Department Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                        disabled={mode === "view"}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="Enter department name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, description: e.target.value }))
                                        }
                                        disabled={mode === "view"}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="Describe the department's purpose and responsibilities"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                                        Organization <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="organization"
                                        name="organization"
                                        value={formData.organizationId}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                organizationId: e.target.value,
                                            }))
                                        }
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                        disabled={mode === "view"}
                                        required
                                    >
                                        <option value="">Select an organization</option>
                                        {organizations.map((org) => (
                                            <option key={org.id} value={org.id}>
                                                {org.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Roles */}
                        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                <Users className="h-5 w-5 mr-2 text-gray-600" />
                                Assigned Roles ({formData.roles.length} selected)
                            </h3>

                            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                                {roles.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">No roles available</div>
                                ) : (
                                    <div className="p-2 space-y-1">
                                        {roles.map((role) => (
                                            <label
                                                key={role.id}
                                                className={`flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                                                    mode === "view" ? "cursor-default" : ""
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.roles.includes(role.id.toString())}
                                                    onChange={() => handleRoleToggle(role.id.toString())}
                                                    disabled={mode === "view"}
                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:cursor-not-allowed"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {role.name}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {role.user_count} users
                                                        </span>
                                                    </div>
                                                    {role.description && (
                                                        <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                        {mode === "view" ? "Close" : "Cancel"}
                    </button>
                    {mode !== "view" && (
                        <button
                            type="submit"
                            disabled={loading}
                            onClick={handleSubmit}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                            <Building2 className="h-4 w-4 mr-2" />
                                            Create Department
                                        </>
                                    ) : (
                                        <>
                                            <Building2 className="h-4 w-4 mr-2" />
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

export default DepartmentModal;
