/**
 * PWA 아이콘 생성 스크립트
 *
 * 실행: node scripts/generate-icons.js
 *
 * 참고: 실제 배포 시에는 디자인된 아이콘 파일을 public/icons/ 에 넣어주세요.
 * 이 스크립트는 개발용 플레이스홀더 SVG 아이콘을 생성합니다.
 */

const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

function createSVGIcon(size, maskable = false) {
    const padding = maskable ? size * 0.1 : 0;
    const innerSize = size - padding * 2;
    const fontSize = Math.floor(innerSize * 0.35);
    const textY = size / 2 + fontSize * 0.35;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#FF7A00" rx="${maskable ? 0 : size * 0.15}"/>
  <text x="${size / 2}" y="${textY}" font-family="sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle">떨이</text>
</svg>`;
}

const configs = [
    { name: 'icon-192.svg', size: 192, maskable: false },
    { name: 'icon-192-maskable.svg', size: 192, maskable: true },
    { name: 'icon-512.svg', size: 512, maskable: false },
    { name: 'icon-512-maskable.svg', size: 512, maskable: true },
];

configs.forEach(({ name, size, maskable }) => {
    const svg = createSVGIcon(size, maskable);
    fs.writeFileSync(path.join(iconsDir, name), svg);
    console.log(`Generated: ${name}`);
});

console.log('\n⚠️  SVG 아이콘이 생성되었습니다.');
console.log('배포 시에는 PNG 파일(icon-192.png, icon-512.png 등)로 교체해주세요.');
console.log('SVG → PNG 변환: https://cloudconvert.com/svg-to-png');
