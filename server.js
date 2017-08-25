const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {blogPost} = require('./models');

const app = express();
app.use(bodyParser.json());

app.get('/posts', (req, res) => {
	blogPost
		.find()
		.exec()
		.then(posts => {
			res.json({
				posts: posts.map(
					(post) => post.apiRepr());
			});
		});
		.catch(
			err => {
				console.error(err);
				res.status(500).json({message: 'An error has occurred. Please try again.'});
		});
});

app.get('/posts/:id', (req, res) => {
	blogPost
		.findById(req.params.id)
		.exec()
		.then(post => res.json (post.apiRepr()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'An error has occurred. Please try again.'});
		});
});

app.post('/posts', (req, res) => {
	const requiredFields = ['title', 'content', 'author'];
	for (let i = 0; i < requiredFields.length; i++) {
		const field = requiredFields[i];
		if(!(field in req.body)) {
			const message = `Error. Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}

	blogPost
		.create({
			title: req.body.title,
			content: req.body.content,
			author: {
				firstName: req.body.author.firstName,
				lastName: req.body.author.lastName
			}
		})
		.then(
			post => res.status(201).json(post.apiRepr()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'An error occurred. Please try again.'});
		});
});

app.put('posts/:id', (req, res) => {
	if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message = (
			`Request path id (${req.params.id}) and request body id ` + 
			`(${req.body.id}) must match`);
		console.error(message);
		res.status(400).json({message: message});
	}
	const toUpdate = {};
	const updateableFields = ['title', 'content', 'author'];

	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	blogPost
		findByIdAndUpdate(req.params.id, {$set: toUpdate})
		.exec()
		.then(post => res.status(200).json(post.apiRepr()));
		.catch(err => res.status(500).json({message: 'An error occurred. Please try again.'}));
});

app.delete('/posts/:id', (req, res) => {
	blogPost
		.findByIdAndRemove(req.params.id)
		.exec()
		.then(post => res.status(204).end())
		.catch(err => res.status(500).json({message: 'An error occurred. Please try again.'}));
});

app.use('*', function(req, res) {
	res.status(404).json({message: 'Error: URL not found.'});
})

let server;

function runServer(databaseUrl = DATABASE_URL, port= PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			if (err) {
				return reject(err);
			}
			server = app.listen(port, () => {
				console.log(`Your app is listening on port ${port}`);
				resolve();
			})
			.on('error', err => {
				mongoose.disconnect();
				reject(err);
			});
		});
	});
}

function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log('Closing server');
			server.close(err => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	});
}

if (require.main === module) {
	runServer().catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};



