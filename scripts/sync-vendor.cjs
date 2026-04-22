const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const vendorDir = path.join(projectRoot, 'vendor');

const files = [
    {
        from: path.join(projectRoot, 'node_modules', 'animejs', 'lib', 'anime.min.js'),
        to: path.join(vendorDir, 'anime.min.js')
    },
    {
        from: path.join(projectRoot, 'node_modules', 'lottie-web', 'build', 'player', 'lottie.min.js'),
        to: path.join(vendorDir, 'lottie.min.js')
    },
    {
        from: path.join(projectRoot, 'node_modules', 'peerjs', 'dist', 'peerjs.min.js'),
        to: path.join(vendorDir, 'peerjs.min.js')
    }
];

fs.mkdirSync(vendorDir, { recursive: true });

for (const file of files) {
    if (!fs.existsSync(file.from)) {
        throw new Error(`File tidak ditemukan: ${file.from}`);
    }
    fs.copyFileSync(file.from, file.to);
    console.log(`Copied: ${path.relative(projectRoot, file.to)}`);
}
