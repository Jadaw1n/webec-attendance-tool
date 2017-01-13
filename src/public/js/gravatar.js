window.app.page("home", () => {
  // called on init

  return (eventid) => {
    // called every time the page is accessed
    var user = User.getData()
    if (user !== null) {
        userGravatarUrl = getGravatarUrl(user.email);
        document.getElementById('gravatar').setAttribute('src', userGravatarUrl);
    }
  }
});

function getGravatarUrl(userEmail) {
    var hash = md5(userEmail.trim().toLowerCase());
    return 'http://www.gravatar.com/avatar/' + hash;
}

