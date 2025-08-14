import React, { useState, useEffect, useMemo } from "react";
import ContentHeader from "@/components/ui/ContentHeader";
import { useAuth } from "@/contexts/AuthContext";
import { SearchInput } from "@/components/ui/SearchInput";
import {
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    Mail,
    Phone,
    Building,
    Calendar,
    AlertCircle,
    CheckCircle,
    User,
    RefreshCw,
    Filter,
    X,
    ChevronDown,
} from "lucide-react";
import { CustomerDetail, securityService } from "@services/securityApi";
import CustomerModel from "@components/models/CustomerModel";
import ConfirmDialog from "@components/models/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";

const CustomerManagement: React.FC = () => {
    const [customers, setCustomers] = useState<CustomerDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth(); // lấy user từ context

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        customer: CustomerDetail | null;
        isDeleting: boolean;
    }>({
        isOpen: false,
        customer: null,
        isDeleting: false,
    });
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        hasPhone: "",
        hasDevice: "",
        hasOrganization: "",
    });
    const [notification, setNotification] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Filter and Panigation
    const filteredAndPaginatedCustomer = useMemo(() => {
        const filtered = customers.filter((customer) => {
            const matchesSearch =
                customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (customer.phone && customer.phone.includes(searchTerm)) ||
                (customer.organization && customer.organization.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesPhoneFilter =
                filters.hasPhone === "" ||
                (filters.hasPhone === "yes" && customer.phone) ||
                (filters.hasPhone === "no" && !customer.phone);

            const matchesDeviceFilter =
                filters.hasDevice === "" ||
                (filters.hasDevice === "yes" && customer.deviceName) ||
                (filters.hasDevice === "no" && !customer.deviceName);

            const matchesOrgFilter =
                filters.hasOrganization === "" ||
                (filters.hasOrganization === "yes" && customer.organization) ||
                (filters.hasOrganization === "no" && !customer.organization);

            return matchesSearch && matchesPhoneFilter && matchesDeviceFilter && matchesOrgFilter;
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
    }, [customers, searchTerm, currentPage, itemsPerPage, filters]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const data = await securityService.getCustomers();
            setCustomers(data);
        } catch (error) {
            console.error("Error fetching customers:", error);
            showNotification("error", "Failed to load customers");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            const data = await securityService.getCustomers();
            setCustomers(data);
            showNotification("success", "Customer list refreshed");
        } catch (error) {
            console.error("Error refreshing customers:", error);
            showNotification("error", "Failed to refresh customers");
        } finally {
            setRefreshing(false);
        }
    };

    const showNotification = (type: "success" | "error", message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleAddCustomer = () => {
        setSelectedCustomer(null);
        setIsModalOpen(true);
    };

    const handleEditCustomer = (customer: CustomerDetail) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const handleDeleteCustomer = (customer: CustomerDetail) => {
        setDeleteDialog({
            isOpen: true,
            customer,
            isDeleting: false,
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteDialog.customer) return;

        try {
            setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));
            await securityService.deleteCustomer(deleteDialog.customer.id);
            await fetchCustomers();
            showNotification("success", "Customer deleted successfully");
            setDeleteDialog({ isOpen: false, customer: null, isDeleting: false });
        } catch (error) {
            console.error("Error deleting customer:", error);
            showNotification("error", "Failed to delete customer");
            setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
        }
    };

    const handleCloseDeleteDialog = () => {
        if (!deleteDialog.isDeleting) {
            setDeleteDialog({ isOpen: false, customer: null, isDeleting: false });
        }
    };

    const handleSaveCustomer = async (customerData: any) => {
        try {
            setIsSubmitting(true);
            if (selectedCustomer) {
                await securityService.updateCustomer(selectedCustomer.id, customerData);
                showNotification("success", "Customer updated successfully");
            } else {
                await securityService.createCustomer(customerData);
                showNotification("success", "Customer added successfully");
            }
            setIsModalOpen(false);
            await fetchCustomers();
        } catch (error) {
            console.error("Error saving customer:", error);
            showNotification("error", selectedCustomer ? "Failed to update customer" : "Failed to add customer");
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearFilters = () => {
        setFilters({
            hasPhone: "",
            hasDevice: "",
            hasOrganization: "",
        });
        setSearchTerm("");
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            {/* Notification */}
            {notification && (
                <div
                    className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-80 ${
                        notification.type === "success"
                            ? "bg-green-50 text-green-800 border-2 border-green-200"
                            : "bg-red-50 text-red-800 border-2 border-red-200"
                    }`}
                >
                    {notification.type === "success" ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                        <AlertCircle className="w-6 h-6 text-red-600" />
                    )}
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            {/* Header */}
            <ContentHeader
                title="Customer Management"
                description="Manage your customers, their devices, and organizations."
                storageKey="customerManagementHeaderClosed"
                userId={user?.id} // Assuming user context is available
            />

            {/* Search and Controls */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search by customer name, email, phone, device, or organization"
                        className="w-80"
                    />
                    <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>
                <button
                    onClick={handleAddCustomer}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                </button>
            </div>

            {/* Customer Table */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading custormer...</span>
                </div>
            ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Device
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Organization
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndPaginatedCustomer.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <User className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 text-lg font-medium mb-2">
                                                {searchTerm || Object.values(filters).some((f) => f)
                                                    ? "No customers found"
                                                    : "No customers yet"}
                                            </p>
                                            <p className="text-gray-400">
                                                {searchTerm || Object.values(filters).some((f) => f)
                                                    ? "Try adjusting your search or filters"
                                                    : "Add your first customer to get started"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAndPaginatedCustomer.data.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                                                    <User className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {customer.customerName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {customer.id.toString().slice(0, 8)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-2">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                                    {customer.email}
                                                </div>
                                                {customer.phone ? (
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                                        {customer.phone}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-400 italic">No phone</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {customer.deviceName || (
                                                    <span className="text-gray-400 italic">No device</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                {customer.organization ? (
                                                    <>
                                                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                                                        {customer.organization}
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 italic">No organization</span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditCustomer(customer)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                                                    title="Edit Customer"
                                                >
                                                    <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCustomer(customer)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                                                    title="Delete Customer"
                                                >
                                                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-center ">
                        {filteredAndPaginatedCustomer.totalPages > 1 && (
                            <div className="mt-4 flex justify-center">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={filteredAndPaginatedCustomer.totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            )}

            {/* Customer Modal */}
            <CustomerModel
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                customer={selectedCustomer}
                onSave={handleSaveCustomer}
                isLoading={isSubmitting}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
                title="Delete Customer"
                message={`Are you sure you want to delete customer "${deleteDialog.customer?.customerName}"? This action cannot be undone.`}
                confirmText="Delete Customer"
                cancelText="Cancel"
                type="danger"
                loading={deleteDialog.isDeleting}
            />
        </div>
    );
};

export default CustomerManagement;