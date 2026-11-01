import catchAsync from "../../utils/catchAsync";
import NotificationService from "./notification.service";

const notificationService= new NotificationService();

export const createNotification= catchAsync((req, res, next)=>{
    return notificationService.createNotification(req, res, next);
});

export const listNotifications= catchAsync((req, res, next)=>{
    return notificationService.listNotifications(req, res, next);
});

export const markAsRead= catchAsync((req, res, next)=>{
    return notificationService.markAsRead(req, res, next)
})