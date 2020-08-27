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
  DeleteParams,
  ActionParams,
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
export default class RESTClient<T, V> {
  public axios: AxiosInstance;

  public prefix: string;

  constructor(prefix: string, config?: AxiosRequestConfig) {
    this.prefix = prefix;
    this.axios = axios.create(config);

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
  }

  async create(params: CreateParams<V>, cancelToken?: CancelToken): Promise<T> {
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
    await this.axios.put<T>(interpolate(`${this.prefix}/:id`, pathVars), data, {
      cancelToken,
    });
  }

  async action(
    path: string,
    params: ActionParams<T>,
    cancelToken?: CancelToken
  ): Promise<void> {
    const { pathVars, ...data } = params;
    await this.axios.post<T>(
      interpolate(`${this.prefix}/:id/${path}`, pathVars),
      data,
      {
        cancelToken,
      }
    );
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

  async delete(params: DeleteParams, cancelToken?: CancelToken): Promise<void> {
    const { pathVars } = params;
    await this.axios.delete<T>(interpolate(`${this.prefix}/:id`, pathVars), {
      cancelToken,
    });
  }
}
