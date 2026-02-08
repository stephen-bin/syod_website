// Security Utilities

const Security = {
    /**
     * Escapes HTML to prevent XSS attacks
     * @param {string} str - String to escape
     * @returns {string} - Escaped string
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Sanitizes URL to prevent javascript: protocol attacks
     * @param {string} url - URL to sanitize
     * @returns {string} - Sanitized URL or empty string if unsafe
     */
    sanitizeUrl(url) {
        if (!url) return '';
        const trimmedUrl = url.trim().toLowerCase();
        
        // Block dangerous protocols
        if (trimmedUrl.startsWith('javascript:') || 
            trimmedUrl.startsWith('data:') || 
            trimmedUrl.startsWith('vbscript:')) {
            console.warn('Blocked unsafe URL:', url);
            return '';
        }
        
        return url;
    },

    /**
     * Validates email format
     * @param {string} email - Email to validate
     * @returns {boolean} - True if valid
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validates phone number (Ghana format)
     * @param {string} phone - Phone to validate
     * @returns {boolean} - True if valid
     */
    isValidPhone(phone) {
        const phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/;
        return phoneRegex.test(phone);
    },

    /**
     * Sanitizes general text input
     * @param {string} input - Input to sanitize
     * @returns {string} - Sanitized input
     */
    sanitizeInput(input) {
        if (!input) return '';
        // Remove any HTML tags and trim
        return input.replace(/<[^>]*>/g, '').trim();
    }
};

// Expose to global scope
window.Security = Security;
