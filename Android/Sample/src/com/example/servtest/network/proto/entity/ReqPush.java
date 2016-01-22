package com.example.servtest.network.proto.entity;

import java.io.DataOutput;
import java.util.Vector;

import com.example.servtest.network.proto.utils.Util;

import com.example.servtest.network.proto.Request;

public class ReqPush extends Request {
	public Vector<String> indexes;
	
	public ReqPush( Vector<String> indexes )
	{
		super( 3 );
		this.indexes = indexes;
	}
	
	@Override
	public byte[] getBytes() throws Exception
	{
		DataOutput out = this.getOutput();
		out.writeShort(this.indexes.size());
		for( int i=0; i < this.indexes.size(); ++i )
		{
			String index = this.indexes.get(i);
			Util.WriteString(out, index);
		}
		return this.getRaw();
	}
}
