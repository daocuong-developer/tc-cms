import React, { useState, useEffect, useCallback, useMemo } from "react";
import ContentHeader from "@/components/ui/ContentHeader";
import {
    FileText,
    Plus,
    Edit,
    Trash2,
    Search,
    Filter,
    Eye,
    RefreshCw,
    AlertCircle,
    X,
    Phone,
    Mail,
    Calendar,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
} from "lucide-react";
import { useAuth } from "@contexts/AuthContext";
import { securityService, ContractDetail } from "@services/securityApi";
import ContractModal from "@components/models/ContractModal";
import ConfirmDialog from "@components/models/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";

const ContractManagement: React.FC = () => {
    const { user,   isLoading: authLoading } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [contracts, setContracts] = useState<ContractDetail[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Modal states
    const [contractModal, setContractModal] = useState<{
        isOpen: boolean;
        mode: "view" | "edit" | "create";
        contract: ContractDetail | null;
    }>({
        isOpen: false,
        mode: "create",
        contract: null,
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
            const contractsData = await securityService.getContracts();
            setContracts(contractsData);
        } catch (err) {
            console.error("Failed to fetch contracts:", err);
            setError("Failed to load contracts. Please try again.");
        } finally {
            setLoadingData(false);
        }
    }, []);

    const refreshData = useCallback(async () => {
        setRefreshing(true);
        try {
            const contractsData = await securityService.getContracts();
            setContracts(contractsData);
        } catch (err) {
            console.error("Failed to refresh contracts:", err);
            setError("Failed to refresh contracts. Please try again.");
        } finally {
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading) {
            fetchData();
        }
    }, [authLoading, fetchData]);

    
    // Filter and Panigation
    const filteredAndPaginatedContracts = useMemo(() => {
        const filtered = contracts.filter(
            (contract) =>
                contract.customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contract.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (contract.customer.phone || "").includes(searchTerm) ||
                (contract.deviceName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (contract.organization || "").toLowerCase().includes(searchTerm.toLowerCase())
        );

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
    }, [contracts, searchTerm, currentPage, itemsPerPage]);

    // Contract handlers
    const handleViewContract = (contract: ContractDetail) => {
        setContractModal({
            isOpen: true,
            mode: "view",
            contract,
        });
    };

    const handleEditContract = (contract: ContractDetail) => {
        setContractModal({
            isOpen: true,
            mode: "edit",
            contract,
        });
    };

    const handleCreateContract = () => {
        setContractModal({
            isOpen: true,
            mode: "create",
            contract: null,
        });
    };

    const handleDeleteContract = (contract: ContractDetail) => {
        setConfirmDialog({
            isOpen: true,
            title: "Delete Contract",
            message: `Are you sure you want to delete the contract for "${contract.customer.customerName}"? This action cannot be undone.`,
            onConfirm: async () => {
                setConfirmDialog((prev) => ({ ...prev, loading: true }));
                try {
                    await securityService.deleteContract(contract.id);
                    setContracts((prev) => prev.filter((c) => c.id !== contract.id));
                    setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
                } catch (error) {
                    console.error("Error deleting contract:", error);
                    setConfirmDialog((prev) => ({ ...prev, loading: false }));
                }
            },
            loading: false,
        });
    };

    const handleShareContract = (contract: ContractDetail) => {
    
        console.log("Sharing contract:", contract);
        alert(`share: ${contract.customer.customerName}`);
    };

    const handleSaveContract = async (contractData: any) => {
        try {
            if (contractModal.mode === "create") {
                const newContract = await securityService.createContract(contractData);
                setContracts((prev) => [...prev, newContract]);
            } else if (contractModal.mode === "edit" && contractModal.contract) {
                const updatedContract = await securityService.updateContract(contractModal.contract.id, contractData);
                setContracts((prev) =>
                    prev.map((contract) => (contract.id === contractModal.contract!.id ? updatedContract : contract))
                );
            }
        } catch (error) {
            console.error("Error saving contract:", error);
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
            case "EXPIRED":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Expired
                    </span>
                );
            case "PAUSED":
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Paused
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

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount);
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            <ContentHeader 
                title="Contract Management"
                description="Manage customer contracts, track their status and expiration dates."
                storageKey="contractManagementHeaderClosed"
                userId={user?.id} // truyền id user
            />

            {/* Controls */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search contracts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    onClick={handleCreateContract}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contract
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading contracts...</span>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Device Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Organization
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Times Marked
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Start Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        End Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAndPaginatedContracts.data.map((contract, index) => (
                                    <tr key={contract.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {contract.customer.customerName}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center">
                                                    <Mail className="h-3 w-3 mr-1" />
                                                    {contract.customer.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs">
                                            <div className="flex items-center">
                                                <Phone className="h-3 w-3 mr-1 text-gray-400" />
                                                {contract.customer.phone || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {contract.customer?.deviceName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {contract.customer?.organization || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs">
                                            <div className="flex items-center">
                                                <DollarSign className="h-3 w-3 mr-1 text-gray-400" />
                                                {contract.timesMarked}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs">
                                            <div className="flex items-center">
                                                <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                                                {formatDateTime(contract.startDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs">
                                            <div className="flex items-center">
                                                <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                                {formatDateTime(contract.endDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(contract.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleViewContract(contract)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditContract(contract)}
                                                    className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteContract(contract)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleShareContract(contract)}
                                                    className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                                    title="Share"
                                                >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="lucide lucide-share-2"
                                                >
                                                <circle cx="18" cy="5" r="3" />
                                                <circle cx="6" cy="12" r="3" />
                                                <circle cx="18" cy="19" r="3" />
                                                <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                                                <line x1="15.42" x2="8.59" y1="6.51" y2="10.49" />
                                                </svg>
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
                        <div className="flex-1 flex justify-center ">
                            {filteredAndPaginatedContracts.totalPages > 1 && (
                                <div className="mt-4 flex justify-center">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={filteredAndPaginatedContracts.totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            <ContractModal
                isOpen={contractModal.isOpen}
                onClose={() => setContractModal((prev) => ({ ...prev, isOpen: false }))}
                contract={contractModal.contract}
                mode={contractModal.mode}
                onSave={handleSaveContract}
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

export default ContractManagement;
