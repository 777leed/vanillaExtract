const animate = require('motion').animate;

function fadeIn(element) {
    let opacity = 0;
    element.style.opacity = opacity;
    const intervalId = setInterval(() => {
        opacity += 0.1;
        element.style.opacity = opacity;
        if (opacity >= 1) {
            clearInterval(intervalId);
        }
    }, 50);
}


function fadeOut(element) {
    let opacity = 1;
    element.style.opacity = opacity;
    const intervalId = setInterval(() => {
        opacity -= 0.1;
        element.style.opacity = opacity;
        if (opacity >= 0) {
            clearInterval(intervalId);
        }
    }, 1000);
}


function scrollCounter(c) {
    setTimeout(() => {
        const thoughtCount = document.getElementById('thoughtCount');
        animate(
            (progress) => thoughtCount.innerHTML = Math.round(progress * c),
            { duration: 1, easing: "ease-out" }
        )
    }, 500)

}
