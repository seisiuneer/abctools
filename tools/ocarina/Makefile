FONTS=Open-12-Hole-Ocarina-1.ttf Open-12-Hole-Ocarina-2.ttf

.PHONY: all clean

all: $(FONTS)

%.ttf: %.svg %-Rest.svg x2.svg X.svg make_font.py
	./make_font.py $< $(word 2,$+) $@

clean:
	rm -v $(FONTS)
