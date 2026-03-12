import "./styles/styles.scss";

document.addEventListener("DOMContentLoaded", () => {
    let links = document.querySelectorAll("nav a");
    for (let i = 0; i < links.length; i++) {
        if (links[i].href === window.location.href){
            links[i].classList.add("active");
        }
        else{
            links[i].classList.remove("active");
        }
    }    
})
