package com.example.servtest.network.proto.entity;

import java.io.DataInputStream;

import com.example.servtest.network.proto.utils.Util;

import com.example.servtest.network.Connection;
import com.example.servtest.network.proto.Protocol;

public class ProtoHandshake extends Protocol {
	
	private long key;
	
	public ProtoHandshake()
	{
		super();
	}
	
	@Override
	public void read( DataInputStream in ) throws Exception
	{
		this.key = in.readInt();
	}
	
	@Override
	public void process( Connection conn ) throws Exception
	{
		String plaintext = "020-37619030#" + this.key;
		// 对plaintext进行md5
		String sign = Util.MD5(plaintext);
		System.out.println(plaintext);
		System.out.println(sign);
		String os = System.getProperty("os.name");
		String osver = System.getProperty("os.version");
		String udid = "001";//Util.getMacAddress();
		conn.putRequest( new ReqHandshake(sign, os, osver, udid) );
	}
}
