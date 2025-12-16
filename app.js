// Mobile Menu Toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Smart Sticky Header - Hide on scroll down, show on scroll up
let lastScrollTop = 0;
let scrollThreshold = 5; // Minimum scroll amount to trigger

function handleSmartHeader() {
    const header = document.querySelector('header');
    if (!header) return;

    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // Don't do anything if scroll is very small
    if (Math.abs(currentScroll - lastScrollTop) <= scrollThreshold) return;

    // Scrolling down - hide header
    if (currentScroll > lastScrollTop && currentScroll > 80) {
        header.classList.add('header-hidden');
    }
    // Scrolling up - show header
    else {
        header.classList.remove('header-hidden');
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}

// Only apply on mobile
if (window.innerWidth <= 768) {
    window.addEventListener('scroll', handleSmartHeader, { passive: true });
}

// Re-check on resize
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        window.addEventListener('scroll', handleSmartHeader, { passive: true });
    } else {
        window.removeEventListener('scroll', handleSmartHeader);
        document.querySelector('header')?.classList.remove('header-hidden');
    }
});

// Video Modal Functions
const YOUTUBE_VIDEO_ID = 'i6dQqmeU_i8'; // Your Shorts video ID

function openVideoModal() {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('youtubePlayer');
    if (modal && player) {
        // Use shorts embed format with mute for autoplay to work
        player.src = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=0&rel=0&modestbranding=1`;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scroll behind modal
    }
}

function closeVideoModal(event) {
    // Only close if clicking on backdrop or close button, not on video
    if (event.target.classList.contains('video-modal') || event.target.classList.contains('modal-close')) {
        const modal = document.getElementById('videoModal');
        const player = document.getElementById('youtubePlayer');
        if (modal && player) {
            modal.classList.remove('active');
            player.src = ''; // Stop video by clearing src
            document.body.style.overflow = ''; // Restore scroll
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // Contact Form AJAX Submission
    const contactForm = document.getElementById('contact-form');
    // Select the button to change text during submission
    const submitBtn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Visual feedback
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            const formData = new FormData(contactForm);

            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        // Success! Redirect to custom success page
                        window.location.href = 'success.html';
                    } else {
                        // Error
                        response.json().then(data => {
                            if (Object.prototype.hasOwnProperty.call(data, 'errors')) {
                                alert(data["errors"].map(error => error["message"]).join(", "));
                            } else {
                                alert("Oops! There was a problem submitting your form");
                            }
                        });
                        // Reset button
                        submitBtn.innerText = originalBtnText;
                        submitBtn.disabled = false;
                    }
                })
                .catch(error => {
                    alert("Oops! There was a problem submitting your form");
                    // Reset button
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Hero Slider Logic (Only if slider exists)
    const slider = document.querySelector('.hero-slider');
    const heroSection = document.querySelector('.hero'); // Target the container for events

    if (slider && heroSection) {
        const slides = document.querySelectorAll('.hero-slide');
        const dots = document.querySelectorAll('.slider-dot');

        if (slides.length > 0) {
            let isDragging = false;
            let startPos = 0;
            let currentTranslate = 0;
            let prevTranslate = 0;
            let animationID;
            let currentIndex = 0;

            // Prevent context menu only on slider area
            heroSection.oncontextmenu = function (event) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }

            // Touch events - attach to heroSection to cover buttons/text too
            heroSection.addEventListener('touchstart', touchStart);
            heroSection.addEventListener('touchend', touchEnd);
            heroSection.addEventListener('touchmove', touchMove);

            // Mouse events
            heroSection.addEventListener('mousedown', touchStart);
            heroSection.addEventListener('mouseup', touchEnd);
            heroSection.addEventListener('mouseleave', () => {
                if (isDragging) touchEnd();
            });
            heroSection.addEventListener('mousemove', touchMove);

            function touchStart(event) {
                isDragging = true;
                startPos = getPositionX(event);
                animationID = requestAnimationFrame(animation);
                slider.classList.add('grabbing');
                // Remove transition during drag to make it follow finger instantly 1:1
                slider.style.transition = 'none';
            }

            function touchEnd() {
                isDragging = false;
                cancelAnimationFrame(animationID);
                slider.classList.remove('grabbing');
                // Restore transition for smooth snapping
                slider.style.transition = 'transform 0.3s ease-out';

                const movedBy = currentTranslate - prevTranslate;

                // Threshold for changing slide (100px)
                if (movedBy < -100 && currentIndex < slides.length - 1) {
                    currentIndex += 1;
                } else if (movedBy > 100 && currentIndex > 0) {
                    currentIndex -= 1;
                }

                setPositionByIndex();
            }

            function touchMove(event) {
                if (isDragging) {
                    const currentPosition = getPositionX(event);
                    currentTranslate = prevTranslate + currentPosition - startPos;
                }
            }

            function getPositionX(event) {
                return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
            }

            function animation() {
                setSliderPosition();
                if (isDragging) requestAnimationFrame(animation);
            }

            function setSliderPosition() {
                slider.style.transform = `translateX(${currentTranslate}px)`;
            }

            function setPositionByIndex() {
                const slideWidth = slides[0].clientWidth;
                currentTranslate = currentIndex * -slideWidth;
                prevTranslate = currentTranslate;
                setSliderPosition();
                updateDots();
            }

            // Handle Resize
            window.addEventListener('resize', () => {
                setPositionByIndex();
            });

            function updateDots() {
                dots.forEach((dot, index) => {
                    if (index === currentIndex) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }

            // Click on dots
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    currentIndex = index;
                    // Ensure transitioning is enabled when clicking dots
                    slider.style.transition = 'transform 0.3s ease-out';
                    setPositionByIndex();
                });
            });
        }
    }

    // Tour Filters Logic
    const filterButtons = document.querySelectorAll('.tour-filters .btn');
    const tourCards = document.querySelectorAll('.tour-card');

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all
                filterButtons.forEach(btn => btn.classList.remove('active', 'btn-primary'));
                filterButtons.forEach(btn => btn.classList.add('btn-outline'));

                // Add active to clicked
                button.classList.remove('btn-outline');
                button.classList.add('btn-primary', 'active');

                const filterValue = button.textContent.trim().toLowerCase();

                tourCards.forEach(card => {
                    const badge = card.querySelector('.badge');
                    const category = badge ? badge.textContent.trim().toLowerCase() : '';

                    if (filterValue === 'all tours') {
                        card.style.display = 'block';
                    } else if (filterValue.includes('private') && category.includes('private')) {
                        card.style.display = 'block';
                    } else if (filterValue.includes('customized') && category.includes('customized')) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
});
