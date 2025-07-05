// Enhanced JavaScript with smooth animations and interactions
document.addEventListener('DOMContentLoaded', function() {
    // Initialize app
    initializeApp();
    
    function initializeApp() {
        setupChainSwitching();
        setupWalletConnection();
        setupFormHandlers();
        setupScrollEffects();
        setupAnimations();
    }
    
    // Chain Switching
    function setupChainSwitching() {
        const chainBtns = document.querySelectorAll('.chain-btn');
        
        chainBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all buttons
                chainBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Add ripple effect
                createRipple(this, e);
                
                // Show notification
                showNotification(`Switched to ${this.textContent.trim()}`, 'success');
            });
        });
    }
    
    // Wallet Connection
    function setupWalletConnection() {
        const connectBtn = document.getElementById('connect-wallet');
        const walletConnected = document.getElementById('wallet-connected');
        const walletAddress = document.getElementById('wallet-address');
        
        if (connectBtn) {
            connectBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Add loading state
                this.innerHTML = '<div class="loading-spinner"></div> Connecting...';
                this.disabled = true;
                
                // Simulate wallet connection
                setTimeout(() => {
                    // Hide connect button
                    this.style.opacity = '0';
                    this.style.transform = 'translateY(-10px)';
                    
                    setTimeout(() => {
                        this.style.display = 'none';
                        
                        // Show wallet connected
                        if (walletConnected) {
                            walletConnected.style.display = 'flex';
                            walletConnected.style.opacity = '0';
                            walletConnected.style.transform = 'translateY(10px)';
                            
                            requestAnimationFrame(() => {
                                walletConnected.style.transition = 'all 0.6s ease-out';
                                walletConnected.style.opacity = '1';
                                walletConnected.style.transform = 'translateY(0)';
                            });
                        }
                        
                        // Update wallet address
                        if (walletAddress) {
                            walletAddress.textContent = '0x742d...35Bd';
                        }
                        
                        // Show success notification
                        showNotification('Wallet connected successfully!', 'success');
                    }, 300);
                }, 2000);
            });
        }
    }
    
    // Form Handlers
    function setupFormHandlers() {
        const depositForm = document.getElementById('deposit-form');
        const coverageForm = document.getElementById('coverage-form');
        
        if (depositForm) {
            depositForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const btn = document.getElementById('deposit-btn');
                const protocolSelect = document.getElementById('protocol-select');
                const amountInput = document.getElementById('deposit-amount');
                
                if (!protocolSelect || !amountInput) return;
                
                if (!protocolSelect.value || !amountInput.value) {
                    showNotification('Please fill in all fields', 'error');
                    return;
                }
                
                // Add loading state
                btn.innerHTML = '<div class="loading-spinner"></div> Processing Transaction...';
                btn.disabled = true;
                
                // Simulate transaction
                setTimeout(() => {
                    btn.innerHTML = '<span class="icon icon-check"></span> Deposit Successful!';
                    btn.style.background = 'var(--gradient-success)';
                    
                    setTimeout(() => {
                        btn.innerHTML = '<span class="icon icon-shield"></span> Deposit with Protection';
                        btn.style.background = 'var(--gradient-primary)';
                        btn.disabled = false;
                        
                        // Reset form
                        depositForm.reset();
                        
                        // Show success notification
                        showNotification('Deposit successful! You\'re now earning protected yield with 100% insurance coverage.', 'success');
                    }, 2000);
                }, 3000);
            });
        }
        
        if (coverageForm) {
            coverageForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const btn = document.getElementById('coverage-btn');
                const checkboxes = document.querySelectorAll('input[name="protocols"]:checked');
                const amountInput = document.getElementById('coverage-amount');
                
                if (!amountInput) return;
                
                if (checkboxes.length === 0 || !amountInput.value) {
                    showNotification('Please select protocols and enter amount', 'error');
                    return;
                }
                
                // Add loading state
                btn.innerHTML = '<div class="loading-spinner"></div> Processing Coverage...';
                btn.disabled = true;
                
                // Simulate transaction
                setTimeout(() => {
                    btn.innerHTML = '<span class="icon icon-check"></span> Insurance Provider Activated!';
                    btn.style.background = 'var(--gradient-success)';
                    
                    setTimeout(() => {
                        btn.innerHTML = '<span class="icon icon-zap"></span> Become Insurance Provider';
                        btn.style.background = 'var(--gradient-primary)';
                        btn.disabled = false;
                        
                        // Reset form
                        coverageForm.reset();
                        checkboxes.forEach(cb => {
                            cb.checked = false;
                            cb.closest('.checkbox-item').classList.remove('checked');
                        });
                        
                        // Reset APY calculation
                        updateAPYCalculation();
                        
                        // Show success notification
                        showNotification('Insurance provider activated! You\'re now earning premium income from Safe Pool users.', 'success');
                    }, 2000);
                }, 3000);
            });
        }
        
        // Setup checkbox interactions with APY calculation
        const checkboxes = document.querySelectorAll('.checkbox-item');
        checkboxes.forEach(item => {
            const checkbox = item.querySelector('.checkbox-input');
            
            if (checkbox) {
                item.addEventListener('click', function(e) {
                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                    }
                    
                    if (checkbox.checked) {
                        this.classList.add('checked');
                    } else {
                        this.classList.remove('checked');
                    }
                    
                    // Update APY calculation
                    updateAPYCalculation();
                });
            }
        });
        
        // Protocol selection for Safe Pool
        const protocolSelect = document.getElementById('protocol-select');
        if (protocolSelect) {
            protocolSelect.addEventListener('change', function() {
                updateSafePoolAPY(this.value);
            });
        }
        
        function updateSafePoolAPY(protocol) {
            const baseAPYElement = document.getElementById('base-apy');
            const insuranceCostElement = document.getElementById('insurance-cost');
            const protectedAPYElement = document.getElementById('protected-apy');
            
            if (!baseAPYElement) return;
            
            const protocolData = {
                'peapods': { base: 25, cost: 5, protected: 20 },
                'notional': { base: 30, cost: 5, protected: 25 },
                'flare': { base: 18, cost: 5, protected: 13 },
                'wombex': { base: 45, cost: 5, protected: 40 }
            };
            
            const data = protocolData[protocol];
            if (data) {
                baseAPYElement.textContent = `${data.base}%`;
                if (insuranceCostElement) {
                    insuranceCostElement.textContent = `-${data.cost}%`;
                }
                if (protectedAPYElement) {
                    protectedAPYElement.textContent = `${data.protected}%`;
                }
            }
        }
        
        function updateAPYCalculation() {
            const checkedBoxes = document.querySelectorAll('input[name="protocols"]:checked');
            const totalPremiumsElement = document.getElementById('total-premiums');
            const totalAPYElement = document.getElementById('total-apy');
            
            if (!totalPremiumsElement || !totalAPYElement) return;
            
            let totalPremiums = 0;
            checkedBoxes.forEach(checkbox => {
                const premium = parseInt(checkbox.dataset.premium) || 0;
                totalPremiums += premium;
            });
            
            const baseAPY = 4;
            const totalAPY = baseAPY + totalPremiums;
            
            totalPremiumsElement.textContent = `+${totalPremiums}%`;
            totalAPYElement.textContent = `${totalAPY}%`;
            
            // Update color based on risk level
            if (totalAPY > 30) {
                totalAPYElement.style.color = 'var(--error-600)';
            } else if (totalAPY > 15) {
                totalAPYElement.style.color = 'var(--warning-600)';
            } else {
                totalAPYElement.style.color = 'var(--primary-600)';
            }
        }
    }
    
    // Scroll Effects
    function setupScrollEffects() {
        const header = document.getElementById('header');
        
        if (header) {
            window.addEventListener('scroll', function() {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
        }
    }
    
    // Advanced Animations
    function setupAnimations() {
        // Animate stats on page load
        const statCards = document.querySelectorAll('.stat-card');
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        }, observerOptions);
        
        statCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease-out';
            observer.observe(card);
        });
        
        // Animate protocol cards
        const protocolCards = document.querySelectorAll('.protocol-card');
        protocolCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease-out';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 200 + index * 100);
        });
    }
    
    // Utility Functions
    function createRipple(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            pointer-events: none;
        `;
        
        // Add ripple keyframes if not already added
        if (!document.querySelector('#ripple-keyframes')) {
            const style = document.createElement('style');
            style.id = 'ripple-keyframes';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Add notification styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 2rem;
                    z-index: 10000;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 1rem;
                    padding: 1rem 1.5rem;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    max-width: 400px;
                    transform: translateX(100%);
                    transition: all 0.3s ease;
                }
                
                .notification.show {
                    transform: translateX(0);
                }
                
                .notification-success {
                    border-left: 4px solid var(--success-500);
                }
                
                .notification-error {
                    border-left: 4px solid var(--error-500);
                }
                
                .notification-info {
                    border-left: 4px solid var(--primary-500);
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .notification-icon {
                    font-size: 1.25rem;
                }
                
                .notification-message {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--gray-800);
                }
                
                .notification-close {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    background: none;
                    border: none;
                    font-size: 1.25rem;
                    cursor: pointer;
                    color: var(--gray-500);
                    width: 1.5rem;
                    height: 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .notification-close:hover {
                    color: var(--gray-700);
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
        
        // Handle close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
    
    function getNotificationIcon(type) {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    }
    
    // Add loading animation to page load
    document.body.style.opacity = '0';
    window.addEventListener('load', function() {
        document.body.style.transition = 'opacity 0.6s ease';
        document.body.style.opacity = '1';
    });
    
    // Add particle effect to floating orbs
    function createParticles() {
        const particles = [];
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: fixed;
                width: 2px;
                height: 2px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1;
            `;
            
            document.body.appendChild(particle);
            particles.push({
                element: particle,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                life: Math.random() * 100
            });
        }
        
        function animateParticles() {
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life--;
                
                if (particle.life <= 0 || particle.x < 0 || particle.x > window.innerWidth || 
                    particle.y < 0 || particle.y > window.innerHeight) {
                    particle.x = Math.random() * window.innerWidth;
                    particle.y = Math.random() * window.innerHeight;
                    particle.life = Math.random() * 100;
                }
                
                particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
                particle.element.style.opacity = particle.life / 100;
            });
            
            requestAnimationFrame(animateParticles);
        }
        
        animateParticles();
    }
    
    // Add debugging and ensure navigation works
    console.log('Navigation setup complete');
    console.log('Available pages:', document.querySelectorAll('.page'));
    console.log('Navigation items:', document.querySelectorAll('.nav-item, .action-btn, .btn'));
    
    // Handle page load hash
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (document.getElementById(hash)) {
            setTimeout(() => {
                const targetPage = document.getElementById(hash);
                if (targetPage) {
                    targetPage.style.display = 'block';
                    targetPage.classList.add('active');
                }
            }, 100);
        }
    }
    
    // Initialize particles (optional - can be commented out for better performance)
    // createParticles();
});

// Global utility functions
window.showNotification = function(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 2rem;
        z-index: 10000;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 1rem;
        padding: 1rem 1.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        max-width: 400px;
        transform: translateX(100%);
        transition: all 0.3s ease;
        border-left: 4px solid ${type === 'success' ? 'var(--success-500)' : type === 'error' ? 'var(--error-500)' : 'var(--primary-500)'};
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.25rem;">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span style="font-size: 0.875rem; font-weight: 500; color: var(--gray-800);">${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" style="position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: none; font-size: 1.25rem; cursor: pointer; color: var(--gray-500);">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
};

// Test pages on load
console.log('JavaScript loaded successfully');
console.log('Current page:', window.location.pathname);