import React, { useState, useEffect } from "react";
import { X, Building, AlertCircle, Save } from "lucide-react";
import { OrganizationDetail } from "@services/securityApi";

interface OrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    organization?: OrganizationDetail | null;
    mode: "view" | "edit" | "create";
    onSave: (organizationData: any) => Promise<void>;
}

const OrganizationModal: React.FC<OrganizationModalProps> = ({ isOpen, onClose, organization, mode, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [loading, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (organization && (mode === "edit" || mode === "view")) {
            setFormData({
                name: organization.name || "",
                description: organization.description || "",
            });
        } else if (mode === "create") {
            setFormData({
                name: "",
                description: "",
            });
        }
        setError(null);
    }, [organization, mode, isOpen]);

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
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

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-6">
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

                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-50 rounded-xl p-6 border border-indigo-100">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        disabled={mode === "view"}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-600"
                                        placeholder="Describe the organization's purpose and mission"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
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
    );
};

export default OrganizationModal;
