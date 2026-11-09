import catchAsync from "../../utils/catchAsync.js";
import NotificationService from "./notification.service.js";

const notificationService= new NotificationService();

export const listNotifications= catchAsync((req, res, next)=>{
    return notificationService.listNotifications(req, res, next);
});

export const markAsRead= catchAsync((req, res, next)=>{
    return notificationService.markAsRead(req, res, next)
})