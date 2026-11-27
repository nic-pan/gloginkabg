"""Check rain GIFs: size, and whether the background is really transparent.

A GIF can have a transparency setting and still draw a solid background.
So this script reads the first frame and looks at the four corner pixels.

Usage:
  python3 -I tools/check-gif.py file.gif [more.gif ...]
  python3 -I tools/check-gif.py --url https://.../file.gif [...]

Output for each file: size, then TRANSPARENT (all four corners clear)
or HAS BACKGROUND with the corner colors.
"""
import struct
import subprocess
import sys


def lzw_decode(data, min_size, pixel_count):
    clear = 1 << min_size
    end = clear + 1
    size = min_size + 1
    table = [[i] for i in range(clear)] + [[], []]
    out = []
    prev = None
    bitpos = 0
    total_bits = len(data) * 8
    while bitpos + size <= total_bits and len(out) < pixel_count:
        code = 0
        for k in range(size):
            byte = data[(bitpos + k) >> 3]
            code |= ((byte >> ((bitpos + k) & 7)) & 1) << k
        bitpos += size
        if code == clear:
            size = min_size + 1
            table = [[i] for i in range(clear)] + [[], []]
            prev = None
            continue
        if code == end:
            break
        if prev is None:
            entry = table[code]
            out.extend(entry)
            prev = entry
            continue
        if code < len(table):
            entry = table[code]
            table.append(prev + [entry[0]])
        else:
            entry = prev + [prev[0]]
            table.append(entry)
        out.extend(entry)
        prev = entry
        if len(table) == (1 << size) and size < 12:
            size += 1
    return out


def check(b):
    if b[:3] != b'GIF':
        return 'not a GIF'
    w, h, flags = struct.unpack('<HHB', b[6:11])
    pos = 13
    gct = None
    if flags & 0x80:
        n = 2 << (flags & 7)
        gct = b[pos:pos + 3 * n]
        pos += 3 * n
    transparent = None
    while pos < len(b):
        block = b[pos]
        if block == 0x21:
            label = b[pos + 1]
            pos += 2
            if label == 0xF9 and b[pos + 1] & 1:
                transparent = b[pos + 4]
            while b[pos]:
                pos += b[pos] + 1
            pos += 1
        elif block == 0x2C:
            ix, iy, iw, ih, iflags = struct.unpack('<HHHHB', b[pos + 1:pos + 10])
            pos += 10
            table = gct
            if iflags & 0x80:
                n = 2 << (iflags & 7)
                table = b[pos:pos + 3 * n]
                pos += 3 * n
            min_size = b[pos]
            pos += 1
            data = bytearray()
            while b[pos]:
                data += b[pos + 1:pos + 1 + b[pos]]
                pos += b[pos] + 1
            pixels = lzw_decode(bytes(data), min_size, iw * ih)
            corners = []
            for cx, cy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
                # A corner outside the first frame's box shows the page (clear).
                if not (ix <= cx < ix + iw and iy <= cy < iy + ih):
                    corners.append('clear')
                    continue
                i = (cy - iy) * iw + (cx - ix)
                if i >= len(pixels):
                    corners.append('?')
                    continue
                idx = pixels[i]
                if idx == transparent:
                    corners.append('clear')
                else:
                    r, g, bb = table[3 * idx:3 * idx + 3]
                    corners.append(f'#{r:02X}{g:02X}{bb:02X}')
            verdict = 'TRANSPARENT' if all(c == 'clear' for c in corners) else 'HAS BACKGROUND'
            return f'{w}x{h} {verdict} corners={corners}'
        else:
            break
    return 'no image found'


def main(args):
    from_url = False
    for arg in args:
        if arg == '--url':
            from_url = True
            continue
        if from_url:
            # curl, because the system Python's TLS is too old for some image hosts.
            data = subprocess.run(['curl', '-sL', '--max-time', '30', arg],
                                  capture_output=True, check=True).stdout
        else:
            data = open(arg, 'rb').read()
        print(f'{arg}: {check(data)}')


if __name__ == '__main__':
    main(sys.argv[1:])
