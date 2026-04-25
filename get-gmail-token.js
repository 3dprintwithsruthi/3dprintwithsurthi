/**
 * Gmail OAuth2 Token Generator - Uses OAuth Playground (already registered redirect URI)
 * 
 * INSTRUCTIONS:
 * 1. Run: node get-gmail-token.js
 * 2. Open the URL shown in the terminal in your browser
 * 3. Sign in with 3dprintwithsruthi@gmail.com and click Allow
 * 4. You'll be redirected to OAuth Playground. Copy the "code" from the URL bar.
 * 5. Paste the code when prompted in the terminal
 * 6. Get your new refresh token!
 */

const { google } = require("googleapis");
const readline = require("readline");

const CLIENT_ID = "587861387451-md6jr7ak8s1m51okncistgrncja8ad5j.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
// This redirect URI is already registered in your Google Cloud Console
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/gmail.send"],
  prompt: "consent", // Forces a new refresh token every time
  redirect_uri: REDIRECT_URI,
});

console.log("\n============================================================");
console.log("  Gmail Refresh Token Generator");
console.log("============================================================");
console.log("\nStep 1: Open this URL in your browser:\n");
console.log(authUrl);
console.log("\nStep 2: Sign in as 3dprintwithsruthi@gmail.com");
console.log("Step 3: Click 'Allow'");
console.log("Step 4: You will land on developers.google.com/oauthplayground");
console.log("        Look at your BROWSER ADDRESS BAR — it will look like:");
console.log("        https://developers.google.com/oauthplayground?code=4/0AXXX...");
console.log("Step 5: Copy ONLY the code value (after 'code=' and before '&')");
console.log("\n------------------------------------------------------------");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question("Paste the authorization code here: ", async (code) => {
  rl.close();
  
  // Trim whitespace and handle URL-encoded ampersands
  const cleanCode = code.trim().split("&")[0].split("%26")[0];
  
  console.log("\nExchanging code for tokens...");
  
  try {
    const { tokens } = await oauth2Client.getToken({
      code: cleanCode,
      redirect_uri: REDIRECT_URI,
    });
    
    if (!tokens.refresh_token) {
      console.error("\n❌ No refresh_token returned. This happens when the account was already authorized.");
      console.error("Solution: Go to https://myaccount.google.com/permissions");
      console.error("Find '3D Print with Sruthi' or your app name, click Remove Access, then run this script again.");
      return;
    }
    
    console.log("\n============================================================");
    console.log("  ✅ SUCCESS — Your New Refresh Token");
    console.log("============================================================");
    console.log("\nAdd this to your .env file (replace the old GOOGLE_REFRESH_TOKEN line):\n");
    console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
    console.log("\nAlso update this in Vercel: Settings → Environment Variables");
    console.log("============================================================\n");
    
    // Verify by sending a test email
    console.log("Testing the new token by sending a test email...");
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    
    const rawEmail = [
      `From: 3D Print with Sruthi <3dprintwithsruthi@gmail.com>`,
      `To: 3dprintwithsruthi@gmail.com`,
      `Subject: ✅ Email System Working!`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      `<h2>🎉 Gmail is Connected!</h2><p>Your order status emails are now fully operational. Customers will receive emails when you change their order status.</p>`,
    ].join("\r\n");
    
    const encoded = Buffer.from(rawEmail, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    
    await gmail.users.messages.send({ userId: "me", requestBody: { raw: encoded } });
    console.log("✅ Test email sent to 3dprintwithsruthi@gmail.com — check your inbox!");
    
  } catch (err) {
    console.error("\n❌ Error:", err.message);
    if (err.message.includes("invalid_grant")) {
      console.error("The code may have expired (codes expire in 60 seconds). Run the script again and paste the code faster.");
    }
  }
});
