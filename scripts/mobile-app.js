/* Mobile app behavior (migrated from inline script in pages/webapp.html)
   This script initializes the mobile screens when the mobile HTML is inserted into the page.
*/
(function(){
    function init() {
        const screens = Array.from(document.querySelectorAll('.mobile-screen'));
        if (!screens.length) return false; // not ready yet

        const bottomLinks = Array.from(document.querySelectorAll('.bottom-nav [data-target]'));
        let historyStack = [];

        function getActiveScreen() {
            return screens.find(screen => screen.classList.contains('is-active'));
        }

        function setBackVisibility() {
            document.querySelectorAll('.btn-back').forEach(button => {
                button.style.display = historyStack.length ? 'inline-flex' : 'none';
            });
        }

        function showScreen(id, pushHistory = true) {
            const target = document.getElementById(id);
            if (!target || target.classList.contains('is-active')) {
                return;
            }

            const current = getActiveScreen();
            if (current && pushHistory) {
                historyStack.push(current.id);
            }

            screens.forEach(screen => {
                screen.classList.remove('is-active');
            });

            target.classList.add('is-active');
            target.scrollTop = 0;
            setBackVisibility();
        }

        document.body.addEventListener('click', function(event) {
            const backButton = event.target.closest('.btn-back');
            if (backButton) {
                const previous = historyStack.pop();
                if (previous) {
                    showScreen(previous, false);
                }
                setBackVisibility();
                return;
            }

            const trigger = event.target.closest('[data-target]');
            if (!trigger) return;

            const targetId = trigger.getAttribute('data-target');
            if (!targetId) return;

            const fromBottomNav = !!trigger.closest('.bottom-nav');
            if (fromBottomNav) historyStack = [];

            showScreen(targetId, !fromBottomNav);
            if (fromBottomNav) setBackVisibility();
        });

        bottomLinks.forEach(link => link.addEventListener('click', event => event.preventDefault()));

        historyStack = [];
        setBackVisibility();
        return true;
    }

    function waitAndInit() {
        if (init()) return;
        const placeholder = document.getElementById('mobile-placeholder');
        if (!placeholder) return;

        const mo = new MutationObserver((mutations, obs) => {
            if (init()) obs.disconnect();
        });

        mo.observe(placeholder, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitAndInit);
    } else {
        waitAndInit();
    }
})();
