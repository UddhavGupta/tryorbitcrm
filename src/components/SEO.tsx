import { Helmet } from "react-helmet-async";

const BASE_URL = "https://orbitcrm.guptau.com";
const DEFAULT_OG = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b0d03382-9b24-4472-b006-01e67c257db9/id-preview-28f9ed57--df1adbbe-2ae6-4c6d-be9f-e4a2b44cbfa3.lovable.app-1778011536775.png";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: object;
}

export const SEO = ({ title, description, path, ogImage = DEFAULT_OG, noindex, jsonLd }: SEOProps) => {
  const url = `${BASE_URL}${path}`;
  const fullTitle = title.includes("OrbitCRM") ? title : `${title} — OrbitCRM`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};
