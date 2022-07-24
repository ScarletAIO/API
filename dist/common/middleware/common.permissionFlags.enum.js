"use strict";
/**
    * Permission Levels:
    * 0 = No Access
    * 1 = Standard
    * 2 = Beta Tester
    * 3 = Admin
    * 4 = Developer
 ---------------------------
    * 1.5 = Bot Account
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionFlags = void 0;
var PermissionFlags;
(function (PermissionFlags) {
    PermissionFlags[PermissionFlags["GUEST_PERMISSION"] = 0] = "GUEST_PERMISSION";
    PermissionFlags[PermissionFlags["BOT_PERMISSION"] = 1.5] = "BOT_PERMISSION";
    PermissionFlags[PermissionFlags["OPEN_PERMISSION"] = 1] = "OPEN_PERMISSION";
    PermissionFlags[PermissionFlags["BETA_PERMISSION"] = 2] = "BETA_PERMISSION";
    PermissionFlags[PermissionFlags["ADMIN_PERMISSION"] = 3] = "ADMIN_PERMISSION";
    PermissionFlags[PermissionFlags["ALL_PERMISSION"] = 4] = "ALL_PERMISSION";
})(PermissionFlags = exports.PermissionFlags || (exports.PermissionFlags = {}));
