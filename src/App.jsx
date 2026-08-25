import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import VerifyCodePage from "./pages/VerifyCodePage";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import AdminHome from "./pages/dashboard/AdminHome";
import AdminMedicos from "./pages/dashboard/AdminMedicos";
import AdminPacientes from "./pages/dashboard/AdminPacientes";
import MedicoHome from "./pages/dashboard/MedicoHome";
import MedicoPacientes from "./pages/dashboard/MedicoPacientes";
import MedicoAnalisis from "./pages/dashboard/MedicoAnalisis";
import PacienteHome from "./pages/dashboard/PacienteHome";
import PacienteAnalisis from "./pages/dashboard/PacienteAnalisis";
import Chats from "./pages/dashboard/Chats";
import Perfil from "./pages/dashboard/Perfil";
import Notificaciones from "./pages/dashboard/Notificaciones";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verificar" element={<VerifyCodePage />} />

      <Route
        path="/administrador"
        element={
          <ProtectedRoute role="administrador">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="medicos" element={<AdminMedicos />} />
        <Route path="pacientes" element={<AdminPacientes />} />
        <Route path="chats" element={<Chats />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="notificaciones" element={<Notificaciones />} />
      </Route>

      <Route
        path="/medico"
        element={
          <ProtectedRoute role="medico">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MedicoHome />} />
        <Route path="pacientes" element={<MedicoPacientes />} />
        <Route path="analisis" element={<MedicoAnalisis />} />
        <Route path="chats" element={<Chats />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="notificaciones" element={<Notificaciones />} />
      </Route>

      <Route
        path="/paciente"
        element={
          <ProtectedRoute role="paciente">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PacienteHome />} />
        <Route path="analisis" element={<PacienteAnalisis />} />
        <Route path="chats" element={<Chats />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="notificaciones" element={<Notificaciones />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
