import { Mail, MapPin, MessageSquareText, ShieldCheck } from 'lucide-react';
import type { PublicProfile, SocialLink } from '../types';
import { ContactForm } from './ContactForm';
import { SectionHeading } from './SectionHeading';
import { SocialLinks } from './SocialLinks';

export const ContactSection = ({
  profile,
  socialLinks,
}: {
  profile: PublicProfile;
  socialLinks: SocialLink[];
}) => (
  <section id="contact" className="section border-t border-line/60">
    <div className="container-page">
      <SectionHeading
        eyebrow="Contact"
        title="Have a project, role, or idea in mind?"
        description="Use the form to get in touch. Messages are stored securely and delivered to my inbox."
      />

      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <div>
          <p className="text-[1.02rem] leading-8 text-muted">
            I am interested in opportunities where I can contribute to thoughtful software and web
            work, keep learning, and solve problems that matter to real users.
          </p>

          <div className="mt-7 space-y-3">
            {profile.contactEmail && (
              <a
                href={`mailto:${profile.contactEmail}`}
                className="card flex items-center gap-4 p-4 transition hover:border-accent/35"
              >
                <span className="icon-box" aria-hidden="true">
                  <Mail size={18} />
                </span>
                <span>
                  <span className="block font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">
                    Email
                  </span>
                  <span className="mt-0.5 block text-sm font-medium text-ink">
                    {profile.contactEmail}
                  </span>
                </span>
              </a>
            )}
            {profile.location && (
              <div className="card flex items-center gap-4 p-4">
                <span className="icon-box" aria-hidden="true">
                  <MapPin size={18} />
                </span>
                <span>
                  <span className="block font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted">
                    Location
                  </span>
                  <span className="mt-0.5 block text-sm font-medium text-ink">
                    {profile.location}
                  </span>
                </span>
              </div>
            )}
          </div>

          {socialLinks.length > 0 && (
            <div className="mt-7">
              <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">
                Find me online
              </h3>
              <SocialLinks links={socialLinks} className="mt-3" />
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-line bg-surface/60 p-5">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={17} className="text-accent" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-ink">How your message is handled</h3>
            </div>
            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-muted">
              <li className="flex gap-2.5">
                <MessageSquareText size={13} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                The message is validated and saved in the portfolio database.
              </li>
              <li className="flex gap-2.5">
                <Mail size={13} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                An email notification is attempted when SMTP is configured.
              </li>
              <li className="flex gap-2.5">
                <ShieldCheck size={13} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                Spam protection and rate limiting are applied by the server.
              </li>
            </ul>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  </section>
);
