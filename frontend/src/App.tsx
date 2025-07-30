import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import SectionContent from "./components/layout/SectionContent";
import { LoginForm } from "./components/auth/LoginForm";
import { Dashboard } from "./components/dashboard/Dashboard";
// import { RolesList } from "./components/roles/RolesList";

const App: React.FC = () => {
    const [activeSection, setActiveSection] = useState("executive");

    return (
        <Routes>
            <Route
                path="/"
                element={
                    <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
                        <SectionContent activeSection={activeSection} />
                    </Layout>
                }
            />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* <Route path="/roles" element={<RolesList />} /> */}

            <Route path="/login" element={<LoginForm />} />
        </Routes>
    );
};

export default App;
