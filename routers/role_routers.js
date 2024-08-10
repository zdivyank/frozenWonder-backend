const express = require('express');
const router = express.Router();
const {add_role, get_role, remove_role } = require('../controllers/role_controller');

router.post('/addrole',add_role);
router.get('/getrole',get_role);
router.delete('/removerole/:_id',remove_role);

module.exports = router;
