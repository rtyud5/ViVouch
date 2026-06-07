import * as categoriesService from './categories.service.js'

export async function getAll(req, res, next) {
  try {
    const categories = await categoriesService.findAll()
    res.json({ success: true, message: 'OK', data: categories })
  } catch (err) {
    next(err)
  }
}