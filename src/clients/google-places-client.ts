import axios, { CancelToken } from 'axios';
import RestClient from './rest-client';

import { PlacesAutocompletResponse, PlacesDetailsResponse } from '../types';

class GooglePlacesClient extends RestClient<any> {
  /**
   * Places autocomplete request
   * @param params
   * @param cancelToken
   * @returns Promise<PlacesAutocompletResponse>
   */
  async autocomplete(
    params: {
      input: string;
      sessiontoken: string;
    },
    cancelToken?: CancelToken
  ): Promise<PlacesAutocompletResponse | null> {
    let data = null;
    try {
      const response = await this.axios.get<PlacesAutocompletResponse>(
        `${this.prefix}/autocomplete`,
        {
          cancelToken,
          params,
        }
      );
      data = response.data;
    } catch (error) {
      if (!axios.isCancel(error)) {
        throw error;
      }
    }
    return data;
  }

  /**
   * Places details request
   * @param params
   * @param cancelToken
   * @returns Promise<PlacesDetailsResponse>
   */
  async details(
    params: {
      placeId: string;
      sessiontoken: string;
    },
    cancelToken?: CancelToken
  ): Promise<PlacesDetailsResponse | null> {
    let data = null;
    try {
      const response = await this.axios.get<PlacesDetailsResponse>(
        `${this.prefix}/details`,
        {
          cancelToken,
          params,
        }
      );
      data = response.data;
    } catch (error) {
      if (!axios.isCancel(error)) {
        throw error;
      }
    }
    return data;
  }
}

export default new GooglePlacesClient('google/places');
