// overwrite getter from spapp
window.app.get = (src, $page, pageName) => $.get(src);

// tool functions
const qsa = selector => [].slice.call(document.querySelectorAll(selector));
const log = (...arguments) => console.log(...arguments);


const updateNavigation = function () {
  const hash = location.hash.slice(1) || $("section[default]").attr('id');

  // navigation update
  const links = qsa("body section[navi]").map(s => `<li role="presentation" ${hash == s.id ? "class=\"active\"" : ""}><a href="#${s.id}">${s.dataset.name}</a></li>`);
  $("#navbar").html(links);

  // hide unused sections
  qsa("body section").forEach(s => s.hidden = hash != s.id);
};

$(window).on("hashchange", updateNavigation);
updateNavigation();

///////////////////////////////////////////////////////////////////////////////
// Page controllers
///////////////////////////////////////////////////////////////////////////////

window.app.page("home", () => {
  log("home controller: init");

  return () => {
    log("home controller: called");
  };
});

window.app.page("events", function () {
  log("event controller");
});

window.app.page("members", function () {
  log("member controller");
});