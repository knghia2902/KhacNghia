/**
 * Utility functions for Network Command Lookup
 */

/**
 * Strips prompt mode / prefix from the command string to ensure clean execution.
 * @param {string} fullSyntax 
 * @param {string} promptMode 
 * @returns {string} Clean command string
 */
export function cleanCommandSyntax(fullSyntax, promptMode = '') {
    if (!fullSyntax) return '';
    let clean = fullSyntax.trim();

    // If promptMode is explicitly provided, strip it from the start if present
    if (promptMode && clean.startsWith(promptMode.trim())) {
        clean = clean.slice(promptMode.trim().length).trim();
    }

    // Common network prompts regex: e.g. "Switch(config)# ", "Router# ", "[Huawei] ", "<Huawei> ", "user@host# "
    const promptRegex = /^([a-zA-Z0-9_./-]+(\([a-zA-Z0-9_./-]+\))?[#>$%\]]\s*)/;
    clean = clean.replace(promptRegex, '');

    return clean;
}

/**
 * Copies text to system clipboard with fallback support.
 * @param {string} text 
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
    if (!text) return false;
    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (err) {
        console.warn('Navigator clipboard failed, attempting execCommand fallback', err);
    }

    // Fallback using textarea
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        return successful;
    } catch (err) {
        console.error('Fallback copy failed:', err);
        return false;
    }
}

/**
 * Vendor badge color mapping
 */
export const VENDOR_THEMES = {
    cisco: { bg: '#005073', text: '#ffffff', label: 'Cisco' },
    fortinet: { bg: '#EE3124', text: '#ffffff', label: 'Fortinet' },
    juniper: { bg: '#84BD00', text: '#ffffff', label: 'Juniper' },
    palo_alto: { bg: '#FA582D', text: '#ffffff', label: 'Palo Alto' },
    mikrotik: { bg: '#222222', text: '#ffffff', label: 'MikroTik' },
    aruba_hpe: { bg: '#FF8300', text: '#ffffff', label: 'Aruba / HPE' },
    huawei: { bg: '#CF0A2C', text: '#ffffff', label: 'Huawei' }
};

/**
 * Returns matching style or fallback based on vendor data
 * @param {Object} vendor 
 * @returns {{ bg: string, text: string, label?: string }}
 */
export function getVendorStyle(vendor) {
    if (!vendor) return { bg: '#64748b', text: '#ffffff' };
    const slug = vendor.slug || '';
    if (VENDOR_THEMES[slug]) return VENDOR_THEMES[slug];
    return {
        bg: vendor.badge_color || '#005073',
        text: '#ffffff',
        label: vendor.name || 'Vendor'
    };
}
