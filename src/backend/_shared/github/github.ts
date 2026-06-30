import type { HTTPStatusBase } from '../http/http.d';
import { getResponse, getStatusBase } from '../http/http';
import type { REMAINING } from './github.d';
import { LOG } from '../log/log';
import { LogType } from '../log/log.config';
import type { CONFIG } from '../../apps/validator/index.d';

export const getRemaining = (header: HTTPStatusBase) => {
    return {
        reset: parseInt(header?.["xRatelimitReset"] || "0", 10),
        allToken: parseInt(header?.["xRatelimitLimit"] || "0", 10),
        current: parseInt(header?.["xRatelimitRemaining"] || "0", 10),
    }
}
export const analyzeRemaining = (remaining: REMAINING) => {
    const resetTime = remaining.reset;
    const rateLimitRemaining = remaining.current;
    const rateLimit = remaining.allToken;
    const msUntilReset = resetTime
        ? Math.max(0, Number(resetTime) * 1000 - Date.now())
        : 0;
        
    let resetIn = `${Math.ceil(msUntilReset / 1000 / 60)} min`;
    
    if (msUntilReset >= 60 * 60 * 1000) {
        resetIn = `${Math.ceil(msUntilReset / 1000 / 60 / 60)} h`;
    }
    let output = `🥮: ${rateLimitRemaining}/${rateLimit}, resets in 📅  ${resetIn}`;
    return output;
}
export type GITHUB_DATA = {
    header: HTTPStatusBase;
    status: number;
    json: any;
    remaining: REMAINING;
}

export const getGithubData = (url: string, config: CONFIG, opts: any = {}): GITHUB_DATA => {
    const okMessage = opts.okMsg || `fetched successfully`;
    const failMessage = opts.failMsg || `failed to fetch`;
    const failType: LogType = opts.failType || 'FAIL';
    const target = opts.target || url;
    const showLog = opts.showLog !== undefined ? opts.showLog : true;
    const result = getResponse(url, {token: config.PAT, showLog});
    const status = parseInt(result.status, 10) || 0;
    const header: HTTPStatusBase =  result.header as HTTPStatusBase;
    const remaining: REMAINING = getRemaining(header as HTTPStatusBase);
    const isSuccess = status === 200;
    const remain = remaining.allToken ? `[${analyzeRemaining(remaining)}]` : '[🥮:no rate limit info]';
    config.used++;
    if(isSuccess){
        LOG.OK(`${okMessage} ${target} ${remain}`);
    } else {
        LOG[failType as LogType](`${failMessage} ${target} ${remain}`);
    }
    const json = status === 200 ? JSON.parse(result.content) : null;
    return {
        header,
        status,
        json,
        remaining,
    }
}