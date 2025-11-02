/**
 * Loads HTML content into a target element and executes any scripts within it
 * @param {string} url - The URL of the HTML content to load
 * @param {string} targetId - The ID of the element to load the content into
 * @param {function} callback - Optional callback to run after content is loaded
 */
async function loadHTMLContent(url, targetId, callback = null) {
    try {
        console.log(`Loading content from ${url}...`);
        const response = await fetch(url);
        const htmlContent = await response.text();
        
        // Create a temporary container to parse the HTML
        const temp = document.createElement('div');
        temp.innerHTML = htmlContent;
        
        // Get the target element
        const targetElement = document.getElementById(targetId);
        if (!targetElement) {
            throw new Error(`Target element with id '${targetId}' not found`);
        }
        
        // Get all scripts from the content
        const scripts = Array.from(temp.getElementsByTagName('script'));
        const scriptsData = scripts.map(script => ({
            src: script.src,
            content: script.textContent,
            type: script.type || 'text/javascript',
            async: script.async,
            defer: script.defer
        }));
        
        // Remove scripts from temp container
        scripts.forEach(script => script.remove());
        
        // Insert the HTML content
        targetElement.innerHTML = temp.innerHTML;
        
        // Execute scripts in sequence
        for (const scriptData of scriptsData) {
            await new Promise((resolve, reject) => {
                const scriptElement = document.createElement('script');
                
                // Copy script attributes
                scriptElement.type = scriptData.type;
                if (scriptData.async) scriptElement.async = true;
                if (scriptData.defer) scriptElement.defer = true;
                
                // Handle script loading/execution
                if (scriptData.src) {
                    // External script
                    scriptElement.src = scriptData.src;
                    scriptElement.onload = resolve;
                    scriptElement.onerror = reject;
                } else {
                    // Inline script
                    scriptElement.textContent = scriptData.content;
                    resolve();
                }
                
                targetElement.appendChild(scriptElement);
                
                // If it's an inline script, we don't need to wait for onload
                if (!scriptData.src) {
                    console.log('Executed inline script');
                }
            }).catch(err => {
                console.error('Error executing script:', err);
            });
        }
        
        console.log(`Content from ${url} loaded successfully`);
        
        // Execute callback if provided
        if (callback && typeof callback === 'function') {
            callback();
        }
    } catch (err) {
        console.error(`Failed to load content from ${url}:`, err);
    }
}