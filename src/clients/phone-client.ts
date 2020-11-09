import { CancelToken } from 'axios';
import RestClient from './rest-client';

class PhoneClient extends RestClient<any, any> {
  /**
   * Request to beast api a code for a phone verification
   * @param data
   * @param cancelToken
   */
  async code(
    data: {
      phone: string;
    },
    cancelToken?: CancelToken
  ): Promise<{ phone: string; code: string }> {
    const response = await this.axios.post<any>(`${this.prefix}/code`, data, {
      cancelToken,
    });
    return response.data;
  }
}

export default new PhoneClient('phones');
