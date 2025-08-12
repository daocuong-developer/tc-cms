import React, { useState, useEffect, useCallback, useMemo } from "react";
import ContentHeader from "@/components/ui/ContentHeader";
import {
    Monitor,
    Plus,
    Edit,
    Trash2,
    Search,
    Filter,
    Eye,
    RefreshCw,
    AlertCircle,
    X,
    Calendar,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Download,
    Smartphone,
    Laptop,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
} from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import { securityService, SoftwareDetail } from "@services/securityApi";
import SoftwareModal from "@components/models/SoftwareModal";
import ConfirmDialog from "@components/models/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";

const SoftwareManagement: React.FC = () => {
    const { user, hasPermission, isLoading: authLoading } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [software, setSoftware] = useState<SoftwareDetail[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter states - these were removed for now to match the ContractManagement.tsx layout
    // const [showFilters, setShowFilters] = useState(false);
    // const [filters, setFilters] = useState({
    //     status: "",
    //     platform: "",
    //     currentVersion: "",
    // });

    // Modal states
    const [softwareModal, setSoftwareModal] = useState<{
        isOpen: boolean;
        mode: "view" | "edit" | "create";
        software: SoftwareDetail | null;
    }>({
        isOpen: false,
        mode: "create",
        software: null,
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
            const softwareData = await securityService.getSoftware();
            setSoftware(softwareData);
        } catch (err) {
            console.error("Failed to fetch software:", err);
            setError("Failed to load software. Please try again.");
        } finally {
            setLoadingData(false);
        }
    }, []);

    const refreshData = useCallback(async () => {
        setRefreshing(true);
        try {
            const softwareData = await securityService.getSoftware();
            setSoftware(softwareData);
        } catch (err) {
            console.error("Failed to refresh software:", err);
            setError("Failed to refresh software. Please try again.");
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading) {
            fetchData();
        }
    }, [authLoading, fetchData]);

    const filteredAndPaginatedSoftWare = useMemo(() => {
        const filtered = software.filter((s) => {
            const matchesSearch =
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.platform.toLowerCase().includes(searchTerm.toLowerCase());

            // Filters are commented out to match the ContractManagement.tsx file
            // const matchesStatusFilter =
            //     filters.status === "" || s.status === filters.status;
            //
            // const matchesPlatformFilter =
            //     filters.platform === "" || s.platform === filters.platform;
            //
            // const matchesVersionFilter =
            //     filters.currentVersion === "" ||
            //     (filters.currentVersion === "yes" && s.isCurrentVersion) ||
            //     (filters.currentVersion === "no" && !s.isCurrentVersion);
            //
            // return matchesSearch && matchesStatusFilter && matchesPlatformFilter && matchesVersionFilter;
            return matchesSearch;
        });

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const data = filtered.slice(startIndex, endIndex);

        return {
            data,
            totalItems,
            totalPages,
        };
    }, [software, searchTerm, currentPage, itemsPerPage]);

    const clearFilters = () => {
        // This function is now simplified as there are no filters
        setSearchTerm("");
    };

    // Software handlers
    const handleViewSoftware = (software: SoftwareDetail) => {
        setSoftwareModal({
            isOpen: true,
            mode: "view",
            software,
        });
    };

    const handleEditSoftware = (software: SoftwareDetail) => {
        setSoftwareModal({
            isOpen: true,
            mode: "edit",
            software,
        });
    };

    const handleCreateSoftware = () => {
        setSoftwareModal({
            isOpen: true,
            mode: "create",
            software: null,
        });
    };

    const handleDeleteSoftware = (software: SoftwareDetail) => {
        setConfirmDialog({
            isOpen: true,
            title: "Delete Software",
            message: `Are you sure you want to delete the software "${software.name}"? This action cannot be undone.`,
            onConfirm: async () => {
                setConfirmDialog((prev) => ({ ...prev, loading: true }));
                try {
                    await securityService.deleteSoftware(software.id);
                    setSoftware((prev) => prev.filter((s) => s.id !== software.id));
                    setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
                } catch (error) {
                    console.error("Error deleting software:", error);
                    setConfirmDialog((prev) => ({ ...prev, loading: false }));
                }
            },
            loading: false,
        });
    };

    const handleSaveSoftware = async (softwareData: any) => {
        try {
            if (softwareModal.mode === "create") {
                const newSoftware = await securityService.createSoftware(softwareData);
                setSoftware((prev) => [...prev, newSoftware]);
            } else if (softwareModal.mode === "edit" && softwareModal.software) {
                const updatedSoftware = await securityService.updateSoftware(softwareModal.software.id, softwareData);
                setSoftware((prev) => prev.map((s) => (s.id === softwareModal.software!.id ? updatedSoftware : s)));
            }
        } catch (error) {
            console.error("Error saving software:", error);
            throw error;
        }
    };

    const dismissError = () => setError(null);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                    </span>
                );
            case "INACTIVE":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Inactive
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {status}
                    </span>
                );
        }
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case "iOS":
                return <Smartphone className="h-4 w-4 text-gray-500" />;
            case "Desktop":
                return <Laptop className="h-4 w-4 text-gray-500" />;
            case "Android":
                return <Smartphone className="h-4 w-4 text-green-500" />;
            case "Web":
                return <Monitor className="h-4 w-4 text-blue-500" />;
            default:
                return <Monitor className="h-4 w-4 text-gray-500" />;
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
            </div>
        );
    }

    if (!user) {
        return <div className="text-red-600">You need to log in to view this page.</div>;
    }

    return (
        <div className="space-y-6">
            <ContentHeader
                title="Software Management"
                description="Manage software information, versions and activation status in the system."
                storageKey="softwareManagementHeaderClosed"
                userId={user?.id}
            />

            {/* Search and Controls */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search software..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {/* The Filter button is for consistency with the ContractManagement file, but doesn't do anything yet */}
                    <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Filter className="h-4 w-4 mr-2" /> Filter
                    </button>
                    <button onClick={refreshData} disabled={refreshing} className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50" >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} /> Refresh
                    </button>
                </div>
                <button onClick={handleCreateSoftware} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" >
                    <Plus className="h-4 w-4 mr-2" /> Add Software
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-red-700">{error}</p>
                        </div>
                        <button
                            onClick={dismissError}
                            className="text-red-400 hover:text-red-600 focus:outline-none"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
            
            {/* Table */}
            {loadingData ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading data...</span>
                </div>
            ) : filteredAndPaginatedSoftWare.data.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Monitor className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="font-semibold text-xl">Không tìm thấy phần mềm</h3>
                    <p className="mt-2">Thêm một phần mềm mới hoặc điều chỉnh tìm kiếm của bạn.</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tên phần mềm
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Phiên bản
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nền tảng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cập nhật lần cuối
                                </th>
                                <th className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndPaginatedSoftWare.data.map((s) => (
                                <tr key={s.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{s.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{s.version}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getPlatformIcon(s.platform)}
                                            <span className="ml-2 text-sm text-gray-900">{s.platform}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(s.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{formatDateTime(s.lastUpdated)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button onClick={() => handleViewSoftware(s)} className="text-blue-600 hover:text-blue-900">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleEditSoftware(s)} className="text-indigo-600 hover:text-indigo-900">
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDeleteSoftware(s)} className="text-red-600 hover:text-red-900">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-center ">
                            {filteredAndPaginatedSoftWare.totalPages > 1 && (
                                <div className="mt-4 flex justify-center">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={filteredAndPaginatedSoftWare.totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            <SoftwareModal
                isOpen={softwareModal.isOpen}
                onClose={() => setSoftwareModal((prev) => ({ ...prev, isOpen: false }))}
                software={softwareModal.software}
                mode={softwareModal.mode}
                onSave={handleSaveSoftware}
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

export default SoftwareManagement;
