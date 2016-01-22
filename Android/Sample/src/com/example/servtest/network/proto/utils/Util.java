package com.example.servtest.network.proto.utils;

import java.io.DataOutput;
import java.io.EOFException;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.security.MessageDigest;

import com.example.servtest.network.proto.exception.ProtoEntityException;


public class Util {
	private static int bit1_count( int n )
	{
		int c;
		for( c=0; n!=0; ++c )
		{
			n &= n-1;
		}
		return c;
	}
	
	public static byte CheckProto( int length, int index, int proto )
	{
		byte ret = 0;
		if( length > 0xff ) ret |= 0x01;
		ret |= ( bit1_count(length & 0xff) & 0x01 ) << 1;
		if( length > 0xffff ) ret |= 0x04;
		if( length > 0xffffff ) ret |= 0x08;
		ret |= (index & 0x01) << 4;
		if( index == 0 ) ret |= 0x20;
		ret |= (bit1_count(proto) & 0x01) << 6;
		ret |= (bit1_count(ret) & 0x01) << 7;
		return ret;
	}
	
	public static String MD5( String plaintext ) throws Exception
	{
		MessageDigest algorithm = MessageDigest.getInstance("MD5");
		algorithm.update( plaintext.getBytes() );
		byte[] digits = algorithm.digest();
		char[] retval = new char[digits.length * 2];
		for( int i=0; i < digits.length; ++i ){
			retval[i*2] = Integer.toHexString( (int)(digits[i]>>4)&0x0f ).charAt(0);
			retval[i*2+1] = Integer.toHexString( (int)digits[i]&0x0f ).charAt(0);
		}
		return new String(retval);
	}
	
	public static String getMacAddress() throws Exception
	{
		InetAddress ip = InetAddress.getLocalHost();
		NetworkInterface net = NetworkInterface.getByInetAddress(ip);
		byte[] digits = net.getHardwareAddress();
		char[] retval = new char[digits.length * 2];
		for( int i=0; i < digits.length; ++i ){
			retval[i*2] = Integer.toHexString( (int)(digits[i]>>4)&0x0f ).charAt(0);
			retval[i*2+1] = Integer.toHexString( (int)digits[i]&0x0f ).charAt(0);
		}
		return new String(retval);
	}
	
	public static void WriteString( DataOutput ba, String str ) throws Exception
	{
		ba.writeUTF(str);
	}
}
