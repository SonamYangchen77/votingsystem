document.addEventListener('DOMContentLoaded', function() {
    // Navigation active state
    const navItems = document.querySelectorAll('nav li');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Quick action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Add animation effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);

            // Handle button actions
            const action = this.textContent.trim();
            switch(action) {
                case 'Create Election':
                    console.log('Creating new election...');
                    break;
                case 'View Reports':
                    console.log('Opening reports...');
                    break;
                case 'Add Candidate':
                    console.log('Adding new candidate...');
                    break;
            }
        });
    });

    // User menu toggle
    const avatar = document.querySelector('.avatar');
    avatar.addEventListener('click', function() {
        // Add user menu functionality here
        console.log('Toggle user menu');
    });

    // Responsive sidebar toggle
    if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        let touchStart = null;

        document.addEventListener('touchstart', (e) => {
            touchStart = e.touches[0].clientX;
        });

        document.addEventListener('touchmove', (e) => {
            if (!touchStart) return;

            const touchEnd = e.touches[0].clientX;
            const diff = touchStart - touchEnd;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    // Swipe left
                    sidebar.style.transform = 'translateX(-70px)';
                } else {
                    // Swipe right
                    sidebar.style.transform = 'translateX(0)';
                }
            }
        });

        document.addEventListener('touchend', () => {
            touchStart = null;
        });
    }
});