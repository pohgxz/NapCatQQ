import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { checkFileReceived, uri2local } from '@/common/file';
import fs from 'fs';

const SchemaData = {
    type: 'object',
    properties: {
        image: { type: 'string' },
    },
    required: ['image'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class OCRImage extends BaseAction<Payload, any> {
    actionName = ActionName.OCRImage;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const { path, success } = (await uri2local(this.core.NapCatTempPath, payload.image));
        if (!success) {
            throw new Error(`OCR ${payload.image}失败,image字段可能格式不正确`);
        }
        if (path) {
            await checkFileReceived(path, 5000); // 文件不存在QQ会崩溃，需要提前判断
            const ret = await this.core.apis.SystemApi.ocrImage(path);
            fs.unlink(path, () => { });

            if (!ret) {
                throw new Error(`OCR ${payload.file}失败`);
            }
            return ret.result;
        }
        fs.unlink(path, () => { });
        throw new Error(`OCR ${payload.file}失败,文件可能不存在`);
    }
}

export class IOCRImage extends OCRImage {
    actionName = ActionName.IOCRImage;
}
