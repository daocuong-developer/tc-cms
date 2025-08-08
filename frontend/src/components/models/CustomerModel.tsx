import React, { useState, useEffect } from "react";
import {
    X,
    User,
    Mail,
    Phone,
    Building,
    Monitor,
    Save,
    AlertCircle,
    CheckCircle,
    Users,
    Building2,
} from "lucide-react";

import { CustomerDetail, DepartmentDetail, GroupDetail, securityService } from "@services/securityApi";

interface CustomerModelProps {
    isOpen: boolean;
    onClose: () => void;
    customer: CustomerDetail | null;
    onSave: (customerData: any) => Promise<void>;
    isLoading: boolean;
}

const CustomerModel: React.FC<CustomerModelProps> = ({
    isOpen,
    onClose,
    customer,
    onSave,
    isLoading,
}) => {
    const [formData, setFormData] = useState({
        customerName: "",
        email: "",
        phone: "",
        deviceName: "",
        department_id: "",
        group_id: "",
    });
    const [departments, setDepartments] = useState<DepartmentDetail[]>([]);
    const [groups, setGroups] = useState<GroupDetail[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [notification, setNotification] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchDepartmentsAndGroups();
        }
    }, [isOpen]);

    useEffect(() => {
        if (customer) {
            setFormData({
                customerName: customer.customerName || "",
                email: customer.email || "",
                phone: customer.phone || "",
                deviceName: customer.deviceName || "",
                department_id: customer.department?.id || "",
                group_id: customer.group?.id || "",
            });
        } else {
            setFormData({
                customerName: "",
                email: "",
                phone: "",
                deviceName: "",
                department_id: "",
                group_id: "",
            });
        }
        setErrors({});
        setNotification(null);
    }, [customer, isOpen]);

    const fetchDepartmentsAndGroups = async () => {
        try {
            setLoadingData(true);
            const [departmentsData, groupsData] = await Promise.all([
                securityService.getDepartments(true), 
                securityService.getGroups(),
            ]);
            setDepartments(departmentsData);
            setGroups(groupsData);
        } catch (error) {
            console.error("Error fetching departments and groups:", error);
            showNotification("error", "Failed to load departments and groups");
        } finally {
            setLoadingData(false);
        }
    };

    const showNotification = (type: "success" | "error", message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = "Customer name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Validate department or group selection
        if (!formData.department_id && !formData.group_id) {
            newErrors.department_group = "Customer must belong to either a Department or a Group";
        }

        if (formData.department_id && formData.group_id) {
            newErrors.department_group = "Customer cannot belong to both Department and Group simultaneously";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showNotification("error", "Please fix the errors below");
            return;
        }

        try {
            const submitData = {
                customerName: formData.customerName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim() || null,
                deviceName: formData.deviceName.trim() || null,
                department_id: formData.department_id || null,
                group_id: formData.group_id || null,
            };

            await onSave(submitData);
        } catch (error) {
            console.error("Error saving customer:", error);
            showNotification("error", "Failed to save customer");
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            
            // Clear the other field when one is selected
            if (field === "department_id" && value) {
                newData.group_id = "";
            } else if (field === "group_id" && value) {
                newData.department_id = "";
            }
            
            return newData;
        });
        
        if (errors[field] || errors.department_group) {
            setErrors(prev => ({ 
                ...prev, 
                [field]: "",
                department_group: ""
            }));
        }
    };

    const getSelectedOrganization = () => {
        if (formData.department_id) {
            const dept = departments.find(d => d.id === formData.department_id);
            return dept ? "From Department" : "";
        }
        if (formData.group_id) {
            const group = groups.find(g => g.id === formData.group_id);
            return group ? "From Group" : "";
        }
        return "";
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                {/* Notification */}
                {notification && (
                    <div
                        className={`absolute top-4 right-4 z-10 p-3 rounded-lg shadow-lg flex items-center gap-2 ${
                            notification.type === "success"
                                ? "bg-green-50 text-green-800 border border-green-200"
                                : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                    >
                        {notification.type === "success" ? (
                            <CheckCircle className="w-4 h-4" />
                        ) : (
                            <AlertCircle className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">{notification.message}</span>
                    </div>
                )}

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {customer ? "Edit Customer" : "Add New Customer"}
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    {customer ? "Update customer information" : "Enter customer details"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            disabled={isLoading}
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {loadingData ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                                <p className="text-gray-600">Loading departments and groups...</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Customer Name Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Customer Name *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.customerName}
                                        onChange={(e) => handleInputChange("customerName", e.target.value)}
                                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            errors.customerName
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="Enter customer name"
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.customerName && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.customerName}
                                    </p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            errors.email
                                                ? "border-red-300 bg-red-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                        placeholder="Enter email address"
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Phone Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all"
                                        placeholder="Enter phone number (optional)"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Device Name Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Device Name
                                </label>
                                <div className="relative">
                                    <Monitor className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.deviceName}
                                        onChange={(e) => handleInputChange("deviceName", e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300 transition-all"
                                        placeholder="Enter device name (optional)"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Department and Group Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Department Select Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Department
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <select
                                            value={formData.department_id}
                                            onChange={(e) => handleInputChange("department_id", e.target.value)}
                                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white ${
                                                errors.department_group
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                            disabled={isLoading || !!formData.group_id}
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map((dept) => (
                                                <option key={dept.id} value={dept.id}>
                                                    {dept.name} ({dept.members} members)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {formData.group_id && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Disabled because Group is selected
                                        </p>
                                    )}
                                </div>

                                {/* Group Select Field */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Group
                                    </label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <select
                                            value={formData.group_id}
                                            onChange={(e) => handleInputChange("group_id", e.target.value)}
                                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white ${
                                                errors.department_group
                                                    ? "border-red-300 bg-red-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                            disabled={isLoading || !!formData.department_id}
                                        >
                                            <option value="">Select Group</option>
                                            {groups.map((group) => (
                                                <option key={group.id} value={group.id}>
                                                    {group.name} ({group.members} members)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {formData.department_id && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            Disabled because Department is selected
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Department/Group Selection Error */}
                            {errors.department_group && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-sm text-red-600 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.department_group}
                                    </p>
                                </div>
                            )}

                            {/* Organization Display */}
                            {getSelectedOrganization() && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <Building className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-900">Organization</p>
                                            <p className="text-sm text-blue-700">{getSelectedOrganization()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || loadingData}
                                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            {customer ? "Update Customer" : "Add Customer"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerModel;