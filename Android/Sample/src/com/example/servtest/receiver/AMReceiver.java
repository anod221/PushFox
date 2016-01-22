package com.example.servtest.receiver;

import android.app.Notification;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.os.PowerManager;
import android.support.v4.app.NotificationCompat;

public class AMReceiver extends BroadcastReceiver {

	@Override
	public void onReceive(Context context, Intent intent) {
		// 显示通知栏
		Notification n = new NotificationCompat.Builder(context)
			.setSmallIcon(context.getApplicationInfo().icon)
			.setContentTitle("测试标题")
			.setContentText("测试正文")
			.setTicker("测试正文")
			.build();
		NotificationManager s = (NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);
		s.notify(0, n);
		
		//获取电源管理器对象  
        PowerManager pm=(PowerManager) context.getSystemService(Context.POWER_SERVICE);  
        //获取PowerManager.WakeLock对象,后面的参数|表示同时传入两个值,最后的是LogCat里用的Tag  
        PowerManager.WakeLock wl = pm.newWakeLock(PowerManager.ACQUIRE_CAUSES_WAKEUP|PowerManager.SCREEN_DIM_WAKE_LOCK,"bright");  
        //点亮屏幕  
        wl.acquire();  
        //释放
        wl.release();  
	}

}
