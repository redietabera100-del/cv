import { copyFileSync, rmSync } from 'node:fs';

copyFileSync(new URL('../build/index.html', import.meta.url), new URL('../index.html', import.meta.url));
rmSync(new URL('../build', import.meta.url), { recursive: true, force: true });
