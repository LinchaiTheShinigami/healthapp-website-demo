// Determine absolute base for '/scripts' and '/pages'
function getAppBaseAbsolute() {
    return '../';
}

function getScriptsBaseAbsolute() {
    return getAppBaseAbsolute() + '/scripts';
}

function getPagesBaseAbsolute() {
    return getAppBaseAbsolute() + '/pages';
}

// Navigate to a screen; accepts a string, Event, or Element
async function navigateToScreen(targetScreen) {
    if (!targetScreen) {
        console.warn('navigateToScreen called without a valid data-target');
        return;
    }

    console.log('Navigating to page:', targetScreen);

    try {
        // Load the screen content using an absolute, robust path
        const url = `${getPagesBaseAbsolute()}/mobile/screens/${targetScreen}.html`;
        console.log('Url is:', url);
        loadHTMLContent(url, 'screens-placeholder', () => {
            const screen = document.getElementById(targetScreen);
            if (screen) {
                screen.classList.add('is-active');
                console.log('Screen activated:', targetScreen);
            }
        });
    } catch (err) {
        console.error('Navigation error:', err);
    }
}

// Delegate clicks from buttons with data-target
function initializeScreenNavigation() {
    // Only handle btn-primary and btn-secondary to avoid conflicting with bottom nav
    document.addEventListener('click', (e) => {
        const button = e.target.closest('button.btn-primary[data-target], button.btn-secondary[data-target], button.btn-back[data-target]');
        if (!button) return;
        e.preventDefault();
        const target = button.getAttribute('data-target');
        if (target) navigateToScreen(target);
    });
}

// Expose APIs globally for inline handlers
//window.navigateToScreen = navigateToScreen;
//window.initializeScreenNavigation = initializeScreenNavigation;

// Initialize delegation immediately
initializeScreenNavigation();
