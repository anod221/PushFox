package com.example.servtest.network.proto;

import java.io.DataInputStream;
import java.lang.ref.WeakReference;

import com.example.servtest.network.proto.exception.ProtoHeaderException;
import com.example.servtest.network.proto.exception.ProtoNotFoundException;
import com.example.servtest.network.proto.utils.Util;


public class ProtoReader {
	
	private WeakReference<DataInputStream> input;
	
	public ProtoReader( DataInputStream stream )
	{
		this.input = new WeakReference<DataInputStream>(stream);
	}
	
	public Protocol readProto() throws Exception
	{
		DataInputStream is = input.get();
		byte			chk = is.readByte();
		byte 			idx = is.readByte();
		int 			len = is.readInt() ^ 0x7fffffff;
		int				pto = is.readUnsignedShort();
		
		// 协议校验
		if( chk != Util.CheckProto(len, idx, pto) ){
			throw new ProtoHeaderException();
		}
		
		Protocol proto = Protocol.CreateByID(pto);
		if( proto == null )
		{
			throw new ProtoNotFoundException(pto);
		}
		proto.length = len;
		proto.id = pto;
		proto.index = idx;
		proto.checksum = chk;
		
		proto.read(is);
		return proto;
	}
}
