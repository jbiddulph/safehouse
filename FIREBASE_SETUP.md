# Firebase Cloud Messaging Setup Guide

## 🔥 **Firebase Console Configuration**

### **1. Get Your Firebase Configuration Values**

Go to your Firebase Console → Project Settings → General → Your apps → Web app

You'll need these values:

```bash
# Firebase Web App Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=safehouse-7631a.firebaseapp.com
FIREBASE_PROJECT_ID=safehouse-7631a
FIREBASE_STORAGE_BUCKET=safehouse-7631a.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id_here
FIREBASE_VAPID_KEY=your_vapid_key_here
```

### **2. Generate Service Account Key**

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Copy the entire JSON content to your `.env` file as `FIREBASE_SERVICE_ACCOUNT_KEY`

### **3. Get VAPID Key for Web Push**

1. Go to Firebase Console → Project Settings → Cloud Messaging
2. Scroll down to "Web configuration"
3. Click "Generate key pair" if you don't have one
4. Copy the key pair and add it to your `.env` file as `FIREBASE_VAPID_KEY`

### **4. Enable Cloud Messaging**

1. Go to Firebase Console → Cloud Messaging
2. Make sure it's enabled for your project
3. Configure web push certificates if needed

## 📱 **Complete .env File Template**

Create a `.env` file in your project root with:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_database_url

# Firebase Configuration
FIREBASE_PROJECT_ID=safehouse-7631a
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=safehouse-7631a.firebaseapp.com
FIREBASE_STORAGE_BUCKET=safehouse-7631a.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_VAPID_KEY=your_vapid_key_here

# Firebase Service Account Key (JSON format)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"safehouse-7631a","private_key_id":"your_private_key_id","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-fbsvc@safehouse-7631a.iam.gserviceaccount.com","client_id":"109447917103600225834","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40safehouse-7631a.iam.gserviceaccount.com"}

# Web Push Certificates (if you have them)
WEB_PUSH_CERTIFICATE=your_web_push_certificate
WEB_PUSH_PRIVATE=your_web_push_private_key

# Email Configuration (Optional)
MAILTRAP_USERNAME=your_mailtrap_username
MAILTRAP_PASSWORD=your_mailtrap_password
```

## 🚀 **Testing FCM Integration**

### **1. Test FCM Token Registration**

Visit your dashboard and check the browser console for:
```
FCM token registered successfully
```

### **2. Test Push Notifications**

1. Create an access request
2. Check if you receive a push notification
3. Verify the notification opens the access requests page

### **3. Test QR Code Generation**

1. Click "QR Code" on any property in the dashboard
2. Verify the QR code displays correctly
3. Test scanning the QR code with your phone

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Firebase not initialized"** → Check your service account key format
2. **"FCM token registration failed"** → Verify your Firebase configuration
3. **"Permission denied"** → Check browser notification permissions
4. **"Invalid VAPID key"** → Verify your VAPID key is correct

### **Debug Steps:**

1. Check browser console for errors
2. Verify all environment variables are set
3. Test Firebase connection in Firebase Console
4. Check network requests in browser dev tools

## 📋 **Next Steps**

1. ✅ Set up Firebase project
2. ✅ Configure service account
3. ✅ Add environment variables
4. ✅ Test FCM integration
5. ✅ Test QR code generation
6. ✅ Test push notifications

Your FCM integration is ready to go! 🎉
