var _ = require('lib/underscore')._;
var Response = require('models/response');
var ButtonView = require('ui/common/components/ButtonView');

function MultiRecordCategoryView(multiRecordCategory, response, number, pageNumber) {
  var view_height = 400;
  var self = Ti.UI.createView({
    layout : 'vertical',
    height : Titanium.UI.SIZE
  });

  var childrenViews = [];

  var button = new ButtonView('Add a Record', { 'width' : '50%' });
  self.add(button);

  var getDeleteRecordButton = function() {
    return new ButtonView("Delete the record", { 'width' : '50%' });
  };

  var QuestionView = require('ui/common/questions/QuestionView');

  var deleteRecord = function(recordID) {
    var Record = require('models/record');
    record = Record.findOneById(recordID);
    record.destroyWithAnswers();
    removeRecordFromView(recordID);
  };

  var removeRecordFromView = function(recordID) {
    childrenViews = _(childrenViews).reject(function(childView) {
      return childView.recordID == recordID;
    });
    showSubQuestions();
  };

  var addRecord = function(e, recordID) {
    if(!recordID) {
      var Record = require('models/record');
      var record = Record.createRecord({
        category_id : multiRecordCategory.id
      });
      recordID = record.id;
    }

    var subQuestions = multiRecordCategory.firstLevelSubQuestions();
    _(subQuestions).each(function(subQuestion, index) {
      var subQuestionAnswer = response && recordID ? response.answerForQuestion(subQuestion.id, recordID) : null;
      var subQuestionNumber = number + '.' + (index + 1);
      childrenViews.push(new QuestionView(subQuestion, subQuestionAnswer, response, subQuestionNumber, pageNumber, recordID));
    });
    var deleteRecordButton = getDeleteRecordButton();
    deleteRecordButton.recordID = recordID;
    childrenViews.push(deleteRecordButton);
    deleteRecordButton.getSubQuestions = function() {
      return null;
    };
    deleteRecordButton.addEventListener('click', function() {
      deleteRecord(recordID);
    });
    showSubQuestions();
  };

  var showSubQuestions = function(selectedRowID) {
    Ti.App.fireEvent('show.sub.questions');
  };

  var records;
  if(response) {
    records = response.recordsForMultiRecordCategory(multiRecordCategory.id);
    _(records).each(function(record){
      addRecord(null, record.id);
    });
  }

  button.addEventListener('click', addRecord);

  self.getValue = function() {
    return null;
  };

  self.getSubQuestions = function() {
    if(childrenViews) {
      var flatMap = require('helpers/Utility').flatMap;
      return flatMap(childrenViews[selectedIndex]);
    }

    return null;
  };

  return self;
}

module.exports = MultiRecordCategoryView;
