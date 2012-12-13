//ResponsesIndexView Component Constructor
function ResponsesIndexView(surveyID) {
  var _ = require('lib/underscore')._;
  var Response = require('models/response');
  var Survey = require('models/survey');
  var TopLevelView = require('ui/common/components/TopLevelView');
  var progressBarView = require('ui/common/components/ProgressBar');
  var SurveyDetailsView = require('ui/common/surveys/SurveyDetailsView');
  var Palette = require('ui/common/components/Palette');
  var SeparatorView = require('ui/common/components/SeparatorView');
  var Measurements = require('ui/common/components/Measurements');
  var NetworkHelper = require('helpers/NetworkHelper');


  var colorForResponse = function(response) {
    return (response.status === 'complete')? Palette.SECONDARY_COLOR : Palette.SECONDARY_COLOR_LIGHT;
  };

  var survey = Survey.findOneById(surveyID);

  var convertModelDataForTable = function() {
    var responses = survey.responsesForCurrentUser();
    responses = _(responses).sortBy(function(response){
      return response.status;
    });

    return _(responses).map(function(response) {
      var row = Ti.UI.createTableViewRow({
        hasDetail : true,
        height : Titanium.UI.SIZE,
        layout : 'vertical',
        responseID : response.id,
        backgroundColor : colorForResponse(response)
      });

      var responseLabel = Ti.UI.createLabel({
        text : "Response #" + response.id.toString(),
        color : Palette.PRIMARY_COLOR,
        font : {
          fontSize : Measurements.FONT_BIG        }
      });

      row.add(responseLabel);

      var answersData = _(response.identifierAnswers()).each(function(answer) {
        var view = Ti.UI.createView({
          layout : 'horizontal',
          left : Measurements.PADDING_MEDIUM
        });
        var label = Ti.UI.createLabel({
          text : answer.question().content + ": " + answer.contentForDisplay(),
          color : Palette.PRIMARY_COLOR,
          font : {
            fontSize : Measurements.FONT_MEDIUM          }
        });
        view.add(label);
        if (answer.isImage()) {
          var imageView = Ti.UI.createImageView({
            width : 100,
            height : 100,
            image : answer.image
          });
          view.add(imageView);
        }
        row.add(view);
      });

      row.add(new SeparatorView(colorForResponse(response), Measurements.PADDING_SMALL));
      row.add(new SeparatorView(Palette.WHITE, Measurements.PADDING_SMALL));
      return (row);
    });
  };
  var showMessageIfModelIsEmpty = function() {
    var responses = survey.responsesForCurrentUser();
    if (_(responses).isEmpty()) {
      contentView.add(label);
      contentView.remove(table);
    } else {
      contentView.remove(label);
      contentView.add(table);
    }
  };

  var self = new TopLevelView('List of Responses');

  self.syncResponses = function() {
    NetworkHelper.pingSurveyWebWithLoggedInCheck( onSuccess = function() {
      var progressBar = progressBarView;
      self.add(progressBar);
      progressBar.init('response.sync.' + survey.id + '.completed', survey.responseCount());
      progressBar.setMessage('Syncing responses...');
      survey.syncResponses(progressBar.incrementValue);
      self.addProgressCompleteListener();
    });
  };

  var progressComplete = function(e) {
    Ti.API.info("Sync complete for resopnses!!!");
    self.remove(progressBarView);
    data = convertModelDataForTable();
    table.setData(data);
    showMessageIfModelIsEmpty();
    self.fireEvent('progress.finish');
    progressBarView.removeEventListener('sync.complete.survey.response', progressComplete);
  };

  self.addProgressCompleteListener = function() {
    progressBarView.addEventListener('sync.complete.survey.response', progressComplete);
  };

  var contentView = Ti.UI.createView({
    top : Measurements.HEADER_HEIGHT,
    layout :'vertical',
    height : Ti.UI.SIZE
  });
  
  contentView.add(new SurveyDetailsView(survey));
  self.add(contentView);

  var table = Titanium.UI.createTableView({
    separatorColor : 'transparent',
    data : convertModelDataForTable()
  });

  table.addEventListener('click', function(e) {
    self.fireEvent('ResponsesIndexView:table_row_clicked', {
      responseID : e.rowData.responseID
    });
  });

  var label = Ti.UI.createLabel({
    color : '#333',
    font : {
      fontSize : Measurements.FONT_BIG    },
    text : 'No responses.',
    textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
    top : '40%',
    width : 'auto',
    height : 'auto'
  });

  Ti.App.addEventListener('ResponseShowWindow:closed', function() {
    table.setData(convertModelDataForTable());
    showMessageIfModelIsEmpty();
  });

  showMessageIfModelIsEmpty();
  return self;
}

module.exports = ResponsesIndexView;
