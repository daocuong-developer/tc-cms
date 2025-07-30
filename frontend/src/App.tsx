import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@components/layout/Layout";
import { Dashboard } from "@components/dashboard/Dashboard";
import SectionContent from "@components/layout/SectionContent";
import { RegisterForm } from "@components/auth/RegisterForm";
import { LoginForm } from "@components/auth/LoginForm";

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

            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
        </Routes>
    );
};

export default App;
