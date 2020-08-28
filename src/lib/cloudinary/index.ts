import FormData from 'form-data';
import * as Crypto from 'expo-crypto';
import axios, { CancelToken } from 'axios';

interface Source {
  uri: string;
  name: string;
  type: string;
}
export interface UploadParams {
  file: Source;
  public_id: string;
}

class Cloudinary {
  private api_key: string;

  private secret: string;

  constructor(apiKey: string, secret: string) {
    this.api_key = apiKey;
    this.secret = secret;
  }

  async upload(
    params: UploadParams,
    cancelToken?: CancelToken
  ): Promise<string> {
    const timestamp = Date.now();
    const signature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `public_id=${params.public_id}&timestamp=${timestamp}${this.secret}`
    );

    const form = new FormData();
    form.append('file', params.file);
    form.append('api_key', this.api_key);
    form.append('timestamp', timestamp);
    form.append('public_id', params.public_id);
    form.append('signature', signature);
    const { data } = await axios.post('v1_1/firedevs/image/upload', form, {
      baseURL: 'http://api.cloudinary.com',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      cancelToken,
    });
    return data.secure_url;
  }

  dynamicUrl(url: string, transformation: string): string {
    const position = url.indexOf('image/upload/') + 'image/upload/'.length;
    return [
      url.slice(0, position),
      `${transformation}/`,
      url.slice(position),
    ].join('');
  }
}

export default new Cloudinary('417667514694758', 'kC1oXyVyUregQIH-826rWwpuBgU');
