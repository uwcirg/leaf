import {getEnvData} from "./envConfig";

// get user Id from config, i.e. see getAuthConfig, getUserTokenAndContext from authAPI
export function getUserIdFromEnv(config) : number | string | null {
    if (!config) return null;
    if (config.user && config.user.name) return config.user.name;
    if (config.profile) return config.profile;
    if (config.fhirUser) return config.fhirUser;
    if (config["preferred_username"]) return config["preferred_username"];
    return null;
}
// get PIWIK siteId from environment variable
export function getMatomoSiteIdFromEnv(envs) : number | null{
    if (!envs) return null;
    if (envs["REACT_APP_MATOMO_SITE_ID"]) return envs["REACT_APP_MATOMO_SITE_ID"];
    if (envs["MATOMO_SITE_ID"]) return envs["MATOMO_SITE_ID"];
    if (envs["REACT_APP_PIWIK_SITE_ID"]) return envs["REACT_APP_PIWIK_SITE_ID"];
    if (envs["PIWIK_SITE_ID"]) return envs["PIWIK_SITE_ID"];
    return envs["SITE_ID"];
}
export async function addMatomoTracking() {
    // already generated script, return
    if (!window || document.querySelector("#matomoScript")) return;
    const envData = await getEnvData();
    const userId = getUserIdFromEnv(envData);
    console.log("PIWIK userId ", userId);
    // no user Id return
    if (!userId) return;
    const siteId = getMatomoSiteIdFromEnv(envData);
    console.log("PIWIK siteId ", siteId)
    // no site Id return
    if (!siteId) return;
    // init global piwik tracking object
    // note this will only be executed if BOTH userId and siteId are present
    window._paq = [];
    window._paq.push(["trackPageView"]);
    window._paq.push(["enableLinkTracking"]);
    window._paq.push(["setSiteId", siteId]);
    window._paq.push(["setUserId", userId]);
  
    let u = "https://piwik.cirg.washington.edu/";
    window._paq.push(["setTrackerUrl", u + "matomo.php"]);
    let d = document,
      g = d.createElement("script"),
      headElement = document.querySelector("head");
    g.type = "text/javascript";
    g.async = true;
    g.defer = true;
    g.setAttribute("src", u + "matomo.js");
    g.setAttribute("id", "matomoScript");
    headElement.appendChild(g);
  }
