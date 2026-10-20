import { api } from './api';
import type { ContactPayload, ContactResponse, HomeData, ProjectDetail, ProjectSummary } from '../types';

export const getHomeData = (signal?: AbortSignal) => api.get<HomeData>('/api/home', signal);

export const getProject = (slug: string, signal?: AbortSignal) =>
  api.get<ProjectDetail>(`/api/projects/${encodeURIComponent(slug)}`, signal);

export const getPublishedProjects = (signal?: AbortSignal) =>
  api.get<{ items: ProjectSummary[] }>('/api/projects?pageSize=100', signal);

export const sendContactMessage = (payload: ContactPayload) =>
  api.post<ContactResponse>('/api/contact', payload);
