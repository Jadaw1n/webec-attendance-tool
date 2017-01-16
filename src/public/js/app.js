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

      document.getElementById('gravatar').setAttribute('src', getGravatarUrl(data.email));
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
  const hash = (location.hash.slice(1) || $("section[default]").attr('id')).split(':')[0];

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

// API calls
function api(url, data = null, method = null) {
  return $.ajax({
    url: "/api/" + url,
    contentType: "application/json",
    data: data === null ? null : JSON.stringify(data),
    method: method !== null ? method : (data === null ? "GET" : "POST"),
    headers: {
      Authorization: User.getToken()
    },
  }).catch(error => {
    const msg = error.responseJSON;
    if (msg.status === "not_logged_in") {
      // redirect to login page if token expired
      User.logout();
      window.location.hash = "login";
      return;
    }

    log("API Error", error);
    alert("API Error", JSON.stringify(error));
  });
}

// get all form fields with their data as JSON
function getFormData(formid) {
  return $(`#${formid}`).serializeArray().reduce((obj, item) => {
    obj[item.name] = item.value;
    return obj;
  }, {});
}

// gravatar
function getGravatarUrl(userEmail) {
    var hash = md5(userEmail.trim().toLowerCase());
    return 'http://www.gravatar.com/avatar/' + hash;
}
