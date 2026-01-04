// Run this once to generate a scorch mark texture

const createScorchTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Create radial gradient for scorch mark
  const gradient = ctx.createRadialGradient(
    256, 256, 50,   // Inner circle
    256, 256, 200   // Outer circle
  );
  
  // Define gradient colors
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');     // Center: almost black
  gradient.addColorStop(0.6, 'rgba(30, 30, 30, 0.7)'); // Mid: dark gray
  gradient.addColorStop(0.8, 'rgba(40, 30, 20, 0.3)'); // Outer: brown/gray
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');       // Edge: transparent
  
  // Apply gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  
  // Add some noise/irregularity
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const radius = Math.random() * 20 + 5;
    const distanceFromCenter = Math.sqrt(
      Math.pow(x - 256, 2) + Math.pow(y - 256, 2)
    );
    
    if (distanceFromCenter < 240) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.5})`;
      ctx.fill();
    }
  }
  
  // Save the texture to a file
  const dataURL = canvas.toDataURL('image/png');
  
  // Create download link
  const link = document.createElement('a');
  link.download = 'scorch-mark.png';
  link.href = dataURL;
  link.click();
};