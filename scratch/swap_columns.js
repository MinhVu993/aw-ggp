const fs = require('fs');

const filePath = 'c:\\Users\\vu.huynh\\Desktop\\GGP\\src\\app\\requests\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// The headers to swap are from line 1070 to 1306 (inclusive, 1-indexed)
// Current order: Destination (1070-1148), Items (1149-1227), Requester (1228-1306)
// Desired order: Requester, Items, Destination

const destHeader = lines.slice(1069, 1148);
const itemsHeader = lines.slice(1148, 1227);
const reqHeader = lines.slice(1227, 1306);

const newHeaders = [...reqHeader, ...itemsHeader, ...destHeader];
lines.splice(1069, 1306 - 1069, ...newHeaders);

// The body td to swap are from line 1411 to 1444
// Current order: Destination (1411-1415), Items (1416-1436), Requester (1437-1444)
// Desired order: Requester, Items, Destination

// Because we didn't change the number of lines above, the line numbers for the body td stay exactly the same.
const destTd = lines.slice(1410, 1415);
const itemsTd = lines.slice(1415, 1436);
const reqTd = lines.slice(1436, 1444);

const newTds = [...reqTd, ...itemsTd, ...destTd];
lines.splice(1410, 1444 - 1410, ...newTds);

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log("Successfully swapped columns!");
