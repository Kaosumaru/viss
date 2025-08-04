#!/usr/bin/env node

/**
 * Build script for integrating VShader graph editor with VS Code extension
 * 
 * This script helps automate the process of building and integrating your
 * VShader graph editor with the VS Code extension.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EXTENSION_DIR = __dirname;
const VSHADER_DIR = path.resolve(EXTENSION_DIR, '..');
const MEDIA_DIR = path.join(EXTENSION_DIR, 'media');

console.log('🔧 VShader VS Code Extension Build Script');
console.log('==========================================');

function runCommand(command, description) {
    console.log(`\n📦 ${description}...`);
    try {
        execSync(command, { stdio: 'inherit', cwd: EXTENSION_DIR });
        console.log(`✅ ${description} completed successfully`);
    } catch (error) {
        console.error(`❌ ${description} failed:`, error.message);
        process.exit(1);
    }
}

function copyFile(src, dest, description) {
    console.log(`\n📋 ${description}...`);
    try {
        fs.copyFileSync(src, dest);
        console.log(`✅ ${description} completed successfully`);
    } catch (error) {
        console.error(`❌ ${description} failed:`, error.message);
    }
}

function main() {
    console.log('\n1. Building VShader project...');
    
    // Check if VShader build exists
    if (fs.existsSync(path.join(VSHADER_DIR, 'dist'))) {
        console.log('📁 Found existing VShader build in dist/');
        
        // TODO: Copy built assets to extension media directory
        // This will depend on your build output structure
        
        const distFiles = [
            'assets/index.js',      // Main bundle
            'assets/index.css',     // Styles
            // Add other necessary files
        ].map(file => path.join(VSHADER_DIR, 'dist', file));
        
        distFiles.forEach((srcFile, index) => {
            const fileName = path.basename(srcFile);
            const destFile = path.join(MEDIA_DIR, `vshader-${fileName}`);
            
            if (fs.existsSync(srcFile)) {
                copyFile(srcFile, destFile, `Copying ${fileName}`);
            } else {
                console.log(`⚠️  File not found: ${srcFile}`);
            }
        });
    } else {
        console.log('⚠️  VShader build not found. Please run your build process first.');
        console.log('   Typical commands might be:');
        console.log('   - npm run build');
        console.log('   - npm run build:prod');
        console.log('   - vite build');
    }
    
    console.log('\n2. Building VS Code extension...');
    runCommand('npm run compile', 'Compiling extension TypeScript');
    
    console.log('\n3. Integration status:');
    console.log('======================');
    
    const requiredFiles = [
        { file: 'media/vshader-editor.js', status: fs.existsSync(path.join(EXTENSION_DIR, 'media/vshader-editor.js')) },
        { file: 'media/vshader-editor.css', status: fs.existsSync(path.join(EXTENSION_DIR, 'media/vshader-editor.css')) },
        { file: 'out/extension.js', status: fs.existsSync(path.join(EXTENSION_DIR, 'out/extension.js')) },
        { file: 'out/vshaderGraphEditorProvider.js', status: fs.existsSync(path.join(EXTENSION_DIR, 'out/vshaderGraphEditorProvider.js')) },
    ];
    
    requiredFiles.forEach(({ file, status }) => {
        console.log(`${status ? '✅' : '❌'} ${file}`);
    });
    
    console.log('\n4. Next steps:');
    console.log('==============');
    if (requiredFiles.every(f => f.status)) {
        console.log('✅ Extension is ready for testing!');
        console.log('   1. Open VS Code');
        console.log('   2. Press F5 to launch Extension Development Host');
        console.log('   3. Open a .vgraph file');
    } else {
        console.log('⚠️  Some files are missing. Please check the integration:');
        console.log('   1. Make sure your VShader project builds successfully');
        console.log('   2. Update media/vshader-editor.js to import your editor');
        console.log('   3. Run this script again');
    }
    
    console.log('\n📖 For detailed integration instructions, see README.md');
}

// Run the build script
main();
