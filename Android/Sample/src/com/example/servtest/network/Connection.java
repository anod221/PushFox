package com.example.servtest.network;

import java.io.DataInputStream;
import java.io.DataOutput;
import java.io.DataOutputStream;
import java.io.EOFException;
import java.io.IOException;
import java.io.OutputStream;
import java.net.Socket;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Intent;

import com.example.servtest.PushService;
import com.example.servtest.network.proto.ProtoReader;
import com.example.servtest.network.proto.Protocol;
import com.example.servtest.network.proto.Request;
import com.example.servtest.network.proto.entity.ReqHeartBeat;
import com.example.servtest.network.proto.utils.Util;


public class Connection implements Runnable
{
	private INetwokHandler 	refHandler;
	private Socket 			socket;
	private String 			host;
	private int				port;
	
	private int				reqIndex;
	private long			heartbeat;
	
	public Connection( String host, int port, INetwokHandler handler )
	{
		this.refHandler = handler;
		this.host = host;
		this.port = port;
	}

	@Override
	public void run() {
		try{
			if( createSocket() ){
				this.reqIndex = 0;
				networkLoop();
			}
		}
		catch( Exception e ){
			if( this.socket!=null )
			{
				if( !this.socket.isClosed() ){
					try{
						this.socket.close();
					}catch(IOException ioe){}
				}
			}
			refHandler.onNetError(socket, e);
		}
	}
	
	public boolean isRunning()
	{
		return this.socket != null 
				&& this.socket.isConnected()
				&& !this.socket.isClosed();
	}
	
	private boolean createSocket() throws IOException
	{
		this.socket = new Socket(host, port);
		return this.socket != null;
	}
	
	private void networkLoop() throws Exception
	{
		DataInputStream is = new DataInputStream( this.socket.getInputStream() );
		ProtoReader rd = new ProtoReader(is);
		while( true ){
			Protocol proto = rd.readProto();
			proto.process( this );
		}
	}
	
	public void putRequest( Request req )
	{
		if( this.isRunning() )
		{
			try{
				byte[] entity = req.getBytes();
				int len = entity==null ? 0 : entity.length;
				len += 8;
				
				DataOutput out = new DataOutputStream( this.socket.getOutputStream() );
				out.writeByte( Util.CheckProto(len, this.reqIndex, req.id) );
				out.writeByte( this.reqIndex );
				out.writeInt( len ^ 0x7fffffff );
				out.writeShort( req.id );
				if( entity!=null ){
					out.write(entity);
				}
				this.heartbeat = System.currentTimeMillis();
				this.refHandler.setupHeartBeat();
			}
			catch( EOFException e )
			{
				// 协议太长了
			}
			catch( Exception e )
			{
				// 重新建立连接
			}
			System.out.println("send req:"+req.id);
		}
	}
	
	public void beat()
	{
		if( System.currentTimeMillis() - this.heartbeat 
				>= PushService.HEART_BEAT_MS )
		{
			this.putRequest( new ReqHeartBeat() );
		}
	}
	
	public Socket getSocket()
	{
		return this.socket;
	}
}
