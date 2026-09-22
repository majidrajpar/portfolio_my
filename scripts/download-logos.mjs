import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const logos = [
  {
    name: 'kitopi.png',
    url: 'https://tadasj.com/assets/kitopi-logo-rebrand-v-qRU7B_.png'
  },
  {
    name: 'al-faisaliah.png',
    url: 'https://www.alfaisaliah.com/images/afg-logo.png'
  },
  {
    name: 'mcdonalds.svg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg'
  },
  {
    name: 'bma.png',
    url: 'https://bmainvests.com/images/bma-advisory-finalized-04.png'
  },
  {
    name: 'ey.svg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/34/EY_logo_2019.svg'
  },
  {
    name: 'kpmg.svg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/31/KPMG.svg'
  }
];

const destDir = path.resolve('public/images/logos');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Saved ${dest}`);
        resolve();
      });
    });
    req.on('error', reject);
  });
}

async function run() {
  for (const item of logos) {
    const dest = path.join(destDir, item.name);
    try {
      await downloadFile(item.url, dest);
    } catch (err) {
      console.error(`Error downloading ${item.name}:`, err.message);
    }
  }
}

run();
