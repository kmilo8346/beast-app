import * as AppleAuthentication from 'expo-apple-authentication';

import { Item, CreateUser, OpeningHours, Place } from '../types';
import numberFormatter from './formatters/number-formatter';
import stringFormatter from './formatters/string-formatter';

const prefix = '[utils]';

export const noop = () => {
  return null;
};

export const createUrl = (url: string, params: { [key: string]: any }) => {
  let createdUrl = url;
  Object.keys(params).forEach((key, index) => {
    let separator = '&';
    if (index === 0) {
      separator = '?';
    }
    createdUrl = `${createdUrl}${separator}${key}=${encodeURIComponent(
      params[key]
    )}`;
  });
  return createdUrl;
};

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// :::                                                                         :::
// :::  This routine calculates the distance between two points (given the     :::
// :::  latitude/longitude of those points). It is being used to calculate     :::
// :::  the distance between two locations using GeoDataSource (TM) prodducts  :::
// :::                                                                         :::
// :::  Definitions:                                                           :::
// :::    South latitudes are negative, east longitudes are positive           :::
// :::                                                                         :::
// :::  Passed to function:                                                    :::
// :::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
// :::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
// :::    unit = the unit you desire for results                               :::
// :::           where: 'M' is statute miles (default)                         :::
// :::                  'K' is kilometers                                      :::
// :::                  'N' is nautical miles                                  :::
// :::                                                                         :::
// :::  Worldwide cities and other features databases with latitude longitude  :::
// :::  are available at https://www.geodatasource.com                         :::
// :::                                                                         :::
// :::  For enquiries, please contact sales@geodatasource.com                  :::
// :::                                                                         :::
// :::  Official Web site: https://www.geodatasource.com                       :::
// :::                                                                         :::
// :::               GeoDataSource.com (C) All Rights Reserved 2018            :::
// :::                                                                         :::
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

export const distance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: string
) => {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }
  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;
  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit === 'K') {
    dist *= 1.609344;
  }
  if (unit === 'N') {
    dist *= 0.8684;
  }
  return dist;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const replaceOrAdd = (
  array: Array<any>,
  newItem: any,
  areEqual: (item1: any, item2: any) => boolean
): Array<any> => {
  let found = false;
  const newArray: Array<any> = array.map((item) => {
    if (areEqual(item, newItem)) {
      found = true;
      return newItem;
    }
    return item;
  });
  if (!found) {
    newArray.push(newItem);
  }
  return newArray;
};

export const getStats = (items: Item[]) => {
  return items.reduce(
    (stats, product) => ({
      total: stats.total + 1,
      ammount: stats.ammount + product.price * product.qty,
    }),
    {
      total: 0,
      ammount: 0,
    }
  );
};

export const extract = (info: {
  authUser: firebase.User;
  profile?: { [key: string]: any };
  appleCredential?: AppleAuthentication.AppleAuthenticationCredential;
}): Partial<CreateUser> => {
  if (info.authUser.isAnonymous) {
    return {
      id: info.authUser.uid,
    };
  }

  const email = info.authUser.email as string;
  let first_name = info.authUser.displayName as string;
  let last_name = '';
  let photo_url = info.authUser.photoURL as string;
  // try to find from profile
  if (info.profile) {
    if (info.profile.first_name) {
      first_name = info.profile.first_name;
    } else if (info.profile.given_name) {
      first_name = info.profile.given_name;
    }

    if (info.profile.last_name) {
      last_name = info.profile.last_name;
    } else if (info.profile.family_name) {
      last_name = info.profile.family_name;
    }
  }

  // try to find from appleCredential
  if (!first_name && info.appleCredential) {
    first_name = info.appleCredential.fullName?.givenName as string;
    last_name = info.appleCredential.fullName?.familyName as string;
  }
  // fallback from email
  if (!first_name) {
    first_name = email.substring(0, email.indexOf('@'));
  }

  if (!photo_url) {
    photo_url =
      'https://res.cloudinary.com/firedevs/image/upload/v1601140373/beast/assets/blue-user-logo_wk53b4.png';
  }

  return {
    id: info.authUser.uid,
    email,
    first_name,
    last_name,
    photo_url,
  };
};

const formatDay = (day: string): string => {
  switch (day) {
    case '1':
      return 'lunes';
    case '2':
      return 'martes';
    case '3':
      return 'miércoles';
    case '4':
      return 'jueves';
    case '5':
      return 'viernes';
    case '6':
      return 'sábado';
    case '7':
      return 'domingo';
    default:
      throw new Error(`${prefix} Invalid day ${day}`);
  }
};

export const humanizeOpenInfo = (
  openingHours: OpeningHours
): { open: boolean; message: string } => {
  const currentDate = new Date();
  let currentDay = `${currentDate.getDay()}`;
  if (currentDay === '0') {
    currentDay = '7';
  }
  const currentMinutes = currentDate.getMinutes();
  const currentTime = parseInt(
    `${currentDate.getHours()}${
      currentMinutes < 10 ? `0${currentMinutes}` : currentMinutes
    }`,
    10
  );
  const match = openingHours.find((i) => i.day === currentDay);
  if (!match) {
    console.warn(`${prefix} Today dont match in opening hours`);
    return { open: false, message: 'Cerrado' };
  }

  if (currentTime >= match.open && currentTime < match.close) {
    return {
      open: true,
      message: `Hoy de ${numberFormatter.humanizeTime(
        match.open
      )} a ${numberFormatter.humanizeTime(match.close)}`,
    };
  }
  const nextOpenDay = (() => {
    for (let i = 0; i < openingHours.length; i++) {
      const dayOpeningHours = openingHours[i];
      if (
        parseInt(dayOpeningHours.day, 10) >= parseInt(currentDay, 10) &&
        !(dayOpeningHours.open === 0 && dayOpeningHours.close === 0)
      ) {
        if (dayOpeningHours.day === currentDay) {
          if (currentTime < dayOpeningHours.open) {
            return {
              today: true,
              tomorrow: false,
              dayOpeningHours,
            };
          }
        } else if (
          parseInt(currentDay, 10) + 1 ===
          parseInt(dayOpeningHours.day, 10)
        ) {
          return {
            today: false,
            tomorrow: true,
            dayOpeningHours,
          };
        } else {
          return {
            today: false,
            tomorrow: false,
            dayOpeningHours,
          };
        }
      }
    }
  })();
  if (!nextOpenDay) {
    return {
      open: false,
      message: `Cerrado`,
    };
  }
  if (nextOpenDay.today) {
    return {
      open: false,
      message: `Cerrado · abre hoy ${numberFormatter.humanizeTime(
        nextOpenDay.dayOpeningHours.open
      )}`,
    };
  }
  if (nextOpenDay.tomorrow) {
    return {
      open: false,
      message: `Cerrado · abre mañana ${numberFormatter.humanizeTime(
        nextOpenDay.dayOpeningHours.open
      )}`,
    };
  }
  return {
    open: false,
    message: `Cerrado · abre ${formatDay(
      nextOpenDay.dayOpeningHours.day
    )} ${numberFormatter.humanizeTime(nextOpenDay.dayOpeningHours.open)}`,
  };
};

export const normalizeOpeningHours = (openingHours: OpeningHours) => {
  return openingHours.map((dayOpeningHours) => {
    const result = { ...dayOpeningHours };
    if (!dayOpeningHours.hours) {
      if (dayOpeningHours.open === 0 && dayOpeningHours.close === 0) {
        result.hours = [];
      } else {
        result.hours = [
          { open: dayOpeningHours.open, close: dayOpeningHours.close },
        ];
      }
    }
    result.hours = (result.hours || []).sort((a, b) => {
      if (a.open < b.open) {
        return -1;
      }
      return a.open > b.open ? 1 : 0;
    });
    return result;
  });
};

export interface CurrentOpenedOpeningHours {
  status: 'opened';
  hours: { open: number; close: number }[];
}
export interface CurrentClosedOpenginHours {
  status: 'closed';
  next_open?: {
    day: string;
    day_time: number;
    day_alias?: 'today' | 'tomorrow';
  };
}

export type CurrentOpenginHours =
  | CurrentOpenedOpeningHours
  | CurrentClosedOpenginHours;

export const extractCurrentOpeningHours = (
  opening_hours: OpeningHours
): CurrentOpenginHours => {
  // normalize
  const oh = normalizeOpeningHours(opening_hours);
  // current info
  const current_date = new Date();
  let current_day = `${current_date.getDay()}`;
  if (current_day === '0') {
    current_day = '7';
  }
  const current_minutes = current_date.getMinutes();
  const current_time = parseInt(
    `${current_date.getHours()}${
      current_minutes < 10 ? `0${current_minutes}` : current_minutes
    }`,
    10
  );

  // find current day
  const index = oh.findIndex((i) => i.day === current_day);
  if (index === -1) {
    throw new Error(`${prefix} Today day dont found in opening hours`);
  }
  const currentDayOpeningHours = oh[index];
  // opened
  if (
    (currentDayOpeningHours.hours || []).some(
      (hours) => current_time >= hours.open && current_time < hours.close
    )
  ) {
    return {
      status: 'opened',
      hours: currentDayOpeningHours.hours || [],
    };
  }

  // closed
  let cont = 0;
  let i = index;
  let alias: 'today' | 'tomorrow' | undefined;
  const total = oh.length;
  do {
    cont++;
    if (cont === 1) {
      alias = 'today';
    } else if (cont === 2) {
      alias = 'tomorrow';
    } else {
      alias = undefined;
    }
    const doh = oh[i];
    const hours = doh.hours || [];
    for (let j = 0; j < hours.length; j++) {
      const h = hours[j];
      if (!(cont === 1 && current_time > h.open)) {
        return {
          status: 'closed',
          next_open: {
            day: doh.day,
            day_time: h.open,
            day_alias: alias,
          },
        };
      }
    }
    i++;
    if (i === total) {
      i = 0;
    }
  } while (cont < total);
  return {
    status: 'closed',
  };
};

export const humanizeCurrentClosedOpeningHours = (
  closedOpeningHours: CurrentClosedOpenginHours
): string => {
  if (!closedOpeningHours.next_open) {
    return 'Temporalmente no disponible';
  }
  let text = `Abre`;
  if (closedOpeningHours.next_open.day_alias) {
    if (closedOpeningHours.next_open.day_alias === 'tomorrow') {
      text = `${text} mañana`;
    }
  } else {
    text = `${text} ${stringFormatter.toWeekDay(
      closedOpeningHours.next_open.day
    )}`;
  }
  return `${text} ${numberFormatter.humanizeTime(
    closedOpeningHours.next_open.day_time
  )}`;
};

export const formatPlace = (place: Place): string => {
  if (place.formatted_address) {
    return place.formatted_address;
  }

  let formatted = '';
  if (place.route) {
    formatted = place.route.short_name;
  }
  if (place.street_number) {
    formatted = `${formatted} ${place.street_number.short_name}`;
  }

  if (place.locality) {
    formatted = `${formatted ? `${formatted}, ` : ''}${
      place.locality.short_name
    }`;
  }

  if (place.administrative_area_level_1) {
    formatted = `${formatted ? `${formatted}, ` : ''}${
      place.administrative_area_level_1.short_name
    }`;
  }

  return formatted;
};
