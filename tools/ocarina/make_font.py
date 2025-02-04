#!/usr/bin/env python
# coding: UTF-8

import string
import os
import re
import fontforge
from lxml import etree

if not hasattr(__builtins__, 'xrange'):
	xrange = range

GLYPH_MAP = dict(
	B = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11    },
	E = {   2, 3, 4, 5, 6, 7, 8, 9, 10,     12},
	G = {      3, 4, 5, 6, 7, 8, 9, 10,     12},
	J = {   2,       5, 6, 7, 8, 9, 10        },
	L = {   2,          6, 7, 8, 9, 10        },
	N = {   2,             7, 8, 9, 10        },
	Q = {   2,                   9, 10        },
	S = {   2,                      10        },

	A = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12},
	C = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10,     12},
	D = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10        },
	F = {   2, 3, 4, 5, 6, 7, 8, 9, 10        },
	H = {      3, 4, 5, 6, 7, 8, 9, 10        },
	I = {         4, 5, 6, 7, 8, 9, 10        },
	K = {            5, 6, 7, 8, 9, 10        },
	M = {               6, 7, 8, 9, 10        },
	O = {                  7, 8, 9, 10        },
	P = {                     8, 9, 10        },
	R = {                        9, 10        },
	T = {                           10        },
	U = {                                     }
)

EXTRA_GLYPHS = dict(
	q = 'x2',
	r = 'rest'
)

RE_STYLE = re.compile(r'\s*([^:\s]+)\s*:\s*((?:[^;:"\'\\]|"(?:[^"\\]|\\\\|\\")*"|\'(?:[^\'\\]|\\\\|\\\')*\')+)\s*(;)?\s*')

def parse_style(stylestr):
	style = {}
	stylestr = stylestr.strip()
	if stylestr:
		i = 0
		while i < len(stylestr):
			m = RE_STYLE.match(stylestr, i)
			if not m:
				raise SyntaxError, 'illegal style: '+stylestr

			key   = m.group(1).strip()
			value = m.group(2).strip()
			style[key] = value

			if m.group(3) != ';':
				if m.end() < len(stylestr):
					raise SyntaxError, 'illegal style: '+stylestr
				break

			i = m.end()

	return style

def stringify_style(style):
	return u';'.join(u'%s: %s' % (key, style[key]) for key in style)

def make_fonts(templfilename, restfilename, outfilename, name, tmpdir, letters):
	if not os.path.exists(tmpdir):
		os.makedirs(tmpdir)

	with open(templfilename, 'rb') as infile:
		templ = etree.parse(infile)

	EM = 1024
	font = fontforge.font()
	font.em = EM

	font.familyname = name
	font.fullname = name
	font.fontname = name.replace(" ", "-")

	for letter in letters:
		fill = letters[letter]
		for hole in xrange(1, 13):
			el = templ.find("//*[@id='hole_%d']" % hole)
			style = parse_style(el.attrib.get("style", ""))

			if hole in fill:
				style['fill']   = '#000000'
				style['stroke'] = 'none'
			else:
				style['fill']   = 'none'
				style['stroke'] = '#000000'

			el.attrib["style"] = stringify_style(style)

		letter_svg = etree.tostring(templ)
		letter_filename = os.path.join(tmpdir, letter+'.svg')
		with open(letter_filename, 'wb') as outfile:
			outfile.write(letter_svg)

		glyph = font.createChar(ord(letter))
		glyph.width = EM
		glyph.importOutlines(letter_filename)
		glyph.correctDirection()
		# TODO: glyph.addAnchorPoint()

	for letter in string.ascii_letters + string.digits:
		if letter not in letters and letter not in EXTRA_GLYPHS:
			glyph = font.createChar(ord(letter))
			glyph.width = EM
			glyph.importOutlines('X.svg')
			glyph.correctDirection()

	glyph = font.createChar(ord('q'))
	glyph.width = EM
	glyph.importOutlines('x2.svg')
	glyph.correctDirection()

	glyph = font.createChar(ord('r'))
	glyph.width = EM
	glyph.importOutlines(restfilename)
	glyph.correctDirection()

	glyph = font.createChar(ord('-'))
	glyph.width = EM

	pen = glyph.glyphPen()
	pen.moveTo((256, 256))
	pen.lineTo((256, 320))
	pen.lineTo((EM-256, 320))
	pen.lineTo((EM-256, 256))
	pen.closePath()
	glyph.correctDirection()
	glyph.autoHint()

	glyph = font.createChar(ord('|'))
	glyph.width = EM
	pen = glyph.glyphPen()
	pen.moveTo((480, -192))
	pen.lineTo((480, EM-192))
	pen.lineTo((544, EM-192))
	pen.lineTo((544, -192))
	pen.closePath()
	glyph.correctDirection()
	glyph.autoHint()

	glyph = font.createChar(0x0305)
	glyph.width = EM
	pen = glyph.glyphPen()
	pen.moveTo(( 0, EM))
	pen.lineTo(( 0, EM+64))
	pen.lineTo((EM, EM+64))
	pen.lineTo((EM, EM))
	pen.closePath()
	glyph.correctDirection()
	glyph.autoHint()

	glyph = font.createChar(0x1DC7)
	glyph.width = EM
#	glyph.importOutlines('vltparen.svg')
#	glyph.correctDirection()
	pen = glyph.glyphPen()
	pen.moveTo((EM-640, EM+64))
	pen.lineTo((EM-640, EM-128))
	pen.lineTo((EM-576, EM-128))
	pen.lineTo((EM-576, EM))
	pen.lineTo((EM, EM))
	pen.lineTo((EM, EM+64))
	pen.closePath()
	glyph.correctDirection()
	glyph.autoHint()

	glyph = font.createChar(0x1DC6)
	glyph.width = EM
#	glyph.importOutlines('vlbparen.svg')
#	glyph.correctDirection()
	pen = glyph.glyphPen()
	pen.moveTo((0, EM+64))
	pen.lineTo((0, EM))
	pen.lineTo((576, EM))
	pen.lineTo((576, EM-128))
	pen.lineTo((640, EM-128))
	pen.lineTo((640, EM+64))
	pen.closePath()
	glyph.correctDirection()
	glyph.autoHint()

	glyph = font.createChar(0x0311)
	glyph.width = EM
#	glyph.importOutlines('vlparen.svg')
#	glyph.correctDirection()
	pen = glyph.glyphPen()
	pen.moveTo((128, EM+64))
	pen.lineTo((128, EM-128))
	pen.lineTo((192, EM-128))
	pen.lineTo((192, EM))
	pen.lineTo((EM-192, EM))
	pen.lineTo((EM-192, EM-128))
	pen.lineTo((EM-128, EM-128))
	pen.lineTo((EM-128, EM+64))
	pen.closePath()
	glyph.correctDirection()
	glyph.autoHint()

	glyph = font.createChar(ord('_'))
	glyph.width = EM

	glyph = font.createChar(ord(' '))
	glyph.width = EM

	font.version = '1.0'
	font.copyright = '''\
Copyright (c) 2016, Mathias Panzenböck <grosser.meister.morti@gmx.net>.
with Reserved Font Name {name}.

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
'''.format(name=name)

	font.generate(outfilename)

if __name__ == '__main__':
	import sys
	templ = sys.argv[1]
	rest  = sys.argv[2]
	ttf   = sys.argv[3]
	name  = ttf.rsplit('.', 1)[0].replace('-', ' ')
	make_fonts(templ, rest, ttf, name, 'tmp', GLYPH_MAP)
