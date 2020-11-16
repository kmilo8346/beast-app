import { CancelToken } from 'axios';
import RestClient from '../rest-client';

import { PlacesAutocompletResponse, PlacesDetailsResponse } from '../../types';

class PlacesClient extends RestClient<any, any> {
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
  ): Promise<PlacesAutocompletResponse> {
    const response = await this.axios.get<PlacesAutocompletResponse>(
      `${this.prefix}/autocomplete`,
      {
        cancelToken,
        params,
      }
    );
    return response.data;
  }

  /**
   * Places details request
   * @param params
   * @param cancelToken
   * @returns Promise<PlacesDetailsResponse>
   */
  async details(
    params: {
      place_id: string;
      sessiontoken: string;
    },
    cancelToken?: CancelToken
  ): Promise<PlacesDetailsResponse> {
    const response = await this.axios.get<PlacesDetailsResponse>(
      `${this.prefix}/details`,
      {
        cancelToken,
        params,
      }
    );
    return response.data;
  }
}

export default new PlacesClient('google/places');
