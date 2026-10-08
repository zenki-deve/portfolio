/* ===================================
   PROFESSIONAL PORTFOLIO - MAIN.JS
   Advanced Animations & Interactions
   =================================== */

// --- ROBUST MOBILE DETECTION ---
const detectMobile = () => {
    const ua = navigator.userAgent || navigator.vendor || window.opera || '';
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    const inAppRegex = /Instagram|FBAN|FBAV|Twitter|Line|Snapchat|TikTok|WebView|wv\)/i;
    
    const isMobileUA = mobileRegex.test(ua);
    const isInAppBrowser = inAppRegex.test(ua);
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isSmallScreen = window.innerWidth <= 1024;
    const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    
    return isMobileUA || isInAppBrowser || (isTouchDevice && isSmallScreen) || isCoarsePointer;
};

const isMobile = detectMobile();
const enableSmoothScroll = true;
const enableCustomCursor = true;

if (enableCustomCursor && !isMobile) {
    document.body.classList.add('custom-cursor');
} else {
    document.body.classList.add('native-cursor');
}

// --- 1. SMOOTH SCROLL (LENIS) ---
let lenis = null;

function initSmoothScroll() {
    if (!enableSmoothScroll) {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }
        return;
    }

    if (isMobile) {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            ScrollTrigger.config({
                ignoreMobileResize: true
            });
        }
        return;
    }
    
    try {
        if (typeof Lenis !== 'undefined') {
            lenis = new Lenis({
                duration: 0.9,
                easing: (t) => 1 - Math.pow(1 - t, 3),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 1,
                touchMultiplier: 1,
                infinite: false,
            });

            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
                lenis.on('scroll', ScrollTrigger.update);
                gsap.ticker.add((time) => {
                    lenis.raf(time * 1000);
                });
                gsap.ticker.lagSmoothing(0);
            } else {
                function raf(time) {
                    lenis.raf(time);
                    requestAnimationFrame(raf);
                }
                requestAnimationFrame(raf);
            }
        } else {
            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
            }
        }
    } catch (e) {
        console.warn('Smooth scroll error:', e);
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }
    }
}

initSmoothScroll();

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = this.getAttribute('href');
        if (target !== '#') {
            const targetElement = document.querySelector(target);
            if (targetElement) {
                if (lenis) {
                    lenis.scrollTo(target, {
                        offset: -80,
                        duration: 1
                    });
                } else {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    });
});

// --- 2. SCROLL PROGRESS BAR ---
const progressBar = document.querySelector('.scroll-progress-bar');
if (progressBar) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    }, { passive: true });
}

// --- 3. CUSTOM CURSOR ---
if (!isMobile && enableCustomCursor) {
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');
    const cursorText = document.querySelector('[data-cursor-text]');

    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;
    let hasMousePosition = false;

    if (cursorDot && cursorOutline) {
        cursorDot.style.willChange = 'transform';
        cursorOutline.style.willChange = 'transform';
        if (cursorText) cursorText.style.willChange = 'transform';

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!hasMousePosition) {
                outlineX = mouseX;
                outlineY = mouseY;
                hasMousePosition = true;
            }

            cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        }, { passive: true });

        function animateCursor() {
            if (hasMousePosition) {
                outlineX += (mouseX - outlineX) * 0.24;
                outlineY += (mouseY - outlineY) * 0.24;

                cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0)`;
                if (cursorText) {
                    cursorText.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0)`;
                }
            }
            requestAnimationFrame(animateCursor);
        }

        animateCursor();

        document.addEventListener('mousedown', () => {
            cursorOutline.classList.add('clicking');
        });
        
        document.addEventListener('mouseup', () => {
            cursorOutline.classList.remove('clicking');
        });

        const interactiveElements = document.querySelectorAll('a, button, .magnetic');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.classList.add('hovered');
                const cursorLabel = el.getAttribute('data-cursor');
                if (cursorLabel && cursorText) {
                    cursorText.textContent = cursorLabel;
                    cursorText.classList.add('visible');
                }
            });
            
            el.addEventListener('mouseleave', () => {
                cursorOutline.classList.remove('hovered');
                if (cursorText) {
                    cursorText.classList.remove('visible');
                }
            });
        });

        document.addEventListener('mouseleave', () => {
            cursorDot.style.opacity = '0';
            cursorOutline.style.opacity = '0';
            if (cursorText) cursorText.style.opacity = '0';
        });
        
        document.addEventListener('mouseenter', () => {
            cursorDot.style.opacity = '1';
            cursorOutline.style.opacity = '1';
            if (cursorText && cursorText.classList.contains('visible')) cursorText.style.opacity = '1';
        });
        
        const darkElements = document.querySelectorAll('.dual-col.dark, .terminal-window, .code-window, .flex-card.prominent');
        
        darkElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('inverted');
                cursorOutline.classList.add('inverted');
                if (cursorText) cursorText.style.color = 'white';
            });
            
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('inverted');
                cursorOutline.classList.remove('inverted');
                if (cursorText) cursorText.style.color = '';
            });
        });
    }
}

// --- 4. TERMINAL SIMULATION ---
const logsContainer = document.getElementById('terminal-logs');

if (logsContainer) {
    const logs = [
        {
                "text": "$ npm run build --prefix web-app",
                "color": "#8B949E",
                "delay": 100
        },
        {
                "text": "> Vite: React dashboard & WebApp bundled [1.8s]",
                "color": "#60A5FA",
                "delay": 300
        },
        {
                "text": "$ go run cmd/server/main.go --env=production",
                "color": "#8B949E",
                "delay": 400
        },
        {
                "text": "[200 OK] Fiber microservices & WebSocket gateway live on :8080",
                "color": "#10B981",
                "delay": 200
        },
        {
                "text": "> DB Pool: PostgreSQL (10/10) & Redis Streams (PONG)",
                "color": "#10B981",
                "delay": 150
        },
        {
                "text": "$ docker compose up -d admin-panel prometheus grafana",
                "color": "#8B949E",
                "delay": 350
        },
        {
                "text": "[CONTAINER HEALTHY] Admin CMS & Prometheus telemetry active",
                "color": "#60A5FA",
                "delay": 250
        },
        {
                "text": "$ pytest tests/e2e --browser=playwright --parallel=8",
                "color": "#8B949E",
                "delay": 500
        },
        {
                "text": "> Executing API & UI test suites with anti-detection rules...",
                "color": "#A855F7",
                "delay": 600
        },
        {
                "text": "[PASSED] 142/142 test scenarios verified cleanly",
                "color": "#10B981",
                "bold": true,
                "delay": 250
        },
        {
                "text": "$ python3 -m bot_fleet --start-proxies --tls-emulate=ja4",
                "color": "#8B949E",
                "delay": 400
        },
        {
                "text": "> TLS Fingerprint: Chrome 150 (Win11) | curl_cffi pool: 50 active",
                "color": "#A855F7",
                "delay": 300
        },
        {
                "text": "[SUCCESS] Akamai & Cloudflare protections bypassed",
                "color": "#10B981",
                "bold": true,
                "delay": 250
        },
        {
                "text": "> ZennoDroid Engine: 8 mobile emulators synced",
                "color": "#60A5FA",
                "delay": 300
        },
        {
                "text": "> Telegram Webhook Listener & Live Telemetry: ONLINE",
                "color": "#10B981",
                "bold": true,
                "delay": 200
        }
];

    const maxLines = 10;
    let currentIndex = 0;
    let terminalInterval = null;
    
    function addLogLine(log) {
        if (logsContainer.children.length >= maxLines) {
            const firstChild = logsContainer.firstChild;
            if (firstChild) {
                firstChild.remove();
            }
        }
        
        const line = document.createElement('div');
        line.style.color = log.color;
        line.style.fontWeight = log.bold ? '700' : '400';
        line.style.whiteSpace = 'nowrap';
        line.style.fontSize = '0.8rem';
        line.style.lineHeight = '1.6';
        line.textContent = log.text;
        
        logsContainer.appendChild(line);
    }
    
    function runTerminalStep() {
        addLogLine(logs[currentIndex]);
        currentIndex = (currentIndex + 1) % logs.length;
    }
    
    for (let i = 0; i < Math.min(10, logs.length); i++) {
        addLogLine(logs[i]);
        currentIndex = i + 1;
    }
    
    terminalInterval = setInterval(runTerminalStep, 1500);
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && terminalInterval) {
            clearInterval(terminalInterval);
        } else if (!document.hidden && !terminalInterval) {
            terminalInterval = setInterval(runTerminalStep, 1500);
        }
    });
}

// --- 5. SCROLL REVEAL ANIMATIONS ---
if (isMobile) {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        if (el) {
            el.classList.add('active');
            el.style.opacity = '1';
            el.style.transform = 'none';
        }
    });
    document.querySelectorAll('.dual-col, .project-card, .stat-item, .skill-item, .skills-category').forEach(el => {
        if (el) {
            el.style.opacity = '1';
            el.style.transform = 'none';
        }
    });
} else {
    try {
        const revealElements = document.querySelectorAll('.reveal-on-scroll');

        if (revealElements.length > 0 && 'IntersectionObserver' in window) {
            const observerOptions = {
                threshold: 0.05,
                rootMargin: '0px 0px -50px 0px'
            };

            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.target) {
                        entry.target.classList.add('active');
                        
                        const children = entry.target.querySelectorAll('.dual-col, .project-card, .stat-item, .skill-item, .skills-category');
                        children.forEach((child, index) => {
                            if (child) {
                                child.style.setProperty('--delay', `${index * 0.08}s`);
                                child.classList.add('fade-in-up');
                            }
                        });
                        
                        revealObserver.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            revealElements.forEach(el => {
                if (el) revealObserver.observe(el);
            });
        }
    } catch (e) {
        console.warn('Scroll reveal error:', e);
    }
}

// --- 6. STATS COUNTER ANIMATION ---
const statNumbers = document.querySelectorAll('.stat-number');

if (typeof gsap !== 'undefined') {
    statNumbers.forEach(stat => {
        const targetStr = stat.getAttribute('data-target');
        const target = parseFloat(targetStr.replace(/\s/g, ''));
        if (isNaN(target)) return;
        
        const hasDecimal = targetStr.includes('.');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    gsap.to({ val: 0 }, {
                        val: target,
                        duration: 1.5,
                        ease: 'power2.out',
                        onUpdate: function() {
                            const num = this.targets()[0].val;
                            if (hasDecimal) {
                                stat.textContent = num.toFixed(1);
                            } else if (num >= 1000) {
                                stat.textContent = Math.floor(num).toLocaleString('en-US');
                            } else {
                                stat.textContent = Math.floor(num);
                            }
                        }
                    });
                    observer.unobserve(stat);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(stat);
    });
} else {
    statNumbers.forEach(stat => {
        const target = stat.getAttribute('data-target');
        if (target) {
            stat.textContent = target;
        }
    });
}

// --- 8. NAVIGATION SCROLL EFFECT ---
const nav = document.querySelector('.nav-wrapper');
const dynamicNav = document.querySelector('.dynamic-nav');

if (nav && dynamicNav) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            dynamicNav.style.background = 'rgba(255, 255, 255, 0.9)';
            dynamicNav.style.boxShadow = '0 20px 40px -24px rgba(15, 23, 42, 0.24)';
        } else {
            dynamicNav.style.background = 'rgba(255, 255, 255, 0.76)';
            dynamicNav.style.boxShadow = '0 14px 40px -24px rgba(15, 23, 42, 0.22), 0 2px 6px rgba(15, 23, 42, 0.04)';
        }
    });
}

if (isMobile) {
    document.querySelectorAll('.project-card').forEach(card => {
        card.removeAttribute('data-cursor');
    });
}

// --- 11. TEXT SPLIT ANIMATION ---
const animateText = () => {
    try {
        const titleWords = document.querySelectorAll('.title-word');
        if (!titleWords || titleWords.length === 0) return;
        
        titleWords.forEach((word, index) => {
            if (!word) return;
            word.style.opacity = '0';
            word.style.transform = 'translateY(100%)';
            
            setTimeout(() => {
                if (word) {
                    word.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)';
                    word.style.opacity = '1';
                    word.style.transform = 'translateY(0)';
                }
            }, 100 + (index * 100));
        });
    } catch (e) {
        console.warn('Text animation error:', e);
    }
};

window.addEventListener('load', animateText);

// --- 12. MARQUEE PAUSE ON HOVER ---
const marqueeTracks = document.querySelectorAll('.marquee-track');

function fillMarqueeTracks() {
    marqueeTracks.forEach((track) => {
        const firstContent = track.querySelector('.marquee-content');
        if (!firstContent) return;

        Array.from(track.querySelectorAll('.marquee-clone')).forEach((clone) => clone.remove());

        const contentWidth = Math.ceil(firstContent.getBoundingClientRect().width);
        track.style.setProperty('--marquee-distance', `${contentWidth}px`);

        const targetWidth = window.innerWidth * 2;
        let safety = 0;

        while (track.scrollWidth < targetWidth && safety < 6) {
            const clone = firstContent.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.classList.add('marquee-clone');
            track.appendChild(clone);
            safety += 1;
        }
    });
}

fillMarqueeTracks();
window.addEventListener('resize', fillMarqueeTracks);

marqueeTracks.forEach(track => {
    track.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
    });
    
    track.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
    });
});

console.log('%c Portfolio loaded successfully! ', 'background: #2563EB; color: white; padding: 4px 8px; border-radius: 4px;');
