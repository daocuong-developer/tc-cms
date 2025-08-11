import React, { useState, useEffect, useCallback } from "react";
import ContentHeader from "@/components/ui/ContentHeader";
import {
    Building,
    Building2,
    Users,
    Plus,
    Edit,
    Trash2,
    Search,
    Filter,
    Eye,
    MoreVertical,
    RefreshCw,
    AlertCircle,
    X,
} from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import { securityService, OrganizationDetail, DepartmentDetail } from "@services/securityApi";
import OrganizationModal from "@components/models/OrganizationModal";
import DepartmentModal from "@components/models/DepartmentModal";
import ConfirmDialog from "@components/models/ConfirmDialog";

const OrganizationManagement: React.FC = () => {
    const { user, hasPermission, isLoading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<"organizations" | "departments">("organizations");
    const [searchTerm, setSearchTerm] = useState("");

    const [organizations, setOrganizations] = useState<OrganizationDetail[]>([]);
    const [departments, setDepartments] = useState<DepartmentDetail[]>([]);

    const [loadingData, setLoadingData] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [organizationModal, setOrganizationModal] = useState<{
        isOpen: boolean;
        mode: "view" | "edit" | "create";
        organization: OrganizationDetail | null;
    }>({
        isOpen: false,
        mode: "create",
        organization: null,
    });

    const [departmentModal, setDepartmentModal] = useState<{
        isOpen: boolean;
        mode: "view" | "edit" | "create";
        department: DepartmentDetail | null;
    }>({
        isOpen: false,
        mode: "create",
        department: null,
    });

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        loading: boolean;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
        loading: false,
    });

    const fetchData = useCallback(async () => {
        setLoadingData(true);
        setError(null);
        try {
            const promises = [];

            if (activeTab === "organizations" && hasPermission("view_organization")) {
                promises.push(securityService.getOrganizations());
            }
            if (activeTab === "departments" && hasPermission("view_department")) {
                promises.push(securityService.getDepartments(true));
            }

            const results = await Promise.all(promises);

            if (activeTab === "organizations") {
                setOrganizations(results[0] || []);
            } else if (activeTab === "departments") {
                setDepartments(results[0] || []);
            }
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError("Failed to load data. Please try again.");
        } finally {
            setLoadingData(false);
        }
    }, [activeTab, hasPermission]);

    const fetchAllData = useCallback(async () => {
        setRefreshing(true);
        try {
            const [orgsData, deptsData] = await Promise.all([
                hasPermission("view_organization") ? securityService.getOrganizations() : Promise.resolve([]),
                hasPermission("view_department") ? securityService.getDepartments(true) : Promise.resolve([]),
            ]);

            setOrganizations(orgsData);
            setDepartments(deptsData);
        } catch (err) {
            console.error("Failed to refresh data:", err);
            setError("Failed to refresh data. Please try again.");
        } finally {
            setRefreshing(false);
        }
    }, [hasPermission]);

    useEffect(() => {
        if (!authLoading) {
            fetchData();
        }
    }, [activeTab, authLoading, fetchData]);

    // Organization handlers
    const handleViewOrganization = (organization: OrganizationDetail) => {
        setOrganizationModal({
            isOpen: true,
            mode: "view",
            organization,
        });
    };

    const handleEditOrganization = (organization: OrganizationDetail) => {
        setOrganizationModal({
            isOpen: true,
            mode: "edit",
            organization,
        });
    };

    const handleCreateOrganization = () => {
        setOrganizationModal({
            isOpen: true,
            mode: "create",
            organization: null,
        });
    };

    const handleDeleteOrganization = (organization: OrganizationDetail) => {
        setConfirmDialog({
            isOpen: true,
            title: "Delete Organization",
            message: `Are you sure you want to delete "${organization.name}"? This action cannot be undone and may affect related departments.`,
            onConfirm: async () => {
                setConfirmDialog((prev) => ({ ...prev, loading: true }));
                try {
                    await securityService.deleteOrganization(organization.id);
                    setOrganizations((prev) => prev.filter((org) => org.id !== organization.id));
                    setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
                    await fetchAllData();
                } catch (error) {
                    console.error("Error deleting organization:", error);
                    setConfirmDialog((prev) => ({ ...prev, loading: false }));
                }
            },
            loading: false,
        });
    };

    const handleSaveOrganization = async (organizationData: any) => {
        try {
            if (organizationModal.mode === "create") {
                const newOrganization = await securityService.createOrganization(organizationData);
                setOrganizations((prev) => [...prev, newOrganization]);
            } else if (organizationModal.mode === "edit" && organizationModal.organization) {
                const updatedOrganization = await securityService.updateOrganization(
                    organizationModal.organization.id,
                    organizationData
                );
                setOrganizations((prev) =>
                    prev.map((org) => (org.id === updatedOrganization.id ? updatedOrganization : org))
                );
            }
            await fetchAllData();
        } catch (error) {
            console.error("Error saving organization:", error);
            throw error;
        }
    };

    // Department handlers
    const handleViewDepartment = (department: DepartmentDetail) => {
        setDepartmentModal({
            isOpen: true,
            mode: "view",
            department,
        });
    };

    const handleEditDepartment = (department: DepartmentDetail) => {
        setDepartmentModal({
            isOpen: true,
            mode: "edit",
            department,
        });
    };

    const handleCreateDepartment = () => {
        setDepartmentModal({
            isOpen: true,
            mode: "create",
            department: null,
        });
    };

    const handleDeleteDepartment = (department: DepartmentDetail) => {
        setConfirmDialog({
            isOpen: true,
            title: "Delete Department",
            message: `Are you sure you want to delete "${department.name}"? This action cannot be undone and may affect users in this department.`,
            onConfirm: async () => {
                setConfirmDialog((prev) => ({ ...prev, loading: true }));
                try {
                    await securityService.deleteDepartment(department.id);
                    setDepartments((prev) => prev.filter((dept) => dept.id !== department.id));
                    setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
                    await fetchAllData();
                } catch (error) {
                    console.error("Error deleting department:", error);
                    setConfirmDialog((prev) => ({ ...prev, loading: false }));
                }
            },
            loading: false,
        });
    };

    const handleSaveDepartment = async (departmentData: any) => {
        try {
            if (departmentModal.mode === "create") {
                const newDepartment = await securityService.createDepartment(departmentData);
                setDepartments((prev) => [...prev, newDepartment]);
            } else if (departmentModal.mode === "edit" && departmentModal.department) {
                const updatedDepartment = await securityService.updateDepartment(
                    departmentModal.department.id,
                    departmentData
                );
                setDepartments((prev) =>
                    prev.map((dept) => (dept.id === updatedDepartment.id ? updatedDepartment : dept))
                );
            }
            await fetchAllData();
        } catch (error) {
            console.error("Error saving department:", error);
            throw error;
        }
    };

    const dismissError = () => setError(null);

    // Filter data based on search term
    const filteredOrganizations = organizations.filter(
        (org) =>
            org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDepartments = departments.filter(
        (dept) =>
            dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (dept.organization as any)?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tabCounts = {
        organizations: organizations.length,
        departments: departments.length,
    };

    const tabs = [
        {
            id: "organizations",
            label: "Organizations",
            icon: Building,
            count: tabCounts.organizations,
            permission: "view_organization",
        },
        {
            id: "departments",
            label: "Departments",
            icon: Building2,
            count: tabCounts.departments,
            permission: "view_department",
        },
    ];

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

    const renderOrganizations = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search organizations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </button>
                    <button
                        onClick={fetchAllData}
                        disabled={refreshing}
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>
                {hasPermission("add_organization") && (
                    <button
                        onClick={handleCreateOrganization}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Organization
                    </button>
                )}
            </div>

            {loadingData ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-2 text-gray-600">Loading organizations...</span>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-red-700">{error}</p>
                        </div>
                        <button onClick={dismissError} className="text-red-400 hover:text-red-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrganizations.map((organization) => (
                        <div
                            key={organization.id}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                                        <Building className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900">{organization.name}</h4>
                                        <p className="text-sm text-gray-500">
                                            Created {formatDateTime(organization.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                    {hasPermission("view_organization") && (
                                        <button
                                            onClick={() => handleViewOrganization(organization)}
                                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View organization"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    )}
                                    {hasPermission("change_organization") && (
                                        <button
                                            onClick={() => handleEditOrganization(organization)}
                                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                                            title="Edit organization"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                    )}
                                    {hasPermission("delete_organization") && (
                                        <button
                                            onClick={() => handleDeleteOrganization(organization)}
                                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete organization"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">{organization.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderDepartments = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search departments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </button>
                    <button
                        onClick={fetchAllData}
                        disabled={refreshing}
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>
                {hasPermission("add_department") && (
                    <button
                        onClick={handleCreateDepartment}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Department
                    </button>
                )}
            </div>

            {loadingData ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-600">Loading departments...</span>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-red-700">{error}</p>
                        </div>
                        <button onClick={dismissError} className="text-red-400 hover:text-red-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredDepartments.map((department) => (
                        <div
                            key={department.id}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                                        <Building2 className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900">{department.name}</h4>
                                        <p className="text-sm text-gray-500">
                                            {(department as any).organization?.name || "No organization"}
                                        </p>
                                        <p className="text-xs text-gray-400">{department.members || 0} members</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                    {hasPermission("view_department") && (
                                        <button
                                            onClick={() => handleViewDepartment(department)}
                                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View department"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    )}
                                    {hasPermission("change_department") && (
                                        <button
                                            onClick={() => handleEditDepartment(department)}
                                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                                            title="Edit department"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                    )}
                                    {hasPermission("delete_department") && (
                                        <button
                                            onClick={() => handleDeleteDepartment(department)}
                                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete department"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">{department.description}</p>
                            {department.roles && department.roles.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-500 uppercase">Assigned Roles</p>
                                    <div className="flex flex-wrap gap-1">
                                        {department.roles.slice(0, 3).map((role, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                                            >
                                                {role.name}
                                            </span>
                                        ))}
                                        {department.roles.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                +{department.roles.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    if (authLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-2 text-gray-600">Loading authentication...</span>
            </div>
        );
    }

    if (!user) {
        return <div className="text-red-600">You must be logged in to view this page.</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            {/* <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Organization Management</h3>
                <p className="text-gray-700 leading-relaxed">
                    Manage organizations and departments to structure your company hierarchy and organize users
                    effectively.
                </p>
            </div> */}
            <ContentHeader
                title="Organization Management"
                description="Manage organizations and departments to structure your company hierarchy and organize users effectively."
                storageKey="organizationManagementHeaderClosed"
            />

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        if (hasPermission(tab.permission)) {
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? "border-indigo-500 text-indigo-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    <Icon className="h-5 w-5 mr-2" />
                                    {tab.label}
                                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        }
                        return null;
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === "organizations" && hasPermission("view_organization") && renderOrganizations()}
                {activeTab === "departments" && hasPermission("view_department") && renderDepartments()}
                {!hasPermission("view_organization") && !hasPermission("view_department") && (
                    <div className="text-center text-red-600 mt-10">
                        You do not have permission to view any organization management sections.
                    </div>
                )}
            </div>

            {/* Modals */}
            <OrganizationModal
                isOpen={organizationModal.isOpen}
                onClose={() => setOrganizationModal((prev) => ({ ...prev, isOpen: false }))}
                organization={organizationModal.organization}
                mode={organizationModal.mode}
                onSave={handleSaveOrganization}
            />

            <DepartmentModal
                isOpen={departmentModal.isOpen}
                onClose={() => setDepartmentModal((prev) => ({ ...prev, isOpen: false }))}
                department={departmentModal.department}
                mode={departmentModal.mode}
                roles={[]}
                onSave={handleSaveDepartment}
            />

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                loading={confirmDialog.loading}
            />
        </div>
    );
};

export default OrganizationManagement;
