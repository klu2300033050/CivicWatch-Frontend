import fs from 'fs';
import path from 'path';

function replaceInDir(dir) {
    if (!fs.existsSync(dir)) return;
    const stat = fs.statSync(dir);
    if (stat.isFile()) {
        processFile(dir);
    } else if (stat.isDirectory()) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            replaceInDir(path.join(dir, file));
        }
    }
}

function processFile(fullPath) {
    if (fullPath.match(/\.(tsx|ts|html)$/)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let original = content;
        content = content
            .replace(/CivicReport/g, 'CivicWatch')
            .replace(/Civic-Issue-Reporter/g, 'CivicWatch')
            .replace(/civic-issue-reporter/g, 'civicwatch')
            .replace(/civic-issue/g, 'civicwatch')
            .replace(/civicIssueLogo/g, 'civicWatchLogo')
            .replace(/Building Better Communities/g, 'Transparency & Action');

        if (content !== original) {
            fs.writeFileSync(fullPath, content);
            console.log(`Updated ${fullPath}`);
        }
    }
}

replaceInDir('./src');
replaceInDir('./index.html');
