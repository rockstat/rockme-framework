export interface BandResponseMeta {
  location?: string;
  httpCode?: number;
  type?: string;
  errorMessage?: string;
  data: { [k: string]: any };
}

export const RESP_META_KEY = '__band_meta'
export const RESP_PIXEL = 'pixel'
export const RESP_REDIRECT = 'redirect'
export const RESP_ERROR = 'error'

export interface BandResponseFields {
  [RESP_META_KEY]?: BandResponseMeta;
}
export type DispatchResult = { [k: string]: any } & BandResponseFields;

export const redirect = (location: string, httpCode: number = 302, data: { [k: string]: any } = {}): BandResponseFields => {
  return {
    [RESP_META_KEY]: {
      type: RESP_REDIRECT,
      location,
      httpCode,
      data
    }
  }
}

export const pixel = (data: { [k: string]: any } = {}): BandResponseFields => {
  return {
    [RESP_META_KEY]: {
      type: RESP_PIXEL,
      data
    }
  }
}

export const error = (errorMessage: string, httpCode: number = 500, data: { [k: string]: any } = {}): BandResponseFields => {
  return {
    [RESP_META_KEY]: {
      type: RESP_ERROR,
      httpCode,
      errorMessage,
      data
    }
  }
}
