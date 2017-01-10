function getGravatarUrl(userEmail) {
    console.info(userEmail);
    var hash = md5(userEmail.trim().toLowerCase());
    return 'http://www.gravatar.com/avatar/' + hash;
}

