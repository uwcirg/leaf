import { getEnv } from "./envConfig";
export function getSiteId() {
  return getEnv("REACT_APP_SITE_ID");
}
export function getLogoPath() {
  const siteId = getSiteId();
  if (siteId)
    return (
      process.env.PUBLIC_URL + `/images/logos/apps/${siteId.toUpperCase()}`
    );
  return "";
}
