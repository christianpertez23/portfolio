# Christian Pertez — Portfolio

Dark blue/black multi-page portfolio with a login system and a visible **Log out** button.

## Structure
```
index.html about.html skill.html project.html contact.html login.html project1-4.html
css/style.css      <- the ONLY stylesheet (colors are the :root variables at the top)
js/app.js          <- nav, auth, animations, lightbox
api/auth.php       <- real accounts on XAMPP (PHP + SQLite)
image/ video/ origami/   <- your media (unchanged)
```
Use lowercase file names (GitHub is case-sensitive).

## Login modes (automatic)
- **XAMPP:** PHP sessions + SQLite, hashed passwords. If registering fails, enable `extension=pdo_sqlite` and `extension=sqlite3` in `C:\xampp\php\php.ini`, restart Apache, and make `api/` writable.
- **GitHub Pages:** no PHP, so accounts are stored in the visitor's browser (demo-level gate only).
- Projects and project1-4 pages require login; logged-out visitors are sent to the login page and returned afterward.

## Run locally
Copy the folder to `C:\xampp\htdocs\portfolio`, start Apache, open `http://localhost/portfolio/`.

## Deploy to GitHub Pages
Push everything to a public repo, then Settings → Pages → Deploy from branch `main` `/ (root)`.

## Customize
Colors: `:root` in `css/style.css`. Hero roles: array `L` in `js/app.js`. Skills: array in `skill.html`.
