const express = require('express')

const app = express()

app.get('/projects', (request, response) => {
	return response.json([
		'Projeto 1',
		'Projeto 2',
		'Projeto 3'
	])
})

app.post('/projects', (request, response) => {
	return response.json([
		'Projeto 1',
		'Projeto 2',
		'Projeto 3',
		'Projeto 4'
	])
})

app.put('/projects', (request, response) => {
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