package com.example.servtest.handler;

import java.io.File;
import java.io.FileDescriptor;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.Iterator;
import java.util.Map;
import java.util.TreeMap;

import org.json.JSONObject;

import com.example.servtest.R;

import android.R.string;
import android.app.Notification;
import android.app.NotificationManager;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager.NameNotFoundException;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Environment;
import android.os.PowerManager;
import android.support.v4.app.NotificationCompat;
import android.view.inputmethod.InputBinding;

public class MessageHandler {
	
	private static final String DOC = "pfapp.json";
	
	private static Context refCon;
	private static Map<String, String> apps;		//使用的应用
	private static boolean isLoaded;
	
	public static boolean isReady()
	{
		if( isLoaded ) return true;

		File f = Environment.getExternalStorageDirectory();
		if( f.exists() && f.list().length > 0 )
		{
			f = new File( Environment.getExternalStorageDirectory()+File.separator+DOC );
			try{
				if( f.exists() )
				{
					InputStream s = new FileInputStream(f);
					byte[] buf = new byte[s.available()];
					s.read(buf);
					JSONObject j = new JSONObject( new String(buf) );
					Iterator<String> k = j.keys();
					while( k.hasNext() )
					{
						String key = k.next();
						if( apps.containsKey(key) == false )
						{
							System.out.println(key+"=>"+j.getString(key));
							apps.put(key, j.getString(key));
						}
					}
				}
			}
			catch( Exception e ){
				System.out.println("try load error with " + e.toString());
			}
			isLoaded = true;
		}
		return isLoaded;
	}
	
	public static void init( Context context ){
		assert( context != null );
		refCon = context;
		isLoaded = false;
		apps = new TreeMap<String, String>();
	}
	
	public static void regApp( String appid, String packname )
	{
		System.out.println("app register " + appid);
		apps.put(appid, packname);
	}
	
	public static void save(){
		try{
			JSONObject obj = new JSONObject(apps);
			String data = obj.toString();
			File f = new File( Environment.getExternalStorageDirectory()+File.separator+DOC );
			if( f.exists()==false ) f.createNewFile();
			OutputStream o = new FileOutputStream(f);
			o.write(data.getBytes());
			o.close();
		}
		catch( Exception e ){
			System.err.println("message save");
			e.printStackTrace();
		}
	}
	
	public static void notify( String message )
	{
		System.out.println("notify:"+message);
		
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
		int icon = R.drawable.ic_launcher;
		try{
			String packname = apps.get(appid);
			icon = refCon.getPackageManager().getApplicationInfo(packname, 0).icon;
		}
		catch( NameNotFoundException e )
		{
			// 包找不到
			return;
		}
		catch( Exception e )
		{
			System.err.println(e.toString());
		}
		
		Notification n = new NotificationCompat.Builder(refCon)
			.setSmallIcon(icon)
			.setContentTitle(title)
			.setContentText(msg)
			.setTicker(msg)
			.build();
		NotificationManager s = (NotificationManager)refCon.getSystemService(Context.NOTIFICATION_SERVICE);
		s.notify(0, n);
		System.out.println("show notification");
		
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
