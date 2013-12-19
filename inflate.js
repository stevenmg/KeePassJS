/*From http://www.onicos.com/staff/iz/amuse/javascript/expert/inflate.txt
Copyright (C) 1999,2012 Masanao Izumo <iz@onicos.co.jp>
Version: 1.0.1
LastModified: Jun 29 2012*/
function zip_HuftList() { this.next = null, this.list = null } function zip_HuftNode() { this.e = 0, this.b = 0, this.n = 0, this.t = null } function zip_HuftBuild(t, i, e, n, r, f) {
    this.BMAX = 16, this.N_MAX = 288, this.status = 0, this.root = null, this.m = 0
    var _, s, o, p, a, u, l, h, z, c, d, B, y, b, g, I, E, T = Array(this.BMAX + 1), S = Array(this.BMAX + 1), w = new zip_HuftNode, v = Array(this.BMAX), D = Array(this.N_MAX), A = Array(this.BMAX + 1)
    for (E = this.root = null, u = 0; u < T.length; u++) T[u] = 0
    for (u = 0; u < S.length; u++) S[u] = 0
    for (u = 0; u < v.length; u++) v[u] = null
    for (u = 0; u < D.length; u++) D[u] = 0
    for (u = 0; u < A.length; u++) A[u] = 0
    s = i > 256 ? t[256] : this.BMAX, z = t, c = 0, u = i
    do T[z[c]]++, c++
    while (--u > 0)
    if (T[0] == i) return this.root = null, this.m = 0, this.status = 0, void 0
    for (l = 1; l <= this.BMAX && 0 == T[l]; l++); for (h = l, l > f && (f = l), u = this.BMAX; 0 != u && 0 == T[u]; u--); for (p = u, f > u && (f = u), b = 1 << l; u > l; l++, b <<= 1) if ((b -= T[l]) < 0) return this.status = 2, this.m = f, void 0
    if ((b -= T[u]) < 0) return this.status = 2, this.m = f, void 0
    for (T[u] += b, A[1] = l = 0, z = T, c = 1, y = 2; --u > 0;) A[y++] = l += z[c++]
    z = t, c = 0, u = 0
    do 0 != (l = z[c++]) && (D[A[l]++] = u)
    while (++u < i)
    for (i = A[p], A[0] = u = 0, z = D, c = 0, a = -1, B = S[0] = 0, d = null, g = 0; p >= h; h++) for (_ = T[h]; _-- > 0;) {
        for (; h > B + S[1 + a];) {
            if (B += S[1 + a], a++, g = (g = p - B) > f ? f : g, (o = 1 << (l = h - B)) > _ + 1) for (o -= _ + 1, y = h; ++l < g && !((o <<= 1) <= T[++y]) ;) o -= T[y]
            for (B + l > s && s > B && (l = s - B), g = 1 << l, S[1 + a] = l, d = Array(g), I = 0; g > I; I++) d[I] = new zip_HuftNode
            E = null == E ? this.root = new zip_HuftList : E.next = new zip_HuftList, E.next = null, E.list = d, v[a] = d, a > 0 && (A[a] = u, w.b = S[a], w.e = 16 + l, w.t = d, l = (u & (1 << B) - 1) >> B - S[a], v[a - 1][l].e = w.e, v[a - 1][l].b = w.b, v[a - 1][l].n = w.n, v[a - 1][l].t = w.t)
        } for (w.b = h - B, c >= i ? w.e = 99 : z[c] < e ? (w.e = z[c] < 256 ? 16 : 15, w.n = z[c++]) : (w.e = r[z[c] - e], w.n = n[z[c++] - e]), o = 1 << h - B, l = u >> B; g > l; l += o) d[l].e = w.e, d[l].b = w.b, d[l].n = w.n, d[l].t = w.t
        for (l = 1 << h - 1; 0 != (u & l) ; l >>= 1) u ^= l
        for (u ^= l; (u & (1 << B) - 1) != A[a];) B -= S[a], a--
    } this.m = S[1], this.status = 0 != b && 1 != p ? 1 : 0
} function zip_GET_BYTE() { return zip_inflate_data.length == zip_inflate_pos ? -1 : 255 & zip_inflate_data.charCodeAt(zip_inflate_pos++) } function zip_NEEDBITS(t) { for (; t > zip_bit_len;) zip_bit_buf |= zip_GET_BYTE() << zip_bit_len, zip_bit_len += 8 } function zip_GETBITS(t) { return zip_bit_buf & zip_MASK_BITS[t] } function zip_DUMPBITS(t) { zip_bit_buf >>= t, zip_bit_len -= t } function zip_inflate_codes(t, i, e) {
    var n, r, f
    if (0 == e) return 0
    for (f = 0; ;) {
        for (zip_NEEDBITS(zip_bl), r = zip_tl.list[zip_GETBITS(zip_bl)], n = r.e; n > 16;) {
            if (99 == n) return -1
            zip_DUMPBITS(r.b), n -= 16, zip_NEEDBITS(n), r = r.t[zip_GETBITS(n)], n = r.e
        } if (zip_DUMPBITS(r.b), 16 != n) {
            if (15 == n) break
            for (zip_NEEDBITS(n), zip_copy_leng = r.n + zip_GETBITS(n), zip_DUMPBITS(n), zip_NEEDBITS(zip_bd), r = zip_td.list[zip_GETBITS(zip_bd)], n = r.e; n > 16;) {
                if (99 == n) return -1
                zip_DUMPBITS(r.b), n -= 16, zip_NEEDBITS(n), r = r.t[zip_GETBITS(n)], n = r.e
            } for (zip_DUMPBITS(r.b), zip_NEEDBITS(n), zip_copy_dist = zip_wp - r.n - zip_GETBITS(n), zip_DUMPBITS(n) ; zip_copy_leng > 0 && e > f;) zip_copy_leng--, zip_copy_dist &= zip_WSIZE - 1, zip_wp &= zip_WSIZE - 1, t[i + f++] = zip_slide[zip_wp++] = zip_slide[zip_copy_dist++]
            if (f == e) return e
        } else if (zip_wp &= zip_WSIZE - 1, t[i + f++] = zip_slide[zip_wp++] = r.n, f == e) return e
    } return zip_method = -1, f
} function zip_inflate_stored(t, i, e) {
    var n
    if (n = 7 & zip_bit_len, zip_DUMPBITS(n), zip_NEEDBITS(16), n = zip_GETBITS(16), zip_DUMPBITS(16), zip_NEEDBITS(16), n != (65535 & ~zip_bit_buf)) return -1
    for (zip_DUMPBITS(16), zip_copy_leng = n, n = 0; zip_copy_leng > 0 && e > n;) zip_copy_leng--, zip_wp &= zip_WSIZE - 1, zip_NEEDBITS(8), t[i + n++] = zip_slide[zip_wp++] = zip_GETBITS(8), zip_DUMPBITS(8)
    return 0 == zip_copy_leng && (zip_method = -1), n
} function zip_inflate_fixed(t, i, e) {
    if (null == zip_fixed_tl) {
        var n, r, f = Array(288)
        for (n = 0; 144 > n; n++) f[n] = 8
        for (; 256 > n; n++) f[n] = 9
        for (; 280 > n; n++) f[n] = 7
        for (; 288 > n; n++) f[n] = 8
        if (zip_fixed_bl = 7, r = new zip_HuftBuild(f, 288, 257, zip_cplens, zip_cplext, zip_fixed_bl), 0 != r.status) return alert("HufBuild error: " + r.status), -1
        for (zip_fixed_tl = r.root, zip_fixed_bl = r.m, n = 0; 30 > n; n++) f[n] = 5
        if (zip_fixed_bd = 5, r = new zip_HuftBuild(f, 30, 0, zip_cpdist, zip_cpdext, zip_fixed_bd), r.status > 1) return zip_fixed_tl = null, alert("HufBuild error: " + r.status), -1
        zip_fixed_td = r.root, zip_fixed_bd = r.m
    } return zip_tl = zip_fixed_tl, zip_td = zip_fixed_td, zip_bl = zip_fixed_bl, zip_bd = zip_fixed_bd, zip_inflate_codes(t, i, e)
} function zip_inflate_dynamic(t, i, e) {
    var n, r, f, _, s, o, p, a, u, l = Array(316)
    for (n = 0; n < l.length; n++) l[n] = 0
    if (zip_NEEDBITS(5), p = 257 + zip_GETBITS(5), zip_DUMPBITS(5), zip_NEEDBITS(5), a = 1 + zip_GETBITS(5), zip_DUMPBITS(5), zip_NEEDBITS(4), o = 4 + zip_GETBITS(4), zip_DUMPBITS(4), p > 286 || a > 30) return -1
    for (r = 0; o > r; r++) zip_NEEDBITS(3), l[zip_border[r]] = zip_GETBITS(3), zip_DUMPBITS(3)
    for (; 19 > r; r++) l[zip_border[r]] = 0
    if (zip_bl = 7, u = new zip_HuftBuild(l, 19, 19, null, null, zip_bl), 0 != u.status) return -1
    for (zip_tl = u.root, zip_bl = u.m, _ = p + a, n = f = 0; _ > n;) if (zip_NEEDBITS(zip_bl), s = zip_tl.list[zip_GETBITS(zip_bl)], r = s.b, zip_DUMPBITS(r), r = s.n, 16 > r) l[n++] = f = r
    else if (16 == r) {
        if (zip_NEEDBITS(2), r = 3 + zip_GETBITS(2), zip_DUMPBITS(2), n + r > _) return -1
        for (; r-- > 0;) l[n++] = f
    } else if (17 == r) {
        if (zip_NEEDBITS(3), r = 3 + zip_GETBITS(3), zip_DUMPBITS(3), n + r > _) return -1
        for (; r-- > 0;) l[n++] = 0
        f = 0
    } else {
        if (zip_NEEDBITS(7), r = 11 + zip_GETBITS(7), zip_DUMPBITS(7), n + r > _) return -1
        for (; r-- > 0;) l[n++] = 0
        f = 0
    } if (zip_bl = zip_lbits, u = new zip_HuftBuild(l, p, 257, zip_cplens, zip_cplext, zip_bl), 0 == zip_bl && (u.status = 1), 0 != u.status) return 1 == u.status, -1
    for (zip_tl = u.root, zip_bl = u.m, n = 0; a > n; n++) l[n] = l[n + p]
    return zip_bd = zip_dbits, u = new zip_HuftBuild(l, a, 0, zip_cpdist, zip_cpdext, zip_bd), zip_td = u.root, zip_bd = u.m, 0 == zip_bd && p > 257 ? -1 : (1 == u.status, 0 != u.status ? -1 : zip_inflate_codes(t, i, e))
} function zip_inflate_start() { null == zip_slide && (zip_slide = Array(2 * zip_WSIZE)), zip_wp = 0, zip_bit_buf = 0, zip_bit_len = 0, zip_method = -1, zip_eof = !1, zip_copy_leng = zip_copy_dist = 0, zip_tl = null } function zip_inflate_internal(t, i, e) {
    var n, r
    for (n = 0; e > n;) {
        if (zip_eof && -1 == zip_method) return n
        if (zip_copy_leng > 0) {
            if (zip_method != zip_STORED_BLOCK) for (; zip_copy_leng > 0 && e > n;) zip_copy_leng--, zip_copy_dist &= zip_WSIZE - 1, zip_wp &= zip_WSIZE - 1, t[i + n++] = zip_slide[zip_wp++] = zip_slide[zip_copy_dist++]
            else {
                for (; zip_copy_leng > 0 && e > n;) zip_copy_leng--, zip_wp &= zip_WSIZE - 1, zip_NEEDBITS(8), t[i + n++] = zip_slide[zip_wp++] = zip_GETBITS(8), zip_DUMPBITS(8)
                0 == zip_copy_leng && (zip_method = -1)
            } if (n == e) return n
        } if (-1 == zip_method) {
            if (zip_eof) break
            zip_NEEDBITS(1), 0 != zip_GETBITS(1) && (zip_eof = !0), zip_DUMPBITS(1), zip_NEEDBITS(2), zip_method = zip_GETBITS(2), zip_DUMPBITS(2), zip_tl = null, zip_copy_leng = 0
        } switch (zip_method) {
            case 0: r = zip_inflate_stored(t, i + n, e - n)
                break
            case 1: r = null != zip_tl ? zip_inflate_codes(t, i + n, e - n) : zip_inflate_fixed(t, i + n, e - n)
                break
            case 2: r = null != zip_tl ? zip_inflate_codes(t, i + n, e - n) : zip_inflate_dynamic(t, i + n, e - n)
                break
            default: r = -1
        } if (-1 == r) return zip_eof ? 0 : -1
        n += r
    } return n
} function zip_inflate(t) {
    var i, e, n, r
    zip_inflate_start(), zip_inflate_data = t, zip_inflate_pos = 0
    var f = -1
    for (e = Array(1024), i = ""; (n = zip_inflate_internal(e, 0, e.length)) > 0 && f != zip_inflate_pos;) for (f = zip_inflate_pos, r = 0; n > r; r++) i += String.fromCharCode(e[r])
    return zip_inflate_data = null, i
} var zip_WSIZE = 32768, zip_STORED_BLOCK = 0, zip_STATIC_TREES = 1, zip_DYN_TREES = 2, zip_lbits = 9, zip_dbits = 6, zip_INBUFSIZ = 32768, zip_INBUF_EXTRA = 64, zip_slide, zip_wp, zip_fixed_tl = null, zip_fixed_td, zip_fixed_bl, fixed_bd, zip_bit_buf, zip_bit_len, zip_method, zip_eof, zip_copy_leng, zip_copy_dist, zip_tl, zip_td, zip_bl, zip_bd, zip_inflate_data, zip_inflate_pos, zip_MASK_BITS = [0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767, 65535], zip_cplens = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], zip_cplext = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99], zip_cpdist = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577], zip_cpdext = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], zip_border = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]