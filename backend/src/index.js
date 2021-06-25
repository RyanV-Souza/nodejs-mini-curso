const express = require('express')

const app = express()

app.use(express.json())

app.get('/projects', (request, response) => {
	const { title, owner } = request.query

	console.log(title, owner)

	return response.json([
		'Projeto 1',
		'Projeto 2',
		'Projeto 3'
	])
})

app.post('/projects', (request, response) => {
	const body = request.body
	
	console.log(body)

	return response.json([
		'Projeto 1',
		'Projeto 2',
		'Projeto 3',
		'Projeto 4'
	])
})

app.put('/projects/:id', (request, response) => {
	const {id} = request.params

	console.log(params)

	return response.json([
		'Projeto 1',
		'Projeto 2',
		'Projeto 3',
		'Projeto 5'
		
	])
})

app.delete('/projects', (request, response) => {
	return response.json([
		'Projeto 1',
		'Projeto 2'
	])
})

app.listen(3333, () => {
	console.log("Backend Started! 👍");
})