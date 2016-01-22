package com.example.servtest.network.proto.exception;

public class ProtoNotFoundException extends Exception {

	/**
	 * GEN BY ECLIPSE
	 */
	private static final long serialVersionUID = 1L;

	public int protoID;
	
	public ProtoNotFoundException( int proto )
	{
		super("invalid proto id:"+proto);
		this.protoID = proto;
	}
}
