package com.example.servtest.network.proto;

import java.io.ByteArrayOutputStream;
import java.io.DataOutput;
import java.io.DataOutputStream;

public class Request {
	public int length;
	public int index;
	public int checksum;
	public int id;
	
	public Request( int id )
	{
		this.id = id;
	}
	
	public byte[] getBytes() throws Exception
	{
		return null;
	}
	
	private static ByteArrayOutputStream sharedBuffer;
	protected DataOutput getOutput()
	{
		if( sharedBuffer == null )
		{
			sharedBuffer = new ByteArrayOutputStream(65536);
		}
		sharedBuffer.reset();
		return new DataOutputStream( sharedBuffer );
	}
	
	protected byte[] getRaw()
	{
		if( sharedBuffer == null )
		{
			return new byte[0];
		}
		else
		{
			return sharedBuffer.toByteArray();
		}
	}
}
