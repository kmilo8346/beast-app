import axios, { AxiosInstance, AxiosRequestConfig, CancelToken } from 'axios';
import camelCaseKeys from 'camelcase-keys';
import snakeCaseKeys from 'snakecase-keys';
import Constants from 'expo-constants';

// libs
import firebase from '../lib/firebase';
// types
import {
  SearchParams,
  SearchResponse,
  CreateParams,
  UpdateParams,
  GetParams,
  GetAllParams,
} from '../types';

axios.defaults.baseURL = Constants.manifest.extra.BEAST_API_URL;

const interpolate = (
  text: string,
  variables: { [key: string]: any } | undefined
) => {
  if (!variables) return text;

  let interpolatedText = text;
  Object.keys(variables).forEach((key) => {
    interpolatedText = interpolatedText.replace(
      new RegExp(`:${key}`, 'g'),
      variables[key]
    );
  });
  return interpolatedText;
};

/**
 * REST Client to standarize api comunications
 */
export default class RESTClient<T> {
  public axios: AxiosInstance;

  public prefix: string;

  constructor(prefix: string, config?: AxiosRequestConfig) {
    this.prefix = prefix;
    this.axios = axios.create(config);

    this.axios.interceptors.request.use(
      (config) => {
        const newConfig = { ...config };
        // axios url params ex: ?place_id=
        if (config.params) {
          newConfig.params = snakeCaseKeys(config.params, { deep: true });
        }
        // axios body data
        if (config.data) {
          newConfig.data = snakeCaseKeys(config.data, { deep: true });
        }

        return newConfig;
      },
      (error) => Promise.reject(error)
    );
    this.axios.interceptors.request.use(
      async (config) => {
        const newConfig = { ...config };
        const currentuser = firebase.auth().currentUser;
        if (!currentuser) {
          throw new Error('Error making request with no user logged');
        }
        const idToken = await currentuser.getIdToken(/* forceRefresh */ true);
        newConfig.headers.Authorization = `Bearer ${idToken}`;
        return config;
      },
      (error) => {
        throw error;
      }
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

  async create(params: CreateParams<T>, cancelToken?: CancelToken): Promise<T> {
    const { pathVars, ...data } = params;
    const response = await this.axios.post<T>(
      interpolate(this.prefix, pathVars),
      data,
      { cancelToken }
    );
    return response.data;
  }

  async update(
    params: UpdateParams<T>,
    cancelToken?: CancelToken
  ): Promise<void> {
    const { pathVars, ...data } = params;
    await this.axios.put<T>(interpolate(this.prefix, pathVars), data, {
      cancelToken,
    });
  }

  async get(params: GetParams, cancelToken?: CancelToken): Promise<T> {
    const { pathVars, source } = params;
    const response = await this.axios.get<T>(
      interpolate(`${this.prefix}/:id`, pathVars),
      {
        params: {
          source,
        },
        cancelToken,
      }
    );
    return response.data;
  }

  async getAll(params: GetAllParams, cancelToken?: CancelToken): Promise<T[]> {
    const { pathVars, ...data } = params;
    const response = await this.axios.get<T[]>(
      interpolate(this.prefix, pathVars),
      {
        params: data,
        cancelToken,
      }
    );
    return response.data;
  }

  async search(
    params: SearchParams,
    cancelToken?: CancelToken
  ): Promise<SearchResponse<T>> {
    const { pathVars, ...data } = params;
    const response = await this.axios.post<SearchResponse<T>>(
      interpolate(`${this.prefix}/search`, pathVars),
      data,
      { cancelToken }
    );
    return response.data;
  }
}
