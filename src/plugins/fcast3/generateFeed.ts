import { Feed } from 'feed'
import md5 from 'md5'
import dayjs from 'dayjs'

import type { Day, Result } from './parseThree'

const generateFeed = (json: Result) => {
  const date = dayjs()
  const baseUrl = 'https://data.dvuckovic.com'
  const link = new URL('/fcast3.xml', baseUrl)
  const image = new URL('/images/fcast/fcast-0.png', 'https://cdn.dvuckovic.com')

  const feed = new Feed({
    title: 'RHMZ',
    description: 'Weather Forecast for Serbia',
    id: link.href,
    link: link.href,
    language: 'en',
    image: image.href,
    favicon: image.href,
    copyright: `© ${date.format('YYYY')} Copyright RHMZ Serbia`,
    updated: date.toDate(),
    generator: 'fcast',
    feedLinks: {
      json: new URL('/fcast3.json', baseUrl).href,
    },
  })

  if (json.status === 'not_ok') {
    feed.addItem({
      title: 'Error',
      id: md5(date.format()),
      date: date.toDate(),
      description: `Error: ${json.e}`,
      link: link.href,
    })
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
    ]

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
    }

    let isDateSet = false

    Object.entries(cities).forEach(([cityId, cityStr]) => {
      const data = json.data?.[cityId]
      const desc = []

      for (let i = 1; i <= data!.days; i++) {
        const day = data?.[`day${i}` as keyof typeof data] as Day
        const type = types[day.type as keyof typeof types]

        desc.push(`<strong>${dayjs(day.date, 'YYYY-MM-DD').format('ddd D MMM')}</strong>`)
        desc.push(`<img src="https://cdn.dvuckovic.com/images/fcast/fcast-${day.type}.png" alt="${type}" />`)
        desc.push(type)
        if (day.tmin) desc.push(`Min: ${day.tmin}°C`)
        desc.push(`Max: ${day.tmax}°C`)
        desc.push('')
      }

      feed.addItem({
        title: cityStr,
        id: md5(`${dayjs(`${data?.date} ${data?.time}`, 'YYYY-MM-DD HH:mm').format()}_${cityId}`),
        date: dayjs(`${data?.date} ${data?.time}`, 'YYYY-MM-DD HH:mm').toDate(),
        description: desc.join('<br>\n'),
        link: new URL('/eng/prognoza/index.php', 'http://www.hidmet.gov.rs').href,
      })

      if (!isDateSet) {
        feed.options.updated = dayjs(`${data?.date} ${data?.time}`, 'YYYY-MM-DD HH:mm').toDate()
        isDateSet = true
      }
    })
  }

  return feed.rss2()
}

export default generateFeed
