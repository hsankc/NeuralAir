const fs = require('fs');

const filePath = 'src/app/marketplace/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace ternary string matches
content = content.replace(/locale === "en" \? ("[^"]*") : "[^"]*"/g, '$1');

// Replace ternary text matches outside strings but inside JSX
// e.g. {locale === "en" ? "Take Mission" : "Görevi Al"}
content = content.replace(/\{locale === "en" \? ("[^"]*") : "[^"]*"\}/g, '$1');

// And remove any remaining missionTypeLabels(locale)
content = content.replace(/missionTypeLabels\(locale\)/g, 'missionTypeLabels("en")');

fs.writeFileSync(filePath, content);
console.log('Done!');
