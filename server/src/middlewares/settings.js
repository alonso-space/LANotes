import settings from '../../admin/getSettings.js';

export function requireGuestRegister(req, res, next) {
  if (settings.guest_register === false) {
    return res.status(403).json({ error: 'El registro está deshabilitado por quien administra el servidor' });
  }

  next();
}
