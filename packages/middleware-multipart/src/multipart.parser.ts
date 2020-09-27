import * as Busboy from 'busboy';

import { fromEvent, Observable, throwError, forkJoin } from 'rxjs';
import {
  mapTo,
  mergeMap,
  takeUntil,
  catchError,
  share,
  defaultIfEmpty,
} from 'rxjs/operators';
import {
  HttpRequest,
  HttpError,
  HttpStatus,
  isHttpError,
} from '@marblejs/core';
import { ParserOpts } from './multipart.interface';
import { parseField } from './multipart.parser.field';
import { parseFile } from './multipart.parser.file';

export const parseMultipart = (opts: ParserOpts) => (
  req: HttpRequest
): Observable<HttpRequest> => {
  const busboy = new Busboy({
    headers: req.headers,
    limits: {
      fileSize: opts.maxFileSize,
      files: opts.maxFileCount,
      fields: opts.maxFieldCount,
      fieldSize: opts.maxFieldSize,
    },
  });

  const finish$ = fromEvent(busboy, 'finish').pipe(share());

  const parseFile$ = parseFile(req)(opts)(fromEvent(busboy, 'file'), finish$);

  const parseField$ = parseField(req)(fromEvent(busboy, 'field'), finish$);

  const filesLimit$ = fromEvent(busboy, 'filesLimit').pipe(
    takeUntil(finish$),
    mergeMap(() =>
      throwError(
        new HttpError(
          `Reached max files count limit [${opts.maxFileCount}]`,
          HttpStatus.PRECONDITION_FAILED,
          undefined,
          req
        )
      )
    ),
    defaultIfEmpty(true)
  );

  const fieldsLimit$ = fromEvent(busboy, 'fieldsLimit').pipe(
    takeUntil(finish$),
    mergeMap(() =>
      throwError(
        new HttpError(
          `Reached max fields count limit [${opts.maxFieldCount}]`,
          HttpStatus.PRECONDITION_FAILED,
          undefined,
          req
        )
      )
    ),
    defaultIfEmpty(true)
  );

  req.pipe(busboy);

  return forkJoin(filesLimit$, fieldsLimit$, parseFile$, parseField$).pipe(
    mapTo(req),
    catchError((error: Error) =>
      isHttpError(error)
        ? throwError(error)
        : throwError(
            new HttpError(
              error.message,
              HttpStatus.INTERNAL_SERVER_ERROR,
              undefined,
              req
            )
          )
    )
  );
};
