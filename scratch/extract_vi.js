const fs = require('fs');
const path = require('path');

const directories = [
  'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\(main)',
  'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\(main)\\components',
  'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\guard',
  'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\guard\\components'
];

const vietnameseRegex = /[àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹýÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ]/;

let results = "";

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          if (vietnameseRegex.test(line) && !line.trim().startsWith('//')) {
            results += `${file}:${index + 1}: ${line.trim()}\n`;
          }
        });
      }
    });
  }
});

fs.writeFileSync('c:\\Users\\vu.huynh\\Desktop\\GGP\\scratch\\vi_strings.txt', results);
console.log('Done extracting Vietnamese strings.');
