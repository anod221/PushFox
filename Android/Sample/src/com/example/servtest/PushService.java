package com.example.servtest;

import java.net.Socket;
import java.security.PublicKey;
import java.util.Map;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;

import com.example.servtest.handler.MessageHandler;
import com.example.servtest.network.Connection;
import com.example.servtest.network.INetwokHandler;
import com.example.servtest.network.proto.Protocol;
import com.example.servtest.receiver.Reconnector;

public class PushService extends Service implements INetwokHandler {

	private static final String TAG = "Push Service";
	public static final long HEART_BEAT_MS = 150 * 1000;// 2:30
	
	private Connection conn;
	private Reconnector reconn;
	private boolean isConnected;
	
	@Override
	public void onCreate(){
		super.onCreate();
		Protocol.Init();
		MessageHandler.init(getBaseContext());
		conn = new Connection("192.168.1.213", 1337, this);
		this.isConnected = false;
		this.reconn = new Reconnector();
		
		registerReceiver(this.reconn, new IntentFilter(Intent.ACTION_SCREEN_ON));
	}
	
	@Override
	public int onStartCommand( Intent intent, int flags, int startId ){
		Log.d(TAG, "start");
		
		Bundle bundle = intent.getExtras();
		if( bundle!=null ){
			String appid = bundle.getString("appid", null);
			String app = bundle.getString("package", null);
			
			if( appid!=null && app!=null ){
				MessageHandler.regApp(appid, app);
			}
		}
		
		if( MessageHandler.isReady() == false )
		{
			delaySendIntent(60*1000);
		}
		else
		{
			if( !isConnected ){
				isConnected = true;
				new Thread(conn).start();
			}
			else {
				conn.beat();
			}
		}
		return super.onStartCommand(intent, flags, startId);
	}
	
	@Override
	public IBinder onBind(Intent arg0) {
		// TODO Auto-generated method stub
		Log.d(TAG, "bind");
		return null;
	}

	@Override
	public void onDestroy(){
		Log.d(TAG, "destroy");
		MessageHandler.save();
		unregisterReceiver(this.reconn);
		this.delaySendIntent(90*1000);
		super.onDestroy();
	}
	
	//----------------------INetworkHandler-----------------------
	@Override
	public void onNetError(Socket sk, Exception error) {
		Log.e("PushService", error.toString());
		try{
			sk.close();
		}catch(Exception e){}

		// 准备好重连
		this.isConnected = false;
		delaySendIntent(90*1000);//一分钟后重新连接
	}

	@Override
	public void setupHeartBeat() {
		delaySendIntent(HEART_BEAT_MS);
	}
	
	private void delaySendIntent( long delay ){
		AlarmManager mgr = (AlarmManager)getSystemService(ALARM_SERVICE);
		Intent intent = new Intent("pushfox.HEART_BEAT");
		PendingIntent pi = PendingIntent.getBroadcast(getBaseContext(), 221, intent, PendingIntent.FLAG_UPDATE_CURRENT);
		mgr.set(AlarmManager.RTC_WAKEUP, System.currentTimeMillis()+delay, pi);
	}
}
