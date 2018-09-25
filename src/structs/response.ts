export const STATUS_OK = 200;
export const STATUS_OK_NO_CONTENT = 204;
export const STATUS_BAD_REQUEST = 400;
export const STATUS_NOT_FOUND = 404;
export const STATUS_TEAPOT = 418;
export const STATUS_INT_ERROR = 500;
export const STATUS_TEMP_REDIR = 302;
export const STATUS_PERSIST_REDIR = 301;
export const STATUS_SEE_OTHERS_REDIR = 303;
export const STATUS_UNKNOWN = 'Unknown Status';


export const STATUS_DESCRIPTIONS = {
  [STATUS_OK]: 'Ok',
  [STATUS_OK_NO_CONTENT]: 'No Content',
  [STATUS_BAD_REQUEST]: 'Bad Request',
  [STATUS_NOT_FOUND]: 'Not Found',
  [STATUS_TEAPOT]: "I'm a teapot",
  [STATUS_INT_ERROR]: 'Internal Error',
  [STATUS_TEMP_REDIR]: 'Temporary Redirect',
  [STATUS_PERSIST_REDIR]: 'Temporary Redirect',
  [STATUS_SEE_OTHERS_REDIR]: 'See Others'
}
export type HTTPCodes = keyof typeof STATUS_DESCRIPTIONS;

// === Header

export type HTTPHeader = [string, number | string | string[]];
export type HTTPHeaders = Array<HTTPHeader>;

const RESP_TYPE_KEY = '_response___type';
const RESP_PIXEL = 'pixel'
const RESP_REDIRECT = 'redirect'
const RESP_ERROR = 'error'
const RESP_DATA = 'data'

export {
  RESP_TYPE_KEY,
  RESP_PIXEL,
  RESP_REDIRECT,
  RESP_ERROR,
  RESP_DATA
}

export type ResponseTypeRedirect = typeof RESP_REDIRECT;
export type ResponseTypePixel = typeof RESP_PIXEL;
export type ResponseTypeError = typeof RESP_ERROR;
export type ResponseTypeData = typeof RESP_DATA;

export type BandResponseDataType = { [k: string]: any } | string | number | null;

export interface BandResponseBase {
  headers: HTTPHeaders,
}

export type BandResponseRedirect = {
  [RESP_TYPE_KEY]: ResponseTypeRedirect;
  location: string;
  httpCode: number;
} & BandResponseBase;

export type BandResponsePixel = {
  [RESP_TYPE_KEY]: ResponseTypePixel;
  httpCode: number;
} & BandResponseBase;

export type BandResponseError = {
  [RESP_TYPE_KEY]: ResponseTypeError;
  httpCode: number;
  errorMessage: string;
} & BandResponseBase;

export type BandResponseData = {
  [RESP_TYPE_KEY]: ResponseTypeData;
  httpCode: number;
  contentType?: string;
  data: BandResponseDataType;
} & BandResponseBase;

// export type ResponseTypes = ResponseTypeRedirect | ResponseTypeError | ResponseTypePixel | ResponseTypeData | ResponseTypeEmpty;
// export interface BandResponseFull {
//   location?: string;
//   httpCode?: number;
//   type: ResponseTypes;
//   errorMessage?: string;
//   data?: { [k: string]: any } | Buffer | string | number | null;
// }

export type BandResponse = BandResponseData
  | BandResponsePixel
  | BandResponseRedirect
  | BandResponseError


const redirect: (params: { location: string, httpCode?: HTTPCodes, headers?: HTTPHeaders }) => BandResponseRedirect = ({ location, httpCode, headers }) => {
  return {
    [RESP_TYPE_KEY]: RESP_REDIRECT,
    headers: headers || [],
    location,
    httpCode: httpCode || STATUS_TEMP_REDIR,
  }
}

const pixel: (params: { httpCode?: HTTPCodes, headers?: HTTPHeaders }) => BandResponsePixel = ({ httpCode, headers }) => {
  return {
    [RESP_TYPE_KEY]: RESP_PIXEL,
    headers: headers || [],
    httpCode: httpCode || STATUS_OK,
    type: RESP_PIXEL
  }
}

const error: (params: { httpCode?: HTTPCodes, errorMessage?: string, headers?: HTTPHeaders }) => BandResponseError = ({ httpCode, errorMessage, headers }) => {
  httpCode = httpCode || STATUS_INT_ERROR;
  return {
    [RESP_TYPE_KEY]: RESP_ERROR,
    headers: headers || [],
    httpCode: httpCode,
    errorMessage: errorMessage || STATUS_DESCRIPTIONS[httpCode],
  }
}

const data: (params: { data?: BandResponseData['data'], httpCode?: HTTPCodes, headers?: HTTPHeaders, contentType?: string }) => BandResponseData = ({ data, httpCode, headers, contentType }) => {
  return {
    [RESP_TYPE_KEY]: RESP_DATA,
    headers: headers || [],
    httpCode: httpCode || STATUS_OK,
    contentType: contentType,
    data: data || {}
  }
}

export const isBansResponse = (msg: BandResponseDataType | BandResponse) => {
  return msg && typeof msg === 'object' && RESP_TYPE_KEY in msg;
}

export const response = {
  redirect,
  pixel,
  error,
  data
}
