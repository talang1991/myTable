import { Request, Response } from 'express';
export interface IHttpParams {
    req?: Request
    res?: Response
}