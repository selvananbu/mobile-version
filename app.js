const express = require("express");
const { Storage } = require("@google-cloud/storage");
const path = require("path");

const app = express();
const port = 3000;

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = "rn-mobile-version";
const versionFile = "version.json";

// API to check the version
app.get("/api/version-check", async (req, res) => {
    try {
        const file = await storage.bucket(bucketName).file(versionFile).download();
        const versionData = JSON.parse(file.toString());

        const currentVersion = "1.0.0"; // Replace with the current app version
        const isUpdateAvailable = versionData.version !== currentVersion;

        res.json({
            isUpdateAvailable,
            bundleUrl: isUpdateAvailable ? versionData.bundleUrl : null,
        });
    } catch (error) {
        console.error("Error checking version:", error);
        res.status(500).send("Error checking version");
    }
});

// API to serve the bundle
app.get("/api/download-bundle", async (req, res) => {
    try {
        const fileName = "index.bundle.js"; // Replace with the actual file name
        const file = storage.bucket(bucketName).file(fileName);

        res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
        file.createReadStream().pipe(res);
    } catch (error) {
        console.error("Error serving bundle:", error);
        res.status(500).send("Error serving bundle");
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
