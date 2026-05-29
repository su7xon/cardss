import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    // Disable browser's scroll restoration completely
    useEffect(() => {
        window.history.scrollRestoration = "manual";
        
        // Scroll to top immediately on mount
        window.scrollTo(0, 0);
        
        return () => {
            window.history.scrollRestoration = "auto";
        };
    }, []);

    // Scroll to top on route change
    useLayoutEffect(() => {
        if (hash) {
            // Scroll to hash element
            const timeoutId = window.setTimeout(() => {
                const id = hash.replace('#', '');
                const element = document.getElementById(id);
                if (element) {
                    const headerHeight = 80;
                    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - headerHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }, 100);

            return () => {
                window.clearTimeout(timeoutId);
            };
        } else {
            // Force scroll to top multiple times to ensure it works
            window.scrollTo(0, 0);
            
            requestAnimationFrame(() => {
                window.scrollTo(0, 0);
            });

            const timeoutId = window.setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);

            return () => {
                window.clearTimeout(timeoutId);
            };
        }
    }, [pathname, hash]);

    return null;
};

export default ScrollToTop;
