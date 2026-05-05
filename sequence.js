document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('sequence-canvas');
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    const frameCount = 192;
    const currentFrame = index => (`frames/frame_${index.toString().padStart(4, '0')}.webp`);

    const images = [];
    
    canvas.width = 1280;
    canvas.height = 720;
    
    const firstImg = new Image();
    firstImg.src = currentFrame(0);
    firstImg.onload = () => {
        context.drawImage(firstImg, 0, 0, canvas.width, canvas.height);
    };
    images[0] = firstImg;

    let loadedCount = 1;
    for (let i = 1; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        img.onload = () => {
            loadedCount++;
        };
        images.push(img);
    }

    const section = document.getElementById('scroll-sequence');
    let lastFrameIndex = 0;
    let animationFrameId = null;

    window.addEventListener('scroll', () => {
        const rect = section.getBoundingClientRect();
        
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;

        const maxScroll = rect.height - window.innerHeight;
        
        let scrollProgress = -rect.top / maxScroll;
        if (scrollProgress < 0) scrollProgress = 0;
        if (scrollProgress > 1) scrollProgress = 1;

        const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(scrollProgress * frameCount)
        );

        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(() => {
            if (frameIndex !== lastFrameIndex && images[frameIndex] && images[frameIndex].complete) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(images[frameIndex], 0, 0, canvas.width, canvas.height);
                lastFrameIndex = frameIndex;
            }
        });
    }, { passive: true });
});
