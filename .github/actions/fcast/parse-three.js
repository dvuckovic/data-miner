const moment = require('moment');

module.exports = (body) => {
    const data = {};
    let error_code;

    let regex = new RegExp(''
        + '<tfoot>\\s+'
            + '<tr>\\s+'
                + '<td class="levo" colspan="10">'
                    + 'Прогноза ажурирана: &nbsp;\\s?([0-9\\.]+) ([0-9\\:]+)'
                + '<\\/td>\\s+'
            + '<\\/tr>\\s+'
        + '<\\/tfoot>',
        'ims'
    );
    if (!regex.test(body)) error_code = 3; // Update timestamp not found

    let match = body.match(regex);

    const dateTime = moment(`${match[1]} ${match[2]}`, 'DD.MM. HH:mm');
    const date = dateTime.format('YYYY-MM-DD');
    const time = dateTime.format('HH:mm');

    regex = new RegExp(''
        + '<tr>\\s+'
            + '<th>&nbsp;<\\/th>\\s+'
            + '<th colspan="[2|3]" style="font-size:13px; line-height:1\\.3;">'
                + '.*?([0-9\\.]+).*?'
            + '<\\/th>\\s+'
            + '<th colspan="3" style="font-size:13px; line-height:1\\.3;">'
                + '.*?([0-9\\.]+).*?'
            + '<\\/th>\\s+'
            + '<th colspan="3" style="font-size:13px; line-height:1\\.3;">'
                + '.*?([0-9\\.]+).*?'
            + '<\\/th>\\s+'
        + '<\\/tr>',
        'ims'
    );

    const days = [];

    if (regex.test(body)) {
        match = body.match(regex);

        days.push(
            { date: moment(match[1], 'DD.MM.').format('YYYY-MM-DD') },
            { date: moment(match[2], 'DD.MM.').format('YYYY-MM-DD') },
            { date: moment(match[3], 'DD.MM.').format('YYYY-MM-DD') },
        );
    }
    else {
        regex = new RegExp(''
            + '\\s*<tr>\\s+'
                + '<th>'
                    + '&nbsp;'
                + '<\\/th>\\s+'
                + '<th colspan="[2|3]" style="font-size:13px; line-height:1\\.3;">'
                    + '.*?([0-9\\.]+).*?'
                + '<\\/th>\\s+'
                + '<th colspan="3" style="font-size:13px; line-height:1\\.3;">'
                    + '.*?([0-9\\.]+).*?'
                + '<\\/th>\\s+'
            + '<\\/tr>',
            'ims'
        );
        if (!regex.test(body)) error_code = 3; // Date columns not found

        days.push(
            { date: moment(match[1], 'DD.MM.').format('YYYY-MM-DD') },
            { date: moment(match[2], 'DD.MM.').format('YYYY-MM-DD') },
        );
    }

    const cities = {
        13378: '&#1055;&#1088;&#1080;&#1096;&#1090;&#1080;&#1085;&#1072;', // Pristina
        13295: '&#1053;&#1077;&#1075;&#1086;&#1090;&#1080;&#1085;', // Negotin
        13274: '&#1041;&#1077;&#1086;&#1075;&#1088;&#1072;&#1076;', // Belgrade
        13067: '&#1055;&#1072;&#1083;&#1080;&#1115;', // Palić
        13262: '&#1051;&#1086;&#1079;&#1085;&#1080;&#1094;&#1072;', // Loznica
        13168: '&#1053;&#1086;&#1074;&#1080; &#1057;&#1072;&#1076;', // Novi Sad
        13388: '&#1053;&#1080;&#1096;', // Niš
        13278: '&#1050;&#1088;&#1072;&#1075;&#1091;&#1112;&#1077;&#1074;&#1072;&#1094;', // Kragujevac
        13376: '&#1050;&#1088;&#1072;&#1113;&#1077;&#1074;&#1086;', // Kraljevo
        13367: '&#1047;&#1083;&#1072;&#1090;&#1080;&#1073;&#1086;&#1088;', // Zlatibor
        // 13379: '&#1050;&#1086;&#1087;&#1072;&#1086;&#1085;&#1080;&#1082;', // Kopaonik
    };

    Object.entries(cities).forEach(([cityId, cityStr]) => {

        // 2 days, w/o tmin
        regex = new RegExp(''
            + '<tr>\\s*'
                + '<td class="[bela|siva]+75(?: levo)?" style="font-size:13px; line-height:1\\.3;(?: text-align:left;)?">'
                    + `&nbsp;${cityStr}`
                + '<\\/td>\\s*'
                + '<td class="[bela|siva]+75" style="font-size:13px;">'
                    + '([0-9\\-]+)'
                + '<\\/td>\\s*'
                    + '<td class="[bela|siva]+75" style="font-size:13px;">'
                        + '<img src="\\.\\.\\/\\.\\.\\/repository\\/ikonice\\/prognoza\\/([0-9]+)\\.gif" alt="[Појава|Phenomenon]+" \\/>'
                    + '<\\/td>\s*'
                + '<td class="[bela|siva]+75" style="font-size:13px;">'
                    + '([0-9\\-]+)'
                + '<\\/td>\\s*'
                + '<td class="[bela|siva]+75" style="font-size:13px;">'
                    + '([0-9\\-]+)'
                + '<\\/td>\\s*'
                + '<td class="[bela|siva]+75" style="font-size:13px;">'
                    + '<img src="\\.\\.\\/\\.\\.\\/repository\\/ikonice\\/prognoza\\/([0-9]+)\\.gif" alt="[Појава|Phenomenon]+" \\/>'
                + '<\\/td>\\s*'
            + '<\\/tr>',
            'ims'
        );

        if (regex.test(body)) {
            match = body.match(regex);

            data[cityId] = {
                date,
                time,
                days: days.length,
                day1: {
                    tmin: null,
                    tmax: match[1],
                    type: match[2],
                    ...days[0],
                },
                day2: {
                    tmin: match[3],
                    tmax: match[4],
                    type: match[5],
                    ...days[1],
                },
            };
        }
        else {
            // 2 days, w/ tmin
            regex = new RegExp(''
                + '<tr>\\s*'
                    + '<td class="[bela|siva]+75(?: levo)?" style="font-size:13px; line-height:1\\.3;(?: text-align:left;)?">'
                        + `&nbsp;${cityStr}`
                    + '<\\/td>\\s*'
                    + '<td class="[bela|siva]+75" style="font-size:13px;">'
                        + '([0-9\\-]+)'
                    + '<\\/td>\\s*'
                    + '<td class="[bela|siva]+75" style="font-size:13px;">'
                        + '([0-9\\-]+)'
                    + '<\\/td>\\s*'
                        + '<td class="[bela|siva]+75" style="font-size:13px;">'
                            + '<img src="\\.\\.\\/\\.\\.\\/repository\\/ikonice\\/prognoza\\/([0-9]+)\\.gif" alt="[Појава|Phenomenon]+" \\/>'
                        + '<\\/td>\s*'
                    + '<td class="[bela|siva]+75" style="font-size:13px;">'
                        + '([0-9\\-]+)'
                    + '<\\/td>\\s*'
                    + '<td class="[bela|siva]+75" style="font-size:13px;">'
                        + '([0-9\\-]+)'
                    + '<\\/td>\\s*'
                    + '<td class="[bela|siva]+75" style="font-size:13px;">'
                        + '<img src="\\.\\.\\/\\.\\.\\/repository\\/ikonice\\/prognoza\\/([0-9]+)\\.gif" alt="[Појава|Phenomenon]+" \\/>'
                    + '<\\/td>\\s*'
                + '<\\/tr>',
                'ims'
            );

            if (regex.test(body)) {
                match = body.match(regex);

                data[cityId] = {
                    date,
                    time,
                    days: days.length,
                    day1: {
                        tmin: match[1],
                        tmax: match[2],
                        type: match[3],
                        ...days[0],
                    },
                    day2: {
                        tmin: match[4],
                        tmax: match[5],
                        type: match[6],
                        ...days[1],
                    },
                };
            }
            else {
                // 3 days, w/o tmin
                regex = new RegExp(''
                    + '<tr>\\s*'
                        + '<td class="[bela|siva]+75(?: levo)?" style="font-size:13px; line-height:1\\.3;(?: text-align:left;)?">'
                            + `&nbsp;${cityStr}`
                        + '<\\/td>\\s*'
                        + '<td class="[bela|siva]+75" style="font-size:13px;">'
                            + '([0-9\\-]+)'
                        + '<\\/td>\\s*'
                            + '<td class="[bela|siva]+75" style="font-size:13px;">'
                                + '<img src="\\.\\.\\/\\.\\.\\/repository\\/ikonice\\/prognoza\\/([0-9]+)\\.gif" alt="[Појава|Phenomenon]+" \\/>'
                            + '<\\/td>\s*'
                        + '<td class="[bela|siva]+75" style="font-size:13px;">'
                            + '([0-9\\-]+)'
                        + '<\\/td>\\s*'
                        + '<td class="[bela|siva]+75" style="font-size:13px;">'
                            + '([0-9\\-]+)'
                        + '<\\/td>\\s*'
                        + '<td class="[bela|siva]+75" style="font-size:13px;">'
                            + '<img src="\\.\\.\\/\\.\\.\\/repository\\/ikonice\\/prognoza\\/([0-9]+)\\.gif" alt="[Појава|Phenomenon]+" \\/>'
                        + '<\\/td>\\s*'
                        + '<td class="[bela|siva]+75" style="font-size:13px;">'
                            + '([0-9\\-]+)'
                        + '<\\/td>\\s*'
                        + '<td class="[bela|siva]+75" style="font-size:13px;">'
                            + '([0-9\\-]+)'
                        + '<\\/td>\\s*'
                        + '<td class="[bela|siva]+75" style="font-size:13px;">'
                            + '<img src="\\.\\.\\/\\.\\.\\/repository\\/ikonice\\/prognoza\\/([0-9]+)\\.gif" alt="[Појава|Phenomenon]+" \\/>'
                        + '<\\/td>\\s*'
                    + '<\\/tr>',
                    'ims'
                );

                if (regex.test(body)) {
                    match = body.match(regex);

                    data[cityId] = {
                        date,
                        time,
                        days: days.length,
                        day1: {
                            tmin: null,
                            tmax: match[1],
                            type: match[2],
                            ...days[0],
                        },
                        day2: {
                            tmin: match[3],
                            tmax: match[4],
                            type: match[5],
                            ...days[1],
                        },
                        day3: {
                            tmin: match[6],
                            tmax: match[7],
                            type: match[8],
                            ...days[2],
                        },
                    };
                }
                else {
                    // 3 days, w/ tmin
                    regex = new RegExp(''
                        + '<tr>\\s*'
                            + '<td class="[bela|siva]+75(?: levo)?" style="font-size:13px; line-height:1\\.3;(?: text-align:left;)?">'
                                + `&nbsp;${cityStr}`
                            + '<\\/td>\\s*'
                            + '<td class="[bela|siva]+75" style="font-size:13px;">'
                                + '([0-9\\-]+)'
                            + '<\\/td>\\s*'
                            + '<td class="[bela|siva]+75" style="font-size:13px;">'
                                + '([0-9\\-]+)'
                            + '<\\/td>\\s*'
                                + '<td class="[bela|siva]+75" style="font-size:13px;">'
                                    + '<img src="\\.\\.\\/\\.\\.\\/repository\\/ikonice\\/prognoza\\/([0-9]+)\\.gif" alt="[Појава|Phenomenon]+" \\/>'
                                + '<\\/td>\s*'
                            + '<td class="[bela|siva]+75" style="font-size:13px;">'
                                + '([0-9\\-]+)'
                            + '<\\/td>\\s*'
                            + '<td class="[bela|siva]+75" style="font-size:13px;">'
                                + '([0-9\\-]+)'
                            + '<\\/td>\\s*'
                            + '<td class="[bela|siva]+75" style="font-size:13px;">'
                                + '<img src="\\.\\.\\/\\.\\.\\/repository\\/ikonice\\/prognoza\\/([0-9]+)\\.gif" alt="[Појава|Phenomenon]+" \\/>'
                            + '<\\/td>\\s*'
                            + '<td class="[bela|siva]+75" style="font-size:13px;">'
                                + '([0-9\\-]+)'
                            + '<\\/td>\\s*'
                            + '<td class="[bela|siva]+75" style="font-size:13px;">'
                                + '([0-9\\-]+)'
                            + '<\\/td>\\s*'
                            + '<td class="[bela|siva]+75" style="font-size:13px;">'
                                + '<img src="\\.\\.\\/\\.\\.\\/repository\\/ikonice\\/prognoza\\/([0-9]+)\\.gif" alt="[Појава|Phenomenon]+" \\/>'
                            + '<\\/td>\\s*'
                        + '<\\/tr>',
                        'ims'
                    );
                    if (!regex.test(body)) error_code = 4; // Forecast columns not found

                    match = body.match(regex);

                    data[cityId] = {
                        date,
                        time,
                        days: days.length,
                        day1: {
                            tmin: match[1],
                            tmax: match[2],
                            type: match[3],
                            ...days[0],
                        },
                        day2: {
                            tmin: match[4],
                            tmax: match[5],
                            type: match[6],
                            ...days[1],
                        },
                        day3: {
                            tmin: match[7],
                            tmax: match[8],
                            type: match[9],
                            ...days[2],
                        },
                    };
                }
            }
        }
    });

    if (error_code) return {
        status: 'not_ok',
        e: error_code,
    };

    return {
        status: 'ok',
        data,
    };
};
