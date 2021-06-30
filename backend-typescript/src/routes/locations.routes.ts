import {Router} from 'express'
import multer from 'multer'
import {celebrate, Joi} from 'celebrate'
import knex  from '../database/connection'
import multerConfig from '../config/multer'
import { Knex } from 'knex'

const locationsRouter = Router()

const upload = multer(multerConfig)

const defaultRules = {
	body: Joi.object().keys({
		name: Joi.string().required(),
		email: Joi.string().required().email().label('e-mail'),
		whatsapp: Joi.string().required(),
		latitude: Joi.number().required(),
		longitude: Joi.number().required(),
		city: Joi.string().required(),
		uf: Joi.string().required().max(2).min(1).messages({
			'string.base': `"uf" should be a type of 'text'`,
            'string.empty': `"uf" cannot be an empty field`,
            'string.min': `"uf" should have a minimum length of {#limit}`,
            'string.max': `"uf" should have a maximum length of {#limit}`,
            'any.required': `"uf" is a required field`
		}),
		items: Joi.array().items(Joi.number()).required()


	})
}

const joiOptions = {
	abortEarly: false,
	errors: {
		escapeHtml: true
	}
}

locationsRouter.get('/', async (request, response) =>{
	const { city, uf, items } = request.query

	if(city && items && uf){ 
		const parsedItems: Number[] = String(items).split(',').map(item => Number(item.trim()))

		const locations = await knex('locations')
			.join('locations_items', 'locations.id', '=', 'locations_items.location_id')
			.where(function() {
				if (items) {
					this.whereIn('locations_items.item_id', parsedItems)
				}
			})
			.where(function() {
				if(city && uf){
					this.where({
						city: String(city),
						uf: String(uf)
					})
				} else if (city && !uf){
					this.where({ city: String(city)})
				} else if (!city && uf){
					this.where({uf: String(uf)})
				}
			})

			.distinct()
			.select('locations.*')

		return response.json(locations)

	} else {
		const locations = await knex('locations').select('*')
		return response.json(locations)

	}

	

})

locationsRouter.get('/:id', async (request, response) =>{
	const { id } = request.params

	const location = await knex('locations').where('id', id).first()

	if(!location){
		return response.status(400).json({message: 'Location not found'})
	}

	const items = await knex('items')
		.join('locations_items', 'items.id', '=', 'locations_items.item_id')
		.where('locations_items.location_id', id)
		.select('items.title')

	return response.json({location, items})
})

locationsRouter.post('/', celebrate(defaultRules, joiOptions), async (request, response) => {
	const {
		name,
		email,
		whatsapp,
		latitude,
		longitude,
		city,
		uf,
		items
	} = request.body

	const location: object = {
		image: 'fake.jpg',
		name,	
		email,
		whatsapp,
		latitude,
		longitude,
		city,
		uf
	}

	const transaction = await knex.transaction()

	const newIds: Array<number> = await transaction('locations').insert(location)

	const location_id: number = newIds[0]

	if(items?.length){
		let itemNotFound: number|undefined = undefined

		const itemsBd = await transaction('items').select('id')

		const itemsIdBd: Array<number> = itemsBd.map(item => {
			return item.id
		})

		if(itemNotFound){
			transaction.rollback()
			return response.status(400).json({message: `Item ${itemNotFound} not found`})
		}

		const locationItems = items.map((item_id: number) => {
			return {
				item_id,
				location_id
			}
		})

		await transaction('locations_items').insert(locationItems)

	}


	await transaction.commit()

	return response.json({
		id: location_id,
		...location
	})
})

locationsRouter.put('/:id', upload.single('image'), async (request, response) => {
	const { id } = request.params

	const image = request.file?.filename

	const location = await knex('locations').where('id', id).first()

	if(!location){
		return response.status(400).json({message: 'Location not found'})
	}

	const locationUpdated = {
		...location,
		image
	}

	await knex('locations').update(locationUpdated).where('id', id)

	return response.json(locationUpdated)

})



export default locationsRouter