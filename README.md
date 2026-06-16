
# 💬 ChatApp

A real-time chat web application built with **Firebase Authentication, Realtime Database, and Storage**.
Users can sign up, create profiles, upload profile pictures, search users, and chat instantly.

---

## 🚀 Live Demo

```
https://cha1app.netlify.app/
```

---

## ✨ Features

* 🔐 Email/password authentication
* 👤 Unique username system
* 🧑 Profile with display name + bio
* 💬 Real-time one-to-one chat
* 🔎 User search system
* 📱 Responsive modern UI
* ⚡ Instant message updates
* 🟢 Online status
* 📱 Mobile Responsive Layout
---

## 🛠️ Tech Stack

* HTML, CSS, JavaScript
* Firebase Authentication
* Firebase Realtime Database
* Firebase Storage
* Netlify (Hosting)

---

## 📁 Project Structure

```
ChatApp/
│
├── index.html
├── style.css
├── app.js
├── auth.js
├── firebase.js
```

---

## ⚙️ Setup Instructions

### Add Firebase config

Create `firebase.js`:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "YOUR_DB_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();
```

---

### 3. Run locally

Just open `index.html` in browser or use Live Server.

---

### 4. Deploy

Recommended:

* Netlify (drag & drop)
* Firebase Hosting

---

## 🔥 Future Improvements

* Read receipts
* Typing indicator
* Group chats
* Message reactions
* Profile picture upload 


---

## 👨‍💻 Author

Built by **Harshit**
Project: Learning + practice in full-stack frontend apps

---
