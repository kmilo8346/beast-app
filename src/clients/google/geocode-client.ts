import { CancelToken } from 'axios';
import RestClient from '../rest-client';

import { Place } from '../../types';

class GeocodeClient extends RestClient<any, any> {
  /**
   * Geocode request
   * @param params
   * @param cancelToken
   * @returns Promise<PlacesDetailsResponse>
   */
  async geocode(
    params: {
      address: string;
    },
    cancelToken?: CancelToken
  ): Promise<Place[]> {
    const response = await this.axios.get<Place[]>(`${this.prefix}`, {
      cancelToken,
      params,
    });
    return response.data;
  }
}

export default new GeocodeClient('google/geocode');
