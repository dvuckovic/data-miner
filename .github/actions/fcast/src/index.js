const core = require('@actions/core');
const fetch = require('node-fetch');

const parseThree = require('./parse-three');
const generateFeed = require('./generate-feed');

try {
    const fetchUrl = core.getInput('fetch-url');

    core.info(`Fetching forecast from ${fetchUrl} ...`);

    fetch(fetchUrl)
        .then(res => {
            if (res.ok) return res.text();
            core.setFailed(res.statusText);
        })
        .then(body => {
            const json = parseThree(body);

            if (json.status === 'not_ok') {
                core.warning('Parsing exception...');
                core.warning(`e: ${json.e}`);
                core.startGroup('Source');
                core.info(body);
                core.endGroup();
            }

            const xml = generateFeed(json);

            core.setOutput('json', json);
            core.setOutput('xml', xml);

            core.info('Done.');
        })
        .catch(error => {
            core.setFailed(error.message);
        });
}
catch (error) {
    core.setFailed(error.message);
}
