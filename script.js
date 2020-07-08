const auth = firebase.auth();
let loginView = document.querySelector("#loginView");
const loginForm = document.querySelector("#login-form");
const loginFields = document.querySelectorAll(".loginFields")
const logIn = document.querySelector("#logIn");
let signUp = document.querySelector("#signUp");
let loginMessage = document.querySelector("#loginMessage");

const logOut = document.querySelector("#logOut");
let idDisplay = document.querySelector("#idDisplay");
const sendForm = document.querySelector("#send");
const messageContainer = document.querySelector("#messageContainer");

const navList = document.querySelector("#navList")
const hamburger = document.querySelector("#hamburger");
hamburger.addEventListener("click", e => {
    navList.classList.toggle("hideMobileMenu");
})

let roomId = "";

if (window.location.search) {
    loginForm.roomId.value = window.location.search.slice(6);
}

if (auth.currentUser) {
    loginView.classList.remove("hidden");
}

sendForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (sendForm.content.value != "") {
        let date = "Upplagt " + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
        db.collection(`${roomId}`).add({
            date: date,
            sender: auth.currentUser.email,
            content: sendForm.content.value,
        })

        sendForm.reset();
    }

})

openEmojis = document.querySelector("#openEmojis");
emojiWindow = document.querySelector("#emojiWindow");

openEmojis.addEventListener("click", e => {
    emojiWindow.classList.toggle("hidden");
})

emojiButtons = document.querySelectorAll(".emojiButton");
emojiButtons.forEach(button => {
    button.addEventListener("click", e => {
        sendForm.content.value += e.target.textContent;
    })
})

firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {


        if (window.location.search && window.location.search.slice(6) == loginForm.roomId.value) {
            roomId = window.location.search.slice(6);
        } else if (loginForm.roomId.value !== "") {
            roomId = loginForm.roomId.value;
            redirectToRoom(roomId)
        } else {
            redirectToRoom("global")
        }
        idDisplay.textContent = roomId;
        logIn.classList.add("hidden");
        logOut.classList.remove("hidden");
        loginFields.forEach(loginField => loginField.classList.add("hidden"));
        db.collection(`${roomId}`).orderBy('date').onSnapshot(snapshot => {
            let changes = snapshot.docChanges();
            changes.forEach(change => {
                if (change.type == 'added') {
                    renderItem(change.doc);
                } else if (change.type == 'removed') {
                    let div = messageContainer.querySelector('[data-id=' + "X" + change.doc.id + ']'); //X is added to Id because querySelector can't handle datasets beginning with numbers
                    messageContainer.removeChild(div);
                }
            });
        });
        loginView.classList.add("hidden");
    } else {
        logIn.classList.remove("hidden");
        logOut.classList.add("hidden");
        loginFields.forEach(loginField => loginField.classList.remove("hidden"));
        messageContainer.innerHTML = "";
        loginView.classList.remove("hidden");
    }
})

const redirectToRoom = (roomId) => {
    if (window.location.hostname == "127.0.0.1") {
        window.location.href = `http://127.0.0.1:5500/?room=${roomId}`;
    } else {
        window.location.href = `http://mchat.surge.sh/?room=${roomId}`;
    }
}

let oldDate = "";
let oldSender = "";

let renderItem = doc => {
    let div = document.createElement("div");
    let date = document.createElement("p");
    let sender = document.createElement("p");
    let content = document.createElement("p");
    let xButton = document.createElement("button");
    div.setAttribute('data-id', "X" + doc.id)
    date.textContent = doc.data().date;
    date.textContent = date.textContent.slice(13, 24);
    sender.textContent = doc.data().sender;
    content.textContent = doc.data().content;
    xButton.innerHTML = '<i class="fas fa-trash"></i>';
    date.className = "date"
    sender.className = "sender"
    if (date.textContent != oldDate) {
        messageContainer.appendChild(date);
        oldDate = date.textContent;
    }
    if (doc.data().sender == auth.currentUser.email) {
        div.className = "messageWrapper you";
        oldSender = sender.textContent;
    } else {
        div.className = "messageWrapper other";
        if (sender.textContent != oldSender) {
            messageContainer.appendChild(sender)
            oldSender = sender.textContent;
        }
    }
    div.appendChild(content);
    /*     div.appendChild(xButton); */
    messageContainer.appendChild(div);
    messageContainer.scrollTop = messageContainer.scrollHeight;
    xButton.addEventListener('click', (e) => {
        let id = e.target.parentElement.getAttribute('data-id');
        db.collection(`${roomId}`).doc(id.substr(1)).delete(); //substr(1) is added to remove X because querySelector can't handle datasets beginning with numbers
    })
};

logIn.addEventListener("click", e => {
    e.preventDefault();
    roomId = loginForm.roomId.value;
    const email = loginForm.loginEmail.value;
    const pass = loginForm.loginPassword.value;
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(e => {
        console.log(e.message);
        loginMessage.textContent = e.message;
    });

});

signUp.addEventListener("click", e => {
    e.preventDefault();
    roomId = loginForm.roomId.value;
    const email = loginForm.loginEmail.value;
    const pass = loginForm.loginPassword.value;
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(e => console.log(e.message));
});

logOut.addEventListener("click", e => {
    e.preventDefault();
    auth.signOut();
});

const changeRoomInput = document.querySelector("#changeRoomInput");
const changeRoomButton = document.querySelector("#changeRoomButton");

changeRoomButton.addEventListener("click", e => {
    if (changeRoomInput.value != "") {
        if (window.location.hostname == "127.0.0.1") {
            window.location.href = `http://127.0.0.1:5500/?room=${changeRoomInput.value}`;
        } else {
            window.location.href = `http://mchat.surge.sh/?room=${changeRoomInput.value}`;
        }
    }
});