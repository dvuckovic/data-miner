const Feed = require('feed').Feed;
const moment = require('moment');

module.exports = (json) => {
    const cities = {
        13378: 'Pristina',
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

    const feed = new Feed({
        title: "RHMZ",
        description: "Prognoza vremena za Srbiju",
        id: "http://example.com/",
        link: "http://example.com/",
        language: "sr-RS",
        image: "http://example.com/image.png",
        favicon: "http://example.com/favicon.ico",
        copyright: "© 2021 Copyright RHMZ Srbije",
        updated: new Date(2013, 6, 14),
        generator: "fcast",
        feedLinks: {
            json: "https://example.com/json",
        },
    });

    return feed.rss2();
};
