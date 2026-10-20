import { api } from './api';
import type {
  AdminCertification,
  AdminCv,
  AdminEducation,
  AdminExperience,
  AdminProfile,
  AdminProject,
  AdminSettings,
  AdminSkill,
  AdminSocialLink,
  ContactMessage,
  DashboardData,
  Pagination,
} from '../types';

type ListResponse<T> = { items: T[]; pagination: Pagination };

export const adminApi = {
  dashboard: () => api.get<DashboardData>('/api/admin/dashboard'),

  getProfile: () => api.get<AdminProfile>('/api/admin/profile'),
  updateProfile: (payload: Record<string, unknown>) =>
    api.put<AdminProfile>('/api/admin/profile', payload),
  uploadProfileImage: (file: File) => {
    const data = new FormData();
    data.append('image', file);
    return api.upload<AdminProfile>('/api/admin/profile/image', data);
  },
  removeProfileImage: () => api.delete<AdminProfile>('/api/admin/profile/image'),

  listProjects: (params: URLSearchParams) =>
    api.get<ListResponse<AdminProject>>(`/api/admin/projects?${params.toString()}`),
  getProject: (id: number) => api.get<AdminProject>(`/api/admin/projects/${id}`),
  createProject: (payload: Record<string, unknown>) =>
    api.post<AdminProject>('/api/admin/projects', payload),
  updateProject: (id: number, payload: Record<string, unknown>) =>
    api.put<AdminProject>(`/api/admin/projects/${id}`, payload),
  deleteProject: (id: number) => api.delete<{ message: string }>(`/api/admin/projects/${id}`),
  reorderProjects: (ids: number[]) =>
    api.put<{ message: string }>('/api/admin/projects/reorder', { ids }),
  uploadProjectImage: (id: number, file: File, altText?: string) => {
    const data = new FormData();
    data.append('image', file);
    if (altText) data.append('altText', altText);
    return api.upload<{ project: AdminProject }>(`/api/admin/projects/${id}/images`, data);
  },
  updateProjectImage: (projectId: number, imageId: number, payload: Record<string, unknown>) =>
    api.put(`/api/admin/projects/${projectId}/images/${imageId}`, payload),
  deleteProjectImage: (projectId: number, imageId: number) =>
    api.delete<{ message: string }>(`/api/admin/projects/${projectId}/images/${imageId}`),
  reorderProjectImages: (projectId: number, ids: number[]) =>
    api.put<{ message: string }>(`/api/admin/projects/${projectId}/images/reorder`, { ids }),

  listSkills: () => api.get<AdminSkill[]>('/api/admin/skills'),
  createSkill: (payload: Record<string, unknown>) => api.post<AdminSkill>('/api/admin/skills', payload),
  updateSkill: (id: number, payload: Record<string, unknown>) =>
    api.put<AdminSkill>(`/api/admin/skills/${id}`, payload),
  deleteSkill: (id: number) => api.delete<{ message: string }>(`/api/admin/skills/${id}`),
  reorderSkills: (ids: number[]) => api.put<{ message: string }>('/api/admin/skills/reorder', { ids }),

  listExperience: () => api.get<AdminExperience[]>('/api/admin/experience'),
  createExperience: (payload: Record<string, unknown>) =>
    api.post<AdminExperience>('/api/admin/experience', payload),
  updateExperience: (id: number, payload: Record<string, unknown>) =>
    api.put<AdminExperience>(`/api/admin/experience/${id}`, payload),
  deleteExperience: (id: number) =>
    api.delete<{ message: string }>(`/api/admin/experience/${id}`),
  reorderExperience: (ids: number[]) =>
    api.put<{ message: string }>('/api/admin/experience/reorder', { ids }),

  listEducation: () => api.get<AdminEducation[]>('/api/admin/education'),
  createEducation: (payload: Record<string, unknown>) =>
    api.post<AdminEducation>('/api/admin/education', payload),
  updateEducation: (id: number, payload: Record<string, unknown>) =>
    api.put<AdminEducation>(`/api/admin/education/${id}`, payload),
  deleteEducation: (id: number) => api.delete<{ message: string }>(`/api/admin/education/${id}`),
  reorderEducation: (ids: number[]) =>
    api.put<{ message: string }>('/api/admin/education/reorder', { ids }),

  listCertifications: () => api.get<AdminCertification[]>('/api/admin/certifications'),
  createCertification: (payload: Record<string, unknown>) =>
    api.post<AdminCertification>('/api/admin/certifications', payload),
  updateCertification: (id: number, payload: Record<string, unknown>) =>
    api.put<AdminCertification>(`/api/admin/certifications/${id}`, payload),
  deleteCertification: (id: number) =>
    api.delete<{ message: string }>(`/api/admin/certifications/${id}`),
  reorderCertifications: (ids: number[]) =>
    api.put<{ message: string }>('/api/admin/certifications/reorder', { ids }),
  uploadCertificate: (id: number, file: File) => {
    const data = new FormData();
    data.append('certificate', file);
    return api.upload<AdminCertification>(`/api/admin/certifications/${id}/certificate`, data);
  },
  removeCertificate: (id: number) =>
    api.delete<AdminCertification>(`/api/admin/certifications/${id}/certificate`),

  getCv: () => api.get<AdminCv | null>('/api/admin/cv'),
  uploadCv: (file: File, title: string, isPublic: boolean) => {
    const data = new FormData();
    data.append('cv', file);
    data.append('title', title);
    data.append('isPublic', String(isPublic));
    return api.upload<AdminCv>('/api/admin/cv', data);
  },
  updateCv: (id: number, title: string, isPublic: boolean) =>
    api.put<AdminCv>(`/api/admin/cv/${id}`, { title, isPublic }),
  deleteCv: (id: number) => api.delete<{ message: string }>(`/api/admin/cv/${id}`),

  listMessages: (params: URLSearchParams) =>
    api.get<
      ListResponse<ContactMessage> & { counts: { unread: number; inbox: number; archived: number } }
    >(`/api/admin/messages?${params.toString()}`),
  getMessage: (id: number) => api.get<ContactMessage>(`/api/admin/messages/${id}`),
  updateMessage: (id: number, payload: { isRead?: boolean; isArchived?: boolean }) =>
    api.patch<ContactMessage>(`/api/admin/messages/${id}`, payload),
  deleteMessage: (id: number) => api.delete<{ message: string }>(`/api/admin/messages/${id}`),

  listSocialLinks: () => api.get<AdminSocialLink[]>('/api/admin/social-links'),
  createSocialLink: (payload: Record<string, unknown>) =>
    api.post<AdminSocialLink>('/api/admin/social-links', payload),
  updateSocialLink: (id: number, payload: Record<string, unknown>) =>
    api.put<AdminSocialLink>(`/api/admin/social-links/${id}`, payload),
  deleteSocialLink: (id: number) =>
    api.delete<{ message: string }>(`/api/admin/social-links/${id}`),
  reorderSocialLinks: (ids: number[]) =>
    api.put<{ message: string }>('/api/admin/social-links/reorder', { ids }),

  getSettings: () => api.get<AdminSettings>('/api/admin/settings'),
  updateSettings: (payload: Record<string, unknown>) =>
    api.put<AdminSettings>('/api/admin/settings', payload),
  sendTestEmail: (recipient?: string) =>
    api.post<{ message: string }>('/api/admin/email/test', recipient ? { recipient } : {}),
};
