// // src/scripts/generateRoutes.js
// const fs = require("fs");
// const path = require("path");

// const APP_DIR = path.join(__dirname, "../app");
// const OUTPUT_FILE = path.join(APP_DIR, "routes.generated.js");

// // Folders to skip
// const SKIP_FOLDERS = ["components", "providers", "common", "api"];

// /**
//  * Check if folder contains a page file
//  */
// function hasPageFile(dir) {
//   if (!fs.existsSync(dir)) return false;
//   const files = fs.readdirSync(dir);
//   return files.some(
//     (f) =>
//       f.toLowerCase().startsWith("page.") &&
//       (f.endsWith(".tsx") || f.endsWith(".jsx"))
//   );
// }

// /**
//  * Recursively generate routes
//  */
// function generateRoutes(dir, parentPath = "") {
//   if (!fs.existsSync(dir)) return {};

//   const items = fs.readdirSync(dir, { withFileTypes: true });
//   const routes = {};

//   for (const item of items) {
//     if (item.isDirectory() && !SKIP_FOLDERS.includes(item.name.toLowerCase())) {
//       const folderName = item.name;
//       const folderPath = path.join(dir, folderName);
//       const routePath = `${parentPath}/${folderName}`.replace(/\\/g, "/");

//       const nestedRoutes = generateRoutes(folderPath, routePath);

//       const routeObj = {};

//       // index route if page exists
//       if (hasPageFile(folderPath)) {
//         routeObj.index = routePath;
//       }

//       // check for Add folder
//       const addFolder = path.join(folderPath, "Add");
//       if (hasPageFile(addFolder)) {
//         routeObj.add = `${routePath}/Add`;
//       }

//       // check for [id] folder (dynamic)
//       const idFolder = path.join(folderPath, "[id]");
//       if (hasPageFile(idFolder)) {
//         routeObj.edit = `${routePath}/Edit/:id`;
//         routeObj.detail = `${routePath}/Detail/:id`;
//       }

//       // merge nested routes
//       Object.assign(routeObj, nestedRoutes);

//       if (Object.keys(routeObj).length > 0) {
//         routes[folderName] = routeObj;
//       }
//     }
//   }

//   return routes;
// }

// const routes = generateRoutes(APP_DIR);

// fs.writeFileSync(
//   OUTPUT_FILE,
//   "export const routes = " + JSON.stringify(routes, null, 2) + ";\n"
// );

// console.log("✅ routes.generated.js created successfully!");
// src/scripts/generateRoutes.js// src/scripts/generateRoutes.js
const fs = require("fs");
const path = require("path");

const APP_DIR = path.join(__dirname, "../app");
const OUTPUT_FILE = path.join(APP_DIR, "routes.generated.js");

// Layout folders to ignore in URLs
const LAYOUT_FOLDERS = ["(guest)", "(protected)", "(public)"];
// Folders to skip entirely (utilities)
const SKIP_FOLDERS = ["components", "providers", "common", "api"];

/**
 * Check if folder contains a page file
 */
function hasPageFile(dir) {
  if (!fs.existsSync(dir)) return false;
  const files = fs.readdirSync(dir);
  return files.some(
    (f) =>
      f.toLowerCase().startsWith("page.") &&
      (f.endsWith(".tsx") || f.endsWith(".jsx"))
  );
}

/**
 * Recursively generate routes
 * @param {string} dir
 * @param {string} parentUrl
 */
function generateRoutes(dir, parentUrl = "") {
  if (!fs.existsSync(dir)) return {};

  const items = fs.readdirSync(dir, { withFileTypes: true });
  const routes = {};

  for (const item of items) {
    if (item.isDirectory() && !SKIP_FOLDERS.includes(item.name.toLowerCase())) {
      const folderName = item.name;
      const folderPath = path.join(dir, folderName);

      // Determine the URL segment: skip layout folders
      const segment = LAYOUT_FOLDERS.includes(folderName.toLowerCase())
        ? ""
        : folderName;
      const routePath = segment ? `${parentUrl}/${segment}` : parentUrl;

      // Recursively process children
      const nestedRoutes = generateRoutes(folderPath, routePath);

      const routeObj = {};

      // index route if page exists
      if (hasPageFile(folderPath)) {
        routeObj.index = routePath || `/${folderName}`;
      }

      // check for Add folder
      const addFolder = path.join(folderPath, "Add");
      if (hasPageFile(addFolder)) {
        routeObj.add = `${routePath}/Add`;
      }

      // check for [id] folder (dynamic)
      const idFolder = path.join(folderPath, "[id]");
      if (hasPageFile(idFolder)) {
        routeObj.edit = `${routePath}/Edit/:id`;
        routeObj.detail = `${routePath}/Detail/:id`;
      }

      // merge nested routes
      Object.assign(routeObj, nestedRoutes);

      if (Object.keys(routeObj).length > 0) {
        routes[folderName] = routeObj;
      }
    }
  }

  return routes;
}

const routes = generateRoutes(APP_DIR);

fs.writeFileSync(
  OUTPUT_FILE,
  "export const routes = " + JSON.stringify(routes, null, 2) + ";\n"
);

console.log("✅ routes.generated.js created successfully!");
