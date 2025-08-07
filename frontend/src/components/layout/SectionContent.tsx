import React from "react";
import ExecutiveSummary from "../../pages/ExecutiveSummary";
import ReceivingModule from "../../pages/ReceivingModule";
import BackofficeModule from "../../pages/BackofficeModule";
import LeadershipModule from "../../pages/LeadershipModule";
import StatisticsModule from "../../pages/StatisticsModule";
import LookupModule from "../../pages/LookupModule";
import AdministrationModule from "../../pages/AdministrationModule";
import CrossModuleRequirements from "../../pages/CrossModuleRequirements";
import TechnicalConsiderations from "../../pages/TechnicalConsiderations";
import { RolesList } from "../roles/RolesList";
import SecurityManagement from "@/pages/SecurityManagement";
import OrganizationManagement from "@/pages/OrganizationManagement";

interface SectionContentProps {
    activeSection: string;
}

const SectionContent: React.FC<SectionContentProps> = ({ activeSection }) => {
    switch (activeSection) {
        case "executive":
            return <ExecutiveSummary />;
        case "receiving":
            return <ReceivingModule />;
        case "backoffice":
            return <BackofficeModule />;
        case "leadership":
            return <LeadershipModule />;
        case "statistics":
            return <StatisticsModule />;
        case "lookup":
            return <LookupModule />;
        case "administration":
            return <AdministrationModule />;
        case "cross-module":
            return <CrossModuleRequirements />;
        case "technical":
            return <TechnicalConsiderations />;
        case "role-list":
            return <RolesList />;
        case "security-management":
            return <SecurityManagement />;
        case "organizations":
            return <OrganizationManagement />;
        default:
            return <ExecutiveSummary />;
    }
};

export default SectionContent;
