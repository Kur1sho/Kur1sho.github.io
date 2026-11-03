const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function startRibbon() {
    const track = document.querySelector(".ribbon-track");
    const list = track.querySelector("ul");

    for (let i = 0; i < 3; i++) {
        const copy = list.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        track.appendChild(copy);
    }

    track.classList.add("moving");
}

function splitIntoLetters(element) {
    const text = element.textContent;
    element.textContent = "";

    return [...text].map((character) => {
        const letter = document.createElement("span");
        letter.className = "letter";
        letter.textContent = character;
        element.appendChild(letter);
        return letter;
    });
}

function setUpTypedHeading(selector, label) {
    const heading = document.querySelector(selector);
    const cursor = heading.querySelector(".fake-cursor");

    heading.setAttribute("aria-label", label);
    const letters = [...heading.querySelectorAll(".typed")].flatMap(splitIntoLetters);
    heading.classList.add("animating");

    async function play() {
        for (const letter of letters) {
            letter.classList.add("shown");
            await wait(60);
        }

        await wait(300);

        if (cursor) {
            cursor.classList.add("arrived");
            await wait(700);
        }

        heading.classList.remove("animating");
    }

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            observer.disconnect();
            play();
        }
    }, { threshold: 0.6 });

    observer.observe(heading);
}

function setUpCardReveal() {
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        }
    }, { threshold: 0.2 });

    for (const card of document.querySelectorAll(".project-card")) {
        card.classList.add("reveal");
        observer.observe(card);
    }
}



function setUpSideIndex() {
    const sideIndex = document.querySelector(".side-index");
    const topBar = document.querySelector("header");

    const topBarObserver = new IntersectionObserver((entries) => {
        sideIndex.classList.toggle("visible", !entries[0].isIntersecting);
    });

    topBarObserver.observe(topBar);

    const links = [...sideIndex.querySelectorAll("a")];

    function updateActiveLink() {
        const line = window.innerHeight * 0.5;
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        let current = null;

        for (const link of links) {
            const section = document.querySelector(link.getAttribute("href"));

            if (section.getBoundingClientRect().top <= line) {
                current = link;
            }
        }

        if (atBottom) {
            current = links[links.length - 1];
        }

        for (const link of links) {
            link.classList.toggle("active", link === current);
        }
    }

    window.addEventListener("scroll", updateActiveLink, { passive: true });
    updateActiveLink();
}

function setUpCentredLinks() {
    for (const link of document.querySelectorAll("header a, .side-index a")) {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            const section = document.querySelector(link.getAttribute("href"));
            const fitsOnScreen = section.offsetHeight <= window.innerHeight;
            section.scrollIntoView({ block: fitsOnScreen ? "center" : "start" });
            history.pushState(null, "", link.getAttribute("href"));
        });
    }
}

setUpSideIndex();

setUpCentredLinks();

if (reducedMotion) {
    for (const cursor of document.querySelectorAll(".fake-cursor")) {
        cursor.classList.add("arrived");
    }
} else {
    startRibbon();
    setUpTypedHeading("#hero h1", "Hi, I'm Ben Adam Whiting");
    setUpTypedHeading("#about h2", "Get to know me");
    setUpTypedHeading("#projects h2", "Some of the projects I've built");
    setUpCardReveal();
}