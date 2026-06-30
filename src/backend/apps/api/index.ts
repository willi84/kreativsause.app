import { command } from '../../_shared/cmd/cmd';
import { FS } from '../../_shared/fs/fs';
import { LOG } from '../../_shared/log/log';

console.log('Hello API');
const URL = 'https://willi84.github.io/kreativsause-api/workshops.json';
const FILE = 'src/_data/workshops.json';
const main = () => {
    const data = command(`curl -s ${URL}`);
    const workshops = JSON.parse(data);
    FS.writeFile(FILE, JSON.stringify(workshops, null, 2));
    LOG.OK(`Fetched ${workshops.length} workshops from ${URL} and saved to ${FILE}`);
}

main();