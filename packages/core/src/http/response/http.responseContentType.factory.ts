import core = require('file-type/core');
import { fromFile as fileType } from 'file-type';
import * as mime from 'mime';
import { HttpStatus } from '../http.interface';
import { ContentType } from '../../+internal/http';

export const DEFAULT_CONTENT_TYPE = ContentType.APPLICATION_JSON;

export const getMimeType = (body: any, path: string) => {
  const mimeFromBuffer =
    Buffer.isBuffer(body) && fileType((body as unknown) as string);
  return mimeFromBuffer
    ? ((mimeFromBuffer as unknown) as core.FileTypeResult).mime
    : mime.getType(path) || DEFAULT_CONTENT_TYPE;
};

export const contentTypeFactory = (data: {
  body: any;
  path: string;
  status: HttpStatus;
}) => ({
  'Content-Type':
    data.status < 400
      ? getMimeType(data.body, data.path)
      : DEFAULT_CONTENT_TYPE,
});
