.PHONY: test server

info:
	# TODO: what should we do by default?

test:
	$(MAKE) -C test

install:
	install -D -m644 webapp/main.html "$(DESTDIR)$(PREFIX)/lib/muzak/webapp/main.html"
	install -D -m644 webapp/oskude/muzak.html "$(DESTDIR)$(PREFIX)/lib/muzak/webapp/oskude/muzak.html"
	install -D -m644 webapp/oskude/muzak/api.js "$(DESTDIR)$(PREFIX)/lib/muzak/webapp/oskude/muzak/api.js"
	install -D -m644 webapp/oskude/muzak/lister.html "$(DESTDIR)$(PREFIX)/lib/muzak/webapp/oskude/muzak/lister.html"
	install -D -m644 webapp/oskude/muzak/player.html "$(DESTDIR)$(PREFIX)/lib/muzak/webapp/oskude/muzak/player.html"
	install -D -m755 server/server "$(DESTDIR)$(PREFIX)/lib/muzak/server/server"
	install -D -m755 server/scanner "$(DESTDIR)$(PREFIX)/lib/muzak/server/scanner"
	install -D -m644 server/lib/config.js "$(DESTDIR)$(PREFIX)/lib/muzak/server/lib/config.js"
	install -D -m644 server/lib/database.js "$(DESTDIR)$(PREFIX)/lib/muzak/server/lib/database.js"
	install -D -m644 server/lib/rip.js "$(DESTDIR)$(PREFIX)/lib/muzak/server/lib/rip.js"
	install -D -m644 server/lib/server.js "$(DESTDIR)$(PREFIX)/lib/muzak/server/lib/server.js"
	install -D -m644 distro/muzak.conf.json "$(DESTDIR)$(PREFIX)/share/muzak/muzak.conf.json"
	install -D -m644 distro/muzak.sql "$(DESTDIR)$(PREFIX)/share/muzak/muzak.sql"
	install -D -m644 distro/muzak-server.service "$(DESTDIR)$(PREFIX)/lib/systemd/system/muzak-server.service"
	install -d "$(DESTDIR)$(PREFIX)/bin"
	ln -s "$(PREFIX)/lib/muzak/server/server" "$(DESTDIR)$(PREFIX)/bin/muzak-server"
	ln -s "$(PREFIX)/lib/muzak/server/scanner" "$(DESTDIR)$(PREFIX)/bin/muzak-scan"

# TODO: add uninstall

archlinux:
	cd distro/archlinux; \
		makepkg -f

clean:
	rm -f test/test.db
	rm -rf distro/archlinux/pkg
	rm -rf distro/archlinux/src
	rm -rf distro/archlinux/muzak
	rm -f distro/archlinux/*.pkg.tar.*
