// Mobile Menu Toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
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
                            if (Object.hasOwn(data, 'errors')) {
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
    const slider = document.querySelector('.hero-slider');
    if (slider) {
        const slides = document.querySelectorAll('.hero-slide');
        const dots = document.querySelectorAll('.slider-dot');

        if (slides.length > 0) {
            let isDragging = false;
            let startPos = 0;
            let currentTranslate = 0;
            let prevTranslate = 0;
            let animationID;
            let currentIndex = 0;

            // Prevent context menu
            window.oncontextmenu = function (event) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }

            // Touch events
            slider.addEventListener('touchstart', touchStart);
            slider.addEventListener('touchend', touchEnd);
            slider.addEventListener('touchmove', touchMove);

            // Mouse events
            slider.addEventListener('mousedown', touchStart);
            slider.addEventListener('mouseup', touchEnd);
            slider.addEventListener('mouseleave', () => {
                if (isDragging) touchEnd();
            });
            slider.addEventListener('mousemove', touchMove);

            function touchStart(event) {
                isDragging = true;
                startPos = getPositionX(event);
                animationID = requestAnimationFrame(animation);
                slider.classList.add('grabbing');
            }

            function touchEnd() {
                isDragging = false;
                cancelAnimationFrame(animationID);
                slider.classList.remove('grabbing');

                const movedBy = currentTranslate - prevTranslate;

                // Threshold for changing slide
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
