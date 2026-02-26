const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./app');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // API Route params signature
    content = content.replace(/\{ params \}: \{ params: \{ ([a-zA-Z]+): string \} \}/g, '{ params }: { params: Promise<{ $1: string }> }');

    // Component params signature
    content = content.replace(/\{ params \}: \{\s*params:\s*\{\s*([a-zA-Z]+):\s*string\s*\}\s*\}/g, '{ params }: { params: Promise<{ $1: string }> }');
    content = content.replace(/params:\s*\{\s*([a-zA-Z]+):\s*string\s*\}/g, 'params: Promise<{ $1: string }>');

    // Usages
    content = content.replace(/params\.id/g, '(await params).id');
    content = content.replace(/params\.slug/g, '(await params).slug');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});
