//Application Window Component Constructor
function SurveysIndexWindow() {
	//load component dependencies
	var SurveysIndexView = require('ui/common/surveys/SurveysIndexView');
	var SettingsWindow = require('ui/handheld/android/SettingsWindow')
	var Survey = require('models/survey');
	var Question = require('models/question');
	var SurveyDetailsWindow = require('ui/handheld/android/SurveyDetailsWindow')

	//create component instance
	var self = Ti.UI.createWindow({
		title : 'Surveys',
		backgroundColor : '#fff',
		navBarHidden : false,
		exitOnClose : true,
		activity : {
			onCreateOptionsMenu : function(e) {
				var menu = e.menu;
				var menuItemSync = menu.add({
					title : "Sync"
				});
				menuItemSync.addEventListener('click', function() {
					Survey.fetchSurveys();
				});
				menuItemSync.setIcon("images/refresh.png");
				var menuItemSettings = menu.add({
					title : "Settings"
				});
				menuItemSettings.addEventListener('click', function() {
					SettingsWindow().open();
				});
				menuItemSettings.setIcon("images/settings.png");
			}
		}
	});

	Ti.App.addEventListener('settings_saved', function() {
		settingsWindow.close();
	})

	Ti.App.addEventListener('surveys_index_view.table_row_clicked', function(e) {
		SurveyDetailsWindow(e.surveyID).open();
	});

	//construct UI
	var surveysIndexView = new SurveysIndexView();
	self.add(surveysIndexView);

	return self;
}

//make constructor function the public component interface
module.exports = SurveysIndexWindow;
