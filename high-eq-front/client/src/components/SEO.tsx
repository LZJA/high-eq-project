import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

export default function SEO({
  title = "高情商回复生成助手 - AI智能聊天助手",
  description = "AI 智能生成高情商聊天回复,帮你在各种社交场景下说出得体的话。",
  keywords = "高情商回复,AI聊天助手,智能回复生成,社交聊天,情商助手,聊天技巧"
}: SEOProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
    </Helmet>
  );
}
