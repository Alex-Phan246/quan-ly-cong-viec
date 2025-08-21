import bcrypt from 'bcryptjs';

export const usersData = [
  {
    id: 1,
    name: 'User A',
    email: 'usera@example.com',
    passwordHash: bcrypt.hashSync('password123', 8),
    role: 'user',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'User B',
    email: 'userb@example.com',
    passwordHash: bcrypt.hashSync('password123', 8),
    role: 'user',
    createdAt: new Date().toISOString(),
  },
];

export let nextUserId = 3;
