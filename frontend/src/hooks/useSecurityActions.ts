import { useState } from "react";
import { securityService, UserDetail, RoleDetail, GroupDetail, PermissionDetail } from "@/services/securityApi";

export interface ModalState<T> {
    isOpen: boolean;
    mode: "view" | "edit" | "create";
    item: T | null;
}

export interface ConfirmDialogState {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    loading: boolean;
}

export const useSecurityActions = () => {
    // Modal states
    const [userModal, setUserModal] = useState<ModalState<UserDetail>>({
        isOpen: false,
        mode: "view",
        item: null,
    });

    const [roleModal, setRoleModal] = useState<ModalState<RoleDetail>>({
        isOpen: false,
        mode: "view",
        item: null,
    });

    const [groupModal, setGroupModal] = useState<ModalState<GroupDetail>>({
        isOpen: false,
        mode: "view",
        item: null,
    });

    const [permissionModal, setPermissionModal] = useState<ModalState<PermissionDetail>>({
        isOpen: false,
        mode: "view",
        item: null,
    });

    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
        loading: false,
    });

    // Generic modal handlers
    const createModalHandlers = <T>(setModal: React.Dispatch<React.SetStateAction<ModalState<T>>>) => ({
        view: (item: T) => setModal({ isOpen: true, mode: "view", item }),
        edit: (item: T) => setModal({ isOpen: true, mode: "edit", item }),
        create: () => setModal({ isOpen: true, mode: "create", item: null }),
        close: () => setModal({ isOpen: false, mode: "view", item: null }),
    });

    // User handlers
    const userActions = createModalHandlers(setUserModal);

    // Role handlers
    const roleActions = createModalHandlers(setRoleModal);

    // Group handlers
    const groupActions = createModalHandlers(setGroupModal);

    // Permission handlers
    const permissionActions = {
        view: (permission: PermissionDetail) => setPermissionModal({ isOpen: true, mode: "view", item: permission }),
        edit: (permission: PermissionDetail) => setPermissionModal({ isOpen: true, mode: "edit", item: permission }),
        close: () => setPermissionModal({ isOpen: false, mode: "view", item: null }),
    };

    // Generic delete handler
    const createDeleteHandler = <T extends { id: string; name?: string; full_name?: string; username?: string }>(
        entityType: string,
        deleteService: (id: string) => Promise<void>,
        setData: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
        const handleDelete = (item: T) => {
            const name = item.name || item.full_name || item.username || "this item";
            const userCount = (item as any).user_count;
            const message = userCount
                ? `Are you sure you want to delete ${entityType.toLowerCase()} "${name}"? This action cannot be undone and will affect ${userCount} users.`
                : `Are you sure you want to delete ${entityType.toLowerCase()} "${name}"? This action cannot be undone.`;

            setConfirmDialog({
                isOpen: true,
                title: `Delete ${entityType}`,
                message,
                onConfirm: () => confirmDelete(item.id, deleteService, setData),
                loading: false,
            });
        };

        return handleDelete;
    };

    // Generic confirm delete
    const confirmDelete = async <T extends { id: string }>(
        id: string,
        deleteService: (id: string) => Promise<void>,
        setData: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
        setConfirmDialog((prev) => ({ ...prev, loading: true }));
        try {
            await deleteService(id);
            setData((prev) => prev.filter((item) => item.id !== id));
            setConfirmDialog((prev) => ({ ...prev, isOpen: false, loading: false }));
        } catch (error) {
            console.error("Error deleting item:", error);
            setConfirmDialog((prev) => ({ ...prev, loading: false }));
        }
    };

    // Generic save handler
    const createSaveHandler = <T extends { id: string }>(
        modal: ModalState<T>,
        setModal: React.Dispatch<React.SetStateAction<ModalState<T>>>,
        createService: (data: any) => Promise<T>,
        updateService: (id: string, data: any) => Promise<T>,
        setData: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
        return async (itemData: any) => {
            try {
                if (modal.mode === "create") {
                    const newItem = await createService(itemData);
                    setData((prev) => [...prev, newItem]);
                } else if (modal.mode === "edit" && modal.item) {
                    const updatedItem = await updateService(modal.item.id, itemData);
                    setData((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
                }
                setModal({ isOpen: false, mode: "view", item: null });
            } catch (error) {
                console.error("Error saving item:", error);
                throw error;
            }
        };
    };

    return {
        // Modal states
        userModal,
        roleModal,
        groupModal,
        permissionModal,
        confirmDialog,

        // Action handlers
        userActions,
        roleActions,
        groupActions,
        permissionActions,

        // Utility functions
        createDeleteHandler,
        createSaveHandler,
        setConfirmDialog,
    };
};
