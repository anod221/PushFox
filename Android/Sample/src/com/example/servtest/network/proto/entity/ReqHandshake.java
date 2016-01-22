package com.example.servtest.network.proto.entity;

import java.io.DataOutput;

import com.example.servtest.network.proto.utils.Util;

import com.example.servtest.network.proto.Request;

public class ReqHandshake extends Request {
	private String sign;
	private String os;
	private String osver;
	private String udid;
	
	public ReqHandshake( String signature, String os, String osver, String udid )
	{
		super( 1 );
		this.sign = signature;
		this.os = os;
		this.osver = osver;
		this.udid = udid;
	}
	
	@Override
	public byte[] getBytes() throws Exception
	{
		DataOutput out = this.getOutput();
		Util.WriteString(out, sign);
		Util.WriteString(out, os);
		Util.WriteString(out, osver);
		Util.WriteString(out, udid);
		return this.getRaw();
	}
}
