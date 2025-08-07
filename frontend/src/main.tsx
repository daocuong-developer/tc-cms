import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <MantineProvider defaultColorScheme="light">
                <AuthProvider>
                    <App />
                </AuthProvider>
                <ToastContainer position="top-right" autoClose={3000} />
            </MantineProvider>
        </BrowserRouter>
    </StrictMode>
);
