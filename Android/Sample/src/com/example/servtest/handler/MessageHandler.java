package com.example.servtest.handler;

import java.util.Map;
import java.util.TreeMap;

import android.R.string;
import android.app.Notification;
import android.app.NotificationManager;
import android.content.Context;
import android.net.Uri;
import android.os.PowerManager;
import android.support.v4.app.NotificationCompat;

public class MessageHandler {
	
	private static Context refCon;
	private static Map<String, String> apps;		//使用的应用
	public static void init( Context context ){
		assert( context != null );
		refCon = context;
		apps = new TreeMap<String, String>();
	}
	
	public static void regApp( String appid, String packname )
	{
		apps.put(appid, packname);
	}
	
	public static void notify( String message )
	{
		// query string 解析
		Uri uri = Uri.parse("http://dummy/?"+message);
		String user = uri.getQueryParameter("u");
		String title = uri.getQueryParameter("t");
		String msg = uri.getQueryParameter("m");
		
		int p = user.lastIndexOf("@");
		String appid = user.substring(p+1);
		if( apps.containsKey(appid)==false )
		{
			//TODO: 可以报个错误到服务器
			return;
		}
		
		// 显示
		// 显示通知栏
		Notification n = new NotificationCompat.Builder(refCon)
			.setSmallIcon(refCon.getApplicationInfo().icon)//TODO: 使用user
			.setContentTitle(title)
			.setContentText(msg)
			.setTicker(msg)
			.build();
		NotificationManager s = (NotificationManager)refCon.getSystemService(Context.NOTIFICATION_SERVICE);
		s.notify(0, n);
		
		//获取电源管理器对象  
        PowerManager pm=(PowerManager) refCon.getSystemService(Context.POWER_SERVICE);  
        //获取PowerManager.WakeLock对象,后面的参数|表示同时传入两个值,最后的是LogCat里用的Tag  
        PowerManager.WakeLock wl = pm.newWakeLock(PowerManager.ACQUIRE_CAUSES_WAKEUP|PowerManager.SCREEN_DIM_WAKE_LOCK,"bright");  
        //点亮屏幕  
        wl.acquire();  
        //释放
        wl.release();  
	}
}
