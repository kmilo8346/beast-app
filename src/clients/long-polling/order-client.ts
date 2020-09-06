import { CancelToken } from 'axios';

import RestClient from '../rest-client';
import { Order, CreateOrder, SearchFilters } from '../../types';

class OrderClient extends RestClient<Order, CreateOrder> {
  async subscribe(
    params: {
      filters?: SearchFilters;
      from?: number;
      size?: number;
      source?: string[];
    },
    cancelToken?: CancelToken
  ): Promise<Order[]> {
    const response = await this.axios.get<Order[]>(`${this.prefix}/subscribe`, {
      params,
      cancelToken,
    });
    return response.data;
  }
}

export default new OrderClient('/long-polling/orders');
