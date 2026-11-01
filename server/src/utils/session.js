// El prefijo __Host- obliga al navegador a exigir Secure, path=/ y ningún Domain
export const SESSION_COOKIE = '__Host-lanotes.sid';

export const regenerateSession = (req) =>
  new Promise((resolve, reject) =>
    req.session.regenerate((err) => (err ? reject(err) : resolve())),
  );

export const saveSession = (req) =>
  new Promise((resolve, reject) => req.session.save((err) => (err ? reject(err) : resolve())));

export const destroySession = (req) =>
  new Promise((resolve, reject) => req.session.destroy((err) => (err ? reject(err) : resolve())));

export async function endSession(req, res) {
  await destroySession(req);

  res.clearCookie(SESSION_COOKIE, {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}
