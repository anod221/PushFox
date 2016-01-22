package com.example.servtest.network.proto.exception;

public class ProtoEntityException extends Exception {

	/**
	 * GEN BY ECLIPSE
	 */
	private static final long serialVersionUID = 1L;
	
	public int protoID;
	
	public ProtoEntityException( int proto )
	{
		super("proto body is broken: id=" + proto);
		this.protoID = proto;
	}

}
