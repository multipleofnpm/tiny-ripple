/*!
 * tiny-ripple v0.1.0
 * A lightweight library that adds subtle ripple effects on touch/click interactions
 * https://github.com/yourusername/tiny-ripple
 * 
 * Copyright (c) 2025
 * Licensed under MIT
 */
(function() {
    'use strict';
    
    const defaultOptions = {
        size: 60,
        duration: 500,
        color: 'rgba(0,0,0,0.3)',
        zIndex: 9999,
        debounceDelay: 100
    };
    
    let isInitialized = false;
    let lastRippleTime = 0;
    let touchStartY = null;
    let touchStartTime = null;
    
    /**
     * Create a ripple effect at specified coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate  
     * @param {Object} options - Custom options
     */
    function createRipple(x, y, options = {}) {
        const opts = { ...defaultOptions, ...options };
        
        const ripple = document.createElement('div');
        ripple.setAttribute('data-tiny-ripple', '');
        
        // Set position and initial size
        const size = opts.size;
        ripple.style.cssText = `
            position: fixed;
            left: ${x - size/2}px;
            top: ${y - size/2}px;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            pointer-events: none;
            z-index: ${opts.zIndex};
            background: radial-gradient(circle, ${opts.color} 0%, ${opts.color.replace('0.3', '0.05')} 70%, transparent 100%);
            animation: tiny-ripple-animation ${opts.duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            mix-blend-mode: multiply;
        `;
        
        document.body.appendChild(ripple);
        
        // Remove the ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, opts.duration);
    }
    
    /**
     * Handle touch start to track potential scrolling
     */
    function handleTouchStart(e) {
        if (e.touches.length === 1) {
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        }
    }
    
    /**
     * Handle touch move to detect if user is scrolling
     */
    function handleTouchMove(e) {
        if (touchStartY !== null && e.touches.length === 1) {
            const currentY = e.touches[0].clientY;
            const deltaY = Math.abs(currentY - touchStartY);
            const deltaTime = Date.now() - touchStartTime;
            
            // If moved more than 10px vertically in less than 300ms, it's likely scrolling
            if (deltaY > 10 && deltaTime < 300) {
                touchStartY = null; // Mark as scrolling gesture
            }
        }
    }
    
    /**
     * Handle touch end - create ripple if it wasn't a scroll gesture
     */
    function handleTouchEnd(e) {
        // Only create ripple if touchStartY is still set (meaning no scroll detected)
        if (touchStartY !== null && e.changedTouches.length === 1) {
            const now = Date.now();
            
            // Debounce check
            if (now - lastRippleTime >= defaultOptions.debounceDelay) {
                lastRippleTime = now;
                
                const touch = e.changedTouches[0];
                createRipple(touch.clientX, touch.clientY);
            }
        }
        
        // Reset tracking
        touchStartY = null;
        touchStartTime = null;
    }
    
    /**
     * Handle mouse events (desktop)
     */
    function handleMouseDown(e) {
        const now = Date.now();
        
        // Debounce check
        if (now - lastRippleTime < defaultOptions.debounceDelay) {
            return;
        }
        lastRippleTime = now;
        
        createRipple(e.clientX, e.clientY);
    }
    
    /**
     * Add required CSS keyframes
     */
    function addCSS() {
        if (document.querySelector('#tiny-ripple-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'tiny-ripple-styles';
        style.textContent = `
            @keyframes tiny-ripple-animation {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                100% {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Initialize the ripple effect library
     */
    function init(options = {}) {
        if (isInitialized) return;
        
        // Merge custom options
        Object.assign(defaultOptions, options);
        
        // Add CSS
        addCSS();
        
        // Add event listeners
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });
        document.addEventListener('mousedown', handleMouseDown, { passive: true });
        
        isInitialized = true;
    }
    
    /**
     * Destroy the ripple effect (remove event listeners and styles)
     */
    function destroy() {
        if (!isInitialized) return;
        
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('mousedown', handleMouseDown);
        
        // Remove existing ripples
        const ripples = document.querySelectorAll('[data-tiny-ripple]');
        ripples.forEach(ripple => ripple.remove());
        
        // Remove styles
        const styles = document.querySelector('#tiny-ripple-styles');
        if (styles) styles.remove();
        
        isInitialized = false;
    }
    
    /**
     * Auto-initialize when DOM is ready
     */
    function autoInit() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }
    
    // Public API
    window.TinyRipple = {
        init,
        destroy,
        createRipple,
        isInitialized: () => isInitialized,
        version: '0.1.0'
    };
    
    // Auto-initialize immediately
    autoInit();
    
})();
