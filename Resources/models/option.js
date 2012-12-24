var _ = require('lib/underscore')._;

var Option = new Ti.App.joli.model({
	table : 'options',
	columns : {
		id : 'INTEGER PRIMARY KEY',
		content : 'TEXT',
		question_id : 'INTEGER',
	},

	methods : {
		createRecords : function(data, questionID, externalSyncHandler) {
			var _ = require('lib/underscore')._;
			var that = this;
			var records = [];
			_(data).each(function(option) {
				var record = that.newRecord({
					id : option.id,
					content : option.content,
					question_id : questionID
				});
				record.save();
				var Question = require('models/question');
				surveyID = Question.findById(questionID).survey_id;
				if (!_.isEmpty(option.questions)) {
					Question.createRecords(option.questions, surveyID, record.id, externalSyncHandler, null);
				}
				var Category = require('models/category');
				Category.createRecords(option.categories, surveyID, record.id, externalSyncHandler, null);
				records.push(record);
			});
			return records;
		}
	},

	objectMethods : {
		firstLevelSubQuestions : function() {
			var Question = require('models/question');
			var questions = Question.findBy('parent_id', this.id);
			var sortedQuestions = _(questions).sortBy(function(question){ return question.order_number; });
			return sortedQuestions;
		},

		firstLevelSubCategories : function() {
			var Category = require('models/category');
			var categories = Category.findBy('parent_id', this.id);
			var sortedCategories = _(categories).sortBy(function(category){ return category.order_number; });
			return sortedCategories;
		},

		firstLevelSubElements : function() {
			var elements = this.firstLevelSubQuestions().concat(this.firstLevelSubCategories());
      var sortedElements = _(elements).sortBy(function(element){ return element.order_number; });
      return sortedElements;
		},

		subQuestions : function() {
			var Question = require('models/question');
			var questions = Question.findBy('parent_id', this.id);

			var sortedQuestions = _(questions).sortBy(function(question){ return question.order_number; });

			var subQuestions = _.chain(sortedQuestions).map(function(question) {
				return question.withSubQuestions();
			}).flatten().value();
			return subQuestions;
		}
	}
});

Ti.App.joli.models.initialize();
module.exports = Option;

