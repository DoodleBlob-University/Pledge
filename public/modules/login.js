export function setup() {
    // todo check cookie to see if already logged in
    
    // wait for form submission, then run login()
    document.querySelector('form').addEventListener('submit', async event => await login(event))
}

async function login(event) {
    event.preventDefault(); // stops standard html form submission
    document.getElementById('error').style.display = "none"; // hide error message box
    try{
        const loginform = document.getElementById("login");
        var data = Object.fromEntries(new FormData(loginform).entries());
        
       if( emptyFields(data) ) throw "Not all fields are filled";

        
        // todo create token
        
        // todo make cookie upon success
        
        
    } catch (error) {
        var errorBox = document.getElementById('error'); // display error
        errorBox.style.display = "block";
        errorBox.firstChild.innerHTML = error; // change text of inner div
    }
}

function emptyFields(object) {
    // check if all object values are filled
    return !Object.values(object).every( x => (x !== null && x !== ""));
}