import { CancelToken } from 'axios';

import RestClient from './rest-client';
import { Widget, CreateWidget, ComputeParams, ComputeResponse } from '../types';

class WidgetClient extends RestClient<Widget, CreateWidget> {
  async compute(
    params: ComputeParams,
    cancelToken?: CancelToken
  ): Promise<ComputeResponse> {
    const response = await this.axios.get<ComputeResponse>(
      `${this.prefix}/compute`,
      { params, cancelToken }
    );
    return response.data;
  }
}

export default new WidgetClient('widgets');
