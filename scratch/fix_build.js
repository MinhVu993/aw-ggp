const fs = require('fs');

const filesToFixImports = [
  'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\(main)\\components\\ActionDropdown.tsx',
  'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\guard\\components\\QRScanner.tsx',
  'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\guard\\components\\RequestDetailsPanel.tsx',
  'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\(main)\\components\\ConfirmModal.tsx',
  'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\(main)\\components\\HistoryModal.tsx',
  'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\(main)\\components\\CreateRequestDrawer.tsx',
  'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\(main)\\components\\DetailRequestDrawer.tsx',
  'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\(main)\\components\\RejectModal.tsx',
];

filesToFixImports.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix "use client" issue
    if (content.includes('import { useTranslation }') && content.includes('"use client";')) {
      if (content.indexOf('"use client";') > content.indexOf('import { useTranslation }')) {
        content = content.replace('"use client";', '');
        content = '"use client";\n' + content;
      }
    }

    // Fix multiple 't' declarations in ConfirmModal
    if (file.includes('ConfirmModal.tsx') || file.includes('HistoryModal.tsx')) {
       // Since 't' is passed as a prop, we don't need `const { t } = useTranslation();` inside.
       // However, we might just remove `t` from props or remove `const { t }`.
       // The error says "the name 't' is defined multiple times". 
       // Removing `const { t } = useTranslation();` inside the component is safest if it's already passed as a prop.
       content = content.replace('const { t } = useTranslation();', '');
    }

    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('Fixed build errors.');
