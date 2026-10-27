# Santa Paws Website

A one-page site for Santa Paws, a Clifton Builders Program student business at the University of Nebraska–Lincoln.
It's plain HTML, CSS, and JavaScript, with no build step.

## Files
| File | What it is |
| --- | --- |
| `index.html` | All page content |
| `styles.css` | Colors, fonts, and layout (colors are set at the top) |
| `script.js` | **Prices are at the top**, plus the menu, live order total, and form |
| `santa-paws-logo.webp`, `santa-paws-logo-small.webp` | Optimized logos used on the page |
| `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png` | Browser and phone icons |
| `make-favicons.py` | Rebuilds the logos and icons from `santa-paws-logo-original.png` |

To find every placeholder, search `index.html` for **"Coming soon"**.

## Filling in placeholders
- **Prices:** in `script.js`, change `null` to a number (for example, `treats: 8`). The product cards and the order total update automatically.
- **Photos:** replace a `<div class="photo-ph ...">…</div>` block with
  `<img class="product-photo" src="treats.jpg" alt="Bag of Santa Paws holiday dog treats">`
  (or `class="team-photo"` for team headshots).
- **Formspree:** create a free form at formspree.io, then replace `YOUR_FORM_ID` in the form's `action`.
- **Video:** follow the comment inside `<div class="video-frame">`.
- **External links** (charity, social media): add `target="_blank" rel="noopener"`.

## Publish free on GitHub Pages
1. Create a free account at github.com, if you don't have one.
2. Click **+ → New repository**, name it `santa-paws`, set it to **Public**, and click **Create repository**.
3. On the new repo page, click **uploading an existing file**, drag in everything from this folder
   (you can skip `santa-paws-logo-original.png` and `make-favicons.py`), and click **Commit changes**.
4. Go to **Settings → Pages**. Under "Build and deployment," choose **Deploy from a branch**, pick **main** and **/(root)**, and click **Save**.
5. Wait 1–2 minutes and refresh. Your site will be live at `https://YOUR-USERNAME.github.io/santa-paws/`.
6. To update the site later, upload the changed files the same way. GitHub republishes automatically.
