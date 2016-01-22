package com.example.servtest.receiver;

import com.example.servtest.PushService;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo.State;

public class Reconnector extends BroadcastReceiver {
	@Override
	public void onReceive(Context context, Intent intent) {
		ConnectivityManager m = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
		State wifi = m.getNetworkInfo(ConnectivityManager.TYPE_WIFI).getState();
		State gprs = m.getNetworkInfo(ConnectivityManager.TYPE_MOBILE).getState();
		
		// 有网络才重新连接
		if( wifi == State.CONNECTED || gprs == State.CONNECTED ){
			Intent reconnect = new Intent(context, PushService.class);
			context.startService( reconnect );
		}
	}
}
