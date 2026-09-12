const htmlFiles = import.meta.glob(`/content/layout/*.html`, {
  query: `?raw`,
  import: `default`,
  eager: true,
});

const folder = `/content/layout/`;

document.querySelector(`#site-head`).innerHTML +=
  htmlFiles[`${folder}head.html`];

document.querySelector(`#site-header`).innerHTML +=
  htmlFiles[`${folder}header.html`];

document.querySelector(`#site-footer`).innerHTML +=
  htmlFiles[`${folder}footer.html`];

document.body.style.opacity = 1;
