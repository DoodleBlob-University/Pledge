export function setup() {
    // todo check cookie to see if already logged in
    
    // wait for form submission, then run login()
    document.querySelector('form').addEventListener('submit', async event => await login(event))
}

async function login() {
    event.preventDefault(); // stops standard html form submission
    document.getElementById('error').style.display = "none"; // hide error message box
    try{
        const loginform = document.getElementById("login");
        var data = Object.fromEntries(new FormData(loginform).entries());
        
        // todo create token
        
        // todo make cookie upon success
        
        
    } catch (error) {
        var errorBox = document.getElementById('error'); // display error
        errorBox.style.display = "block";
        errorBox.firstChild.innerHTML = error; // change text of inner div
    }
}