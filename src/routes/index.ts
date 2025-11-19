import {Router} from 'express'

const router = Router()

/* Get home page. */
router.get('/', async (req, res, next) => {
    res.render('index', {title: '書籍(貸し出し)管理システム'})
})

export default router