const core = require('@actions/core');
const fetch = require('node-fetch');

const parseThree = require('./parse-three');
const generateFeed = require('./generate-feed');

try {
    const fetchUrl = core.getInput('fetch-url');

    console.log(`Fetching from ${fetchUrl} ...`);

    fetch(fetchUrl)
        .then(res => {
            if (res.ok) return res.text();
            core.setFailed(res.statusText);
        })
        .then(body => {
            const json = parseThree(body);
            const xml = generateFeed(json);

            core.setOutput('json', json);
            core.setOutput('xml', xml);

            console.log('Done.');
        })
        .catch(error => {
            core.setFailed(error.message);
        });
}
catch (error) {
    core.setFailed(error.message);
}
