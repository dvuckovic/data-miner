const Feed = require('feed').Feed;
const md5 = require('md5');
const moment = require('moment');

module.exports = (json) => {
    const feed = new Feed({
        title: 'RHMZ',
        description: 'Weather Forecast for Serbia',
        id: 'https://data.dvuckovic.com/fcast3.xml',
        link: 'https://data.dvuckovic.com/fcast3.xml',
        language: 'sr-RS',
        image: 'https://cdn.dvuckovic.com/images/rhmz-srbije.gif',
        favicon: 'http://www.hidmet.gov.rs/favicon.ico',
        copyright: '© 2021 Copyright RHMZ Serbia',
        updated: moment().toDate(),
        generator: 'fcast',
        feedLinks: {
            json: 'https://data.dvuckovic.com/fcast3.json',
        },
    });

    if (json.success === 'not_ok') {
        feed.addItem({
            title: 'Error',
            id: md5(moment()),
            date: moment().toDate(),
            description: `Error: ${json.e}`,
        });
    }
    else {
        const types = [
            'Unknown',
            'No clouds',
            'Sunny',
            'Mostly sunny',
            'Partly cloudy',
            'After noon rain showers',
            'Possible rain showers',
            'Cloudy',
            'Possible rain',
            'Rain',
            'Mostly cloudy',
            'Rain showers',
            'Showers and thunder storm',
            'Rain and snow mixed',
            'Possible snow',
            'Snow',
            'Freezing rain',
            'Fog',
            'Wind gusts',
            'Possible after noon rain',
            'Storms',
        ];

        const cities = {
            13378: 'Priština',
            13295: 'Negotin',
            13274: 'Belgrade',
            13067: 'Palić',
            13262: 'Loznica',
            13168: 'Novi Sad',
            13388: 'Niš',
            13278: 'Kragujevac',
            13376: 'Kraljevo',
            13367: 'Zlatibor',
            // 13379: 'Kopaonik',
        };

        Object.entries(cities).forEach(([cityId, cityStr]) => {
            const data = json.data[cityId];
            const desc = [];

            for (let i = 1; i <= data.days; i++) {
                desc.push(`<strong>${moment(data[`day${i}`].date, 'YYYY-MM-DD').format('ddd D MMM')}</strong>`);
                desc.push(types[data[`day${i}`].type]);
                if (data[`day${i}`].tmin) desc.push(`Min: ${data[`day${i}`].tmin}°C`);
                desc.push(`Max: ${data[`day${i}`].tmax}°C`);
                desc.push('');
            }

            feed.addItem({
                title: cityStr,
                id: md5(cityId),
                date: moment(`${data.date} ${data.time}`, 'YYYY-MM-DD HH:mm').toDate(),
                description: desc.join('<br>\n'),
            });
        });
    }

    return feed.rss2();
};
