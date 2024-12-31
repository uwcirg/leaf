import Axios from "axios";
import { getAuthConfig, getUserTokenAndContext } from "../services/authApi";
interface EnvVar {
  key: string;
  value: string | object;
}

export async function fetchEnvData(): Promise<any> {
  return new Promise((resolve) => {
    // fetch data from appsettings.json and env.json
    Promise.allSettled([
      getAuthConfig().then((config) => config), // general config settings
      getAuthConfig().then((config) => getUserTokenAndContext(config)), // user auth specific settings
      Axios.get("/env.json"), // env.json, generated via script to be populated with environment variables
    ])
      .then((results) => {
        let returnResults = {};
        if (results[0].value) {
            returnResults = results[0].value;
        }
        if (results[1].value) {
            returnResults = {
                ...returnResults,
                user: results[1].value
            }
        }
        if (results[2].value && results[2].value.data) {
            returnResults = {
                ...returnResults,
                ...results[2].value.data
            }
        }
        resolve(returnResults);
      })
      .catch((e) => resolve(null));
  });
}
// data coming from appsettings && env.json
export async function getEnvData() {
  const results = await fetchEnvData();
  if (window && results) {
    window["appConfig"] = results;
    console.table("Environment variables:",getEnvs());
  }
  return results;
}
export function getEnv(key: string) {
  //window application global variables
  if (window && window["appConfig"] && window["appConfig"][key])
    return window["appConfig"][key];
  const envDefined = typeof process !== "undefined" && process.env;
  //enviroment variables as defined by Node
  if (envDefined && process.env[key]) return process.env[key];
  return "";
}

export function getEnvs(): EnvVar[] {
  let arrEnvs: EnvVar[] = [];
  const BLACK_LIST = ["SECRET", "KEY", "TOKEN", "CREDENTIALS"];
  if (window && window["appConfig"]) {
    const keys = Object.keys(window["appConfig"]);
    keys.forEach((key) => {
      if (BLACK_LIST.indexOf(key.toUpperCase()) !== -1) return true;
      arrEnvs.push({ key: key, value: window["appConfig"][key] });
    });
  }
  const envDefined = typeof process !== "undefined" && process.env;
  if (envDefined) {
    const envKeys = Object.keys(process.env);
    envKeys.forEach((key) => {
      if (BLACK_LIST.indexOf(key.toUpperCase()) !== -1) return true;
      arrEnvs.push({ key: key, value: process.env[key] });
    });
  }
  console.log("Environment variables ", arrEnvs);
  return arrEnvs;
}
