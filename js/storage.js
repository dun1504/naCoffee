const AUTH_KEY = "na_user";
const USERS_KEY = "na_users";

function getUser() {
    try {
        return JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
    }
     catch {
        return null;
     }
}
function setUser(user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}
function clearUser() {
    localStorage.removeItem(AUTH_KEY);
}

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch {
        return [];
    }
}
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// setUser({name:"Alice"})
// getUser() // phải trả về {name:"Alice"}

// saveUsers([{email:"a@gmail.com"}])
// getUsers() // phải trả về [{email:"a@gmail.com"}]