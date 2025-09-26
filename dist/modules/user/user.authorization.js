"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endPoint = void 0;
const User_model_1 = require("../../database/model/User.model");
exports.endPoint = {
    profile: [User_model_1.RoleEnum.user],
    hardDelete: [User_model_1.RoleEnum.admin],
    restoreAccount: [User_model_1.RoleEnum.admin],
    dashboard: [User_model_1.RoleEnum.admin, User_model_1.RoleEnum.superAdmin]
};
