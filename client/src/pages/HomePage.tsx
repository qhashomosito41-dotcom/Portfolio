import { useMemo } from 'react';
import { usePublicData } from '../contexts/PublicDataContext';
import { Seo } from '../components/Seo';
import { Hero } from '../components/Hero';
import { AboutSection } from '../components/AboutSection';
import { SkillsSection } from '../components/SkillsSection';
import { ProjectsSection } from '../components/ProjectsSection';
import { ExperienceSection } from '../components/ExperienceSection';
import { EducationSection } from '../components/EducationSection';
import { CertificationsSection } from '../components/CertificationsSection';
import { ContactSection } from '../components/ContactSection';
import { ErrorState, LoadingState } from '../components/States';

export const HomePage = () => {
  const { data, loading, error, refetch } = usePublicData();

  const jsonLd = useMemo(() => {
    if (!data?.profile) return null;
    const origin = window.location.origin;
    const person: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: data.profile.fullName,
      jobTitle: data.profile.professionalTitle,
      description: data.profile.biography,
      url: origin,
      mainEntityOfPage: origin,
      knowsAbout: [
        ...data.profile.professionalInterests,
        ...data.skills.map((skill) => skill.name),
      ],
      ...(data.profile.profileImageUrl
        ? { image: `${origin}${data.profile.profileImageUrl}` }
        : {}),
      ...(data.profile.location
        ? {
            address: {
              '@type': 'PostalAddress',
              addressCountry: data.profile.location,
            },
          }
        : {}),
      ...(data.socialLinks.length > 0
        ? { sameAs: data.socialLinks.map((link) => link.url) }
        : {}),
      ...(data.education.length > 0
        ? {
            alumniOf: data.education.map((item) => ({
              '@type': 'CollegeOrUniversity',
              name: item.institution,
            })),
          }
        : {}),
    };
    return {
      '@context': 'https://schema.org',
      '@graph': [
        person,
        {
          '@type': 'WebSite',
          name: data.site.title,
          url: origin,
          description: data.site.description,
        },
      ],
    };
  }, [data]);

  if (loading && !data) {
    return (
      <div className="container-page flex min-h-[70vh] items-center justify-center">
        <LoadingState label="Loading portfolio…" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="container-page py-24">
        <ErrorState
          message="The portfolio could not be loaded. Please check that the API and database are running."
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="container-page py-24">
        <ErrorState message="The portfolio profile has not been set up yet. Run the database seed and sign in to the administrator dashboard." />
      </div>
    );
  }

  return (
    <>
      <Seo
        title={data.site.title}
        description={data.site.description || data.profile.heroIntro}
        path="/"
        type="profile"
        image={data.profile.profileImageUrl}
        jsonLd={jsonLd}
      />
      <Hero profile={data.profile} cv={data.cv} />
      <AboutSection profile={data.profile} />
      <SkillsSection skills={data.skills} />
      <ProjectsSection projects={data.projects} />
      <ExperienceSection experience={data.experience} />
      <EducationSection education={data.education} />
      <CertificationsSection certifications={data.certifications} />
      <ContactSection profile={data.profile} socialLinks={data.socialLinks} />
    </>
  );
};
