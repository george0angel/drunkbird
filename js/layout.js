const htmlFiles = import.meta.glob(`/content/layout/*.html`, {
  query: `?raw`,
  import: `default`,
  eager: true,
});

const folder = `/content/layout/`;

document
  .querySelector(`#site-head`)
  .insertAdjacentHTML(`beforeend`, htmlFiles[`${folder}head.html`]);

document
  .querySelector(`#site-header`)
  .insertAdjacentHTML(`beforeend`, htmlFiles[`${folder}header.html`]);

document
  .querySelector(`#site-footer`)
  .insertAdjacentHTML(`beforeend`, htmlFiles[`${folder}footer.html`]);

document.body.style.opacity = 1;
