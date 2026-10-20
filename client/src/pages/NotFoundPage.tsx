import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Seo } from '../components/Seo';

export const NotFoundPage = () => (
  <>
    <Seo title="Page not found | Mosito Qhasho" path="/404" noindex />
    <div className="container-page flex min-h-[60vh] items-center justify-center py-20">
      <div className="max-w-lg text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Error 404</p>
        <h1 className="heading-1 mt-4 text-4xl sm:text-5xl">This page does not exist.</h1>
        <p className="body-text mt-4">
          The link may be outdated, or the page may have moved. Return to the portfolio to keep
          exploring.
        </p>
        <Link to="/" className="btn btn-primary mt-7">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to the portfolio
        </Link>
      </div>
    </div>
  </>
);
