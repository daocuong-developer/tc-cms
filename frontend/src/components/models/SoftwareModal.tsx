import React, { useState, useEffect } from "react";
import { X, Monitor, Save, AlertCircle, Smartphone, Laptop } from "lucide-react";

interface Software {
    id: string;
    name: string;
    version: string;
    platform: "iOS" | "Desktop" | "Android" | "Web";
    isCurrentVersion: boolean;
    status: "Active" | "Inactive" | "Expired";
    lastUpdated: string;
}

interface SoftwareModalProps {
    isOpen: boolean;
    onClose: () => void;
    software?: Software | null;
    mode: "view" | "edit" | "create";
    onSave: (softwareData: any) => Promise<void>;
}

const SoftwareModal: React.FC<SoftwareModalProps> = ({ isOpen, onClose, software, mode, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        version: "",
        platform: "Desktop" as "iOS" | "Desktop" | "Android" | "Web",
        isCurrentVersion: false,
        status: "Active" as "Active" | "Inactive" | "Expired",
        lastUpdated: "",
    });
    const [loading, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const platforms = [
        { value: "iOS", label: "iOS", icon: Smartphone },
        { value: "Desktop", label: "Desktop", icon: Laptop },
        { value: "Android", label: "Android", icon: Smartphone },
        { value: "Web", label: "Web", icon: Monitor },
    ];

    const statuses = [
        { value: "Active", label: "Active", color: "text-green-600" },
        { value: "Inactive", label: "Inactive", color: "text-yellow-600" },
        { value: "Expired", label: "Expired", color: "text-red-600" },
    ];

    useEffect(() => {
        if (software && (mode === "edit" || mode === "view")) {
            setFormData({
                name: software.name || "",
                version: software.version || "",
                platform: software.platform || "Desktop",
                isCurrentVersion: software.isCurrentVersion || false,
                status: software.status || "Active",
                lastUpdated: software.lastUpdated ? new Date(software.lastUpdated).toISOString().slice(0, 10) : "",
            });
        } else if (mode === "create") {
            setFormData({
                name: "",
                version: "",
                platform: "Desktop",
                isCurrentVersion: false,
                status: "Active",
                lastUpdated: new Date().toISOString().slice(0, 10),
            });
        }
        setError(null);
        setErrors({});
    }, [software, mode, isOpen]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Software name is required";
        }

        if (!formData.version.trim()) {
            newErrors.version = "Version is required";
        }

        if (!formData.lastUpdated) {
            newErrors.lastUpdated = "Last updated date is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === "view") return;

        if (!validateForm()) return;

        setSaving(true);
        setError(null);

        try {
            const dataToSave = {
                ...formData,
                lastUpdated: new Date(formData.lastUpdated).toISOString(),
            };
            await onSave(dataToSave);
            onClose();
        } catch (err: any) {
            setError(err.message || "Unable to save software");
        } finally {
            setSaving(false);
        }
    };

    const getPlatformIcon = (platform: string) => {
        const platformConfig = platforms.find((p) => p.value === platform);
        if (platformConfig) {
            const Icon = platformConfig.icon;
            return <Icon className="h-4 w-4" />;
        }
        return <Monitor className="h-4 w-4" />;
    };

    if (!isOpen) return null;

    const isReadOnly = mode === "view";
    const title = mode === "create" ? "Add New Software" : mode === "edit" ? "Edit Software" : "Software Details";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <Monitor className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">{title}</h2>
                                {software && mode === "view" && (
                                    <p className="text-purple-100 text-sm">ID: {software.id}</p>
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

                <div className="flex-1 overflow-y-auto max-h-[calc(95vh-80px)]">
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

                        {Object.keys(errors).length > 0 && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-medium text-red-800 mb-2">
                                            Please correct the following errors:
                                        </h4>
                                        <ul className="text-sm text-red-700 space-y-1">
                                            {Object.entries(errors).map(([field, error]) => (
                                                <li key={field}>• {error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Software Information */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Monitor className="h-5 w-5 mr-2 text-gray-400" />
                                    Software Information
                                </h3>
                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Software Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                disabled={isReadOnly}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:text-gray-600 ${
                                                    errors.name ? "border-red-300" : "border-gray-300"
                                                }`}
                                                placeholder="Enter software name"
                                            />
                                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Version *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.version}
                                                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                                disabled={isReadOnly}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:text-gray-600 ${
                                                    errors.version ? "border-red-300" : "border-gray-300"
                                                }`}
                                                placeholder="Enter version"
                                            />
                                            {errors.version && (
                                                <p className="mt-1 text-sm text-red-600">{errors.version}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Platform
                                            </label>
                                            <select
                                                value={formData.platform}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, platform: e.target.value as any })
                                                }
                                                disabled={isReadOnly}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:text-gray-600"
                                            >
                                                {platforms.map((platform) => (
                                                    <option key={platform.value} value={platform.value}>
                                                        {platform.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="mt-2 flex items-center text-sm text-gray-600">
                                                {getPlatformIcon(formData.platform)}
                                                <span className="ml-2">{formData.platform}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status
                                            </label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, status: e.target.value as any })
                                                }
                                                disabled={isReadOnly}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:text-gray-600"
                                            >
                                                {statuses.map((status) => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Updated *
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.lastUpdated}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, lastUpdated: e.target.value })
                                                }
                                                disabled={isReadOnly}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:text-gray-600 ${
                                                    errors.lastUpdated ? "border-red-300" : "border-gray-300"
                                                }`}
                                            />
                                            {errors.lastUpdated && (
                                                <p className="mt-1 text-sm text-red-600">{errors.lastUpdated}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="isCurrentVersion"
                                                checked={formData.isCurrentVersion}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, isCurrentVersion: e.target.checked })
                                                }
                                                disabled={isReadOnly}
                                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                            />
                                            <label
                                                htmlFor="isCurrentVersion"
                                                className="ml-2 block text-sm text-gray-900"
                                            >
                                                Current Version
                                            </label>
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
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            {mode === "create" ? "Add Software" : "Save Changes"}
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

export default SoftwareModal;
