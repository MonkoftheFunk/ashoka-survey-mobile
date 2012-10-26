//A single survey
function ResponseShowView(responseID) {
	var _ = require('lib/underscore')._;
	var Survey = require('models/survey');
	var Answer = require('models/answer');
	var Question = require('models/question');
	var convertResponseDataForTable = function() {
		var answers = Answer.findBy('response_id', responseID);
		var responses = _(answers).map(function(answer) {
			return {
				'header' : Question.findOneById(answer.question_id).content,
				'title' : answer.content
			}
		});
		return responses;
	}
	var self = Ti.UI.createView({
		layout : 'vertical'
	});

	// now assign that array to the table's data property to add those objects as rows
	var table = Titanium.UI.createTableView({
		data : convertResponseDataForTable()
	});
	
	var responseEditButton = Ti.UI.createButton({
		title : 'Edit this Response',
		width : '100%'
	});

	responseEditButton.addEventListener('click', function(e) {
		self.fireEvent('ResponseShowView:responseEdit', {
			responseID : responseID
		});
	});
	var buttonsView = Ti.UI.createView({
		layout : 'vertical'
	});
	buttonsView.add(responseEditButton);

	table.setFooterView(buttonsView);

	self.add(table);
	return self;
}

module.exports = ResponseShowView;
