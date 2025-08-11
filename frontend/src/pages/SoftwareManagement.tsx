    // Mock data
    // const mockSoftware: Software[] = [
    //     {
    //         id: "1",
    //         name: "VS Code",
    //         version: "19.5.1",
    //         platform: "iOS",
    //         isCurrentVersion: true,
    //         status: "Active",
    //         lastUpdated: "2025-07-01T00:00:00Z",
    //     },
    //     {
    //         id: "2",
    //         name: "A-MarkAI",
    //         version: "1.2.8",
    //         platform: "Desktop",
    //         isCurrentVersion: true,
    //         status: "Active",
    //         lastUpdated: "2025-03-24T00:00:00Z",
    //     },
    //     {
    //         id: "3",
    //         name: "System Monitor",
    //         version: "4.4.4",
    //         platform: "Desktop",
    //         isCurrentVersion: false,
    //         status: "Inactive",
    //         lastUpdated: "2025-07-07T00:00:00Z",
    //     },
    //     {
    //         id: "4",
    //         name: "VS Code",
    //         version: "19.5.1",
    //         platform: "iOS",
    //         isCurrentVersion: false,
    //         status: "Active",
    //         lastUpdated: "2025-07-01T00:00:00Z",
    //     },
    //     {
    //         id: "5",
    //         name: "Code Editor Pro",
    //         version: "2.1.3",
    //         platform: "Android",
    //         isCurrentVersion: false,
    //         status: "Active",
    //         lastUpdated: "2025-07-01T00:00:00Z",
    //     },
    //     {
    //         id: "6",
    //         name: "Development Tools",
    //         version: "3.2.1",
    //         platform: "Web",
    //         isCurrentVersion: false,
    //         status: "Active",
    //         lastUpdated: "2025-07-01T00:00:00Z",
    //     },
    //     {
    //         id: "7",
    //         name: "Test Suite",
    //         version: "12",
    //         platform: "iOS",
    //         isCurrentVersion: false,
    //         status: "Active",
    //         lastUpdated: "2025-03-26T00:00:00Z",
    //     },
    //     {
    //         id: "8",
    //         name: "Quality Assurance",
    //         version: "1.5.2",
    //         platform: "Desktop",
    //         isCurrentVersion: false,
    //         status: "Active",
    //         lastUpdated: "2025-03-26T00:00:00Z",
    //     },
    //     {
    //         id: "9",
    //         name: "AutoMark",
    //         version: "1.0.0",
    //         platform: "Desktop",
    //         isCurrentVersion: false,
    //         status: "Active",
    //         lastUpdated: "2025-03-06T00:00:00Z",
    //     },
    // ];

   
    import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import { securityService, SoftwareDetail } from "@services/securityApi";
import SoftwareModal from "@components/models/SoftwareModal";
import ConfirmDialog from "@components/models/ConfirmDialog";

const SoftwareManagement: React.FC = () => {
    const { user, hasPermission, isLoading: authLoading } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [software, setSoftware] = useState<SoftwareDetail[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    // Filter software based on search term
    const filteredSoftware = software.filter(
        (s) =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.platform.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Software Management</h3>
                <p className="text-gray-700 leading-relaxed">
                    Manage software information, versions and activation status in the system.
                </p>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search software..."
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
                        onClick={refreshData}
                        disabled={refreshing}
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>
                <button
                    onClick={handleCreateSoftware}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Software
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
                        <button onClick={dismissError} className="text-red-400 hover:text-red-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            {loadingData ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-gray-600">Loading software...</span>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Software Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Version
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Platform
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Current Version
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Updated
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSoftware.map((software, index) => (
                                    <tr key={software.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Monitor className="h-5 w-5 text-purple-500 mr-2" />
                                                <div className="text-sm font-medium text-gray-900">{software.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {software.version}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getPlatformIcon(software.platform)}
                                                <span className="ml-2 text-sm text-gray-900">{software.platform}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {software.isCurrentVersion ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                    No
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(software.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                                                {formatDateTime(software.lastUpdated)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleViewSoftware(software)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditSoftware(software)}
                                                    className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSoftware(software)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Previous
                            </button>
                            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">1</span> to{" "}
                                    <span className="font-medium">{filteredSoftware.length}</span> of{" "}
                                    <span className="font-medium">{filteredSoftware.length}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                        1
                                    </button>
                                    <select className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        <option>20</option>
                                        <option>50</option>
                                        <option>100</option>
                                    </select>
                                </nav>
                            </div>
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
