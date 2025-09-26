"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBasicInfo = exports.updatePassword = exports.hardDelete = exports.freezeAccount = exports.changeRole = exports.acceptFriendRequestFriendRequest = exports.sendFriendRequest = exports.logout = void 0;
const zod_1 = require("zod");
const token_security_1 = require("../../utils/security/token.security");
const mongoose_1 = require("mongoose");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const model_1 = require("../../database/model");
exports.logout = {
    body: zod_1.z.strictObject({
        flag: zod_1.z.enum(token_security_1.logoutEnum).default(token_security_1.logoutEnum.only)
    })
};
exports.sendFriendRequest = {
    params: zod_1.z.strictObject({
        userId: validation_middleware_1.generalFields.id,
    })
};
exports.acceptFriendRequestFriendRequest = {
    params: zod_1.z.strictObject({
        requestId: validation_middleware_1.generalFields.id,
    })
};
exports.changeRole = {
    params: exports.sendFriendRequest.params,
    body: zod_1.z.strictObject({
        role: zod_1.z.enum(model_1.RoleEnum)
    })
};
exports.freezeAccount = {
    params: zod_1.z.object({
        userId: zod_1.z.string().optional()
    }).refine(data => {
        return data?.userId ? mongoose_1.Types.ObjectId.isValid(data.userId) : true;
    }, {
        error: "invalid object is format", path: ["userId"]
    })
};
exports.hardDelete = {
    params: zod_1.z.strictObject({
        userId: zod_1.z.string()
    }).refine(data => {
        return data.userId ? mongoose_1.Types.ObjectId.isValid(data.userId) : true;
    }, {
        error: "invalid object is format", path: ["userId"]
    })
};
exports.updatePassword = {
    body: zod_1.z.object({
        oldPassword: zod_1.z.string().min(6),
        newPassword: zod_1.z.string().min(6),
    }),
};
exports.updateBasicInfo = {
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(2).max(25).optional(),
        lastName: zod_1.z.string().min(2).max(25).optional(),
        phone: zod_1.z.string().optional(),
        address: zod_1.z.string().optional(),
    }),
};
