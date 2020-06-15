import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import camelCaseKeys from 'camelcase-keys';
import snakeCaseKeys from 'snakecase-keys';

import { SearchParams, SearchResponse } from '../types';

axios.defaults.baseURL = 'http://104.198.252.111';

/**
 * REST Client to standarize api comunications
 */
export default class RESTClient<T> {
  public axios: AxiosInstance;

  private prefix: string;

  constructor(prefix: string, config?: AxiosRequestConfig) {
    this.prefix = prefix;
    this.axios = axios.create(config);

    this.axios.interceptors.request.use(
      (config) => {
        return {
          ...config,
          data: snakeCaseKeys(config.data, { deep: true }),
        };
      },
      (error) => Promise.reject(error)
    );

    // interceptor to transform backend response keys to came case
    this.axios.interceptors.response.use(
      (response) => ({
        ...response,
        data: camelCaseKeys(response.data, { deep: true }),
      }),
      (error) => Promise.reject(error)
    );
  }

  async create(body: T): Promise<T> {
    const response = await this.axios.post<T>(this.prefix, body);
    return response.data;
  }

  async update(body: T): Promise<T> {
    const response = await this.axios.put<T>(this.prefix, body);
    return response.data;
  }

  async get(id: string): Promise<T> {
    const response = await this.axios.get<T>(`${this.prefix}/${id}`);
    return response.data;
  }

  async getAll(params: { from: 0; size: 10 }): Promise<T[]> {
    const response = await this.axios.get<T[]>(this.prefix, {
      params,
    });
    return response.data;
  }

  async search(params?: SearchParams): Promise<SearchResponse<T>> {
    const response = await this.axios.post<SearchResponse<T>>(
      `${this.prefix}/search`,
      params
    );
    return response.data;
  }
}
