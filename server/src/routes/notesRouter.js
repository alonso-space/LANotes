import express from 'express';
import notesController from '../controllers/notesController.js';
import { requireLogin } from '../middlewares/auth.js';

const router = express.Router();

router.use(requireLogin);

router.get('/', notesController.list);
router.post('/', notesController.create);
router.put('/:id', notesController.update);
router.delete('/:id', notesController.remove);
router.put('/:id/favorite', notesController.addFavorite);
router.delete('/:id/favorite', notesController.removeFavorite);

export default router;
