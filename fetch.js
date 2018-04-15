import fs from 'fs';
import fetch from 'node-fetch';

const REPO_DIR = './repositories';
const PACKAGE_DIR = './package';

if (!fs.existsSync(REPO_DIR)) {
  fs.mkdirSync(REPO_DIR);
}

if (!fs.existsSync(PACKAGE_DIR)) {
  fs.mkdirSync(PACKAGE_DIR);
}

const GITHUB_API_URL = 'https://api.github.com';

const ACCESS_TOKEN = 'api_key';

const QUERY = 'language:javascript+sort:stars';
const PER_PAGE = '100';
const repositories = [];

const fetchRepositories = async ({ page }) => {
  return fetch(`${GITHUB_API_URL}/search/repositories?access_token=${ACCESS_TOKEN}&q=${QUERY}&per_page=${PER_PAGE}&page=${page}`)
    .then(res => {
      if (res.ok) return res.json();
      throw new Error(`(${res.status}) ${res.statusText}`);
    })
    .then(res => {
      repositories.push(...res.items);
      saveToFile({
        filename: `${REPO_DIR}/${page.toString().padStart(2, '0')}.json`,
        data: res.items,
      });
      console.log(`Successfully fetched page ${page}`);
    })
    .catch(err => {
      throw err;
    });
}

const saveToFile = ({ filename, data }) => fs.writeFileSync(filename, JSON.stringify(data, null, 2));

const times = n => f => {
  let iter = async i => {
    if (i === n) return
    if ((await f(i)) === false) return;
    iter(i + 1)
  }
  return iter(0)
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// times(100)(async (i) => {
//   const page = i + 1;
//   try {
//     if (!fs.existsSync(`${REPO_DIR}/${page.toString().padStart(2, '0')}.json`)) {
//       await fetchRepositories({ page })
//       await sleep(1000)
//     } else {
//       console.log(`Skipping page ${page}`);
//     }
//   } catch (e) {
//     console.log(`Error at page ${page}:`, e.toString());
//     return false;
//   }
// });

fs.readdir(REPO_DIR, (err, filenames) => {
  if (err) {
    console.log('Error!', err);
    return;
  }
  filenames.forEach(filename => {
    const data = fs.readFileSync(`${REPO_DIR}/${filename}`);
    repositories.push(...JSON.parse(data));
  })

  times(repositories.length)(async (index) => {
    const repo = repositories[index];
    const number = (index + 1).toString().padStart(5, '0');
    const packageFilename = `${PACKAGE_DIR}/${repo.owner.login}.${repo.name}.package.json`;
    if (!fs.existsSync(packageFilename)) {
      await sleep(1000)
      await fetch(`${repo.url}/contents/package.json?access_token=${ACCESS_TOKEN}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error(`(${res.status}) ${res.statusText}`);
        })
        .then(res => {
          const data = JSON.parse(Buffer.from(res.content, 'base64').toString());
          saveToFile({
            filename: packageFilename,
            data,
          });
          console.log(`[${number}] package.json found: ${repo.name}`);
        })
        .catch(err => {
          console.log(`[${number}] package.json not found: ${repo.name} - ${err.message}`);
        });
      } else {
        console.log(`[${number}] Skipping: ${repo.name}`);
      }
    });
})