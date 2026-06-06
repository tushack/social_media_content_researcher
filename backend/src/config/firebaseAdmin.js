const admin = require("firebase-admin");
const serviceAccount = require("../../social-content-researcher-firebase-adminsdk-fbsvc-a77a1c0ecc.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;