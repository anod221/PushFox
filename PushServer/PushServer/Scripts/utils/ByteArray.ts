export enum Endian {
    BIG_ENDIAN,
    LITTLE_ENDIAN
}

export class ByteArray {
    private static CHUNK_SIZE = 128;

    public endian: Endian;              //对齐
    private offset_: number;            //内部游标
    private length_: number;            //有效数据长
    private capacity_: number;          //缓冲区实际大小
    private buffer_: Buffer;            //缓冲区

    static FromBuffer(buffer: Buffer): ByteArray {
        var ret = new ByteArray(buffer.length);
        ret.length_ = buffer.length;
        buffer.copy(ret.buffer_, 0, 0, buffer.length);
        return ret;
    }

    constructor(size= 128, endian: Endian= Endian.BIG_ENDIAN) {
        this.endian = endian;
        this.offset_ = 0;
        this.length_ = 0;
        this.capacity_ = size;
        this.buffer_ = new Buffer(size);
    }

    get position(): number {
        return this.offset_;
    }

    set position(p: number) {
        // 范围修正
        if (p > this.length_)
            p = this.length_;
        else if (p < 0) p = 0;

        this.offset_ = p;
    }

    get bytesAvailable(): number {
        return this.length_ - this.offset_;
    }

    get length(): number {
        return this.length_;
    }

    ToBuffer(): Buffer {
        var ret: Buffer = new Buffer(this.length_);
        this.buffer_.copy(ret, 0, 0, this.length_);
        return ret;
    }

    clear(): void {
        this.offset_ = 0;
        this.length_ = 0;
    }

    private reserve(size: number): void {
        if (this.capacity_ < size) {
            var len = Math.ceil(size / ByteArray.CHUNK_SIZE) * ByteArray.CHUNK_SIZE;
            var newbuff = new Buffer(len);
            this.buffer_.copy(newbuff, 0, 0, this.length_);
            this.buffer_ = newbuff;
            this.capacity_ = len;
        }
    }
    private checkread(size: number): boolean {
        return size <= this.bytesAvailable;
    }
    private checkwrite(size: number): void {
        this.reserve(this.offset_ + size);
    }

    //> 读取
    readByte(): number {
        if (!this.checkread(1)) return NaN;

        return this.buffer_.readInt8(this.offset_++);
    }

    readUnsignedByte(): number {
        if (!this.checkread(1)) return NaN;

        return this.buffer_.readUInt8(this.offset_++);
    }

    readShort(): number {
        if (!this.checkread(2)) return NaN;

        var ret: number;
        if (this.endian == Endian.LITTLE_ENDIAN) {
            ret = this.buffer_.readInt16LE(this.offset_);
        } else {
            ret = this.buffer_.readInt16BE(this.offset_);
        }
        this.offset_ += 2;
        return ret;
    }

    readUnsignedShort(): number {
        if (!this.checkread(2)) return NaN;

        var ret: number;
        if (this.endian == Endian.LITTLE_ENDIAN) {
            ret = this.buffer_.readUInt16LE(this.offset_);
        } else {
            ret = this.buffer_.readUInt16BE(this.offset_);
        }
        this.offset_ += 2;
        return ret;
    }

    readInt(): number {
        if (!this.checkread(4)) return NaN;

        var ret: number;
        if (this.endian == Endian.LITTLE_ENDIAN) {
            ret = this.buffer_.readInt32LE(this.offset_);
        } else {
            ret = this.buffer_.readInt32BE(this.offset_);
        }
        this.offset_ += 4;
        return ret;
    }

    readUnsignedInt(): number {
        if (!this.checkread(4)) return NaN;

        var ret: number;
        if (this.endian == Endian.LITTLE_ENDIAN) {
            ret = this.buffer_.readUInt32LE(this.offset_);
        } else {
            ret = this.buffer_.readUInt32BE(this.offset_);
        }
        this.offset_ += 4;
        return ret;
    }

    readFloat(): number {
        if (!this.checkread(4)) return NaN;

        var ret: number;
        if (this.endian == Endian.LITTLE_ENDIAN) {
            ret = this.buffer_.readFloatLE(this.offset_);
        } else {
            ret = this.buffer_.readFloatBE(this.offset_);
        }
        this.offset_ += 4;
        return ret;
    }

    readDouble(): number {
        if (!this.checkread(8)) return NaN;

        var ret: number;
        if (this.endian == Endian.LITTLE_ENDIAN) {
            ret = this.buffer_.readFloatLE(this.offset_);
        } else {
            ret = this.buffer_.readFloatBE(this.offset_);
        }
        this.offset_ += 8;
        return ret;
    }

    readBytes(bytearray: ByteArray, offset: number= 0, length: number = -1): number {
        if (length < 0) length = this.bytesAvailable;

        if (this.offset_ + length > this.length_) {
            // 范围修正
            length = this.length_ - this.offset_;
        }

        bytearray.checkwrite(length);
        this.buffer_.copy(bytearray.buffer_, offset, this.offset_, this.offset_ + length);
        this.offset_ += length;
        bytearray.length_ = Math.max(bytearray.length, offset + length);
        return length;
    }

    readMultiBytes(length: number= -1, encode: string= "utf8"): string {
        if (length < 0) length = this.bytesAvailable;

        if (this.offset_ + length > this.length_) {
            length = this.length_ - this.offset_;
        }

        var ret = this.buffer_.toString(encode, this.offset_, this.offset_ + length);
        this.offset_ += length;
        return ret;
    }

    //> 写入
    writeByte(n: number): number {
        this.checkwrite(1);
        this.buffer_.writeInt8(n, this.offset_);
        this.offset_ += 1;
        this.length_ = this.length_ > this.offset_ ? this.length_ : this.offset_;
        return 1;
    }

    writeUnsignedByte(n: number): number {
        this.checkwrite(1);
        this.buffer_.writeUInt8(n, this.offset_);
        this.offset_ += 1;
        this.length_ = this.length_ > this.offset_ ? this.length_ : this.offset_;
        return 1;
    }

    writeShort(n: number): number {
        this.checkwrite(2);
        if (this.endian == Endian.LITTLE_ENDIAN) {
            this.buffer_.writeInt16LE(n, this.offset_);
        } else {
            this.buffer_.writeInt16BE(n, this.offset_);
        }
        this.offset_ += 2;
        this.length_ = this.length_ > this.offset_ ? this.length_ : this.offset_;
        return 2;
    }

    writeUnsignedShort(n: number): number {
        this.checkwrite(2);
        if (this.endian == Endian.LITTLE_ENDIAN) {
            this.buffer_.writeUInt16LE(n, this.offset_);
        } else {
            this.buffer_.writeUInt16BE(n, this.offset_);
        }
        this.offset_ += 2;
        this.length_ = this.length_ > this.offset_ ? this.length_ : this.offset_;

        return 2;
    }

    writeInt(n: number): number {
        this.checkwrite(4);
        if (this.endian == Endian.LITTLE_ENDIAN) {
            this.buffer_.writeInt32LE(n, this.offset_);
        } else {
            this.buffer_.writeInt32BE(n, this.offset_);
        }
        this.offset_ += 4;
        this.length_ = this.length_ > this.offset_ ? this.length_ : this.offset_;

        return 4;
    }

    writeUnsignedInt(n: number): number {
        this.checkwrite(4);
        if (this.endian == Endian.LITTLE_ENDIAN) {
            this.buffer_.writeUInt32LE(n, this.offset_);
        } else {
            this.buffer_.writeUInt32BE(n, this.offset_);
        }
        this.offset_ += 4;
        this.length_ = this.length_ > this.offset_ ? this.length_ : this.offset_;

        return 4;
    }

    writeFloat(n: number): number {
        this.checkwrite(4);
        if (this.endian == Endian.LITTLE_ENDIAN) {
            this.buffer_.writeFloatLE(n, this.offset_);
        } else {
            this.buffer_.writeFloatBE(n, this.offset_);
        }
        this.offset_ += 4;
        this.length_ = this.length_ > this.offset_ ? this.length_ : this.offset_;

        return 4;
    }

    writeDouble(n: number): number {
        this.checkwrite(8);
        if (this.endian == Endian.LITTLE_ENDIAN) {
            this.buffer_.writeDoubleBE(n, this.offset_);
        } else {
            this.buffer_.writeDoubleBE(n, this.offset_);
        }
        this.offset_ += 8;
        this.length_ = this.length_ > this.offset_ ? this.length_ : this.offset_;

        return 8;
    }

    writeBytes(bytearray: ByteArray, offset: number= 0, length: number= -1): number {
        if (length < 0) length = bytearray.length_;

        if (offset + length > bytearray.length_) {
            length = bytearray.length_ - offset;
        }

        this.checkwrite(length);
        bytearray.buffer_.copy(this.buffer_, this.offset_, offset, offset + length);
        this.offset_ += length;
        this.length_ = this.length_ > this.offset_ ? this.length_ : this.offset_;
        return length;
    }

    writeMultiBytes(str: string, encode: string= "utf8"): number {
        var length = Buffer.byteLength(str, encode);

        this.checkwrite(length);
        this.buffer_.write(str, this.offset_, length, encode);
        this.offset_ += length;
        this.length_ = this.length_ > this.offset_ ? this.length_ : this.offset_;
        return length;
    }
}
