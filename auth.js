console.log("auth.js loaded");

// SWITCH UI
document.getElementById("showLogin").onclick = () => {
    signupCard.classList.add("hidden");
    loginCard.classList.remove("hidden");
};

document.getElementById("showSignup").onclick = () => {
    loginCard.classList.add("hidden");
    signupCard.classList.remove("hidden");
};

// SIGNUP
document.getElementById("signupBtn").onclick = async () => {

    const email = signupEmail.value.trim();
    const password = signupPassword.value.trim();
    const username = signupUsername.value.trim().toLowerCase();
    const displayName = signupDisplayName.value.trim();

    if (!email || !password || !username || !displayName) {
        alert("Fill all fields");
        return;
    }

    try {

        const check = await db.ref("usernames/" + username).once("value");

        if (check.exists()) {
            alert("Username taken");
            return;
        }

        const cred = await auth.createUserWithEmailAndPassword(email, password);
        const uid = cred.user.uid;

        await db.ref("users/" + uid).set({
            email,
            username,
            displayName,
            createdAt: Date.now(),
            pfpURL: ""
        });

        await db.ref("usernames/" + username).set(uid);

        alert("Account created!");

    } catch (err) {
        alert(err.message);
    }
};

// LOGIN
document.getElementById("loginBtn").onclick = async () => {

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
        alert(err.message);
    }
};

// AUTH STATE
auth.onAuthStateChanged(user => {
    if (user) loadHomePage(user.uid);
});

// LOGOUT
function logout() {
    auth.signOut();
    location.reload();
}