import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title: string;
  description?: string;
}

export function SEO({ title, description }: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    document.title = title;

    if (description) {
      let metaDescription = document.querySelector(
        "meta[name='description']"
      ) as HTMLMetaElement | null;
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.name = "description";
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = description;
    }

    let canonical = document.querySelector(
      "link[rel='canonical']"
    ) as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + location.pathname;
  }, [title, description, location.pathname]);

  return null;
}
