// YouTube Shorts Auto Scroll

let autoScrollEnabled = true;
let isNavigating = false;
let lastVideo = null;
let monitorInterval = null;
let navigationTimeout = null;


// =====================================================
// LOAD SETTINGS
// =====================================================

chrome.storage.local.get(["autoScrollEnabled"], (result) => {
    autoScrollEnabled = result.autoScrollEnabled !== false;

    console.log(
        "[Shorts AutoScroll] Enabled:",
        autoScrollEnabled
    );

    if (autoScrollEnabled) {
        startMonitoring();
    }
});


// =====================================================
// LISTEN FOR SETTING CHANGES
// =====================================================

chrome.storage.onChanged.addListener((changes) => {
    if (!changes.autoScrollEnabled) {
        return;
    }

    autoScrollEnabled = changes.autoScrollEnabled.newValue;

    console.log(
        "[Shorts AutoScroll] Setting changed:",
        autoScrollEnabled
    );

    if (autoScrollEnabled) {
        startMonitoring();
    }
});


// =====================================================
// FIND CURRENT VIDEO
// =====================================================

function getCurrentVideo() {
    const videos = Array.from(
        document.querySelectorAll("video")
    );

    if (videos.length === 0) {
        return null;
    }

    // Prefer a visible video.
    const visibleVideo = videos.find((video) => {
        const rect = video.getBoundingClientRect();

        return (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.bottom > 0 &&
            rect.top < window.innerHeight
        );
    });

    return visibleVideo || videos[0];
}


// =====================================================
// FIND NEXT SHORT BUTTON
// =====================================================

function findNextButton() {

    // Current Shorts navigation structure
    const button = document.querySelector(
        "#navigation-button-down button"
    );

    if (button) {
        return button;
    }

    // Fallback
    const container = document.querySelector(
        "#navigation-button-down"
    );

    if (container) {
        return container;
    }

    return null;
}


// =====================================================
// NAVIGATE TO NEXT SHORT
// =====================================================

function navigateToNextShort() {

    if (!autoScrollEnabled) {
        return;
    }

    if (isNavigating) {
        return;
    }

    isNavigating = true;

    console.log(
        "[Shorts AutoScroll] Navigating to next Short..."
    );

    const nextButton = findNextButton();

    if (nextButton) {

        console.log(
            "[Shorts AutoScroll] Next button found:",
            nextButton
        );

        nextButton.click();

    } else {

        console.warn(
            "[Shorts AutoScroll] Next button NOT found"
        );

        // Last-resort fallback.
        window.scrollBy({
            top: window.innerHeight,
            behavior: "smooth"
        });
    }

    clearTimeout(navigationTimeout);

    navigationTimeout = setTimeout(() => {

        isNavigating = false;

        console.log(
            "[Shorts AutoScroll] Navigation lock released"
        );

    }, 1000);
}


// =====================================================
// MONITOR VIDEO
// =====================================================

function monitorVideo() {

    if (!autoScrollEnabled) {
        return;
    }

    if (isNavigating) {
        return;
    }

    const video = getCurrentVideo();

    if (!video) {
        return;
    }


    // New video detected
    if (video !== lastVideo) {

        lastVideo = video;

        console.log(
            "[Shorts AutoScroll] New video detected"
        );

        console.log(
            "[Shorts AutoScroll] Duration:",
            video.duration
        );
    }


    // Video metadata may not be loaded yet.
    if (
        !Number.isFinite(video.duration) ||
        video.duration <= 0
    ) {
        return;
    }


    const remaining =
        video.duration - video.currentTime;


    // Log when the video is close to ending.
    if (
        remaining <= 0.5 &&
        remaining > 0.1
    ) {

        console.log(
            "[Shorts AutoScroll] Video ending soon:",
            remaining.toFixed(3),
            "seconds remaining"
        );
    }


    // Main trigger.
    if (
        remaining <= 0.2 &&
        video.currentTime > 0
    ) {

        console.log(
            "[Shorts AutoScroll] Video almost ended:",
            video.currentTime.toFixed(3),
            "/",
            video.duration.toFixed(3)
        );

        navigateToNextShort();
    }
}


// =====================================================
// START MONITORING
// =====================================================

function startMonitoring() {

    if (monitorInterval) {
        clearInterval(monitorInterval);
    }

    console.log(
        "[Shorts AutoScroll] Starting video monitoring..."
    );

    monitorInterval = setInterval(
        monitorVideo,
        100
    );
}


// =====================================================
// HANDLE YOUTUBE SPA NAVIGATION
// =====================================================

let lastUrl = location.href;

const urlObserver = new MutationObserver(() => {

    if (location.href === lastUrl) {
        return;
    }

    lastUrl = location.href;

    console.log(
        "[Shorts AutoScroll] URL changed:",
        location.href
    );

    // Reset state for new Short.
    isNavigating = false;
    lastVideo = null;

    setTimeout(() => {

        if (autoScrollEnabled) {

            console.log(
                "[Shorts AutoScroll] Restarting monitoring..."
            );

            startMonitoring();
        }

    }, 500);
});


if (document.body) {

    urlObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

}


// =====================================================
// INITIALIZATION
// =====================================================

console.log(
    "[Shorts AutoScroll] Content script loaded"
);