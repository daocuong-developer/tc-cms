import { useState, useEffect } from "react";
import {
    UserDetail,
    RoleDetail,
    DepartmentDetail,
    OrganizationDetail,
    securityService,
    GroupDetail,
} from "@services/securityApi";

export const useUserModalLogic = (isOpen: boolean, mode: "view" | "edit" | "create", userToEdit: UserDetail | null) => {
    const [organizations, setOrganizations] = useState<OrganizationDetail[]>([]);
    const [loadingOrganizations, setLoadingOrganizations] = useState(false);

    const [filteredDepartments, setFilteredDepartments] = useState<DepartmentDetail[]>([]);
    const [allDepartments, setAllDepartments] = useState<DepartmentDetail[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);

    const [filteredGroups, setFilteredGroups] = useState<GroupDetail[]>([]);
    const [allGroups, setAllGroups] = useState<GroupDetail[]>([]);
    const [loadingGroups, setLoadingGroups] = useState(false);

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
        group_id: "",
        is_active: true,
        notes: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // --- EFFECT: Chỉ cập nhật Department/Group khi data load xong ---
    useEffect(() => {
        if (userToEdit && (mode === "view" || mode === "edit") && allDepartments.length > 0 && allGroups.length > 0) {
            setFilteredDepartments(
                allDepartments.filter((dept) => String(dept.organization_id) === String(userToEdit.organization?.id))
            );
            setFilteredGroups(
                allGroups.filter((group) => String(group.organization?.id) === String(userToEdit.organization?.id))
            );

            // ✅ Chỉ cập nhật 3 field này, giữ nguyên các field khác
            setFormData((prev) => ({
                ...prev,
                organization_id: String(userToEdit.organization?.id || ""),
                department_id: String(userToEdit.department?.id || ""),
                group_id: String(userToEdit.group?.id || ""),
            }));
        }
    }, [allDepartments, allGroups, userToEdit, mode]);

    // --- EFFECT: Tải dữ liệu ban đầu ---
    useEffect(() => {
        const loadInitialData = async () => {
            if (!isOpen) return;

            setLoadingOrganizations(true);
            setLoadingDepartments(true);
            setLoadingGroups(true);

            try {
                const [orgs, depts, groupsData] = await Promise.all([
                    securityService.getOrganizations(),
                    securityService.getDepartments(true),
                    securityService.getGroups(),
                ]);

                const normalizedDepts = depts.map((d) => ({
                    ...d,
                    organization_id: d.organization_id ?? d.organization?.id ?? null,
                }));

                setOrganizations(orgs);
                setAllDepartments(normalizedDepts);
                setAllGroups(groupsData);
            } catch (error) {
                console.error("❌ Error loading initial data:", error);
            } finally {
                setLoadingOrganizations(false);
                setLoadingDepartments(false);
                setLoadingGroups(false);
            }
        };

        loadInitialData();
    }, [isOpen]);

    // --- EFFECT: Lọc Departments theo Organization ---
    useEffect(() => {
        if (formData.organization_id && allDepartments.length > 0) {
            const filtered = allDepartments.filter(
                (dept) => String(dept.organization_id) === String(formData.organization_id)
            );
            setFilteredDepartments(filtered);
        } else {
            setFilteredDepartments([]);
        }
    }, [formData.organization_id, allDepartments]);

    // --- EFFECT: Reset Department khi không hợp lệ ---
    useEffect(() => {
        if (formData.department_id && filteredDepartments.length > 0) {
            const currentDeptValid = filteredDepartments.find(
                (dept) => String(dept.id) === String(formData.department_id)
            );

            if (!currentDeptValid) {
                setFormData((prev) => ({ ...prev, department_id: "" }));
            }
        }
    }, [filteredDepartments, formData.department_id]);

    // --- EFFECT: Lọc Groups theo Organization ---
    useEffect(() => {
        if (formData.organization_id && allGroups.length > 0) {
            const filtered = allGroups.filter(
                (group) => String(group.organization?.id) === String(formData.organization_id)
            );
            setFilteredGroups(filtered);
        } else {
            setFilteredGroups([]);
        }
    }, [formData.organization_id, allGroups]);

    // --- EFFECT: Khởi tạo dữ liệu khi mở modal ---
    useEffect(() => {
        if (userToEdit && (mode === "view" || mode === "edit")) {
            setFormData({
                username: userToEdit.username || "",
                email: userToEdit.email || "",
                full_name: userToEdit.full_name || "",
                password: "",
                phone: userToEdit.phone || "",
                position: userToEdit.position || "",
                organization_id: String(userToEdit.organization?.id || ""),
                address: userToEdit.address || "",
                role_ids: userToEdit.roles?.map((r) => r.id) || [],
                department_id: String(userToEdit.department?.id || ""),
                group_id: String(userToEdit.group?.id || ""),
                is_active: userToEdit.is_active ?? true,
                notes: userToEdit.notes || "",
            });

            // Nếu dữ liệu đã load, lọc luôn
            if (allDepartments.length > 0) {
                const filteredDept = allDepartments.filter(
                    (dept) => String(dept.organization_id) === String(userToEdit.organization?.id)
                );
                setFilteredDepartments(filteredDept);
            }
            if (allGroups.length > 0) {
                const filteredGroup = allGroups.filter(
                    (group) => String(group.organization?.id) === String(userToEdit.organization?.id)
                );
                setFilteredGroups(filteredGroup);
            }
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
                group_id: "",
                is_active: true,
                notes: "",
            });
            setFilteredDepartments([]);
            setFilteredGroups([]);
        }

        setErrors({});
    }, [userToEdit, mode, allDepartments, allGroups]);

    // ✅ Handle organization change
    const handleOrganizationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newOrgId = e.target.value;
        setFormData({
            ...formData,
            organization_id: newOrgId,
            department_id: "",
            group_id: "",
        });
    };

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

        if (formData.role_ids.length === 0) {
            newErrors.role_ids = "Please select at least one role";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return {
        formData,
        setFormData,
        organizations,
        loadingOrganizations,
        filteredDepartments,
        loadingDepartments,
        filteredGroups,
        loadingGroups,
        errors,
        validateForm,
        handleOrganizationChange,
    };
};

export default useUserModalLogic;
