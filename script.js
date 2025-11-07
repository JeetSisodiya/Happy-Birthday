 
        const particleCanvas = document.getElementById('particle-canvas');
        const ctx = particleCanvas.getContext('2d');
        let particles = [];
        
        
        const particleColors = ['#ffc0cb', '#a78bfa', '#fcd34d', '#ffffff', '#a7f3d0', '#fbcfe8']; 

        function resizeCanvas() {
            particleCanvas.width = window.innerWidth;
            particleCanvas.height = window.innerHeight;
        }
        
        
        class Particle {
            constructor() {
                this.x = Math.random() * particleCanvas.width;
                this.y = Math.random() * particleCanvas.height;
                this.size = Math.random() * 2 + 1; 
                this.speedX = (Math.random() * 0.8 - 0.4) * 0.5; 
                this.speedY = (Math.random() * 0.8 - 0.4) * 0.5;
                this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
            }
            
            
            update() {
                if (this.x > particleCanvas.width || this.x < 0) {
                    this.speedX = -this.speedX;
                }
                if (this.y > particleCanvas.height || this.y < 0) {
                    this.speedY = -this.speedY;
                }
                this.x += this.speedX;
                this.y += this.speedY;
            }
            
            
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        
        function initParticles() {
            particles = [];
            let numberOfParticles = (particleCanvas.width * particleCanvas.height) / 12000; 
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        }

        
        function animateParticles() {
            ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            requestAnimationFrame(animateParticles);
        }

        
        
        const wishButton = document.getElementById('wish-button');
        const wishText = document.getElementById('wish-text');
        const originalWishText = wishText.innerText;
        const themeSelector = document.getElementById('theme-selector');
        const themeButtons = document.querySelectorAll('.theme-button');
        
        let isFirstWish = true;

        
        const apiKey = ""; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

        const systemPrompt = "You are an adorable and kind magical creature, like a fairy or a friendly pixie, writing a birthday message for a wonderful girl. Your tone is whimsical, sweet, and filled with gentle enchantment. Keep the message to a single, heartwarming sentence, max 30 words.";
        const userQuery = "Write a unique, magical, and super cute one-sentence birthday wish for my friend Vanshita. Focus on joy, dreams, and a wonderful year ahead, with a touch of sparkle.";

       
        async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
            for (let i = 0; i < retries; i++) {
                try {
                    const response = await fetch(url, options);
                    if (response.ok) {
                        return await response.json();
                    }
                    
                } catch (error) {
                    
                }
                
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
            throw new Error('API request failed after all retries.');
        }

        async function generateBirthdayWish(theme = 'general', clickedButton) {
            
            const originalButtonHTML = clickedButton.innerHTML;
            clickedButton.disabled = true;
            clickedButton.innerHTML = `<span>Granting...</span> <span class="text-xl animate-spin">💖</span>`;
            
            if(theme !== 'general') {
                wishButton.disabled = true; // Disable main button if theme is clicked
            }
            themeButtons.forEach(btn => {
                if(btn !== clickedButton) btn.disabled = true; // Disable other theme buttons
            });

            wishText.classList.add('opacity-0'); 

            let userQuery = "";
            switch (theme) {
                case 'adventure':
                    userQuery = "Write a cute and exciting one-sentence birthday wish for Vanshita, wishing her a year full of thrilling adventures and wonderful new discoveries.";
                    break;
                case 'dreams':
                    userQuery = "Write a sweet and whimsical one-sentence birthday wish for Vanshita, encouraging her to follow her dreams and reach for the stars.";
                    break;
                case 'happiness':
                    userQuery = "Write a simple, adorable, and heartwarming one-sentence birthday wish for Vanshita, focusing on pure happiness, laughter, and joy for the coming year.";
                    break;
                default:
                    userQuery = "Write a unique, magical, and super cute one-sentence birthday wish for my friend Vanshita. Focus on joy, dreams, and a wonderful year ahead, with a touch of sparkle.";
            }
            
            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
            };

            try {
                const result = await fetchWithRetry(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const candidate = result.candidates?.[0];
                if (candidate && candidate.content?.parts?.[0]?.text) {
                    const newWish = candidate.content.parts[0].text;
                    wishText.innerText = newWish;
                    
                    triggerConfetti();
                } else {
                    
                    wishText.innerText = originalWishText;
                    triggerConfetti(); 
                }
            } catch (error) {
                
                wishText.innerText = originalWishText; 
                triggerConfetti(); 
            } finally {
                clickedButton.disabled = false;
                clickedButton.innerHTML = originalButtonHTML;

                // Re-enable all buttons
                wishButton.disabled = false;
                themeButtons.forEach(btn => btn.disabled = false);

                if (isFirstWish) {
                    themeSelector.classList.remove('hidden');
                    wishButton.innerHTML = '<span>Make Another Wish!</span> <span class="text-2xl">✨</span>';
                    isFirstWish = false;
                }
                wishText.classList.remove('opacity-0'); 
            }
        }

     
        function triggerConfetti() {
            const rect = wishButton.getBoundingClientRect();
            const originX = (rect.left + rect.width / 2) / window.innerWidth;
            const originY = (rect.top + rect.height / 2) / window.innerHeight;
            
            
            const confettiColors = ['#ffc0cb', '#a78bfa', '#fcd34d', '#ffffff', '#a7f3d0', '#fbcfe8', '#ffccd5'];

            
            confetti({
                particleCount: 180, 
                spread: 100,
                startVelocity: 45, 
                origin: { x: originX, y: originY },
                colors: confettiColors,
                zIndex: 9999
            });

            
            confetti({
                particleCount: 70,
                angle: 120,
                spread: 65,
                startVelocity: 35,
                origin: { x: 1 },
                colors: confettiColors,
                zIndex: 9999
            });
        }

        
        wishButton.addEventListener('click', (e) => generateBirthdayWish('general', e.currentTarget));
        
        themeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                generateBirthdayWish(theme, e.currentTarget);
            });
        });

        
        
        
        window.addEventListener('resize', () => {
            resizeCanvas();
            initParticles();
        });

        
        resizeCanvas();
        initParticles();
        animateParticles();
 
