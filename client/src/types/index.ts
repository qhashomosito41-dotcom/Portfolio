export interface PublicProfile {
  fullName: string;
  professionalTitle: string;
  headline: string;
  heroIntro: string;
  heroTechSummary: string[];
  biography: string;
  academicBackground: string | null;
  approach: string | null;
  careerObjectives: string | null;
  professionalInterests: string[];
  location: string | null;
  contactEmail: string | null;
  profileImageUrl: string | null;
  avatarInitials: string;
  websiteTitle: string;
  websiteDescription: string;
}

export interface SiteInfo {
  title: string;
  description: string;
  footerTagline: string;
  siteUrl: string;
}

export interface ProjectImage {
  id: number;
  url: string | null;
  altText: string | null;
  sortOrder: number;
}

export interface ProjectSummary {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  category: string;
  projectStatus: string;
  technologies: string[];
  repositoryUrl: string | null;
  liveUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  featured: boolean;
  coverImage: ProjectImage | null;
  updatedAt: string;
}

export interface ProjectDetail extends ProjectSummary {
  fullDescription: string;
  contribution: string | null;
  keyFeatures: string[];
  challenges: string | null;
  solutions: string | null;
  images: ProjectImage[];
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  description: string | null;
  proficiencyLabel: string | null;
  context: string | null;
}

export interface Experience {
  id: number;
  organization: string;
  position: string;
  type: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  evidenceUrl: string | null;
}

export interface Education {
  id: number;
  institution: string;
  qualification: string;
  fieldOfStudy: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  modules: string[];
  achievements: string[];
}

export interface Certification {
  id: number;
  title: string;
  provider: string;
  completionDate: string | null;
  description: string | null;
  credentialId: string | null;
  verificationUrl: string | null;
  certificateUrl: string | null;
}

export interface SocialLink {
  id: number;
  platform: string;
  label: string;
  url: string;
  icon: string | null;
}

export interface CvInfo {
  id: number;
  title: string;
  fileSize: number;
  uploadedAt: string;
  downloadUrl: string;
}

export interface HomeData {
  profile: PublicProfile | null;
  skills: Skill[];
  projects: ProjectSummary[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  socialLinks: SocialLink[];
  cv: CvInfo | null;
  site: SiteInfo;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthSession {
  authenticated: boolean;
  admin?: AdminUser;
  csrfToken?: string;
  expiresAt?: string;
}

export interface AdminProfile extends Omit<PublicProfile, 'profileImageUrl'> {
  id: number;
  profileImagePath: string | null;
  profileImageUrl: string | null;
  createdAt?: string;
  updatedAt: string;
}

export interface AdminProject extends Omit<ProjectDetail, 'coverImage' | 'images'> {
  published: boolean;
  sortOrder: number;
  images: (ProjectImage & { filePath?: string })[];
  coverImage: ProjectImage | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSkill extends Skill {
  sortOrder: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminExperience extends Omit<Experience, 'startDate' | 'endDate'> {
  startDate: string;
  endDate: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminEducation extends Omit<Education, 'startDate' | 'endDate'> {
  startDate: string | null;
  endDate: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCertification extends Certification {
  certificatePath: string | null;
  certificateUrl: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSocialLink extends SocialLink {
  visible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCv {
  id: number;
  title: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  isActive: boolean;
  isPublic: boolean;
  uploadedAt: string;
  previewUrl: string;
  downloadUrl: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  reason: string | null;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface DashboardData {
  stats: {
    totalProjects: number;
    publishedProjects: number;
    draftProjects: number;
    totalSkills: number;
    totalExperience: number;
    totalEducation: number;
    totalCertifications: number;
    unreadMessages: number;
    totalMessages: number;
  };
  cv: AdminCv | null;
  recentMessages: ContactMessage[];
  recentProjects: AdminProject[];
}

export interface AdminSettings {
  websiteTitle: string;
  websiteDescription: string;
  footerTagline: string;
  contactNotificationEmail: string;
  siteUrl: string;
  smtpConfigured: boolean;
  effectiveNotificationRecipient: string | null;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  reason?: string;
  website?: string;
}

export interface ContactResponse {
  received: boolean;
  message: string;
  emailNotified: boolean;
}
