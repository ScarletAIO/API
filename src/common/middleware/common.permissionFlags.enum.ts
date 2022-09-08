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

export enum PermissionFlags {
    GUEST_PERMISSION = 0,
    BOT_PERMISSION = 1.5,
    OPEN_PERMISSION = 1,
    BETA_PERMISSION = 2,
    ADMIN_PERMISSION = 3,
    ALL_PERMISSION = 4,
}