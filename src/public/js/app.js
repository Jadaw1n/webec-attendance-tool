// overwrite getter from spapp
window.app.get = (src, $page, pageName) => $.get(src);

// tool functions
const qsa = selector => [].slice.call(document.querySelectorAll(selector));
const log = (...args) => console.log(...args);

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
      updateGravatar();
    },
    logout: () => {
      token = null;
      data = null;
      localStorage.removeItem("token");
      localStorage.removeItem("data");
      updateGravatar();
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
  $("#naviloggedIn, #naviloggedOut").hide();
  $(naviLoggedIn).show();

  // hide unused sections
  qsa("body section").forEach(s => s.hidden = hash != s.id);
};

$(window).on("hashchange", updateNavigation);
updateNavigation();

// update gravatar
const getGravatarUrl = (userEmail) => 'https://www.gravatar.com/avatar/' + md5(userEmail.trim().toLowerCase());
function updateGravatar() {
  if (User.isLoggedIn()) {
    $("#gravatar")[0].setAttribute('src', getGravatarUrl(User.getData().email));
    $("#useremail").text(User.getData().email);
  } else {
    $("#gravatar")[0].setAttribute('src', '');
    $("#useremail").text("");
  }
}

updateGravatar();

// on screen notifications
const Notifications = (() => {
  //let messages = [];
  const $display = $("#notifications");

  return {
    push: (msg, type = "info") => {
      // create notification div
      $msg = $(`<div class="alert alert-${type}" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>${msg}</div>`);
      // append to display
      $display.append($msg);

      // hide after some time
      setTimeout(() => $msg.fadeOut(), 5000);
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
