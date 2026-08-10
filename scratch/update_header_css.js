const fs = require('fs');

const headerCssPath = 'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\components\\layout\\Header.module.css';
let content = fs.readFileSync(headerCssPath, 'utf8');

content = content.replace('justify-content: flex-end;', 'justify-content: space-between;');

const logoStyles = `
.logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.logoIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 56px;
    width: 68px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.logoImg {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.logoText {
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--text-primary);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    white-space: normal;
    line-height: 1.3;
}
`;

content = content + '\n' + logoStyles;
fs.writeFileSync(headerCssPath, content, 'utf8');
console.log("Updated Header.module.css successfully.");
