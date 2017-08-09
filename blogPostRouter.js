const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const app = express();

const {BlogPosts} = require('./models');

BlogPosts.create('My Summer Vacation', 'I had a fantastic summer in Europe! The end.', 'Adam Hinkel', 'August 7, 2017');
BlogPosts.create('Modern Politics', 'This guy is presedent? Really?', 'Joe Shmoe', 'January 24, 2017');
BlogPosts.create('Fallout 4 Review', 'This is a really great game. Buy it.', 'Preston Garvey', 'May 21, 2017');


app.get('/blog-posts', (req, res) => {
	res.json(BlogPosts.get());
});


app.post('/blog-posts', jsonParser, (req, res) => {
	const requiredFields = ['title', 'content', 'author'];
	for (let i = 0; i < requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = 'Missing \'${field}\' in request body';
			console.error(message);
			return res.status(400).send(message);
		}
	}
	const item = BlogPosts.create(req.body.id, req.body.title, req.body.content, req.body.author, req.body.publishDate);
	res.status(201).json(item);
});


app.put('/blog-posts/:id', jsonParser, (req, res) => {
	const requiredFields = ['id', 'title', 'content', 'author', 'publishDate'];
	for (let i = 0; i < requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = 'Missing \'${field}\' in request body';
			console.error(message);
			return res.status(400).send(message);
		}
	}
	if (req.params.id !== req.body.id) {
		const message = 'request path id (${req.params.id}) and request body id (${req.body.id}) must match';
		console.error(message);
		return res.status(400).send(message);
	}
	console.log('Updating blog post \'${req.params.id}\'');
	BlogPosts.update({
		id: req.params.id,
		title: req.body.title,
		content: req.body.content,
		author: req.body.author,
		publishDate: req.body.publishDate
	});
	res.status(204).end();
});

app.delete('/blog-posts/:id', (req, res) => {
	BlogPosts.delete(req.params.id);
	console.log('Deleted blog post \'${req.params.id}\'');
	res.status(204).end();
});

module.exports = router;