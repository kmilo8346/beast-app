import * as AppleAuthentication from 'expo-apple-authentication';

import { Item, CreateUser, OpeningHours, Place } from '../types';
import numberFormatter from './formatters/number-formatter';

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

export const formatPlace = (place: Place): string => {
  if (place.formatted_address) {
    return place.formatted_address;
  }

  let formatted = '';
  if (place.route) {
    formatted = place.route.short_name;
  }
  if (place.street_number) {
    formatted = `${formatted} ${place.street_number}`;
  }

  if (place.locality) {
    formatted = `${formatted ? `${formatted}, ` : ''}${place.locality}`;
  }

  if (place.administrative_area_level_1) {
    formatted = `${formatted ? `${formatted}, ` : ''}${
      place.administrative_area_level_1
    }`;
  }

  return formatted;
};
