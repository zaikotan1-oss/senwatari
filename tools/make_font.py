# 丸い字（Zen Maru Gothic・OFL）を、このゲームで使う字だけに切り出して fonts/ へ（woff2）
# 字を足したら: python tools/make_font.py （元の ttf は tools/fontsrc/ ・git に入れない）
import os,glob
from fontTools import subset
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..")
txt="".join(open(f,encoding="utf-8").read() for f in [os.path.join(R,x) for x in ["index.html","stages.js","looks.js","modes.js","gen.js"]])
chars=set(txt)
chars|=set(chr(c) for c in range(0x20,0x7f))|set(chr(c) for c in range(0x3040,0x30ff))|set("ー・。、！？「」『』（）〜…★☆⭐♪→←↑↓↩")
chars|=set(chr(c) for c in range(0xff01,0xff5f))
for w in ["Bold","Black"]:
    src=os.path.join(R,"tools","fontsrc",f"ZenMaruGothic-{w}.ttf");out=os.path.join(R,"fonts",f"zenmaru-{w.lower()}.woff2")
    o=subset.Options();o.flavor="woff2";o.layout_features=["*"];o.name_IDs=["*"];o.notdef_outline=True
    f=subset.load_font(src,o);s=subset.Subsetter(o);s.populate(text="".join(sorted(chars)));s.subset(f);subset.save_font(f,out,o)
    print(out,os.path.getsize(out))
