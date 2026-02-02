const express = require('express');
const router = express.Router();
const {
  getAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset
} = require('../services/assetController');

router.route('/')
  .get(getAssets)
  .post(createAsset);

router.route('/:id')
  .get(getAsset)
  .put(updateAsset)
  .delete(deleteAsset);

module.exports = router;