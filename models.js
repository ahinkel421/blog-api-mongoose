const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema({
	title: {type: String, required: true},
	content: {type: String, required: true},
	author: {
		firstName: String, 
		lastName: String
	},
	created: {type: Date}
});

blogPostSchema.virtual('authorString').get(function() {
	return `${this.author.firstName} ${this.author.lastName}`.trim()});
blogPostSchema.methods.apiRepr = function() {
	return {
		id: this._id,
		title: this.title,
		content: this.content,
		author: this.authorString,
		created: this.created
	};
}

const blogPost = mongoose.model('posts', blogPostSchema);

module.exports = {blogPost};