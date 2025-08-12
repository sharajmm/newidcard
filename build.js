const fs = require("fs");
const path = require("path");
require("dotenv").config();

console.log("Building project with environment variables...");

// Create build directory
const buildDir = "build";
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

// Function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip certain files/directories
    if (
      [
        ".env",
        "build",
        ".git",
        "node_modules",
        "build.js",
        "build.ps1",
      ].includes(entry.name)
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy all files to build directory
copyDir(".", buildDir);

// Update firebase config with environment variables
const configPath = path.join(buildDir, "firebase-config-env.js");
if (fs.existsSync(configPath)) {
  let content = fs.readFileSync(configPath, "utf8");

  // Replace placeholders with environment variables
  content = content.replace(
    /\{\{VITE_FIREBASE_API_KEY\}\}/g,
    process.env.VITE_FIREBASE_API_KEY || ""
  );
  content = content.replace(
    /\{\{VITE_FIREBASE_AUTH_DOMAIN\}\}/g,
    process.env.VITE_FIREBASE_AUTH_DOMAIN || ""
  );
  content = content.replace(
    /\{\{VITE_FIREBASE_PROJECT_ID\}\}/g,
    process.env.VITE_FIREBASE_PROJECT_ID || ""
  );
  content = content.replace(
    /\{\{VITE_FIREBASE_STORAGE_BUCKET\}\}/g,
    process.env.VITE_FIREBASE_STORAGE_BUCKET || ""
  );
  content = content.replace(
    /\{\{VITE_FIREBASE_MESSAGING_SENDER_ID\}\}/g,
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || ""
  );
  content = content.replace(
    /\{\{VITE_FIREBASE_APP_ID\}\}/g,
    process.env.VITE_FIREBASE_APP_ID || ""
  );
  content = content.replace(
    /\{\{VITE_FIREBASE_MEASUREMENT_ID\}\}/g,
    process.env.VITE_FIREBASE_MEASUREMENT_ID || ""
  );

  fs.writeFileSync(configPath, content);
}

// Update HTML to use the new config file
const htmlPath = path.join(buildDir, "index.html");
if (fs.existsSync(htmlPath)) {
  let htmlContent = fs.readFileSync(htmlPath, "utf8");
  htmlContent = htmlContent.replace(
    /src="firebase-config\.js"/g,
    'src="firebase-config-env.js"'
  );
  fs.writeFileSync(htmlPath, htmlContent);
}

console.log("Build completed successfully in build/ directory");
console.log("You can now deploy the build/ directory to your hosting platform");
