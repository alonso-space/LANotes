import usersService from '../services/usersService.js';

async function getAllUsers(req, res) {
  try {
    const users = await usersService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUserById(req, res) {
  const userId = req.params.id;
  try {
    const user = await usersService.getUserById(userId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function newUser(req, res) {
  const { username, password } = req.body;

  try {
    const userId = await usersService.newUser(username, password);
    res.status(201).json({ id: userId, username: username });
  } catch (error) {
    console.error('Error al registrar usuario:', error);

    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username already taken' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}

export default {
  getAllUsers,
  getUserById,
  newUser,
};