import { AxiosRequestConfig } from 'axios';

import RestClient from './rest-client';
// types
import { RenderedWidget, SearchParams, SearchResponse } from '../types';

export interface RenderParams extends SearchParams {
  context: { [key: string]: any };
}

class WidgetClient extends RestClient<RenderedWidget, {}> {
  async render(
    params: RenderParams,
    config?: AxiosRequestConfig
  ): Promise<SearchResponse<RenderedWidget>> {
    const response = await this.axios.get<SearchResponse<RenderedWidget>>(
      `${this.prefix}/render`,
      {
        ...config,
        params,
      }
    );
    return response.data;
  }
}

export default new WidgetClient('/widgets');
