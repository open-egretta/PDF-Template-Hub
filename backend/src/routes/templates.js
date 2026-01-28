import express from 'express';
import {
  authenticate,
  requireAdmin,
  requireOwnerOrAdmin
} from '../middleware/auth.js';
import { getMany, getOne, transaction } from '../db/helpers.js';
import templateService from '../services/template.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const templates = await getMany(
      'SELECT * FROM templates WHERE is_active = true AND view = $1 ORDER BY id ASC',
      ['PUBLIC']
    )
    console.log(templates)
    res.json({ data: templates })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

// Admin: 取得所有 templates（忽略 is_active）
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const templates = await getMany(
      'SELECT * FROM templates ORDER BY id ASC'
    )
    res.json({ data: templates })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, schema, description, view, is_active } = req.body;
    const created_by = req.user.id;

    const template = await templateService.create({
      name,
      schema,
      description,
      view,
      is_active,
      created_by
    });

    res.status(201).json({ data: template });
  } catch (error) {
    const status = error.message.includes('@pdfme/common') ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
})

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, schema, description, view, is_active } = req.body;

    const template = await templateService.update(req.params.id, {
      name,
      schema,
      description,
      view,
      is_active
    });

    res.status(200).json({ data: template });
  } catch (error) {
    const status = error.message.includes('@pdfme/common') ? 400 : 500;
    res.status(status).json({ error: error.message });
  }
})

router.get('/:id', async (req, res) => {
  try {
    const template = await getOne(
      'SELECT * FROM templates WHERE is_active = true AND view = $1 AND id = $2 ORDER BY id ASC',
      ['PUBLIC', req.params.id]);
    res.json({ data: template });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
})

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await transaction(async (client) => {
      const result = await client.query(
        'DELETE FROM templates WHERE id = $1 RETURNING *',
        [req.params.id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json({ message: 'Template deleted successfully', data: result.rows[0] });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

router.patch('/:id/active', authenticate, requireAdmin, async (req, res) => {
  try {
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active must be a boolean' });
    }

    await transaction(async (client) => {
      const result = await client.query(
        'UPDATE templates SET is_active = $1 WHERE id = $2 RETURNING *',
        [is_active, req.params.id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json({ data: result.rows[0] });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

export default router;