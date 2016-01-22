package com.example.servtest.network.proto.entity;

import java.io.DataInputStream;

import android.util.Log;

import com.example.servtest.network.Connection;
import com.example.servtest.network.proto.Protocol;

public class ProtoBye extends Protocol {
	
	public String message;
	
	public ProtoBye()
	{
		super();
	}
	
	@Override
	public void read( DataInputStream in ) throws Exception
	{
		this.message = in.readUTF();
	}
	
	@Override
	public void process( Connection conn ) throws Exception
	{
		Log.e("ProtoBye", this.message );
	}
}
