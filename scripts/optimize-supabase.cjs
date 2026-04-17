const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const workDir = path.join(__dirname, '../public/models/temp');

if (!fs.existsSync(workDir)) {
    fs.mkdirSync(workDir, { recursive: true });
}

async function run() {
    console.log('Fetching world_config...');
    const { data: configData } = await supabase.from('world_config').select('config').limit(1);
    if (!configData || !configData[0]) return console.log('No world config found.');

    const customModels = configData[0].config.customModels || [];
    console.log(`Found ${customModels.length} models to optimize in Supabase.`);

    for (const model of customModels) {
        const url = model.src;
        if (!url.includes('supabase.co')) continue; // Skip local models if any
        
        // Example URL: https://.../models/1776324106562_Campfire.glb
        const filename = url.split('/').pop();
        const localRawPath = path.join(workDir, filename);
        const localOptPath = path.join(workDir, filename.replace('.glb', '_opt.glb'));

        console.log(`\n--- Processing ${filename} ---`);
        
        // 1. Download file
        console.log(`Downloading ${filename}...`);
        const { data: fileData, error: downloadError } = await supabase.storage.from('models').download(filename);
        if (downloadError) {
            console.error('Download failed:', downloadError.message);
            continue;
        }
        const buffer = Buffer.from(await fileData.arrayBuffer());
        fs.writeFileSync(localRawPath, buffer);
        console.log(`Downloaded size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

        // 2. Compress
        console.log(`Compressing... this may take a moment.`);
        try {
            execSync(`npx @gltf-transform/cli optimize "${localRawPath}" "${localOptPath}" --texture-compress webp`, { stdio: 'inherit' });
            const oldSize = fs.statSync(localRawPath).size;
            const newSize = fs.statSync(localOptPath).size;
            console.log(`Compression ratio: ${(newSize / oldSize * 100).toFixed(1)}%`);
        } catch (e) {
            console.error('Compression failed for', filename);
            continue;
        }

        // 3. Upload (Overwrite)
        console.log(`Uploading optimized ${filename} back to Supabase...`);
        const optBuffer = fs.readFileSync(localOptPath);
        const { error: uploadError } = await supabase.storage.from('models').upload(filename, optBuffer, {
            contentType: 'model/gltf-binary',
            upsert: true
        });

        if (uploadError) {
            console.error('Upload failed:', uploadError.message);
        } else {
            console.log(`✅ Uploaded optimized ${filename} successfully!`);
        }
    }

    console.log('\n🎉 All Supabase models have been optimized.');
}

run();
