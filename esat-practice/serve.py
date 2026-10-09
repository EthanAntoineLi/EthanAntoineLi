#!/usr/bin/env python3
"""Run ESAT Practice locally.

    python3 serve.py            # opens http://localhost:8765 in your browser
    python3 serve.py --port 9000 --no-browser

Only the Python standard library is used. The server listens on 127.0.0.1 only
(your own computer). Besides serving the app it offers an optional relay at
/proxy for AI providers that refuse requests made directly from a web page
(CORS); the app uses it only when "Route requests through the local server" is
ticked in Settings. Your API key passes through this process straight to the
provider and is never stored or logged.
"""

import argparse
import http.server
import json
import os
import socketserver
import sys
import threading
import urllib.error
import urllib.parse
import urllib.request
import webbrowser

ROOT = os.path.dirname(os.path.abspath(__file__))

# Headers we never forward in either direction.
HOP_BY_HOP = {
    "connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailers",
    "transfer-encoding", "upgrade", "host", "content-length", "origin", "referer", "cookie",
    "x-target-url", "accept-encoding", "sec-fetch-site", "sec-fetch-mode", "sec-fetch-dest",
}


class Handler(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):  # keep the console quiet apart from errors
        if len(args) > 1 and str(args[1]).startswith(("4", "5")):
            sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def end_headers(self):
        # Never let the browser cache the app's own files, so updates show up immediately.
        if not self.path.startswith("/proxy"):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    # --- small JSON API -------------------------------------------------
    def do_GET(self):
        if self.path.startswith("/api/health"):
            body = json.dumps({"app": "esat-practice", "proxy": True}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if self.path.startswith("/proxy"):
            return self.relay("GET")
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith("/proxy"):
            return self.relay("POST")
        self.send_error(404)

    # --- relay ------------------------------------------------------------
    def same_origin(self):
        origin = self.headers.get("Origin")
        if not origin:
            return True
        host = urllib.parse.urlparse(origin).hostname
        return host in ("localhost", "127.0.0.1", "::1")

    def relay(self, method):
        if not self.same_origin():
            self.send_error(403, "Only the local app may use the relay")
            return
        target = self.headers.get("X-Target-URL", "")
        parsed = urllib.parse.urlparse(target)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            self.send_error(400, "Missing or invalid X-Target-URL")
            return
        length = int(self.headers.get("Content-Length") or 0)
        data = self.rfile.read(length) if length else None
        headers = {k: v for k, v in self.headers.items() if k.lower() not in HOP_BY_HOP}
        req = urllib.request.Request(target, data=data, method=method, headers=headers)
        try:
            upstream = urllib.request.urlopen(req, timeout=600)
        except urllib.error.HTTPError as e:
            upstream = e  # still has status, headers and a body to pass back
        except Exception as e:  # network error, DNS, TLS…
            body = json.dumps({"error": {"message": "Local relay could not reach %s: %s" % (parsed.netloc, e)}}).encode()
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        status = getattr(upstream, "status", None) or upstream.getcode()
        self.send_response(status)
        for k, v in upstream.headers.items():
            if k.lower() not in HOP_BY_HOP and k.lower() not in ("content-encoding", "set-cookie"):
                self.send_header(k, v)
        self.send_header("Transfer-Encoding", "chunked")
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        try:
            reader = getattr(upstream, "read1", None) or upstream.read
            while True:
                chunk = reader(8192)
                if not chunk:
                    break
                self.wfile.write(b"%x\r\n%s\r\n" % (len(chunk), chunk))
                self.wfile.flush()
            self.wfile.write(b"0\r\n\r\n")
            self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError):
            pass  # the page stopped the request
        finally:
            upstream.close()


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main():
    ap = argparse.ArgumentParser(description="Run ESAT Practice on your computer.")
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--no-browser", action="store_true", help="don't open a browser tab")
    args = ap.parse_args()

    try:
        httpd = Server(("127.0.0.1", args.port), Handler)
    except OSError as e:
        print("Could not start on port %d (%s). Try: python3 serve.py --port 8766" % (args.port, e))
        sys.exit(1)
    url = "http://localhost:%d/" % args.port
    print("ESAT Practice is running at %s" % url)
    print("Keep this window open while you practise. Press Ctrl+C to stop.")
    if not args.no_browser:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
