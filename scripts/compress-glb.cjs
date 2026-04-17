const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../public/models');

const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.glb') && !f.endsWith('_opt.glb') && !f.endsWith('_draco.glb'));

console.log(`Found ${files.length} models to optimize...`);

files.forEach(file => {
    const input = path.join(modelsDir, file);
    const output = path.join(modelsDir, file.replace('.glb', '_opt.glb'));
    
    console.log(`Optimizing ${file}...`);
    try {
        // Run gltf-transform to compress geometry and textures
        execSync(`npx @gltf-transform/cli optimize "${input}" "${output}" --compress draco --texture-compress webp`, { stdio: 'inherit' });
        
        const oldSize = (fs.statSync(input).size / 1024 / 1024).toFixed(2);
        const newSize = (fs.statSync(output).size / 1024 / 1024).toFixed(2);
        console.log(`✅ Success: ${file} (${oldSize}MB -> ${newSize}MB)`);
    } catch (e) {
        console.error(`❌ Failed to optimize ${file}`);
    }
});
