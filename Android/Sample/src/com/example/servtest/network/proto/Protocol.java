package com.example.servtest.network.proto;

import java.io.DataInputStream;
import java.lang.reflect.Constructor;
import java.util.Map;
import java.util.TreeMap;

import com.example.servtest.network.proto.entity.ProtoBye;
import com.example.servtest.network.proto.entity.ProtoHandshake;
import com.example.servtest.network.proto.entity.ProtoPush;

import com.example.servtest.network.Connection;

public class Protocol {
	public int length;
	public int index;
	public int checksum;
	public int id;
	
	public Protocol()
	{
		
	}
	
	public void read( DataInputStream in ) throws Exception
	{
		
	}
	
	public void process( Connection conn ) throws Exception
	{
		
	}
	
	//---------------------------
	private static Map<Integer, Class<?>> protoMap;
	private static void RegisterByID( int id, Class<?> proto )
	{
		if( protoMap == null )
		{
			protoMap = new TreeMap<Integer, Class<?>>();
		}
		protoMap.put(id, proto);
	}
	
	public static void Init()
	{
		RegisterByID(0x8001, ProtoHandshake.class);
		RegisterByID(0x8002, ProtoBye.class);
		RegisterByID(0x8003, ProtoPush.class);
	}
	
	public static Protocol CreateByID( int id ) throws Exception
	{
		Protocol retval = null;
		if( protoMap == null )
		{
			throw new Exception("Please call Protocol.Init!!");
		}
		if( protoMap.containsKey(id) )
		{
			Class<?> c = protoMap.get(id);
			Constructor<?>[] con = c.getConstructors();
			try{
				retval = (Protocol)con[0].newInstance();
			}
			catch( Exception e )
			{
				retval = null;
			}
		}
		return retval;
	}
}
