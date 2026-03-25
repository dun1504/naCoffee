function login(email, password) {
    const users = getUsers();
    const user = users.find( u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if(!user) {
        return { ok: false, error: "Email hoặc mật khẩu không đúng"};
    }
    const { password: _, ...safeUser} = user;
    setUser(safeUser);

    return { ok: true, user: safeUser};
}

function logout() {
    clearUser();
    window.location.href = "index.html";
}
function isLoggedIn() {
    return !!getUser();
}
function isAdmin() {
    return getUser()?.role = "admin";
}