// const fs = require("fs");
// const path = require("path");

// const APP_DIR = path.join(__dirname, "../app");
// const OUTPUT_FILE = path.join(APP_DIR, "routes.generated.js");

// const LAYOUT_FOLDERS = ["(guest)", "(protected)", "(public)"];
// const SKIP_FOLDERS = ["components", "providers", "common", "api"];
// const PAGE_FOLDERS = ["add", "edit", "detail"];

// function hasPageFile(dir) {
//   if (!fs.existsSync(dir)) return false;
//   const files = fs.readdirSync(dir);
//   return files.some(
//     (f) =>
//       f.toLowerCase().startsWith("page.") &&
//       (f.toLowerCase().endsWith(".tsx") || f.toLowerCase().endsWith(".jsx"))
//   );
// }

// function childDirs(dir) {
//   if (!fs.existsSync(dir)) return [];
//   return fs
//     .readdirSync(dir, { withFileTypes: true })
//     .filter((d) => d.isDirectory());
// }

// function generateRoutes(dir, parentUrl = "") {
//   if (!fs.existsSync(dir)) return {};

//   const items = fs.readdirSync(dir, { withFileTypes: true });
//   const routes = {};

//   for (const item of items) {
//     const name = item.name;
//     const nameLower = name.toLowerCase();

//     if (
//       !item.isDirectory() ||
//       SKIP_FOLDERS.includes(nameLower) ||
//       /^\[.*\]$/.test(name)
//     ) {
//       continue;
//     }

//     const folderPath = path.join(dir, name);
//     const segment = LAYOUT_FOLDERS.includes(nameLower) ? "" : name;
//     const routePath = segment
//       ? `${parentUrl}/${segment}`.replace(/\\/g, "/").toLowerCase()
//       : parentUrl;

//     const routeObj = {};

//     // index route if folder has page.tsx
//     if (hasPageFile(folderPath)) {
//       routeObj.index = routePath || `/${name}`;
//     }

//     // handle add/edit/detail folders
//     const children = childDirs(folderPath);
//     for (const pf of PAGE_FOLDERS) {
//       const match = children.find(
//         (c) => c.name.toLowerCase() === pf.toLowerCase()
//       );
//       if (match) {
//         const subDir = path.join(folderPath, match.name);

//         // case 1: subfolder has page directly
//         if (hasPageFile(subDir)) {
//           routeObj[pf] = { index: `${routePath}/${match.name.toLowerCase()}` };
//         } else {
//           // case 2: subfolder contains only dynamic folder(s)
//           const subChildren = childDirs(subDir).filter((d) =>
//             /^\[.*\]$/.test(d.name)
//           );
//           if (subChildren.length > 0) {
//             // we ignore [id] in path
//             routeObj[pf] = {
//               index: `${routePath}/${match.name.toLowerCase()}`,
//             };
//           }
//         }
//       }
//     }

//     // recursively generate nested routes
//     const nestedRoutes = generateRoutes(folderPath, routePath);
//     Object.assign(routeObj, nestedRoutes);

//     if (Object.keys(routeObj).length > 0) {
//       routes[name] = routeObj;
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

// src/scripts/generateRoutes.js
const req = module.require.bind(module);
const fs = req("fs");
const path = req("path");

const APP_DIR = path.join(__dirname, "../app");
const OUTPUT_FILE = path.join(APP_DIR, "routes.generated.js");

// Layout folders to ignore in URLs
const LAYOUT_FOLDERS = ["(guest)", "(protected)", "(public)"];
// Folders to skip entirely
const SKIP_FOLDERS = ["components", "providers", "common", "api"];
// Subfolders to handle manually
const PAGE_FOLDERS = ["add", "edit", "detail"];

/**
 * Check if a folder contains a page file (page.tsx / page.jsx)
 */
function hasPageFile(dir) {
  if (!fs.existsSync(dir)) return false;
  const files = fs.readdirSync(dir);
  return files.some(
    (f) =>
      f.toLowerCase().startsWith("page.") &&
      (f.toLowerCase().endsWith(".tsx") || f.toLowerCase().endsWith(".jsx")),
  );
}

/**
 * Get all child directories
 */
function childDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory());
}

/**
 * Recursively generate routes
 */
function generateRoutes(dir, parentUrl = "") {
  if (!fs.existsSync(dir)) return {};

  const items = fs.readdirSync(dir, { withFileTypes: true });
  const routes = {};

  for (const item of items) {
    const name = item.name;
    const nameLower = name.toLowerCase();

    // Skip non-directories, skipped folders, or top-level dynamic folders like [id]
    if (
      !item.isDirectory() ||
      SKIP_FOLDERS.includes(nameLower) ||
      /^\[.*\]$/.test(name)
    ) {
      continue;
    }

    const folderPath = path.join(dir, name);
    const segment = LAYOUT_FOLDERS.includes(nameLower) ? "" : name;
    const routePath = segment
      ? `${parentUrl}/${segment}`.replace(/\\/g, "/").toLowerCase()
      : parentUrl;

    const routeObj = {};

    // index route if folder has page.tsx
    if (hasPageFile(folderPath)) {
      routeObj.index = routePath || `/${name}`;
    }

    // handle add/edit/detail subfolders
    const children = childDirs(folderPath);
    for (const pf of PAGE_FOLDERS) {
      const match = children.find(
        (c) => c.name.toLowerCase() === pf.toLowerCase(),
      );
      if (match) {
        const subDir = path.join(folderPath, match.name);

        // case 1: subfolder has page directly
        if (hasPageFile(subDir)) {
          routeObj[pf] = { index: `${routePath}/${match.name.toLowerCase()}` };
        } else {
          // case 2: subfolder contains dynamic folder(s) like [id]
          const subChildren = childDirs(subDir).filter((d) =>
            /^\[.*\]$/.test(d.name),
          );
          if (subChildren.length > 0) {
            // ignore [id] in path, just add trailing slash
            routeObj[pf] = {
              index: `${routePath}/${match.name.toLowerCase()}/`,
            };
          }
        }
      }
    }

    // append trailing slash if folder contains dynamic children (like [id])
    const hasDynamicChild = children.some((d) => /^\[.*\]$/.test(d.name));
    if (hasDynamicChild && routeObj.index && !routeObj.index.endsWith("/")) {
      routeObj.index = routeObj.index + "/";
    }

    // recursively generate nested routes
    const nestedRoutes = generateRoutes(folderPath, routePath);
    Object.assign(routeObj, nestedRoutes);

    if (Object.keys(routeObj).length > 0) {
      routes[name] = routeObj;
    }
  }

  return routes;
}

const routes = generateRoutes(APP_DIR);

// write to file
fs.writeFileSync(
  OUTPUT_FILE,
  "export const routes = " + JSON.stringify(routes, null, 2) + ";\n",
);

console.log("✅ routes.generated.js created successfully!");
