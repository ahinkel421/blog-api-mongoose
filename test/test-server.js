const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('blogPost', function() {
	before(function() {
		return runServer();
	});
	after(function() {
		return closeServer();
	});

	it('should list blog posts on GET', function() {
		return chai.request(app)
		.get('/blog-posts')
		.then(function(res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.length.should.be.at.least(1);

			const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate'];
			res.body.forEach(function(item) {
				item.should.be.a('object');
				item.should.include.keys(expectedKeys);
			});
		});
	});

	it('should add a new blog post on POST', function() {
		const newBlogPost = {title: 'My photography trip', content: "I took a trip to take a bunch of pictures and stuff. The end.", author: "John Doe"};
		return chai.request(app)
		.post('/blog-posts')
		.send(newBlogPost)
		.then(function(res) {
			res.should.have.status(201);
			res.should.be.json;
			res.body.should.be.a('object');
			res.body.should.include.keys('id', 'title', 'content', 'author');
			res.body.id.should.not.be.null;

			res.body.should.deep.equal(Object.assign(newBlogPost, {id: res.body.id}));
		});
	});

	it('should update blog posts on PUT', function() {

		return chai.request(app)

		.get('/blog-posts')
		.then(function(res) {

			const updateData = Object.assign(res.body[0], {
			title: 'Crazy Story',
			content: 'This happened!',
			author: 'Jack'
			});

			return chai.request(app)
			.put(`/blog-posts/${res.body[0].id}`)
			.send(updateData)
			.then(function(res) {
				res.should.have.status(200);
			});
		});
	});

	it('should delete blog posts on DELETE', function() {
		return chai.request(app)
		.get('/blog-posts')
		.then(function(res) {
			return chai.request(app)
			.delete('/blog-posts/{res.body[0].id}')
			.then(function(res) {
				res.should.have.status(204);
			});
		});
	});
});



