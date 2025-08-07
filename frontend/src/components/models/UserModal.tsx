import React, { useState, useEffect } from "react";
import {
    X,
    User,
    Mail,
    Shield,
    Building,
    Save,
    Eye,
    EyeOff,
    Phone,
    MapPin,
    Briefcase,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
} from "lucide-react";
import { UserDetail, RoleDetail, DepartmentDetail, OrganizationDetail, securityService } from "@services/securityApi";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: UserDetail | null;
    mode: "view" | "edit" | "create";
    roles: RoleDetail[];
    departments?: DepartmentDetail[];
    onSave: (userData: any) => Promise<void>;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, mode, roles, departments, onSave }) => {
    const [organizations, setOrganizations] = useState<OrganizationDetail[]>([]);
    const [filteredDepartments, setFilteredDepartments] = useState<DepartmentDetail[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [loadingOrganizations, setLoadingOrganizations] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        full_name: "",
        password: "",
        phone: "",
        position: "",
        organization_id: "",
        address: "",
        role_ids: [] as string[],
        department_id: "",
        is_active: true,
        notes: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load organizations on component mount
    useEffect(() => {
        const loadOrganizations = async () => {
            setLoadingOrganizations(true);
            try {
                const orgs = await securityService.getOrganizations();
                setOrganizations(orgs);
            } catch (error) {
                console.error("Error loading organizations:", error);
            } finally {
                setLoadingOrganizations(false);
            }
        };

        if (isOpen) {
            loadOrganizations();
        }
    }, [isOpen]);

    // Filter departments based on selected organization
    useEffect(() => {
        setLoadingDepartments(true);
        if (formData.organization_id) {
            const loadDepartmentsForOrg = async () => {
                try {
                    // Use the departments prop which should already be loaded
                    const filtered = departments.filter(
                        (dept) => dept.organization?.id === Number(formData.organization_id)
                    );
                    setFilteredDepartments(filtered);
                } catch (error) {
                    console.error("Error loading departments for organization:", error);
                    setFilteredDepartments([]);
                }
                setLoadingDepartments(false);
            };
            loadDepartmentsForOrg();
        } else {
            setFilteredDepartments([]);
            setLoadingDepartments(false);
        }
    }, [formData.organization_id, departments]);

    // Reset department selection if current department doesn't belong to selected organization
    useEffect(() => {
        if (formData.department_id && filteredDepartments.length > 0) {
            const currentDeptValid = filteredDepartments.find((dept) => dept.id === formData.department_id);
            if (!currentDeptValid) {
                setFormData((prev) => ({ ...prev, department_id: "" }));
            }
        }
    }, [filteredDepartments, formData.department_id]);

    useEffect(() => {
        if (user && (mode === "view" || mode === "edit")) {
            setFormData({
                username: user.username || "",
                email: user.email || "",
                full_name: user.full_name || "",
                password: "",
                phone: user.phone || "",
                position: user.position || "",
                organization_id: user.organization?.id || "",
                address: user.address || "",
                role_ids: user.roles?.map((r) => r.id) || [],
                department_id: user.department?.id || "",
                is_active: user.is_active ?? true,
                notes: user.notes || "",
            });
        } else if (mode === "create") {
            setFormData({
                username: "",
                email: "",
                full_name: "",
                password: "",
                phone: "",
                position: "",
                organization_id: "",
                address: "",
                role_ids: [],
                department_id: "",
                is_active: true,
                notes: "",
            });
        }
        setErrors({});
    }, [user, mode]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
        } else if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.full_name.trim()) {
            newErrors.full_name = "Full name is required";
        }

        if (mode === "create" && !formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
            newErrors.phone = "Please enter a valid phone number";
        }

        if (!formData.organization_id) {
            newErrors.organization_id = "Please select an organization";
        }

        if (!formData.department_id) {
            newErrors.department_id = "Please select a department";
        }

        if (formData.role_ids.length === 0) {
            newErrors.role_ids = "Please select at least one role";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === "view") return;

        if (!validateForm()) return;

        setSaving(true);
        try {
            const dataToSend = { ...formData };
            if (mode === "edit" && !formData.password.trim()) {
                delete dataToSend.password;
            }

            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Error saving user:", error);
        } finally {
            setSaving(false);
        }
    };

    const formatDateTime = (dateString: string | null | undefined) => {
        if (!dateString) return "Never";
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (isActive: boolean, isOnline?: boolean) => {
        if (isOnline) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
                    Online
                </span>
            );
        } else if (isActive) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle className="w-3 h-3 mr-1" />
                    Inactive
                </span>
            );
        }
    };

    if (!isOpen) return null;

    const isReadOnly = mode === "view";
    const title = mode === "create" ? "Create New User" : mode === "edit" ? "Edit User" : "User Details";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">{title}</h2>
                                {user && mode === "view" && <p className="text-blue-100 text-sm">ID: {user.id}</p>}
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
                    {/* Left Panel - User Info (View Mode) */}
                    {mode === "view" && user && (
                        <div className="lg:w-1/3 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl font-bold text-white">
                                        {user.full_name?.charAt(0) || user.username?.charAt(0) || "U"}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {user.full_name || user.username}
                                </h3>
                                <p className="text-sm text-gray-500 mb-2">{user.email}</p>
                                {getStatusBadge(user.is_active, user.is_online)}
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                        Activity
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Last Login:</span>
                                            <span className="text-gray-900">{formatDateTime(user.last_login)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Last Logout:</span>
                                            <span className="text-gray-900">{formatDateTime(user.last_logout)}</span>
                                        </div>
                                    </div>
                                </div>

                                {user.roles && user.roles.length > 0 && (
                                    <div className="bg-white rounded-lg p-4 shadow-sm">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                            <Shield className="h-4 w-4 mr-2 text-gray-400" />
                                            Roles & Permissions
                                        </h4>
                                        <div className="space-y-2">
                                            {user.roles.map((role) => (
                                                <div key={role.id} className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-900">{role.name}</span>
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        {role.permissions?.length || 0} perms
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto">
                        <form onSubmit={handleSubmit} className="p-6">
                            {/* Error Display */}
                            {Object.keys(errors).length > 0 && (
                                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-red-800 mb-2">
                                                Please fix the following errors:
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
                                {/* Basic Information */}
                                <div className="lg:col-span-2">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <User className="h-5 w-5 mr-2 text-gray-400" />
                                        Basic Information
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Username *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.username}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, username: e.target.value })
                                                    }
                                                    disabled={isReadOnly}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 ${
                                                        errors.username ? "border-red-300" : "border-gray-300"
                                                    }`}
                                                    placeholder="Enter username"
                                                />
                                                {errors.username && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <Mail className="h-4 w-4 inline mr-1" />
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, email: e.target.value })
                                                    }
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
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.full_name}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, full_name: e.target.value })
                                                    }
                                                    disabled={isReadOnly}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 ${
                                                        errors.full_name ? "border-red-300" : "border-gray-300"
                                                    }`}
                                                    placeholder="Enter full name"
                                                />
                                                {errors.full_name && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <Phone className="h-4 w-4 inline mr-1" />
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, phone: e.target.value })
                                                    }
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
                                                    <Briefcase className="h-4 w-4 inline mr-1" />
                                                    Position
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.position}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, position: e.target.value })
                                                    }
                                                    disabled={isReadOnly}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                                                    placeholder="Enter job position"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Information */}
                                <div className="lg:col-span-2">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <Briefcase className="h-5 w-5 mr-2 text-gray-400" />
                                        Professional Information
                                    </h3>
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                                    <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center mr-2">
                                                        <Building className="h-4 w-4 text-white" />
                                                    </div>
                                                    Organization
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <select
                                                    value={formData.organization_id}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, organization_id: e.target.value })
                                                    }
                                                    disabled={isReadOnly}
                                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all duration-200 bg-white shadow-sm ${
                                                        errors.organization_id
                                                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                                            : "border-gray-200 hover:border-blue-300"
                                                    }`}
                                                >
                                                    <option value="">
                                                        {loadingOrganizations
                                                            ? "Loading organizations..."
                                                            : "Choose an organization..."}
                                                    </option>
                                                    {organizations.map((org) => (
                                                        <option key={org.id} value={org.id}>
                                                            {org.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.organization_id && (
                                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        {errors.organization_id}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                                    <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center mr-2">
                                                        <Building className="h-4 w-4 text-white" />
                                                    </div>
                                                    Department
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <select
                                                    value={formData.department_id}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, department_id: e.target.value })
                                                    }
                                                    disabled={
                                                        isReadOnly || !formData.organization_id || loadingDepartments
                                                    }
                                                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-200 focus:border-green-500 disabled:bg-gray-100 disabled:text-gray-600 transition-all duration-200 bg-white shadow-sm ${
                                                        errors.department_id
                                                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                                            : "border-gray-200 hover:border-green-300"
                                                    }`}
                                                >
                                                    <option value="">
                                                        {loadingDepartments
                                                            ? "Loading departments..."
                                                            : formData.organization_id
                                                            ? "Choose a department..."
                                                            : "Select organization first"}
                                                    </option>
                                                    {filteredDepartments.map((dept) => (
                                                        <option key={dept.id} value={dept.id}>
                                                            {dept.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.department_id && (
                                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        {errors.department_id}
                                                    </p>
                                                )}
                                                {formData.organization_id &&
                                                    filteredDepartments.length === 0 &&
                                                    !loadingDepartments && (
                                                        <p className="mt-2 text-sm text-blue-600 flex items-center bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                                                            <AlertCircle className="h-4 w-4 mr-2" />
                                                            No departments available for this organization. Please
                                                            create a department first.
                                                        </p>
                                                    )}
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                                    <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center mr-2">
                                                        <Shield className="h-4 w-4 text-white" />
                                                    </div>
                                                    Roles & Permissions
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                {isReadOnly ? (
                                                    <div className="flex flex-wrap gap-3">
                                                        {user?.roles?.map((role) => (
                                                            <span
                                                                key={role.id}
                                                                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300 shadow-sm"
                                                            >
                                                                <Shield className="h-3 w-3 mr-1" />
                                                                {role.name}
                                                            </span>
                                                        )) || (
                                                            <span className="text-gray-500 italic bg-gray-100 px-4 py-2 rounded-lg">
                                                                No roles assigned
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <select
                                                            multiple
                                                            value={formData.role_ids}
                                                            onChange={(e) => {
                                                                const values = Array.from(
                                                                    e.target.selectedOptions,
                                                                    (option) => option.value
                                                                );
                                                                setFormData({ ...formData, role_ids: values });
                                                            }}
                                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm ${
                                                                errors.role_ids
                                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                                                    : "border-gray-200 hover:border-purple-300"
                                                            }`}
                                                            size={Math.min(roles.length, 5)}
                                                        >
                                                            {roles.map((role) => (
                                                                <option key={role.id} value={role.id}>
                                                                    🛡️ {role.name} ({role.user_count} users)
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                            <p className="text-xs text-blue-700 flex items-center">
                                                                <Shield className="h-3 w-3 mr-1" />
                                                                Hold{" "}
                                                                <kbd className="px-1 py-0.5 bg-blue-200 rounded text-xs mx-1">
                                                                    Ctrl
                                                                </kbd>{" "}
                                                                (Windows) or{" "}
                                                                <kbd className="px-1 py-0.5 bg-blue-200 rounded text-xs mx-1">
                                                                    Cmd
                                                                </kbd>{" "}
                                                                (Mac) to select multiple roles
                                                            </p>
                                                        </div>

                                                        {errors.role_ids && (
                                                            <p className="text-sm text-red-600 flex items-center">
                                                                <XCircle className="h-4 w-4 mr-1" />
                                                                {errors.role_ids}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Security & Access */}
                                {(mode === "create" || mode === "edit") && (
                                    <div className="lg:col-span-2">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                            <Shield className="h-5 w-5 mr-2 text-gray-400" />
                                            Security & Access
                                        </h3>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Password {mode === "edit" && "(leave blank to keep current)"}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            value={formData.password}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, password: e.target.value })
                                                            }
                                                            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                                errors.password ? "border-red-300" : "border-gray-300"
                                                            }`}
                                                            placeholder={
                                                                mode === "create"
                                                                    ? "Enter password"
                                                                    : "Enter new password"
                                                            }
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    {errors.password && (
                                                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-center">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            id="is_active"
                                                            checked={formData.is_active}
                                                            onChange={(e) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    is_active: e.target.checked,
                                                                })
                                                            }
                                                            disabled={isReadOnly}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                        <label
                                                            htmlFor="is_active"
                                                            className="ml-2 block text-sm text-gray-900"
                                                        >
                                                            Active User Account
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Additional Information */}
                                <div className="lg:col-span-2">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                                        Additional Information
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Address
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.address}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, address: e.target.value })
                                                    }
                                                    disabled={isReadOnly}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                                                    placeholder="Enter address"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Notes
                                                </label>
                                                <textarea
                                                    value={formData.notes}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, notes: e.target.value })
                                                    }
                                                    disabled={isReadOnly}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-600"
                                                    placeholder="Additional notes about the user..."
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
                                                {mode === "create" ? "Create User" : "Save Changes"}
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

export default UserModal;
