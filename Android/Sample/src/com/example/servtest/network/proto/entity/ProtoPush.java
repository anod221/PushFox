package com.example.servtest.network.proto.entity;

import java.io.DataInputStream;
import java.util.Vector;

import com.example.servtest.handler.MessageHandler;
import com.example.servtest.network.Connection;
import com.example.servtest.network.proto.Protocol;

public class ProtoPush extends Protocol {
	public Vector<String> messages;
	
	public ProtoPush()
	{
		super();
	}
	
	@Override
	public void read( DataInputStream in ) throws Exception
	{
		this.messages = new Vector<String>();
		int count = in.readUnsignedShort();
		while( count-->0 ){// 趋向于！！
			this.messages.add( in.readUTF() );
		}
	}
	
	@Override
	public void process( Connection conn ) throws Exception
	{
		Vector<String> indexes = new Vector<String>();
		for( int i=0; i < this.messages.size(); ++i ){
			String msg = this.messages.get(i);
			System.out.println(msg);
			
			// 分析querystring
			int p = msg.indexOf("index=");
			if( p >=0 )
			{
				indexes.add( msg.substring(p+6) );
			}
			
			// notify
			MessageHandler.notify(msg);
		}
		conn.putRequest( new ReqPush(indexes) );
	}
}
