import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: "website" | "article";
  imageUrl?: string;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

export default function SEO({
  title = "高情商回复生成助手 - AI智能聊天助手",
  description = "AI 智能生成高情商聊天回复,帮你在各种社交场景下说出得体的话。",
  keywords = "higheq,HighEQ,高情商回复,AI聊天助手,智能回复生成,社交聊天,情商助手,聊天技巧",
  canonicalUrl = "https://www.higheq.top/",
  ogType = "website",
  imageUrl,
  structuredData,
}: SEOProps) {
  const jsonLd = Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index,follow" />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="HighEQ" />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      <meta name="twitter:card" content={imageUrl ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      {jsonLd.map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}
