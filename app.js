// ---------------- UI SWITCH ----------------

const signupCard = document.getElementById("signupCard");
const loginCard = document.getElementById("loginCard");

document.getElementById("showLogin").onclick = () => {
    signupCard.classList.add("hidden");
    loginCard.classList.remove("hidden");
};

document.getElementById("showSignup").onclick = () => {
    loginCard.classList.add("hidden");
    signupCard.classList.remove("hidden");
};


// ---------------- SIGNUP ----------------

document.getElementById("signupBtn").onclick = async () => {

    const email = signupEmail.value;
    const password = signupPassword.value;
    const username = signupUsername.value.toLowerCase();
    const displayName = signupDisplayName.value;

    const cred = await auth.createUserWithEmailAndPassword(email, password);
    const uid = cred.user.uid;

    await db.ref("users/" + uid).set({
        email,
        username,
        displayName,
        bio: "",
        pfpURL: ""
    });

    alert("Account created!");
};


// ---------------- LOGIN ----------------

document.getElementById("loginBtn").onclick = async () => {

    const email = loginEmail.value;
    const password = loginPassword.value;

    await auth.signInWithEmailAndPassword(email, password);
};


// ---------------- AUTH STATE ----------------

auth.onAuthStateChanged(user => {
    if (user) loadHome(user.uid);
});


// ---------------- HOME ----------------

async function loadHome(uid) {

    const snap = await db.ref("users/" + uid).once("value");
    const me = snap.val();

    document.body.innerHTML = `
    <div class="app">

        <div class="sidebar">

            <h2>💬 ChatAPP</h2>

            <div class="profile">
                <div class="avatar">
                    ${
                        me.pfpURL
                        ? `<img src="${me.pfpURL}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;">`
                        : me.displayName.charAt(0).toUpperCase()
                    }
                </div>

                <div>
                    <h3>${me.displayName}</h3>
                    <p>@${me.username}</p>
                </div>
            </div>

            <button onclick="openProfile('${uid}')">Profile</button>
            <button onclick="logout()">Logout</button>

            <h3>Chats</h3>
            <div id="chatList"></div>

            <input id="searchInput" placeholder="Search users...">
            <div id="searchResults"></div>

        </div>

        <div class="chat-area">
            <h2>Select a chat</h2>
        </div>

    </div>
    `;

    document.getElementById("searchInput").oninput = searchUsers;

    loadChatList(uid);
}


// ---------------- SEARCH ----------------

async function searchUsers(e) {

    const q = e.target.value.toLowerCase();
    const div = document.getElementById("searchResults");

    if (!q) return div.innerHTML = "";

    const snap = await db.ref("users").once("value");
    const users = snap.val() || {};

    let html = "";

    for (const id in users) {

        const u = users[id];
        if (!u.username) continue;

        if (u.username.includes(q) || u.displayName.toLowerCase().includes(q)) {

            html += `
            <div class="user-result">
                <strong>${u.displayName}</strong>
                <p>@${u.username}</p>
                <button onclick="startChat('${id}')">Message</button>
            </div>
            `;
        }
    }

    div.innerHTML = html;
}


// ---------------- CHAT START ----------------

window.startChat = async function(otherUid) {

    const me = auth.currentUser.uid;

    const chatId =
        me < otherUid ? me + "_" + otherUid : otherUid + "_" + me;

    const ref = db.ref("chats/" + chatId);

    const snap = await ref.once("value");

    if (!snap.exists()) {
        await ref.set({
            participants: {
                [me]: true,
                [otherUid]: true
            }
        });
    }

    openChat(chatId, otherUid);
};


// ---------------- OPEN CHAT ----------------

async function openChat(chatId, otherUid) {

    const snap = await db.ref("users/" + otherUid).once("value");
    const u = snap.val();

    document.querySelector(".chat-area").innerHTML = `
        <div class="chat-container">

           <div class="chat-header">
             <h2>${u.displayName}</h2>

              <p id="statusText">
             ${u.online ? "🟢 Online" : "⚫ Offline"}
               </p> 
             </div>

            <div id="messages" class="chat-box"></div>

            <div class="chat-input">
                <input
                    id="msgInput"
                    placeholder="Type a message..."
                >

                <button onclick="sendMessage('${chatId}')">
                    Send
                </button>
            </div>

        </div>
    `;

    loadMessages(chatId);

    setTimeout(() => {
        document.getElementById("msgInput")?.focus();
    }, 100);

 db.ref("users/" + otherUid)
.on("value", snap => {

    const user = snap.val();

    const status =
        document.getElementById("statusText");

    if (!status) return;

    status.textContent =
        user.online
        ? "🟢 Online"
        : "⚫ Offline";
});

}


// ---------------- MESSAGES ----------------

function loadMessages(chatId) {

    const div = document.getElementById("messages");

    db.ref("chats/" + chatId + "/messages")
        .on("child_added", snap => {

            const m = snap.val();
            const me = auth.currentUser.uid;
            const isMe = m.sender === me;

            const el = document.createElement("div");

            el.style.textAlign = isMe ? "right" : "left";
         
            el.innerHTML = `
                <div style="
             display:inline-block;
             padding:10px 14px;
             margin:1px 0;
              border-radius:16px;
                background:${isMe ? "#10b981" : "#1f2937"};
              color:${isMe ? "black" : "white"};
               max-width:70%;
               word-wrap:break-word;
             ">
                    ${m.text}
                </div>
            `;

            div.appendChild(el);
            div.scrollTop = div.scrollHeight;
        });
}


// ---------------- SEND ----------------

window.sendMessage = async function(chatId) {

    const input = document.getElementById("msgInput");
    const text = input.value.trim();

    if (!text) return;

    await db.ref("chats/" + chatId + "/messages").push({
        sender: auth.currentUser.uid,
        text,
        time: Date.now()
    });

    input.value = "";
};


// ---------------- CHAT LIST ----------------

async function loadChatList(uid) {

    const div = document.getElementById("chatList");

    db.ref("chats").on("value", async (snap) => {

        const chats = snap.val() || {};
        let html = "";

        for (const id in chats) {

            const c = chats[id];

            // Skip chats user isn't part of
            if (!c.participants || !c.participants[uid]) continue;

            const other = Object.keys(c.participants).find(
                x => x !== uid
            );

            if (!other) continue;

            try {

                const userSnap = await db.ref("users/" + other).once("value");
                const u = userSnap.val();

                if (!u) continue;

                let lastMessage = "No messages yet";

                if (c.messages) {

                    const msgs = Object.values(c.messages);

                    if (msgs.length > 0) {
                        const latest = msgs[msgs.length - 1];

                        if (latest && latest.text) {
                            lastMessage = latest.text;
                        }
                    }
                }

                html += `
                <div class="user-result"
                     onclick="startChat('${other}')">

                    <strong>${u.displayName}</strong>

                    <p style="
                        color:#9ca3af;
                        white-space:nowrap;
                        overflow:hidden;
                        text-overflow:ellipsis;
                    ">
                        ${lastMessage}
                    </p>

                </div>
                `;

            } catch (err) {

                console.error(
                    "Chat list error:",
                    err
                );

            }
        }

        div.innerHTML = html;
    });
}


// ---------------- PROFILE PFP ----------------

window.uploadPfp = async function() {

    const file = document.getElementById("pfpInput").files[0];
    const uid = auth.currentUser.uid;

    const ref = storage.ref("pfps/" + uid);

    await ref.put(file);

    const url = await ref.getDownloadURL();

    await db.ref("users/" + uid).update({
        pfpURL: url
    });

    alert("Updated");
};


// ---------------- LOGOUT ----------------

window.logout = () => auth.signOut();

document.addEventListener("keydown", (e) => {

    const input = document.getElementById("msgInput");

    if (
        e.key === "Enter" &&
        input &&
        document.activeElement === input
    ) {
        document.querySelector(".chat-input button")?.click();
    }
});
// ---------------- PROFILE ----------------

window.openProfile = async function(uid) {

    const snap = await db.ref("users/" + uid).once("value");
    const user = snap.val();

    document.querySelector(".chat-area").innerHTML = `
        <div class="profile-page">

            <h2>Profile</h2>

            <div class="profile">

                <div class="avatar">
                    ${
                        user.pfpURL
                        ? `<img src="${user.pfpURL}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;">`
                        : user.displayName.charAt(0).toUpperCase()
                    }
                </div>

                <div>
                    <h3>${user.displayName}</h3>
                    <p>@${user.username}</p>
                </div>

            </div>

            <input
                type="text"
                id="bioInput"
                placeholder="Bio"
                value="${user.bio || ""}"
            >

            <button onclick="saveProfile()">
                Save Bio
            </button>

        </div>
    `;
};
window.saveProfile = async function() {

    const uid = auth.currentUser.uid;

    await db.ref("users/" + uid).update({
        bio: document.getElementById("bioInput").value
    });

    alert("Profile saved!");
};
// ---------------- Online/Offline ----------------
window.addEventListener("beforeunload", () => {

    const user = auth.currentUser;

    if (!user) return;

    db.ref("users/" + user.uid).update({
        online: false
    });

});