import React, { useState, useEffect } from "react";
import { X, FileText, User, Mail, Phone, Building, DollarSign, Calendar, Save, AlertCircle } from "lucide-react";

interface Contract {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    deviceName: string;
    organization: string;
    totalAmount: number;
    startDate: string;
    endDate: string;
    status: "ACTIVE" | "EXPIRED" | "PAUSED";
}

interface ContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    contract?: Contract | null;
    mode: "view" | "edit" | "create";
    onSave: (contractData: any) => Promise<void>;
}

const ContractModal: React.FC<ContractModalProps> = ({ isOpen, onClose, contract, mode, onSave }) => {
    const [formData, setFormData] = useState({
        customerName: "",
        email: "",
        phone: "",
        deviceName: "",
        organization: "",
        totalAmount: 0,
        startDate: "",
        endDate: "",
        status: "ACTIVE" as "ACTIVE" | "EXPIRED" | "PAUSED",
    });
    const [loading, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (contract && (mode === "edit" || mode === "view")) {
            setFormData({
                customerName: contract.customerName || "",
                email: contract.email || "",
                phone: contract.phone || "",
                deviceName: contract.deviceName || "",
                organization: contract.organization || "",
                totalAmount: contract.totalAmount || 0,
                startDate: contract.startDate ? new Date(contract.startDate).toISOString().slice(0, 16) : "",
                endDate: contract.endDate ? new Date(contract.endDate).toISOString().slice(0, 16) : "",
                status: contract.status || "ACTIVE",
            });
        } else if (mode === "create") {
            setFormData({
                customerName: "",
                email: "",
                phone: "",
                deviceName: "",
                organization: "",
                totalAmount: 0,
                startDate: "",
                endDate: "",
                status: "ACTIVE",
            });
        }
        setError(null);
        setErrors({});
    }, [contract, mode, isOpen]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = "Customer name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
            newErrors.phone = "Phone number is invalid";
        }

        if (!formData.deviceName.trim()) {
            newErrors.deviceName = "Device name is required";
        }

        if (!formData.startDate) {
            newErrors.startDate = "Start date is required";
        }

        if (!formData.endDate) {
            newErrors.endDate = "End date is required";
        }

        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
            newErrors.endDate = "End date must be after start date";
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
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
            };
            await onSave(dataToSave);
            onClose();
        } catch (err: any) {
            setError(err.message || "Unable to save contract");
        } finally {
            setSaving(false);
        }
    };


    if (!isOpen) return null;

    const isReadOnly = mode === "view";
    const title = mode === "create" ? "Create New Contract" : mode === "edit" ? "Edit Contract" : "Contract Details";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">{title}</h2>
                                {contract && mode === "view" && (
                                    <p className="text-blue-100 text-sm">ID: {contract.id}</p>
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

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Customer Information */}
                            <div className="lg:col-span-2">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <User className="h-5 w-5 mr-2 text-gray-400" />
                                    Customer Information
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Customer Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.customerName}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, customerName: e.target.value })
                                                }
                                                disabled={isReadOnly}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 ${
                                                    errors.customerName ? "border-red-300" : "border-gray-300"
                                                }`}
                                                placeholder="Enter customer name"
                                            />
                                            {errors.customerName && (
                                                <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Mail className="h-4 w-4 inline mr-1" />
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                disabled={isReadOnly}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 ${
                                                    errors.email ? "border-red-300" : "border-gray-300"
                                                }`}
                                                placeholder="Enter email address"
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Phone className="h-4 w-4 inline mr-1" />
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                disabled={isReadOnly}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 ${
                                                    errors.phone ? "border-red-300" : "border-gray-300"
                                                }`}
                                                placeholder="Enter phone number"
                                            />
                                            {errors.phone && (
                                                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Building className="h-4 w-4 inline mr-1" />
                                                Organization
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.organization}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, organization: e.target.value })
                                                }
                                                disabled={isReadOnly}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                                                placeholder="Enter organization name"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contract Information */}
                            <div className="lg:col-span-2">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-gray-400" />
                                    Contract Information
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Device Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.deviceName}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, deviceName: e.target.value })
                                                }
                                                disabled={isReadOnly}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 ${
                                                    errors.deviceName ? "border-red-300" : "border-gray-300"
                                                }`}
                                                placeholder="Enter device name"
                                            />
                                            {errors.deviceName && (
                                                <p className="mt-1 text-sm text-red-600">{errors.deviceName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <DollarSign className="h-4 w-4 inline mr-1" />
                                                Total Amount
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.totalAmount}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, totalAmount: Number(e.target.value) })
                                                }
                                                disabled={isReadOnly}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Calendar className="h-4 w-4 inline mr-1" />
                                                Start Date *
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={formData.startDate}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, startDate: e.target.value })
                                                }
                                                disabled={isReadOnly}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 ${
                                                    errors.startDate ? "border-red-300" : "border-gray-300"
                                                }`}
                                            />
                                            {errors.startDate && (
                                                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Calendar className="h-4 w-4 inline mr-1" />
                                                End Date *
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={formData.endDate}
                                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                                disabled={isReadOnly}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 ${
                                                    errors.endDate ? "border-red-300" : "border-gray-300"
                                                }`}
                                            />
                                            {errors.endDate && (
                                                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status
                                            </label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, status: e.target.value as any })
                                                }
                                                disabled={isReadOnly}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                                            >
                                                <option value="ACTIVE">ACTIVE</option>
                                                <option value="EXPIRED">EXPIRED</option>
                                                <option value="PAUSED">PAUSED</option>
                                            </select>
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
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            {mode === "create" ? "Create Contract" : "Save Changes"}
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

export default ContractModal;
