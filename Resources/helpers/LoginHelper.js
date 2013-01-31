var ConfirmDialog = require('ui/common/components/ConfirmDialog');
var Toast = require('ui/common/components/Toast');

var LoginHelper = {
  loggedIn : function() {
    var accessToken = Ti.App.Properties.getString('access_token');
    var accessTokenCreatedAt = Ti.App.Properties.getString('access_token_created_at');

    if (!accessToken)
      return false;

    if (new Date() - new Date(accessTokenCreatedAt) > 35000000) {//Expire the token after 9.72 hours.
      alert(L("session_expired"));
      LoginHelper.expireSession();
      return false;
    }

    return true;
  },

  logout : function(clearDB) {
    var confirmDialog = new ConfirmDialog("Logout", "Are you sure? This will clear all the surveys on this device.", onConfirm = function(e) {
      LoginHelper.expireSession();
      Ti.App.Properties.setString('loggedIn', null);
      var DatabaseHelper = require('helpers/DatabaseHelper');
      DatabaseHelper.clearDatabase();
      Ti.App.Properties.setString('email', null);
      (new Toast(L("logout_message"))).show();
      Ti.App.fireEvent('settings.refreshSurveys');
    });
    confirmDialog.show();
  },

  expireSession : function() {
    Ti.App.Properties.setString('access_token', null);
    Ti.App.Properties.setString('access_token_created_at', null);
  },

  login : function(email, password, rememberMe, topLevelView) {
    var loginUrl = Ti.App.Properties.getString('server_url') + '/api/login';
    var NetworkHelper = require('helpers/NetworkHelper');
    NetworkHelper.pingSurveyWebWithoutLoggedInCheck( onSuccess = function() {
      var client = Ti.Network.createHTTPClient();
      client.autoRedirect = false;

      client.onload = function() {
        Ti.App.fireEvent('login.done');
        var response = JSON.parse(this.responseText);
        (new Toast(L('login_message'))).show();
        Ti.App.Properties.setString('access_token', response.access_token);
        Ti.App.Properties.setString('access_token_created_at', new Date().toString());
        Ti.API.info(response.username);
        Ti.App.Properties.setString('username', response.username);
        Ti.App.Properties.setString('loggedIn', 'true');
        Ti.App.Properties.setString('email', email);
        if(rememberMe) {
          Ti.App.Properties.setString('password', password);
        } else {
          Ti.App.Properties.setString('password', '');
        }
        Ti.App.Properties.setString('user_id', response.user_id);
        Ti.App.Properties.setString('organization_id', response.organization_id);
        topLevelView.fireEvent('login:completed');
      };
      client.setTimeout(5000);
      client.onerror = function() {
        Ti.App.fireEvent('login.done');
        alert(L("login_failed"));
      };
      client.open('POST', loginUrl);
      client.send({
        username : email,
        password : password
      });
    });
  }
};

module.exports = LoginHelper;
