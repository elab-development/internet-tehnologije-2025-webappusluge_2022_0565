import { getSwaggerSpec } from '../lib/swagger';
import fs from 'fs';
import path from 'path';

const spec = getSwaggerSpec();
const outputPath = path.join(process.cwd(), 'public', 'swagger.json');
fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2));
console.log('Swagger JSON generated successfully at', outputPath);
