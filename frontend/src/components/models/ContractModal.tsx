import React, { useState, useEffect } from "react";
import { X, FileText, User, Mail, Phone, Building, DollarSign, Calendar, Save, AlertCircle } from "lucide-react";
import { ContractDetail, CustomerDetail, securityService } from "@services/securityApi";

interface ContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    contract?: ContractDetail | null;
    mode: "view" | "edit" | "create";
    onSave: (contractData: any) => Promise<void>;
}

const ContractModal: React.FC<ContractModalProps> = ({ isOpen, onClose, contract, mode, onSave }) => {
    const [formData, setFormData] = useState({
        customer_id: "",
        totalAmount: 0,
        startDate: "",
        endDate: "",
        status: "ACTIVE" as "ACTIVE" | "EXPIRED" | "PAUSED",
    });
    const [loading, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [customers, setCustomers] = useState<CustomerDetail[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);

    useEffect(() => {
        // Fetch customers for dropdown
        const fetchCustomers = async () => {
            try {
                const customersData = await securityService.getCustomers();
                setCustomers(customersData);
            } catch (err) {
                console.error("Failed to fetch customers:", err);
            }
        };

        if (isOpen) {
            fetchCustomers();
        }

        if (contract && (mode === "edit" || mode === "view")) {
            setFormData({
                customer_id: contract.customer.id || "",
                totalAmount: contract.timesMarked || 0,
                startDate: contract.startDate ? new Date(contract.startDate).toISOString().slice(0, 16) : "",
                endDate: contract.endDate ? new Date(contract.endDate).toISOString().slice(0, 16) : "",
                status: contract.status || "ACTIVE",
            });
            setSelectedCustomer(contract.customer);
        } else if (mode === "create") {
            setFormData({
                customer_id: "",
                totalAmount: 0,
                startDate: "",
                endDate: "",
                status: "ACTIVE",
            });
            setSelectedCustomer(null);
        }
        setError(null);
        setErrors({});
    }, [contract, mode, isOpen]);

    // Update selected customer when customer_id changes
    useEffect(() => {
        if (formData.customer_id && customers.length > 0) {
            const customer = customers.find((c) => c.id === formData.customer_id);
            setSelectedCustomer(customer || null);
        } else {
            setSelectedCustomer(null);
        }
    }, [formData.customer_id, customers]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.customer_id) {
            newErrors.customer_id = "Customer is required";
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
                customer_id: formData.customer_id,
                deviceName: selectedCustomer?.deviceName || "",
                organization: selectedCustomer?.organization || "",
                totalAmount: formData.totalAmount,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                status: formData.status,
            };
            await onSave(dataToSave);
            onClose();
        } catch (err: any) {
            setError(err.message || "Unable to save contract");
        } finally {
            setSaving(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
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
                            {/* Customer Selection */}
                            <div className="lg:col-span-2">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <User className="h-5 w-5 mr-2 text-gray-400" />
                                    Customer Selection
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <User className="h-4 w-4 inline mr-1" />
                                                Customer *
                                            </label>
                                            {mode === "view" && contract ? (
                                                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600">
                                                    {contract.customer.customerName} ({contract.customer.email})
                                                </div>
                                            ) : (
                                                <select
                                                    value={formData.customer_id}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, customer_id: e.target.value })
                                                    }
                                                    disabled={isReadOnly}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 ${
                                                        errors.customer_id ? "border-red-300" : "border-gray-300"
                                                    }`}
                                                >
                                                    <option value="">Select a customer</option>
                                                    {customers.map((customer) => (
                                                        <option key={customer.id} value={customer.id}>
                                                            {customer.customerName} ({customer.email})
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            {errors.customer_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information Display */}
                            {selectedCustomer && (
                                <div className="lg:col-span-2">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <FileText className="h-5 w-5 mr-2 text-gray-400" />
                                        Customer Information
                                    </h3>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Device Name
                                                </label>
                                                <div className="flex items-center text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                                                    {selectedCustomer.deviceName || (
                                                        <span className="text-red-500 italic">No device name</span>
                                                    )}
                                                </div>
                                                {errors.deviceName && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.deviceName}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    <Building className="h-4 w-4 inline mr-1" />
                                                    Organization
                                                </label>
                                                <div className="flex items-center text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                                                    {selectedCustomer.organization || (
                                                        <span className="text-gray-400 italic">No organization</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    <Mail className="h-4 w-4 inline mr-1" />
                                                    Email
                                                </label>
                                                <div className="flex items-center text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                                                    {selectedCustomer.email}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    <Phone className="h-4 w-4 inline mr-1" />
                                                    Phone
                                                </label>
                                                <div className="flex items-center text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                                                    {selectedCustomer.phone || (
                                                        <span className="text-gray-400 italic">No phone</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                                <DollarSign className="h-4 w-4 inline mr-1" />
                                                Times Marked
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
