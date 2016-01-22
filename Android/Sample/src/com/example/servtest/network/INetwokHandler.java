package com.example.servtest.network;

import java.net.Socket;

public interface INetwokHandler {
	public void setupHeartBeat();
	public void onNetError( Socket sk, Exception error );
}
