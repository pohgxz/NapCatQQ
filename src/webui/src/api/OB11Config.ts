import { RequestHandler } from 'express';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { OneBotConfig } from '@/onebot/config/config';

import { webUiPathWrapper } from '@/webui';
import { WebUiDataRuntime } from '@webapi/helper/Data';
import { sendError, sendSuccess } from '@webapi/utils/response';
import { isEmpty } from '@webapi/utils/check';

// 获取OneBot11配置
export const OB11GetConfigHandler: RequestHandler = (_, res) => {
    // 获取QQ登录状态
    const isLogin = WebUiDataRuntime.getQQLoginStatus();
    // 如果未登录，返回错误
    if (!isLogin) {
        return sendError(res, 'Not Login');
    }
    // 获取登录的QQ号
    const uin = WebUiDataRuntime.getQQLoginUin();
    // 读取配置文件
    const configFilePath = resolve(webUiPathWrapper.configPath, `./onebot11_${uin}.json`);
    // 尝试解析配置文件
    try {
        // 读取配置文件
        const data = JSON.parse(
            existsSync(configFilePath)
                ? readFileSync(configFilePath).toString()
                : readFileSync(resolve(webUiPathWrapper.configPath, './onebot11.json')).toString()
        ) as OneBotConfig;
        // 返回配置文件
        return sendSuccess(res, data);
    } catch (e) {
        return sendError(res, 'Config Get Error');
    }
};

// 写入OneBot11配置
export const OB11SetConfigHandler: RequestHandler = async (req, res) => {
    // 获取QQ登录状态
    const isLogin = WebUiDataRuntime.getQQLoginStatus();
    // 如果未登录，返回错误
    if (!isLogin) {
        return sendError(res, 'Not Login');
    }
    // 如果配置为空，返回错误
    if (isEmpty(req.body.config)) {
        return sendError(res, 'config is empty');
    }
    // 写入配置
    try {
        await WebUiDataRuntime.setOB11Config(JSON.parse(req.body.config));
        return sendSuccess(res, null);
    } catch (e) {
        return sendError(res, 'Error: ' + e);
    }
};
