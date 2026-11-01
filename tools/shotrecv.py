# 確かめ用の受け口（8806）。#test の SHOT(name) は PNG、PUTJSON(name,obj) は JSON を、
# 引数のフォルダ（なければ scratchpad の eval/shots）へ保存するだけ
import base64, os, sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "_shots")
os.makedirs(OUT, exist_ok=True)

class H(BaseHTTPRequestHandler):
    def do_POST(self):
        u = urlparse(self.path); name = parse_qs(u.query).get("name", ["x"])[0]
        name = "".join(c for c in name if c.isalnum() or c in "-_")
        body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
        if u.path == "/shot":
            data = body.split(b",", 1)[1] if body.startswith(b"data:") else body
            open(os.path.join(OUT, name + ".png"), "wb").write(base64.b64decode(data))
        else:
            open(os.path.join(OUT, name + ".json"), "wb").write(body)
        self.send_response(200); self.send_header("Access-Control-Allow-Origin", "*"); self.end_headers()
    def log_message(self, *a): pass

HTTPServer(("127.0.0.1", 8806), H).serve_forever()
