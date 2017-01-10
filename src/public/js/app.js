// overwrite getter from spapp
window.app.get = (src, $page, pageName) => $.get(src);

// tool functions
const qsa = selector => [].slice.call(document.querySelectorAll(selector));
const log = (...arguments) => console.log(...arguments);

// user data
const User = (() => {
  let token = localStorage.getItem("token");
  let data = JSON.parse(localStorage.getItem("data"));
  return {
    login: (newToken, newData) => {
      token = newToken;
      data = newData;
      localStorage.setItem("token", token);
      localStorage.setItem("data", JSON.stringify(data));
    },
    logout: () => {
      token = null;
      data = null;
      localStorage.removeItem("token");
      localStorage.removeItem("data");
    },
    isLoggedIn: () => token !== null,
    getData: () => data,
    getToken: () => token,
  };
})();

// navigation functions
const updateNavigation = () => {
  const hash = location.hash.slice(1) || $("section[default]").attr('id');

  // navigation update
  const naviLoggedIn = User.isLoggedIn() ? "#naviloggedIn" : "#naviloggedOut";
  const links = qsa(`${naviLoggedIn} section`).map(s => `<li role="presentation" ${hash == s.id ? "class=\"active\"" : ""}><a href="#${s.id}">${s.dataset.name}</a></li>`);
  $("#navbar").html(links);

  // hide unused sections
  qsa("body section").forEach(s => s.hidden = hash != s.id);
};

$(window).on("hashchange", updateNavigation);
updateNavigation();

// on screen notifications
const Notifications = (() => {
  //let messages = [];
  const $display = $("#notifications");

  return {
    push: (msg, type = "info") => {
      // TODO auto hide after some time
      $display.append(`<div class="alert alert-${type}" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>${msg}</div>`);
    }
  };
})();

///////////////////////////////////////////////////////////////////////////////
// Page controllers
///////////////////////////////////////////////////////////////////////////////

window.app.page("home", () => {
  log("home controller: init");

  return () => {
    log("home controller: called");
  };
});

window.app.page("events", () => {
  log("event controller");
});

// API calls
function api(url, data = null) {
  return $.ajax({
    url: "/api/" + url,
    contentType: "application/json",
    data: data === null ? null : JSON.stringify(data),
    method: data === null ? "GET" : "POST"
  }).catch(msg => {
    log("API Error", msg);
    alert("API Error", JSON.stringify(msg));
  });
}

// get all form fields with their data as JSON
function getFormData(formid) {
  return $(`#${formid}`).serializeArray().reduce((obj, item) => {
    obj[item.name] = item.value;
    return obj;
  }, {});
}
