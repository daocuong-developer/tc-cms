import React, { useState, useEffect } from "react";
import { X, Building, Users, AlertCircle, Save } from "lucide-react";
import { OrganizationDetail, DepartmentDetail, securityService } from "@services/securityApi";

interface GroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    organization?: OrganizationDetail | null;
    mode: "view" | "edit" | "create";
    onSave: (organizationData: any) => Promise<void>;
}

const GroupModal: React.FC<GroupModalProps> = ({ isOpen, onClose, organization, mode, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [departments, setDepartments] = useState<DepartmentDetail[]>([]);
    const [loading, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingDepartments, setLoadingDepartments] = useState(false);

    useEffect(() => {
        if (organization && (mode === "edit" || mode === "view")) {
            setFormData({
                name: organization.name || "",
                description: organization.description || "",
            });

            // Load departments for this organization
            if (mode === "view") {
                loadDepartments(organization.id);
            }
        } else if (mode === "create") {
            setFormData({
                name: "",
                description: "",
            });
        }
        setError(null);
    }, [organization, mode, isOpen]);

    const loadDepartments = async (organizationId: string) => {
        setLoadingDepartments(true);
        try {
            const allDepartments = await securityService.getDepartments(true);
            const orgDepartments = allDepartments.filter((dept) => dept.organization_id === organizationId);
            setDepartments(orgDepartments);
        } catch (err) {
            console.error("Error loading departments:", err);
        } finally {
            setLoadingDepartments(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === "view") return;

        setSaving(true);
        setError(null);

        try {
            await onSave(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save organization");
        } finally {
            setSaving(false);
        }
    };

    const formatDateTime = (dateString: string | null | undefined) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <Building className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    {mode === "create"
                                        ? "Create New Organization"
                                        : mode === "edit"
                                        ? "Edit Organization"
                                        : "Organization Details"}
                                </h2>
                                {organization && mode === "view" && (
                                    <p className="text-indigo-100 text-sm">ID: {organization.id}</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row max-h-[calc(95vh-80px)]">
                    {/* Left Panel - Organization Info (View Mode) */}
                    {mode === "view" && organization && (
                        <div className="lg:w-1/3 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl font-bold text-white">
                                        {organization.name?.charAt(0) || "O"}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{organization.name}</h3>
                                <p className="text-sm text-gray-500 mb-2">{organization.description}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                                        Organization Info
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Created:</span>
                                            <span className="text-gray-900">
                                                {formatDateTime(organization.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Updated:</span>
                                            <span className="text-gray-900">
                                                {formatDateTime(organization.updated_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                                        Departments ({departments.length})
                                    </h4>
                                    {loadingDepartments ? (
                                        <div className="text-sm text-gray-500">Loading departments...</div>
                                    ) : departments.length > 0 ? (
                                        <div className="space-y-2">
                                            {departments.map((dept) => (
                                                <div key={dept.id} className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-900">{dept.name}</span>
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        {dept.members || 0} members
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No departments found</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto">
                        <form onSubmit={handleSubmit} className="p-6">
                            {/* Error Display */}
                            {error && (
                                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-red-800 mb-2">Error</h4>
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Basic Information */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Building className="h-5 w-5 mr-2 text-gray-400" />
                                        Organization Information
                                    </h3>
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Organization Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    disabled={mode === "view"}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-600"
                                                    placeholder="Enter organization name"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, description: e.target.value })
                                                    }
                                                    disabled={mode === "view"}
                                                    rows={4}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-600"
                                                    placeholder="Describe the organization's purpose and mission"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200 bg-gray-50 -mx-6 px-6 -mb-6 pb-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex items-center px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    {mode === "view" ? "Close" : "Cancel"}
                                </button>
                                {mode !== "view" && (
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                {mode === "create" ? "Create Organization" : "Save Changes"}
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupModal;
