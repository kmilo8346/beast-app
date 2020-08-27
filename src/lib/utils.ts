import { Item, CreateUser } from '../types';

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
      ammount: stats.ammount + product.price * 1,
    }),
    {
      total: 0,
      ammount: 0,
    }
  );
};

export const extract = (
  authUser: firebase.User,
  profile?: { [key: string]: any }
): Partial<CreateUser> => {
  if (authUser.isAnonymous) {
    return {
      id: authUser.uid,
    };
  }

  let first_name = authUser.displayName as string;
  let last_name = '';
  if (profile) {
    if (profile.first_name) {
      first_name = profile.first_name;
    } else if (profile.given_name) {
      first_name = profile.given_name;
    }

    if (profile.last_name) {
      last_name = profile.last_name;
    } else if (profile.family_name) {
      last_name = profile.family_name;
    }
  }

  return {
    id: authUser.uid,
    email: authUser.email as string,
    first_name,
    last_name,
    photo_url: authUser.photoURL as string,
  };
};
