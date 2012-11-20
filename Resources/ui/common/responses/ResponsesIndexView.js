//ResponsesIndexView Component Constructor
function ResponsesIndexView(surveyID) {
  var _ = require('lib/underscore')._;
  var Response = require('models/response');
  var Survey = require('models/survey');
  var progressBarView = require('ui/common/components/ProgressBar');

  var convertModelDataForTable = function() {
    var responses = Response.findBy('survey_id', surveyID);
    return _(responses).map(function(response) {
      var row = Ti.UI.createTableViewRow({
        header : "Response #" + response.id.toString(),
        height : Titanium.UI.SIZE,
        layout : 'vertical',
        responseID : response.id
      });

      var answersData = _(response.identifierAnswers()).each(function(answer) {
        var view = Ti.UI.createView({
          layout : 'horizontal'
        });
        var label = Ti.UI.createLabel({
          text : answer.question().content + ": " + answer.contentForDisplay()
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
      return (row);
    });
  }
  var showMessageIfModelIsEmpty = function() {
    var responses = Response.findBy('survey_id', surveyID);
    if (_(responses).isEmpty()) {
      self.add(label);
      self.remove(table);
    } else {
      self.remove(label);
      self.add(table);
    }
  }

  progressBarView.addEventListener('sync:complete', function(e) {
    data = convertModelDataForTable();
    table.setData(data);
    showMessageIfModelIsEmpty();
    // Ti.App.removeEventListener('responses.sync.error', errorListener);
  });

  // var errorListener = function(data) {
  // progressBarView.hide();
  // progressBarView.reset();
  // if (data.status >= 400) {
  // alert("Your server isn't responding. Sorry about that.");
  // } else if (data.status == 0) {
  // alert("Couldn't reach the server.");
  // }
  // Ti.App.removeEventListener('surveys.fetch.error', errorListener);
  // };

  var showProgressBar = function(e) {
    self.add(progressBarView);
    progressBarView.show();
    Ti.App.removeEventListener('responses.sync.start', showProgressBar);
  };

  Ti.App.addEventListener('responses.sync.start', showProgressBar);

  //create object instance, a parasitic subclass of Observable
  var self = Ti.UI.createView();
  
    // self.addErrorListener = function() {
    // Ti.App.addEventListener('surveys.fetch.error', errorListener);
  // };


  // now assign that array to the table's data property to add those objects as rows
  var table = Titanium.UI.createTableView({
    data : convertModelDataForTable()
  });

  table.addEventListener('click', function(e) {
    self.fireEvent('ResponsesIndexView:table_row_clicked', {
      responseID : e.rowData.responseID
    });
  });

  label = Ti.UI.createLabel({
    color : '#333',
    font : {
      fontSize : 18
    },
    text : 'No responses yet.',
    textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
    top : '40%',
    width : 'auto',
    height : 'auto'
  });

  Ti.App.addEventListener('ResponseShowWindow:closed', function() {
    table.setData(convertModelDataForTable());
  });

  showMessageIfModelIsEmpty();
  return self;
}

module.exports = ResponsesIndexView;
