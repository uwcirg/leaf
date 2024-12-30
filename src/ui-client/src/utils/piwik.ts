import { getEnv } from "./envConfig";

/*
 * decode Jwt token
 */
export function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  return JSON.parse(jsonPayload);
}
/*
 * get access token information stored in sessionStorage
 */
export function getTokenInfoFromStorage() {
  if (typeof window.sessionStorage === "undefined") return null;
  let token;
  var keys = Object.keys(window.sessionStorage);
  keys.forEach(function (key) {
    var obj;
    try {
      obj = JSON.parse(window.sessionStorage.getItem(key));
    } catch (e) {
      obj = null;
    }
    if (obj && obj["tokenResponse"] && obj["tokenResponse"]["access_token"]) {
      token = parseJwt(obj["tokenResponse"]["access_token"]);
    }
  });
  return token;
}
export function getMatomoTrackingSiteId() {
  return getEnv(`REACT_APP_MATOMO_SITE_ID`);
}
export function getUserIdFromAccessToken() {
  const accessToken = getTokenInfoFromStorage();
  if (!accessToken) return null;
  if (accessToken.profile) return accessToken.profile;
  if (accessToken.fhirUser) return accessToken.fhirUser;
  return accessToken["preferred_username"];
}
export function addMatomoTracking() {
  // already generated script, return
  if (document.querySelector("#matomoScript")) return;
  const userId = getUserIdFromAccessToken();
  // no user Id return
  if (!userId) return;
  const siteId = getMatomoTrackingSiteId();
  // no site Id return
  if (!siteId) return;
  // init global piwik tracking object
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
