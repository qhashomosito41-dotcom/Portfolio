import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { HomePage } from './pages/HomePage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminLayout } from './layouts/AdminLayout';
import { LoginPage } from './pages/admin/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { ProfilePage } from './pages/admin/ProfilePage';
import { ProjectsPage } from './pages/admin/ProjectsPage';
import { ProjectEditorPage } from './pages/admin/ProjectEditorPage';
import { SkillsPage } from './pages/admin/SkillsPage';
import { ExperiencePage } from './pages/admin/ExperiencePage';
import { EducationPage } from './pages/admin/EducationPage';
import { CertificationsPage } from './pages/admin/CertificationsPage';
import { CvPage } from './pages/admin/CvPage';
import { MessagesPage } from './pages/admin/MessagesPage';
import { SocialLinksPage } from './pages/admin/SocialLinksPage';
import { SettingsPage } from './pages/admin/SettingsPage';

export const App = () => (
  <BrowserRouter>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="projects/:slug" element={<ProjectDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route path="/admin/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/new" element={<ProjectEditorPage />} />
                <Route path="projects/:id" element={<ProjectEditorPage />} />
                <Route path="skills" element={<SkillsPage />} />
                <Route path="experience" element={<ExperiencePage />} />
                <Route path="education" element={<EducationPage />} />
                <Route path="certifications" element={<CertificationsPage />} />
                <Route path="cv" element={<CvPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="social-links" element={<SocialLinksPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </BrowserRouter>
);
